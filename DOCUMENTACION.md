# Documentación — Sitio web El Cóndor S.A.S

Sitio **estático** (HTML + CSS + JavaScript vanilla + jQuery). **Sin build, sin
backend, sin dependencias de npm.** Los datos se cargan en tiempo de ejecución
desde archivos JSON con `fetch()`, por lo que el sitio **debe servirse por HTTP**
(no abrir con `file://`).

---

## 1. Árbol de ficheros

```
Website/
├── index.html              Página principal (home)
├── empresa.html            Quiénes somos / misión / visión
├── proyectos.html          Listado de proyectos con filtros
├── proyecto.html           Detalle de UN proyecto (?id=slug)
├── simulador.html          Simulador de cuotas / plan de pagos
├── contacto.html           Datos de contacto + WhatsApp
├── robots.txt              SEO: reglas para crawlers
├── sitemap.xml             SEO: mapa del sitio (URLs limpias)
├── netlify.toml            Config de Netlify: publish dir + redirects .html → limpias
├── README.md               Resumen e instrucciones de arranque
├── DOCUMENTACION.md         Este archivo
├── CLAUDE.md               Reglas de trabajo para el asistente (Claude)
│
├── partials/               Fragmentos HTML reutilizables (inyectados por fetch)
│   ├── header.html         Navbar (logo + menú + botón Compradores)
│   └── footer.html         Pie de página (contacto, redes, enlaces)
│
├── assets/
│   ├── css/
│   │   ├── style.css            Estilos propios del sitio (principal)
│   │   ├── responsive.css       Ajustes responsive propios
│   │   ├── bootstrap.css        Bootstrap (grid + componentes)
│   │   ├── aos/aos.css          Animaciones al hacer scroll (AOS)
│   │   ├── swiper/swiper.css    Carruseles (Swiper)
│   │   ├── loader/loaders.css   Animación de carga inicial
│   │   └── font-awesome/font-awesome.css   Íconos
│   │
│   ├── js/
│   │   ├── app.js               Lógica propia: detalle de proyecto + gráfica
│   │   ├── main.js              Lógica propia: AOS, slider testimonios, header
│   │   ├── proyectos.js         Renderiza tarjetas (index + proyectos.html) desde JSON + filtros
│   │   ├── simulador.js         Simulador de cuotas (index simple + simulador.html con cronograma)
│   │   ├── partials.js          Inyecta header/footer y rellena contacto desde empresa.json
│   │   ├── jquery-3.3.1.js      Librería jQuery
│   │   ├── bootstrap.bundle.js  Bootstrap JS (+ Popper)
│   │   ├── aos.js               Librería AOS
│   │   └── swiper.min.js        Librería Swiper
│   │
│   ├── images/             Logos, fotos de proyectos, hero, equipo (23 archivos)
│   ├── fonts/              Fuentes de Font Awesome (webfont.*)
│   ├── data/
│   │   ├── empresa.json         Datos de contacto/empresa (teléfonos, redes…)
│   │   └── proyectos.json       Catálogo de proyectos (fuente de verdad)
│   └── pdf/                Tablas de valores descargables (1 por proyecto)
│
└── output/                Tour virtual 360° (export de Pano2VR — independiente)
    ├── index.html              Visor del tour
    ├── pano2vr_player.js        Motor del visor
    ├── pano.xml / gginfo.json   Configuración del panorama
    └── tiles/                   134 imágenes (mosaicos del panorama)
```

---

## 2. Cómo se componen las páginas

Todas las páginas comparten la misma estructura y el mismo bloque de scripts al
final del `<body>`:

```html
<div id="header"></div>   <!-- relleno por partials.js -->
   ... contenido propio de la página ...
<div id="footer"></div>   <!-- relleno por partials.js -->

<script src="assets/js/jquery-3.3.1.js"></script>
<script src="assets/js/bootstrap.bundle.js"></script>
<script src="assets/js/aos.js"></script>
<script src="assets/js/main.js"></script>
<script src="assets/js/partials.js"></script>
<!-- swiper.min.js, app.js y proyectos.js solo donde se necesitan -->
```

**Header y footer** no se copian en cada HTML: `partials.js` los carga una sola
vez desde `partials/` con `fetch()` e inyecta en los contenedores `#header` /
`#footer`. Editar el menú o el pie se hace **solo** en `partials/header.html` /
`partials/footer.html`. El mismo `partials.js` rellena teléfono/email desde
`empresa.json` en las páginas que muestran `#empresa-telefono` / `#empresa-email`.

### Flujo de datos

```
proyectos.json ──► proyectos.html  (lista + filtros, script inline)
               └─► proyecto.html   (detalle, app.js, lee ?id=slug)
               └─► index.html      (proyectos destacados)

empresa.json   ──► contacto.html / proyecto.html / simulador.html
                   (rellena teléfono, email, WhatsApp)
```

**`proyectos.json` es la fuente de verdad del catálogo.** Agregar o editar un
proyecto se hace ahí; las páginas se actualizan solas. Campos por proyecto:
`id, slug, nombre, ciudad, departamento, tipo, logo, descripcion, ubicacion,
ubicacionTexto, mapa, lat, lng, precioDesde, precioTexto, precioCat, area,
areaCat, caracteristicas[], imagenes[], pdfPrecios`. `precioCat`
(`economico`/`premium`) y `areaCat` (`compacto`/`mediano`/`grande`) alimentan
los filtros de `proyectos.html`.

---

## 3. Detalle por archivo

### Páginas HTML

| Archivo           | Qué hace |
|-------------------|----------|
| `index.html`      | Home: hero, propuesta de valor, proyectos destacados, simulador inline, testimonios, CTA. Carga `swiper.min.js`. |
| `empresa.html`    | Misión, visión, equipo y un Street View embebido de Google Maps. |
| `proyectos.html`  | Renderiza tarjetas desde `proyectos.json` (vía `proyectos.js`) y filtra por tipo/precio/área en el cliente. |
| `proyecto.html`   | Página de detalle. Lee `?id=slug`, busca el proyecto en `proyectos.json` y rellena hero, galería (Swiper + lightGallery), mapa, características, Street View y PDF de precios. Genera meta-description y JSON-LD dinámicos para SEO. |
| `simulador.html`  | Calculadora de cuotas: precio, cuota inicial (con opción de dividirla), número de meses y día de pago. Calcula todo **en el cliente** (no usa JSON de lotes). |
| `contacto.html`   | Datos de contacto y botón de WhatsApp; rellena teléfono/email desde `empresa.json`. |

### JavaScript propio

| Archivo            | Responsabilidad |
|--------------------|-----------------|
| `app.js`           | Dos bloques independientes, cada uno protegido por una comprobación de existencia: (1) gráfica de valorización con Chart.js *(requiere incluir Chart.js; hoy el canvas no está presente → bloque inactivo)*; (2) renderizado del detalle de proyecto en `proyecto.html`. |
| `main.js`          | Inicializa AOS, el slider de testimonios (Swiper con autoplay), el ocultamiento del header al hacer scroll y el fade-out del loader. |
| `proyectos.js`     | Carga `proyectos.json` y pinta las tarjetas: destacados en `index.html` (`#proyectos-destacados`) y la lista filtrable de `proyectos.html` (`#proyectos-grid`), incluida la lógica de filtros por tipo/precio/área. |
| `simulador.js`     | Lógica del simulador de cuotas, compartida por `index.html` (versión simple) y `simulador.html` (añade split de la inicial, día de pago y cronograma). Las funciones extra se activan solo si sus elementos existen en la página. |
| `partials.js`      | Inyecta `partials/header.html` y `partials/footer.html` en `#header`/`#footer` (todas las páginas) y rellena teléfono/email desde `empresa.json` donde existen `#empresa-telefono`/`#empresa-email`. |

### Datos (`assets/data/`)

| Archivo           | Contenido |
|-------------------|-----------|
| `empresa.json`    | Razón social, NIT, teléfonos, WhatsApp, email, oficina, horario y redes sociales. |
| `proyectos.json`  | Array de proyectos (catálogo completo). Fuente única para listado, detalle y destacados. |

### Librerías de terceros

- **Locales** (`assets/js`, `assets/css`): jQuery, Bootstrap, AOS, Swiper, Font Awesome.
- **Por CDN** (solo en `proyecto.html`): lightGallery 2.7.1 (galería a pantalla completa).
- **Fuentes**: Google Fonts (Open Sans + Rajdhani).

### Tour virtual (`output/`)

Export autónomo de **Pano2VR**. Funciona por sí solo abriendo `output/index.html`,
pero **actualmente no está enlazado** desde ninguna página del sitio.

---

## 4. Desarrollo local

Como las páginas usan **URLs limpias** (Netlify sirve `empresa.html` en `/empresa`),
para que los enlaces internos (`/empresa`, `/proyecto?id=...`) funcionen igual que
en producción usa **Netlify CLI**:

```bash
npm i -g netlify-cli   # una sola vez
netlify dev            # replica URLs limpias + redirects de netlify.toml
```

Un servidor estático normal (`python -m http.server` / `npx serve`) **no** resuelve
`/empresa` (daría 404); solo sirve si abres `empresa.html` directamente. En todo
caso debe ser por HTTP, nunca `file://` (los `fetch()` de partials/JSON fallan).

---

## 5. Despliegue y ramas (Netlify)

- **Netlify despliega la rama `main`** (producción → el dominio público).
- Se trabaja en **`develop`** (rama por defecto de `git push`). `main` no recibe
  cambios hasta que tú lo decidas.
- Para publicar: fusionar `develop` → `main` y empujar `main`.

```bash
# trabajar (estando en develop)
git add -A && git commit -m "..." && git push      # sube a develop

# desplegar a producción
git checkout main && git merge develop && git push  # Netlify despliega
git checkout develop                                 # volver a trabajar
```

### URLs limpias
- Los enlaces internos apuntan a rutas sin extensión (`/`, `/empresa`, `/proyecto?id=x`).
- `netlify.toml` redirige (301) las rutas antiguas `*.html` a las limpias.
- **Las rutas de assets siguen siendo relativas** (`assets/...`) y no se tocan:
  funcionan porque cada página cuelga de la raíz `/`.

---

## 6. Convenciones

- **Rutas relativas** siempre (`assets/...`, `partials/...`) — el sitio puede vivir en un subdirectorio.
- **Nombres de archivo** en minúsculas y sin espacios ni tildes (kebab-case en los PDF).
- **Idioma del contenido**: español (`lang="es-CO"`).
- **No duplicar** header/footer en los HTML: editar solo en `partials/`.
- **No reintroducir** dependencias sin uso (se depuró la plantilla original).
