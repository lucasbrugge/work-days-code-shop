const Auth = {
  getToken() { return localStorage.getItem("auth_token"); },
  getUser() {
    try { return JSON.parse(localStorage.getItem("auth_user")); }
    catch { return null; }
  },
  isLoggedIn() { return !!this.getToken(); },
  isAdmin() { return this.getUser()?.role === "admin"; },
  clear() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  },
};