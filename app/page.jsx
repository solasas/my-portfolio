import Navbar from '@/components/Navbar';
import Hero from '@/components/sections/Hero';
import Skills from '@/components/sections/Skills';
import Projects from '@/components/sections/Projects';
import Education from '@/components/sections/Education';
import Contact from '@/components/sections/Contact';
import AdminModal from '@/components/AdminModal';
import AdminToolbar from '@/components/AdminToolbar';
import AdminBodyClass from '@/components/AdminBodyClass';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Skills />
        <Projects />
        <Education />
        <Contact />
      </main>
      <Footer />
      <AdminBodyClass />
      <AdminModal />
      <AdminToolbar />
    </>
  );
}
