// Conversión a WebP + redimensionado de las imágenes pesadas del sitio.
// Uso: node scripts/optimize-images.mjs   (requiere devDependency "sharp")
// No toca logo.png ni los originales: solo genera los .webp.
import sharp from "sharp";
import { stat, readdir } from "node:fs/promises";
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

// ---- Fotos de asesores (assets/images/asesores) ----
// Convierte cada PNG a WebP (400 px basta para el círculo de 130 px en retina).
try {
  const ASES = join(DIR, "asesores");
  const pngs = (await readdir(ASES)).filter((f) => /\.png$/i.test(f));
  let b = 0, a = 0;
  for (const file of pngs) {
    const src = join(ASES, file);
    const out = join(ASES, parse(file).name + ".webp");
    const o = (await stat(src)).size;
    await sharp(src).resize({ width: 400, withoutEnlargement: true }).webp({ quality: 80 }).toFile(out);
    const n = (await stat(out)).size;
    b += o; a += n;
    console.log(`asesores/${file.padEnd(22)} ${String(kb(o)).padStart(5)} KB -> ${String(kb(n)).padStart(4)} KB`);
  }
  console.log(`Asesores: ${kb(b)} KB -> ${kb(a)} KB  (ahorro ${kb(b - a)} KB)`);
} catch (e) {
  console.error(`ERROR asesores: ${e.message}`);
}

// ---- Renders de proyectos (assets/images/Render_Mapas, carpeta cruda no versionada) ----
// Convierte los renders/planos a WebP con nombres kebab-case en assets/images/.
// Se excluyen los panoramas 360º (no sirven como foto plana de galería).
// { origen relativo a assets/images, nombre de salida (sin extensión) }
const RENDERS = [
  // La Esmeralda
  ["Render_Mapas/mapaesmeralda.jpeg",                              "esmeralda-mapa"],
  ["Render_Mapas/renders esmeralda/renders/05 RENDER PARQUE.jpg",  "esmeralda-parque-1"],
  ["Render_Mapas/renders esmeralda/renders/08 RENDER PARQUE.jpg",  "esmeralda-parque-2"],
  ["Render_Mapas/renders esmeralda/renders/13 RENDER PARQUE.jpg",  "esmeralda-parque-3"],
  ["Render_Mapas/renders esmeralda/renders/16  RENDER PARQUE.jpg", "esmeralda-parque-4"],
  ["Render_Mapas/renders esmeralda/renders/06 RENDER CASA TIPO I.jpg",  "esmeralda-casa-tipo-1"],
  ["Render_Mapas/renders esmeralda/renders/7 RENDER CASA TIPO II.jpg",  "esmeralda-casa-tipo-2"],
  ["Render_Mapas/renders esmeralda/renders/11  RENDER PORTERIA.jpg",    "esmeralda-porteria"],
  // La Esmeralda Luxury
  ["Render_Mapas/PLANTA LUXURY F.png",                             "esmeralda-luxury-planta"],
  ["Render_Mapas/renders esmeralda luxury/ENTREGABLE/RENDERS FACHADAS (2)/FACHADA FRONTAL 1.png",   "esmeralda-luxury-fachada-frontal"],
  ["Render_Mapas/renders esmeralda luxury/ENTREGABLE/RENDERS FACHADAS (2)/FACHADA ESQUINERA 1.png", "esmeralda-luxury-fachada-esquinera"],
  ["Render_Mapas/renders esmeralda luxury/ENTREGABLE/RENDERS INTERIORES (6)/SALA-COMEDOR Nº1.png",       "esmeralda-luxury-sala-comedor"],
  ["Render_Mapas/renders esmeralda luxury/ENTREGABLE/RENDERS INTERIORES (6)/COCINA Nº5.png",            "esmeralda-luxury-cocina"],
  ["Render_Mapas/renders esmeralda luxury/ENTREGABLE/RENDERS INTERIORES (6)/RENDER COCINA PERSPECTIVA.png", "esmeralda-luxury-cocina-perspectiva"],
  ["Render_Mapas/renders esmeralda luxury/ENTREGABLE/RENDERS INTERIORES (6)/RENDER ALCOBA PRINCIPAL 1.png", "esmeralda-luxury-alcoba-principal"],
  ["Render_Mapas/renders esmeralda luxury/ENTREGABLE/RENDERS INTERIORES (6)/ALCOBA Nº3.png",            "esmeralda-luxury-alcoba"],
  ["Render_Mapas/renders esmeralda luxury/ENTREGABLE/RENDERS INTERIORES (6)/BAÑO Nº2.png",              "esmeralda-luxury-bano"],
  ["Render_Mapas/renders esmeralda luxury/ENTREGABLE/RENDERS INTERIORES (6)/RENDER TINA 1.png",         "esmeralda-luxury-tina"],
  ["Render_Mapas/renders esmeralda luxury/ENTREGABLE/RENDERS PLANTAS (2)/RENDER PLANTA 1er PISO 1.png", "esmeralda-luxury-planta-1"],
  // Topacio
  ["Render_Mapas/cuadro interior TOPACIO-01.jpg.jpeg",             "topacio-interior"],
];

try {
  let b = 0, a = 0;
  for (const [file, name] of RENDERS) {
    const src = join(DIR, file);
    const out = join(DIR, name + ".webp");
    try {
      const o = (await stat(src)).size;
      await sharp(src).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(out);
      const n = (await stat(out)).size;
      b += o; a += n;
      console.log(`${name.padEnd(34)} ${String(kb(o)).padStart(6)} KB -> ${String(kb(n)).padStart(4)} KB`);
    } catch (e) {
      console.error(`ERROR ${name}: ${e.message}`);
    }
  }
  console.log(`Renders: ${kb(b)} KB -> ${kb(a)} KB  (ahorro ${kb(b - a)} KB)`);
} catch (e) {
  console.error(`ERROR renders: ${e.message}`);
}
