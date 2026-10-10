/* ==========================================================================
   Portfolio runtime

   One page, several small services. Each service owns one concern, talks to
   the others only through the DOM (state classes / attributes) and two events
   on `window`, and is started inside its own try/catch, so a failure in one
   (say, WebGL or the PDF viewer) never takes the rest of the page down.

   Events
     portfolio:ready        the loader finished; entrance animations may play
     portfolio:themechange  the theme switched (detail.theme: "ink" | "paper")

   State classes (consumed by styles.css)
     html.js  body.ready  body.has-3d  .in  .lit  .reached  .open
   ========================================================================== */

const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const COMPACT = window.matchMedia("(max-width: 720px)");

const EVENTS = {
  ready: "portfolio:ready",
  theme: "portfolio:themechange",
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const bus = {
  emit(name, detail) {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  },
  on(name, handler, options) {
    window.addEventListener(name, handler, options);
  },
};

/* Shared helpers ---------------------------------------------------------- */

/** Run `callback(el)` once for each element the first time it is visible. */
function onceVisible(elements, callback, { threshold = 0.3 } = {}) {
  if (REDUCED_MOTION || !("IntersectionObserver" in window)) {
    elements.forEach(callback);
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        callback(entry.target);
      });
    },
    { threshold }
  );
  elements.forEach((el) => io.observe(el));
}

/** One scroll/resize listener shared by every scroll-linked service, run once per frame. */
const frameLoop = (() => {
  const subscribers = [];
  let queued = false;

  function flush() {
    queued = false;
    subscribers.forEach((fn) => fn());
  }
  function schedule() {
    if (!queued) {
      queued = true;
      requestAnimationFrame(flush);
    }
  }

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);

  return {
    subscribe(fn) {
      subscribers.push(fn);
      fn();
    },
  };
})();

function markReady() {
  if (document.body.classList.contains("ready")) return;
  const loader = $("#loader");
  if (loader) loader.classList.add("done");
  document.body.classList.add("ready");
  bus.emit(EVENTS.ready);
}

/* Services ---------------------------------------------------------------- */

/** Loader: counts up with a running commentary, then hands over to the page. */
const loader = {
  name: "loader",
  LINES: [
    [0, "Warming up the particles…"],
    [18, "Untangling Spring beans…"],
    [36, "Convincing CSS to cooperate…"],
    [54, "Refuelling the car…"],
    [72, "Almost there. Pretending it was hard."],
    [92, "Ready. Mostly."],
  ],

  init() {
    const count = $("#loader-count");
    const msg = $("#loader-msg");
    if (!count || !msg) return markReady();

    const lines = this.LINES;
    let shown = 0;

    const show = (i) => {
      if (i === shown) return;
      shown = i;
      msg.classList.add("swap");
      setTimeout(() => {
        msg.textContent = lines[i][1];
        msg.classList.remove("swap");
      }, 180);
    };

    if (REDUCED_MOTION) {
      msg.textContent = lines[lines.length - 1][1];
      count.textContent = "100%";
      setTimeout(markReady, 400);
      return;
    }

    let value = 0;
    const timer = setInterval(() => {
      value = Math.min(100, value + 1 + Math.floor(Math.random() * 5));
      count.textContent = value + "%";

      for (let i = lines.length - 1; i >= 0; i--) {
        if (value >= lines[i][0]) {
          show(i);
          break;
        }
      }

      if (value >= 100) {
        clearInterval(timer);
        setTimeout(markReady, 350);
      }
    }, 90);
  },
};

/** Header: publishes its height so the hero can fill exactly the rest of the screen. */
const header = {
  name: "header",
  init() {
    const el = $(".site-header");
    if (!el) return;
    const measure = () =>
      document.documentElement.style.setProperty("--header-h", el.offsetHeight + "px");
    measure();
    if ("ResizeObserver" in window) new ResizeObserver(measure).observe(el);
    else window.addEventListener("resize", measure);
  },
};

/** Theme: Ink <-> Paper. The saved choice is applied before first paint by the
 *  inline script in <head>; this service only owns switching and saving it. */
const theme = {
  name: "theme",
  init() {
    const root = document.documentElement;
    const toggle = $("#theme-toggle");
    const label = $("#theme-name");
    const meta = $('meta[name="theme-color"]');
    if (!toggle || !label) return;

    const apply = (name, announce) => {
      root.setAttribute("data-theme", name);
      toggle.setAttribute("aria-pressed", String(name === "paper"));
      label.textContent = name === "paper" ? "Paper" : "Ink";
      if (meta) meta.setAttribute("content", name === "paper" ? "#ede7da" : "#100e0c");
      if (announce) bus.emit(EVENTS.theme, { theme: name });
    };

    apply(root.getAttribute("data-theme") === "paper" ? "paper" : "ink", false);

    toggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "paper" ? "ink" : "paper";
      apply(next, true);
      try {
        localStorage.setItem("portfolio-theme", next);
      } catch (e) {
        /* storage unavailable: the choice just won't persist */
      }
    });
  },
};

/** Navigation: mobile menu + highlights the section you are in. */
const nav = {
  name: "nav",
  init() {
    const toggle = $("#menu-toggle");
    const menu = $("#primary-nav");
    if (!toggle || !menu) return;

    const setOpen = (open) => {
      menu.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };

    toggle.addEventListener("click", () => setOpen(!menu.classList.contains("open")));
    $$("a", menu).forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Scroll-spy: the section crossing the middle of the viewport is "current"
    if (!("IntersectionObserver" in window)) return;
    const links = new Map($$('a[href^="#"]', menu).map((a) => [a.getAttribute("href").slice(1), a]));
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((a, id) => {
            if (id === entry.target.id) a.setAttribute("aria-current", "true");
            else a.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    $$("main > section").forEach((s) => links.has(s.id) && spy.observe(s));

    // The last section is short, so it never reaches the middle of the screen:
    // at the very bottom of the page it counts as current.
    const lastId = $$("main > section").pop()?.id;
    frameLoop.subscribe(() => {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (!atBottom || !lastId) return;
      links.forEach((a, id) => {
        if (id === lastId) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    });
  },
};

/** Hero: Three.js scene (isolated, optional), spotlight word and role roller. */
const hero = {
  name: "hero",
  ROLES: ["Software Developer", "Fresher SDE", "Full-Stack Builder", "Problem Solver"],
  STAGGER: 28, // ms between letters
  HOLD: 2600, // ms each role stays

  init() {
    this.spotlight();
    bus.on(EVENTS.ready, () => {
      this.roller();
      this.scene();
    }, { once: true });
    if (document.body.classList.contains("ready")) {
      this.roller();
      this.scene();
    }
  },

  /** The WebGL scene is a separate module loaded on demand. If the CDN, the
   *  module or WebGL is unavailable the CSS orb simply stays. */
  async scene() {
    const container = $("#hero-canvas");
    if (!container) return;
    try {
      const { mountHeroScene } = await import("./hero3d.js");
      mountHeroScene(container, { reducedMotion: REDUCED_MOTION });
    } catch (err) {
      console.warn("[portfolio] hero scene unavailable, using fallback", err);
    }
  },

  /** The cursor lights up the YOO! letters; with no pointer the light wanders. */
  spotlight() {
    const stage = $("#hero");
    const word = $("#hey");
    if (!stage || !word) return;

    const setSpot = (x, y) => {
      word.style.setProperty("--hx", x * 100 + "%");
      word.style.setProperty("--hy", y * 100 + "%");
    };

    let lastMove = 0;
    let visible = true;

    stage.addEventListener("pointermove", (e) => {
      const r = word.getBoundingClientRect();
      lastMove = performance.now();
      setSpot((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    });

    if (REDUCED_MOTION) {
      setSpot(0.5, 0.5);
      return;
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
      }).observe(stage);
    }

    const wander = (t) => {
      requestAnimationFrame(wander);
      if (!visible || t - lastMove < 1800) return;
      const s = t / 1000;
      setSpot(0.5 + Math.sin(s * 0.7) * 0.42, 0.5 + Math.sin(s * 1.3 + 1.2) * 0.3);
    };
    requestAnimationFrame(wander);
  },

  /** Roles roll out letter by letter, then the next rolls in. */
  roller() {
    const el = $("#roller");
    if (!el) return;
    const { ROLES, STAGGER, HOLD } = this;

    if (REDUCED_MOTION) {
      el.textContent = ROLES[0];
      return;
    }

    const fill = (text) => {
      el.textContent = "";
      el.setAttribute("aria-label", text);
      Array.from(text).forEach((ch, i) => {
        const span = document.createElement("span");
        span.className = "char";
        span.setAttribute("aria-hidden", "true");
        span.textContent = ch === " " ? " " : ch;
        span.style.animationDelay = i * STAGGER + "ms";
        el.appendChild(span);
      });
    };

    let index = 0;
    fill(ROLES[index]);

    setInterval(() => {
      const chars = $$(".char", el);
      chars.forEach((c, i) => {
        c.classList.add("out");
        c.style.animationDelay = i * STAGGER + "ms";
      });
      setTimeout(() => {
        index = (index + 1) % ROLES.length;
        fill(ROLES[index]);
      }, chars.length * STAGGER + 450);
    }, HOLD);
  },
};

/** Reveal: headings rise in; Skills/Projects rows fill in; contact rows pop in. */
const reveal = {
  name: "reveal",
  init() {
    onceVisible($$(".reveal"), (el) => el.classList.add("in"), { threshold: 0.3 });

    const rows = $$(".index-row");
    rows.forEach((row) =>
      $$("li", row).forEach((li, i) => li.style.setProperty("--i", i))
    );
    onceVisible(rows, (row) => row.classList.add("in"), { threshold: 0.4 });

    // Contact rows pop in one after another
    const contacts = $$(".contact-row");
    contacts.forEach((row, i) => row.style.setProperty("--i", i));
    onceVisible(contacts, (row) => row.classList.add("in"), { threshold: 0.5 });
  },
};

/** Bio: words light up one by one as the paragraph scrolls through the screen. */
const bio = {
  name: "bio",
  init() {
    const lead = $("#bio");
    if (!lead) return;

    const words = lead.textContent.trim().split(/\s+/);
    lead.setAttribute("aria-label", words.join(" "));
    lead.textContent = "";
    const spans = words.map((w, i) => {
      const span = document.createElement("span");
      span.className = "word";
      span.setAttribute("aria-hidden", "true");
      span.textContent = w;
      lead.appendChild(span);
      if (i < words.length - 1) lead.appendChild(document.createTextNode(" "));
      return span;
    });

    if (REDUCED_MOTION) {
      spans.forEach((s) => s.classList.add("lit"));
      return;
    }

    frameLoop.subscribe(() => {
      const rect = lead.getBoundingClientRect();
      const vh = window.innerHeight;
      // starts when the bio's top reaches 85% of the viewport, done by 40%
      const start = vh * 0.85;
      const end = vh * 0.4;
      const p = Math.min(1, Math.max(0, (start - rect.top) / (start - end + rect.height * 0.6)));
      const lit = Math.round(p * spans.length);
      spans.forEach((s, i) => s.classList.toggle("lit", i < lit));
    });
  },
};

/** Education: a car drives the road as you scroll; stops light up as it passes. */
const journey = {
  name: "journey",
  init() {
    const root = $("#journey");
    const svg = $("#journey-road");
    if (!root || !svg) return;

    const NS = "http://www.w3.org/2000/svg";
    const paths = ["#road-edge", "#road-surface", "#road-dash"].map((s) => $(s));
    const pinsGroup = $("#road-pins");
    const car = $("#car");
    const stops = $$(".stop", root);

    let H = 0;
    let cx = 0;
    let amp = 0;
    let pins = [];
    let carY = 0;
    let targetY = 0;
    let animating = false;

    // A gentle S-curve. x is a function of y, so the car can follow it exactly.
    const fx = (y) => cx + amp * Math.sin((y / H) * Math.PI * 3);
    const dfx = (y) => amp * Math.cos((y / H) * Math.PI * 3) * ((3 * Math.PI) / H);

    const build = () => {
      const W = root.clientWidth;
      H = root.clientHeight;
      cx = COMPACT.matches ? 30 : W / 2;
      amp = COMPACT.matches ? 8 : Math.min(54, W * 0.07);

      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      let d = `M ${fx(0).toFixed(1)} 0`;
      for (let y = 6; y <= H + 6; y += 6) d += ` L ${fx(y).toFixed(1)} ${y}`;
      paths.forEach((p) => p.setAttribute("d", d));

      pinsGroup.textContent = "";
      pins = stops.map((stop) => {
        const y = stop.offsetTop + 34;
        const c = document.createElementNS(NS, "circle");
        c.setAttribute("class", "pin");
        c.setAttribute("cx", fx(y).toFixed(1));
        c.setAttribute("cy", y);
        c.setAttribute("r", 9);
        pinsGroup.appendChild(c);
        return { y, el: c, stop };
      });
    };

    const place = (y) => {
      // the car is drawn facing down the page; rotate it to follow the curve
      const angle = -Math.atan2(dfx(y), 1) * (180 / Math.PI);
      car.setAttribute("transform", `translate(${fx(y).toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)})`);
      pins.forEach((p) => {
        const reached = y >= p.y - 4;
        p.el.classList.toggle("reached", reached);
        p.stop.classList.toggle("reached", reached);
      });
    };

    const computeTarget = () => {
      // the car holds ~60% of the way down the screen while the road scrolls under it
      const y = window.innerHeight * 0.6 - root.getBoundingClientRect().top;
      targetY = Math.min(H - 28, Math.max(28, y));
    };

    const step = () => {
      const diff = targetY - carY;
      if (Math.abs(diff) < 0.4) {
        carY = targetY;
        place(carY);
        animating = false;
        return;
      }
      carY += diff * 0.14;
      place(carY);
      requestAnimationFrame(step);
    };

    const layout = () => {
      build();
      if (REDUCED_MOTION) {
        carY = H - 28;
      } else {
        computeTarget();
        carY = targetY;
      }
      place(carY);
    };

    layout();
    if (!REDUCED_MOTION) {
      frameLoop.subscribe(() => {
        computeTarget();
        if (!animating) {
          animating = true;
          requestAnimationFrame(step);
        }
      });
    }
    // fonts and other sections can change the height after first layout
    if ("ResizeObserver" in window) new ResizeObserver(layout).observe(root);
    window.addEventListener("load", layout);
    COMPACT.addEventListener("change", layout);
  },
};

/** Resume: a viewer over the page (no new tab). Everything behind it is made
 *  inert while it is open; Esc, Close or a click outside dismisses it. */
const resume = {
  name: "resume",
  init() {
    const triggers = $$("[data-resume]");
    const modal = $("#resume-modal");
    const frame = $("#resume-frame");
    const closeBtn = $("#resume-close");
    if (!triggers.length || !modal || !frame || !closeBtn) return;

    const background = [$(".site-header"), $("#hero"), $("main"), $(".footer")].filter(Boolean);
    let lastFocus = null;

    const open = () => {
      lastFocus = document.activeElement;
      if (!frame.getAttribute("src")) {
        frame.setAttribute("src", triggers[0].getAttribute("href") + "#view=FitH");
      }
      modal.hidden = false;
      background.forEach((el) => el.setAttribute("inert", ""));
      document.body.classList.add("modal-open");
      closeBtn.focus();
      void modal.offsetWidth; // flush layout so the fade-in transition runs
      modal.classList.add("open");
    };

    const close = () => {
      modal.classList.remove("open");
      background.forEach((el) => el.removeAttribute("inert"));
      document.body.classList.remove("modal-open");
      setTimeout(() => {
        modal.hidden = true;
      }, REDUCED_MOTION ? 0 : 250);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    triggers.forEach((t) =>
      t.addEventListener("click", (e) => {
        // browsers that can't show PDFs inline just follow the link in this tab
        if (navigator.pdfViewerEnabled === false) return;
        e.preventDefault();
        open();
      })
    );

    closeBtn.addEventListener("click", close);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) close();
    });
  },
};

/* Boot -------------------------------------------------------------------- */

[loader, header, theme, nav, hero, reveal, bio, journey, resume].forEach((service) => {
  try {
    service.init();
  } catch (err) {
    console.error(`[portfolio] "${service.name}" failed to start`, err);
    // the loader is the one service the page must not be left waiting on
    if (service.name === "loader") markReady();
  }
});
