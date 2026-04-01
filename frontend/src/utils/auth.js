// 🔥 STORE AUTH
export const setAuth = ({ token, user }) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

// 🔥 GET AUTH
export const getAuth = () => {
  return {
    token: localStorage.getItem("token"),
    user: JSON.parse(localStorage.getItem("user") || "null"),
  };
};

// 🔥 TOKEN ONLY (if needed)
export const getToken = () => {
  return localStorage.getItem("token");
};

// 🔥 LOGOUT
export const logout = () => {
  localStorage.clear();
};