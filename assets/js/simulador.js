// Simulador de cuotas. Compartido por index.html (versión simple) y
// simulador.html (versión completa: split de inicial, día de pago y cronograma).
// Las funciones avanzadas se activan solo si sus elementos existen en la página.
(function () {
    var $ = function (id) { return document.getElementById(id); };

    var precioInput = $("sim-precio");
    if (!precioInput) return;

    var inicialInput  = $("sim-inicial");
    var mesesInput    = $("sim-meses");
    var simBtn        = $("sim-btn");
    var resultado     = $("sim-resultado");
    var permutaCheck  = $("sim-permuta-check");
    var permutaFields = $("sim-permuta-fields");
    var permutaValor  = $("sim-permuta-valor");
    var nSplitSelect  = $("sim-n-split");      // solo simulador.html
    var diaSelect     = $("sim-dia");          // solo simulador.html
    var cronoWrapper  = $("cronograma-wrapper"); // solo simulador.html

    /* ── helpers ── */
    function formatCOP(val) {
        return val.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    function parseCOP(val) {
        return parseInt((val || "").replace(/\./g, ""), 10) || 0;
    }
    function fmt(n) {
        return "$ " + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    var MESES_CORTO = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    var MESES_LARGO = ["enero","febrero","marzo","abril","mayo","junio","julio",
                       "agosto","septiembre","octubre","noviembre","diciembre"];
    function fmtCorto(d) { return d.getDate() + " " + MESES_CORTO[d.getMonth()] + " " + d.getFullYear(); }
    function fmtLargo(d) { return MESES_LARGO[d.getMonth()] + " " + d.getFullYear(); }

    /* ── formato de inputs monetarios ── */
    [precioInput, inicialInput, permutaValor].forEach(function (el) {
        el.addEventListener("input", function () {
            var pos  = this.selectionStart;
            var prev = this.value.length;
            this.value = formatCOP(this.value);
            var diff = this.value.length - prev;
            this.setSelectionRange(pos + diff, pos + diff);
        });
    });

    mesesInput.addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, "");
    });

    permutaCheck.addEventListener("change", function () {
        permutaFields.style.display = this.checked ? "block" : "none";
        if (!this.checked) {
            permutaValor.value = "";
            $("sim-permuta-desc").value = "";
        }
    });

    /* ── calcular ── */
    simBtn.addEventListener("click", function () {
        var precio  = parseCOP(precioInput.value);
        var inicial = parseCOP(inicialInput.value);
        var meses   = parseInt(mesesInput.value) || 0;
        var permuta = permutaCheck.checked ? parseCOP(permutaValor.value) : 0;
        var nSplit  = nSplitSelect ? (parseInt(nSplitSelect.value) || 1) : 1;
        var dia     = diaSelect    ? (parseInt(diaSelect.value) || 5) : 5;

        /* validación */
        var valid = true;
        [[precioInput,  !precio || precio <= 0],
         [inicialInput, !inicial || inicial <= 0 || inicial >= precio],
         [mesesInput,   !meses || meses <= 0]
        ].forEach(function (p) {
            if (p[1]) { p[0].classList.add("is-invalid");    valid = false; }
            else      { p[0].classList.remove("is-invalid"); }
        });
        if (!valid) return;

        var precioAjustado = precio - permuta;
        var saldo          = Math.max(precioAjustado - inicial, 0);
        var cuotaMensual   = meses > 0 ? Math.round(saldo / meses) : 0;
        var cuotaSplit     = nSplit > 1 ? Math.round(inicial / nSplit) : 0;
        var umbral30       = precio * 0.30;

        /* panel resultado */
        ["res-precio","res-inicial","res-saldo","res-cuota"].forEach(function (id) {
            var el = $(id);
            el.classList.remove("sim-val-anim");
            void el.offsetWidth;
            el.classList.add("sim-val-anim");
        });

        $("res-precio").textContent  = fmt(precio);
        $("res-inicial").textContent = fmt(inicial);
        $("res-saldo").textContent   = fmt(saldo);
        $("res-cuota").textContent   = fmt(cuotaMensual);

        var splitRow = $("res-split-row");
        if (splitRow) {
            if (nSplit > 1) {
                $("res-split").textContent = fmt(cuotaSplit) + " × " + nSplit;
                splitRow.style.display = "flex";
            } else {
                splitRow.style.display = "none";
            }
        }

        var permutaRow = $("res-permuta-row");
        if (permutaRow) {
            if (permuta > 0) {
                $("res-permuta").textContent = "– " + fmt(permuta);
                permutaRow.style.display = "flex";
            } else {
                permutaRow.style.display = "none";
            }
        }

        resultado.classList.add("sim-activo");

        /* ── cronograma (solo simulador.html) ── */
        if (cronoWrapper) {
            renderCronograma(precio, inicial, meses, nSplit, dia, cuotaMensual, cuotaSplit, umbral30);
            cronoWrapper.style.display = "block";
            cronoWrapper.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });

    function renderCronograma(precio, inicial, meses, nSplit, dia, cuotaMensual, cuotaSplit, umbral30) {
        var pagos = [];
        var acumulado = 0;
        var escriturasMes = null;
        var hoy = new Date();
        var base = new Date(hoy.getFullYear(), hoy.getMonth() + 1, dia);

        function addPago(num, fecha, concepto, monto) {
            acumulado += monto;
            var milestone = escriturasMes === null && acumulado >= umbral30;
            if (milestone) escriturasMes = num;
            pagos.push({ num: num, fecha: fecha, concepto: concepto,
                         monto: monto, acumulado: acumulado,
                         pct: acumulado / precio * 100, milestone: milestone });
        }

        var n = 1;
        if (nSplit > 1) {
            for (var i = 0; i < nSplit; i++) {
                addPago(n++,
                    new Date(base.getFullYear(), base.getMonth() + i, dia),
                    "Cuota inicial · Pago " + (i + 1) + "/" + nSplit,
                    cuotaSplit);
            }
            for (var j = 0; j < meses; j++) {
                addPago(n++,
                    new Date(base.getFullYear(), base.getMonth() + nSplit + j, dia),
                    "Facilidad de pago · Cuota " + (j + 1) + "/" + meses,
                    cuotaMensual);
            }
        } else {
            addPago(n++,
                new Date(base.getFullYear(), base.getMonth(), dia),
                "Cuota inicial", inicial);
            for (var k = 0; k < meses; k++) {
                addPago(n++,
                    new Date(base.getFullYear(), base.getMonth() + 1 + k, dia),
                    "Facilidad de pago · Cuota " + (k + 1) + "/" + meses,
                    cuotaMensual);
            }
        }

        var tbody = $("cronograma-body");
        tbody.innerHTML = "";
        pagos.forEach(function (p) {
            var tr = document.createElement("tr");
            if (p.milestone) tr.className = "escritura-row";
            var badge = p.milestone
                ? '<span class="escritura-badge"><i class="fa fa-home"></i> Escrituras</span>'
                : "";
            var pctClass = p.pct >= 30 ? "pct-label pct-ok" : "pct-label";
            var esInicial = p.concepto.indexOf("Cuota inicial") === 0;
            tr.innerHTML =
                "<td>" + p.num + "</td>" +
                "<td>" + fmtCorto(p.fecha) + "</td>" +
                '<td class="' + (esInicial ? "crono-concepto-inicial" : "crono-concepto-fin") + '">' + p.concepto + "</td>" +
                '<td class="text-right">' + fmt(p.monto) + "</td>" +
                '<td class="text-right">' + fmt(p.acumulado) + "</td>" +
                '<td class="text-right"><span class="' + pctClass + '">' + p.pct.toFixed(1) + "%</span></td>" +
                "<td>" + badge + "</td>";
            tbody.appendChild(tr);
        });

        var totalPagos = nSplit > 1 ? (nSplit + meses) : (1 + meses);
        $("crono-meta").textContent = totalPagos + " pagos · desde " + fmtCorto(base);

        var notaEl = $("cronograma-nota");
        var escrituraRow = $("res-escritura-row");
        if (escriturasMes !== null) {
            var mesDat = pagos[escriturasMes - 1];
            notaEl.innerHTML =
                '<i class="fa fa-home mr-1 sim-escritura-ico"></i> ' +
                "<strong>Las escrituras del lote se entregan a partir del pago #" + escriturasMes + "</strong>" +
                " (" + fmtLargo(mesDat.fecha) + "), cuando el total pagado alcanza el 30% del valor del lote" +
                " (" + fmt(umbral30) + ").";

            $("res-escritura").textContent = "Pago #" + escriturasMes + " · " + fmtLargo(mesDat.fecha);
            escrituraRow.style.display = "flex";
        } else {
            notaEl.innerHTML =
                '<i class="fa fa-info-circle mr-1 sim-nota-ico"></i>' +
                "El 30% del lote (" + fmt(umbral30) + ") se alcanza al finalizar el plan completo.";
            escrituraRow.style.display = "none";
        }
    }
})();
