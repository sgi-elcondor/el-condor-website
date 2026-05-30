// Conversión a WebP + redimensionado de las imágenes pesadas del sitio.
// Uso: node scripts/optimize-images.mjs   (requiere devDependency "sharp")
// No toca logo.png ni los originales: solo genera los .webp.
import sharp from "sharp";
import { stat } from "node:fs/promises";
import { join, parse } from "node:path";

const DIR = "assets/images";

// { archivo origen, ancho máximo, calidad }
const TARGETS = [
  ["hero-bg.jpg",            1600, 72],
  ["hero-texture.png",       1280, 70],
  ["dron1.jpeg",             1600, 78],
  ["dron2.jpeg",             1600, 78],
  ["flandes1.png",            900, 80],
  ["flandes2.png",            900, 80],
  ["flandes3.png",            900, 80],
  ["flandes4.png",            900, 80],
  ["persona1.jpeg",           400, 80],
  ["persona3.jpg",            400, 80],
  ["cliente2.jpg",            400, 80],
  ["imagen_condor_dos.jpg",   900, 80],
  ["imagen_condor_tres.jpg",  673, 80],
];

const kb = (n) => Math.round(n / 1024);
let before = 0, after = 0;

for (const [file, width, quality] of TARGETS) {
  const src = join(DIR, file);
  const out = join(DIR, parse(file).name + ".webp");
  try {
    const o = (await stat(src)).size;
    await sharp(src)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality })
      .toFile(out);
    const n = (await stat(out)).size;
    before += o; after += n;
    console.log(`${file.padEnd(26)} ${String(kb(o)).padStart(5)} KB -> ${String(kb(n)).padStart(4)} KB  ${parse(out).base}`);
  } catch (e) {
    console.error(`ERROR ${file}: ${e.message}`);
  }
}

console.log(`\nTotal: ${kb(before)} KB -> ${kb(after)} KB  (ahorro ${kb(before - after)} KB)`);

// ---- Logos de marca + favicon (a partir de los originales Logo_Condor*) ----
// Genera: logo-condor.webp (con fondo, para previews), logo-condor-sin-fondo.webp
// (transparente, para header/footer/loader) y favicon-{32,180,192}.png (solo el cóndor).
try {
  await sharp(join(DIR, "Logo_Condor.jpg"))
    .resize({ width: 1200 }).webp({ quality: 82 })
    .toFile(join(DIR, "logo-condor.webp"));

  const sinFondo = join(DIR, "Logo_Condor_sin_fondo.png");
  await sharp(sinFondo)
    .resize({ width: 600 }).webp({ quality: 90 })
    .toFile(join(DIR, "logo-condor-sin-fondo.webp"));

  // Favicon: recorta la zona superior (solo el ave) y la centra en un cuadrado transparente.
  const meta = await sharp(sinFondo).metadata();
  const crop = await sharp(sinFondo)
    .extract({ left: 0, top: 0, width: meta.width, height: Math.round(meta.height * 0.57) })
    .png().toBuffer();
  const bird = await sharp(crop).trim().png().toBuffer();   // separar trim evita "bad extract area"
  for (const sz of [32, 180, 192]) {
    await sharp(bird)
      .resize(sz, sz, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png().toFile(join(DIR, `favicon-${sz}.png`));
  }
  console.log("Logos y favicon generados.");
} catch (e) {
  console.error(`ERROR logos/favicon: ${e.message}`);
}
