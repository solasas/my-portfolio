import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('cv') as File | null;

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
  if (file.type !== 'application/pdf')
    return NextResponse.json({ error: 'Must be a PDF' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const dest = path.join(process.cwd(), 'public', 'cv.pdf');
  await writeFile(dest, buffer);

  return NextResponse.json({ ok: true });
}
