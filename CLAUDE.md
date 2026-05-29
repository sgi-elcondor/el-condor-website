# CLAUDE.md — Reglas de trabajo

## Comunicación
- **Responde siempre en español.**
- **Ahorra tokens**: respuestas breves, directas, sin relleno ni resúmenes obvios.
- **Menos prosa, más código**: prefiere bloques de código, diffs, tablas y listas
  cortas en lugar de párrafos largos. Explica solo lo no evidente.
- No repitas el código que el usuario ya tiene; muestra solo lo que cambia.

## Antes de editar
1. **Si tienes una opción mejor que el planteamiento del usuario, dilo primero**
   (1-2 líneas: qué propones y por qué) antes de tocar nada.
2. **Muestra el plan** de lo que vas a cambiar (archivos + cambios concretos)
   antes de aplicarlo. Para cambios de una línea, basta una frase.
3. Si el cambio afecta varias páginas/recursos, indícalo.

## Calidad de código
- **Código limpio**: nombres claros, funciones pequeñas, sin duplicación (DRY).
- Sigue las convenciones ya presentes en el repo (estilo, indentación, idioma).
- No agregues dependencias ni librerías sin justificarlo; la plantilla ya fue depurada.
- No dejes código muerto, `console.log` de depuración ni comentarios obvios.
- Maneja errores donde importe (p. ej. `fetch` con `.catch`).

## Contexto del proyecto
- Sitio **estático**: HTML + CSS + JS vanilla/jQuery. **Sin build ni backend.**
- Los datos viven en `assets/data/*.json` y se cargan con `fetch()`
  → requiere servidor HTTP, no `file://`.
- **`proyectos.json` es la fuente de verdad** del catálogo: agregar/editar
  proyectos se hace ahí, no en el HTML.
- **Header y footer** se editan **solo** en `partials/`; no duplicar en cada página.
- **Rutas relativas** siempre. Nombres de archivo en minúsculas, sin espacios ni tildes.
- Ver `DOCUMENTACION.md` para el árbol completo y el detalle de cada archivo.

## No hacer sin pedirlo
- Reestructurar carpetas (rompe rutas cableadas en los HTML).
- Borrar archivos sin confirmar que no se referencian en HTML/CSS/JS/JSON.
- Hacer `commit`/`push` salvo que el usuario lo solicite.
