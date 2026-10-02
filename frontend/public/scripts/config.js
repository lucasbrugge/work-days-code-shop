const CONFIG = {
  API_URL: window.API_URL || "http://localhost:8000/api",
  STORE_NAME: "Groove Discos",
  // Raiz do site (pasta frontend/), calculada a partir de onde este arquivo está.
  // Serve para redirecionar ao login de qualquer página, em qualquer profundidade.
  SITE_ROOT: new URL("../", document.currentScript.src).href,
};