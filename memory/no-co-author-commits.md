---
name: no-co-author-commits
description: No incluir Co-Authored-By en los commits de este repo (rompe el deploy de Netlify)
metadata:
  type: feedback
---

En este proyecto los commits NO deben llevar el trailer `Co-Authored-By: Claude ...`.

**Why:** Netlify cuenta cada co-autor como un contribuidor adicional; en plan gratis + repo privado solo admite 1 contribuidor verificado y bloquea el build ("unrecognized Git contributor"). El trailer hizo fallar varios deploys de producción.

**How to apply:** Crear los commits solo con el autor `JabesMonroy <jmonroyb@unal.edu.co>`, sin línea `Co-Authored-By`. (2026-05-30 se reescribió el historial de main y develop para eliminarlo y se hizo force-push.)
