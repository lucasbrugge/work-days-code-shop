const CONFIG = {
  API_URL: window.API_URL || "http://localhost:8000/api",
  STORE_NAME: "Groove Discos",
};
 
// Raiz do site (a pasta frontend/public/), calculada a partir de onde este arquivo está.
// Assim os links e redirecionamentos funcionam de qualquer pasta
// (raiz, pages/ ou admin/).
CONFIG.SITE_ROOT = new URL("../", document.currentScript.src).href;
CONFIG.PAGES_ROOT = CONFIG.SITE_ROOT + "pages/";
CONFIG.ADMIN_URL = CONFIG.SITE_ROOT + "admin/index.html";