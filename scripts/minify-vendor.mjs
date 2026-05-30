// Minifica in-place las librerías de terceros (mismo nombre de archivo → sin
// cambios de referencia en el HTML). No toca el código propio del sitio.
// Uso: node scripts/minify-vendor.mjs   (devDeps: terser, clean-css-cli)
import { readFile, writeFile, stat } from "node:fs/promises";
import { minify as terserMinify } from "terser";
import CleanCSS from "clean-css";

const JS = [
  "assets/js/jquery-3.3.1.js",
  "assets/js/bootstrap.bundle.js",
  "assets/js/aos.js",
];
const CSS = [
  "assets/css/bootstrap.css",
  "assets/css/font-awesome/font-awesome.css",
  "assets/css/aos/aos.css",
];

const kb = (n) => Math.round(n / 1024);
const cleaner = new CleanCSS({ level: 2 });

for (const f of JS) {
  const o = (await stat(f)).size;
  const code = await readFile(f, "utf8");
  const res = await terserMinify(code, { compress: true, mangle: true });
  if (res.error) { console.error(`ERROR ${f}: ${res.error}`); continue; }
  await writeFile(f, res.code);
  console.log(`${f.padEnd(40)} ${String(kb(o)).padStart(4)} KB -> ${String(kb((await stat(f)).size)).padStart(3)} KB`);
}

for (const f of CSS) {
  const o = (await stat(f)).size;
  const out = cleaner.minify(await readFile(f, "utf8"));
  if (out.errors.length) { console.error(`ERROR ${f}: ${out.errors.join(", ")}`); continue; }
  await writeFile(f, out.styles);
  console.log(`${f.padEnd(40)} ${String(kb(o)).padStart(4)} KB -> ${String(kb((await stat(f)).size)).padStart(3)} KB`);
}
