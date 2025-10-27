export const isLoggedIn = () => {
  return document.cookie.includes("token=");
};