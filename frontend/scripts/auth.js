const Auth = {
  getToken() {
    return localStorage.getItem("auth_token");
  },

  getUser() {
    try {
      return JSON.parse(
        localStorage.getItem("auth_user")
      );
    } catch {
      return null;
    }
  },

  set(token, user) {
    localStorage.setItem(
      "auth_token",
      token
    );

    localStorage.setItem(
      "auth_user",
      JSON.stringify(user)
    );
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  isAdmin() {
    return this.getUser()?.role === "admin";
  },

  clear() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  },
};