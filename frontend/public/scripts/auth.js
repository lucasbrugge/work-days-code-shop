const Auth = {
  getToken() { return localStorage.getItem("auth_token"); },
  getUser() {
    try { return JSON.parse(localStorage.getItem("auth_user")); }
    catch { return null; }
  },
  isLoggedIn() { return !!this.getToken(); },
  isAdmin() { return this.getUser()?.role === "admin"; },
  set(token, user) {
    if (token) localStorage.setItem("auth_token", token);
    if (user) localStorage.setItem("auth_user", typeof user === "string" ? user : JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  },
};