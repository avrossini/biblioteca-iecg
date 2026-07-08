"use client";

import { useEffect } from "react";

/**
 * Registra o service worker (/sw.js) após o carregamento da página.
 * PWA é progressivo: se o navegador não suportar ou falhar, o app segue normal.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const registrar = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* silencioso */
      });
    };

    if (document.readyState === "complete") {
      registrar();
      return;
    }
    window.addEventListener("load", registrar);
    return () => window.removeEventListener("load", registrar);
  }, []);

  return null;
}
