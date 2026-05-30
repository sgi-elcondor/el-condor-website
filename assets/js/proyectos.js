// Renderiza las tarjetas de proyectos desde proyectos.json (fuente de verdad).
//   - index.html       → #proyectos-destacados (tarjetas .media)
//   - proyectos.html   → #proyectos-grid (tarjetas .proy-card + filtros)
(function () {
    const gridDestacados = document.getElementById("proyectos-destacados");
    const gridLista      = document.getElementById("proyectos-grid");
    if (!gridDestacados && !gridLista) return;

    const tipoLabel = {
        urbanizacion: "Urbanización",
        conjunto: "Conjunto privado",
        condominio: "Condominio"
    };
    const esLuxury = tipo => tipo !== "urbanizacion";

    fetch("assets/data/proyectos.json")
        .then(r => r.json())
        .then(data => {
            if (gridDestacados) {
                gridDestacados.innerHTML = data.map(cardDestacado).join("");
            }
            if (gridLista) {
                gridLista.innerHTML = data.map(cardLista).join("");
                initFiltros();
            }
            if (window.AOS) AOS.refreshHard();
        })
        .catch(function (err) {
            console.error(err);
            const grid = gridDestacados || gridLista;
            grid.innerHTML = '<p class="text-center text-muted py-5">' +
                "No se pudieron cargar los proyectos. Recarga la página.</p>";
        });

    function cardDestacado(p, i) {
        const tipo = tipoLabel[p.tipo] || p.tipo;
        const linea1 = p.precioDesde
            ? `<li><strong>Desde:</strong> ${p.precioTexto}</li>`
            : `<li><strong>Tipo:</strong> ${tipo}</li>`;
        return `
            <div class="col-sm-6 col-lg-4">
                <div class="media" data-aos="fade-up" data-aos-delay="${(i % 3 + 1) * 100}" data-aos-duration="400">
                    <img class="mr-4" src="${p.logo}" alt="${p.nombre}" loading="lazy">
                    <div class="media-body">
                        <h3 class="proyecto-card-title">${p.nombre}</h3>
                        <p class="proyecto-card-meta">${p.ciudad}, ${p.departamento} · ${tipo}</p>
                        <p class="proyecto-card-desc">${p.descripcion}</p>
                        <ul class="list-unstyled small mt-2">
                            ${linea1}
                            <li><strong>Área:</strong> ${p.area}</li>
                        </ul>
                        <div class="mt-2">
                            <a href="/proyecto?id=${p.slug}" class="btn btn-outline-primary btn-sm">Ver proyecto</a>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    function cardLista(p) {
        const tipo = tipoLabel[p.tipo] || p.tipo;
        const luxury = esLuxury(p.tipo);
        const precio = p.precioDesde
            ? `<li><i class="fa fa-tag"></i><span><strong>Desde</strong> ${p.precioTexto}</span></li>`
            : `<li><i class="fa fa-tag"></i><span>${p.precioTexto}</span></li>`;
        return `
            <div class="col-md-6 col-lg-4 mb-4 proyecto-card"
                 data-tipo="${p.tipo}" data-precio-cat="${p.precioCat}" data-area-cat="${p.areaCat}">
                <div class="proy-card${luxury ? " proy-card-luxury" : ""}">
                    <div class="proy-card-header">
                        <img src="${p.logo}" alt="${p.nombre}">
                        <span class="proy-type-badge${luxury ? " proy-badge-luxury" : ""}">${tipo}</span>
                    </div>
                    <div class="proy-card-body">
                        <h5>${p.nombre}</h5>
                        <p class="proy-ubicacion"><i class="fa fa-map-marker"></i> ${p.ciudad}, ${p.departamento}</p>
                        <p class="proy-desc">${p.descripcion}</p>
                        <ul class="proy-specs">
                            ${precio}
                            <li><i class="fa fa-expand"></i><span><strong>Área</strong> ${p.area}</span></li>
                            <li><i class="fa fa-clock-o"></i><span>Facilidades de pago sin intereses</span></li>
                        </ul>
                    </div>
                    <div class="proy-card-footer">
                        <a href="/proyecto?id=${p.slug}" class="btn proy-btn">
                            Ver proyecto <i class="fa fa-arrow-right ml-1"></i>
                        </a>
                    </div>
                </div>
            </div>`;
    }

    function initFiltros() {
        const tarjetas = Array.from(document.querySelectorAll(".proyecto-card"));
        const mensaje    = document.getElementById("mensaje-sin-resultados");
        const btnLimpiar = document.getElementById("btn-limpiar");
        if (!mensaje || !btnLimpiar) return;

        const getVal = name => {
            const r = document.querySelector('input[name="' + name + '"]:checked');
            return r ? r.value : "";
        };

        const filtrar = () => {
            const tipo   = getVal("ft");
            const precio = getVal("fp");
            const area   = getVal("fa");
            let visibles = 0;

            tarjetas.forEach(p => {
                const ok = (!tipo   || p.dataset.tipo      === tipo) &&
                           (!precio || p.dataset.precioCat === precio) &&
                           (!area   || p.dataset.areaCat   === area);
                p.classList.toggle("d-none", !ok);
                if (ok) visibles++;
            });

            mensaje.style.display = visibles === 0 ? "block" : "none";
        };

        document.querySelectorAll('input[name="ft"], input[name="fp"], input[name="fa"]')
            .forEach(inp => inp.addEventListener("change", filtrar));

        btnLimpiar.addEventListener("click", function () {
            document.querySelectorAll('input[name="ft"][value=""], input[name="fp"][value=""], input[name="fa"][value=""]')
                .forEach(inp => { inp.checked = true; });
            filtrar();
        });
    }
})();
