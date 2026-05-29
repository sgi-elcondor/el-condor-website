# El Cóndor S.A.S — Sitio web

Sitio web estático de **El Cóndor S.A.S**, comercializadora de lotes en el Tolima
(Colombia). HTML, CSS y JavaScript puro, sin proceso de build.

## Páginas

| Archivo            | Descripción                                              |
|--------------------|----------------------------------------------------------|
| `index.html`       | Página principal (hero, proyectos destacados, contacto)  |
| `empresa.html`     | Información de la empresa                                 |
| `proyectos.html`   | Listado de proyectos / urbanizaciones                    |
| `proyecto.html`    | Detalle de un proyecto (galería, mapa, PDF de precios)   |
| `simulador.html`   | Simulador de cuotas y plan de pagos                      |
| `contacto.html`    | Formulario y datos de contacto                           |

## Estructura

```
.
├── index.html, empresa.html, proyectos.html,
│   proyecto.html, simulador.html, contacto.html
├── partials/            Cabecera y pie inyectados en cada página
│   ├── header.html
│   └── footer.html
├── assets/
│   ├── css/             Estilos (bootstrap, aos, swiper, font-awesome, propios)
│   ├── js/              Scripts (jquery, bootstrap, aos, swiper, app, main)
│   ├── images/          Imágenes del sitio
│   ├── fonts/           Fuentes (Font Awesome)
│   ├── data/            Datos en JSON (empresa, proyectos)
│   └── pdf/             Tablas de valores descargables
├── output/              Visor de tour virtual 360° (export Pano2VR)
├── robots.txt
└── sitemap.xml
```

Los datos de proyectos y empresa se cargan dinámicamente desde `assets/data/*.json`.

## Desarrollo local

Al usar `fetch()` para los JSON, debe servirse por HTTP (no abrir con `file://`):

```bash
# Python
python -m http.server 8000
# o Node
npx serve .
```

Luego abrir <http://localhost:8000>.
