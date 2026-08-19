const setPromoCookie = (name, value, days) => { document.cookie = `${name}=${value}; expires=${new Date(Date.now() + days * 864e5).toUTCString()}; path=/`; };
const getPromoCookie = (name) => document.cookie.split("; ").find((row) => row.startsWith(`${name}=`))?.split("=")[1];
const promoBanner = document.querySelector("[data-promo-banner]");
if (promoBanner && !getPromoCookie("ugc_promo_dismissed")) promoBanner.removeAttribute("hidden");
document.querySelector("[data-promo-dismiss]")?.addEventListener("click", () => { promoBanner?.setAttribute("hidden", ""); setPromoCookie("ugc_promo_dismissed", "1", 7); });
