document.addEventListener("DOMContentLoaded", () => {

    // Valorization chart — only runs if canvas exists (index.html)
    const chartCtx = document.getElementById("graficaValorizacion");
    if (chartCtx) {
        new Chart(chartCtx, {
            type: "line",
            data: {
                labels: ["Inicio", "Año 1", "Año 2", "Año 3", "Año 4"],
                datasets: [{
                    label: "Valor del lote (millones COP)",
                    data: [10, 15, 25, 30, 35],
                    borderColor: "#ff7a00",
                    backgroundColor: "rgba(255,122,0,0.15)",
                    tension: 0.4,
                    fill: true,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: ctx => `$ ${ctx.parsed.y} millones`
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: { callback: val => `$${val}M` },
                        title: { display: true, text: "Precio del lote" }
                    },
                    x: {
                        title: { display: true, text: "Tiempo" }
                    }
                }
            }
        });
    }

    // Project detail page — only runs if URL has ?id= (proyecto.html)
    const slug = new URLSearchParams(window.location.search).get("id");
    if (!slug) return;

    fetch("assets/data/proyectos.json")
        .then(r => r.json())
        .then(data => {
            const proyecto = data.find(p => p.slug === slug);
            if (!proyecto) return;

            const set = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.innerText = val;
            };

            const ciudadDep = `${proyecto.ciudad}, ${proyecto.departamento}`;

            // Page title + canonical
            document.title = proyecto.nombre + " | Lotes en " + proyecto.ciudad + " | El Cóndor";
            const canonical = document.getElementById("page-canonical");
            if (canonical) canonical.href = "https://somoselcondor.com/proyecto?id=" + slug;

            // Meta description dinámica
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) { metaDesc = document.createElement("meta"); metaDesc.name = "description"; document.head.appendChild(metaDesc); }
            metaDesc.content = proyecto.nombre + " — Lotes en " + proyecto.ciudad + ", " + proyecto.departamento + ". " + (proyecto.descripcion || "") + " Facilidades de pago sin intereses.";

            // Schema JSON-LD dinámico
            const schema = {
                "@context": "https://schema.org",
                "@type": "LandForm",
                "name": proyecto.nombre,
                "description": proyecto.descripcion || "",
                "url": "https://somoselcondor.com/proyecto?id=" + slug,
                "image": proyecto.logo ? "https://somoselcondor.com/" + proyecto.logo : "",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": proyecto.ciudad,
                    "addressRegion": proyecto.departamento,
                    "addressCountry": "CO"
                },
                "offers": proyecto.precioTexto ? {
                    "@type": "Offer",
                    "price": proyecto.precio || "",
                    "priceCurrency": "COP",
                    "description": "Facilidades de pago hasta 36 meses sin intereses"
                } : undefined,
                "provider": { "@id": "https://somoselcondor.com/#organization" }
            };
            const schemaEl = document.createElement("script");
            schemaEl.type = "application/ld+json";
            schemaEl.textContent = JSON.stringify(schema);
            document.head.appendChild(schemaEl);

            // Hero
            set("proyecto-nombre", proyecto.nombre);
            set("proyecto-descripcion", proyecto.descripcion);
            set("proyecto-hero-ciudad", ciudadDep);

            const tipoLabels = {
                urbanizacion: "Urbanización",
                conjunto: "Conjunto Cerrado",
                condominio: "Condominio"
            };
            const badge = document.getElementById("proyecto-tipo-badge");
            if (badge && proyecto.tipo) badge.textContent = tipoLabels[proyecto.tipo] || proyecto.tipo;

            const logoHero = document.getElementById("proyecto-logo-hero");
            if (logoHero && proyecto.logo) { logoHero.src = proyecto.logo; logoHero.alt = proyecto.nombre; }

            // Stats bar
            set("pstat-ubicacion", ciudadDep);
            set("pstat-area", proyecto.area || "—");
            set("pstat-precio", proyecto.precioTexto || "Consultar");

            // Map
            set("proyecto-ubicacion", proyecto.ubicacion || ciudadDep);
            set("proyecto-ubicacion-texto", proyecto.ubicacionTexto || "");

            const mapa = document.getElementById("mapa-proyecto");
            if (mapa && proyecto.mapa) mapa.src = proyecto.mapa;

            // Street view (conditional)
            const sv        = document.getElementById("street-view-iframe");
            const svSection = document.getElementById("street-view-section");
            if (sv && proyecto.streetView) {
                sv.src = proyecto.streetView;
                svSection.style.display = "block";
            }

            // Characteristics
            const caractGrid = document.getElementById("caracteristicas-grid");
            if (caractGrid && proyecto.caracteristicas?.length) {
                const iconMap = {
                    "urbanización": "fa-home", "urbanizaci": "fa-home",
                    "conjunto":     "fa-lock",
                    "condominio":   "fa-shield",
                    "portería":     "fa-shield", "porteri":    "fa-shield",
                    "servicios":    "fa-bolt",
                    "sin intereses":"fa-percent",
                    "financiación": "fa-calendar-check-o", "financiaci": "fa-calendar-check-o",
                    "vías":         "fa-road", "vías": "fa-road",
                    "zonas comunes":"fa-tree",
                    "agua":         "fa-tint",
                    "alcantarillado":"fa-cogs",
                    "valorización": "fa-line-chart", "valoriz":    "fa-line-chart",
                    "escritura":    "fa-file-text-o",
                    "precio":       "fa-tag",
                    "seguridad":    "fa-lock",
                    "piscina":      "fa-tint",
                    "naturaleza":   "fa-leaf",
                    "lotes":        "fa-map",
                };
                const getIcon = text => {
                    const lower = text.toLowerCase();
                    for (const [key, icon] of Object.entries(iconMap)) {
                        if (lower.includes(key)) return icon;
                    }
                    return "fa-check-circle";
                };
                caractGrid.innerHTML = proyecto.caracteristicas.map((c, i) =>
                    `<div class="col-sm-6 col-md-4 col-lg-3 mb-4">
                        <div class="proy-caract-card" data-aos="fade-up" data-aos-delay="${i * 60}">
                            <div class="proy-caract-icon">
                                <i class="fa ${getIcon(c)}"></i>
                            </div>
                            <div class="proy-caract-text">${c}</div>
                        </div>
                    </div>`
                ).join("");
            }

            // Gallery
            const galeriaEl = document.getElementById("galeria-proyecto");
            if (galeriaEl && proyecto.imagenes?.length) {
                proyecto.imagenes.forEach(img => {
                    const slide = document.createElement("div");
                    slide.className = "swiper-slide";
                    slide.innerHTML = `<a href="${img}"><img src="${img}" alt="${proyecto.nombre}"></a>`;
                    galeriaEl.appendChild(slide);
                });

                const swiper = new Swiper(".proyecto-galeria", {
                    loop: true,
                    spaceBetween: 30,
                    centeredSlides: true,
                    pagination: { el: ".swiper-pagination", clickable: true }
                });

                if (typeof window.lightGallery === "function") {
                    const lg = window.lightGallery(galeriaEl, { selector: "a", download: false });
                    document.querySelector(".galeria-fullscreen-btn")
                        ?.addEventListener("click", () => lg.openGallery(swiper.realIndex));
                }

                document.querySelector(".galeria-prev-btn")
                    ?.addEventListener("click", () => swiper.slidePrev());
                document.querySelector(".galeria-next-btn")
                    ?.addEventListener("click", () => swiper.slideNext());
            }

            // Tabla de precios por tipología (desde lotes[])
            const tablaEl = document.getElementById("precios-tabla");
            const preciosConsultar = document.getElementById("precios-consultar");
            if (tablaEl && proyecto.lotes && proyecto.lotes.length) {
                const fmtPrecio = n => "$ " + Math.round(n).toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                const filas = proyecto.lotes.map(l =>
                    `<tr><td>${l.label}</td><td class="precio-col">${l.desde ? "desde " : ""}${fmtPrecio(l.precio)}</td></tr>`
                ).join("");
                tablaEl.innerHTML =
                    `<div class="precios-tabla-wrap">
                        <table class="precios-tabla">
                            <thead><tr><th>Tipología</th><th class="precio-col">Precio</th></tr></thead>
                            <tbody>${filas}</tbody>
                        </table>
                    </div>
                    <p class="precios-nota">
                        Precios sujetos a disponibilidad. Financiación directa sin intereses.
                        <a href="/simulador">Simula tu plan de pago &rarr;</a>
                    </p>`;
            } else if (preciosConsultar) {
                preciosConsultar.style.display = "block";
            }
        })
        .catch(function(err) {
            console.error(err);
            var hero = document.getElementById("proyecto-nombre");
            if (hero) hero.textContent = "No se pudo cargar el proyecto. Recarga la página.";
        });
});
