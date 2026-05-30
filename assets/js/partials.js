// Inyecta el header y el footer compartidos desde /partials.
["header", "footer"].forEach(function (id) {
    fetch("partials/" + id + ".html")
        .then(r => r.text())
        .then(html => {
            const slot = document.getElementById(id);
            if (slot) slot.innerHTML = html;
        })
        .catch(console.error);
});

// Rellena teléfono y email desde empresa.json (solo en páginas que los muestran).
if (document.getElementById("empresa-telefono") || document.getElementById("empresa-email")) {
    fetch("assets/data/empresa.json")
        .then(r => r.json())
        .then(data => {
            const tel  = document.getElementById("empresa-telefono");
            const mail = document.getElementById("empresa-email");
            if (tel)  tel.textContent  = data.telefono;
            if (mail) mail.textContent = data.email;
        })
        .catch(console.error);
}
