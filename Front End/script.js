const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const siteNav = document.querySelector("[data-site-nav]");
const closeSubmenus = () => document.querySelectorAll(".nav-dropdown").forEach((dropdown) => dropdown.removeAttribute("open"));
const closeMenu = () => { document.body.classList.remove("menu-open"); menuToggle?.setAttribute("aria-expanded", "false"); menuToggle?.querySelector("b")?.replaceChildren(document.createTextNode("Open menu")); closeSubmenus(); };
menuToggle?.addEventListener("click", () => { const isOpen = document.body.classList.toggle("menu-open"); menuToggle.setAttribute("aria-expanded", String(isOpen)); menuToggle.querySelector("b")?.replaceChildren(document.createTextNode(isOpen ? "Close menu" : "Open menu")); document.querySelectorAll(".nav-dropdown").forEach((dropdown) => dropdown.toggleAttribute("open", isOpen)); });
siteNav?.addEventListener("click", (event) => { if (event.target.closest("a")) closeMenu(); });
const programLink = siteNav?.querySelector('[data-page-link="programs.html"]');
if (programLink) {
  const programDropdown = document.createElement("details");
  programDropdown.className = "nav-dropdown";
  programDropdown.innerHTML = '<summary>Programs <span aria-hidden="true">+</span></summary><div class="dropdown-menu"><a data-page-link="pubg.html" href="pubg.html">PUBG</a><a data-page-link="mobile-legends.html" href="mobile-legends.html">Mobile Legends</a><a data-page-link="brawl-stars.html" href="brawl-stars.html">Brawl Stars</a><a data-page-link="clash-of-clans.html" href="clash-of-clans.html">Clash of Clans</a><a data-page-link="roblox.html" href="roblox.html">Roblox</a></div>';
  programLink.replaceWith(programDropdown);
}
document.querySelectorAll('.dropdown-menu a[data-page-link="events.html"], .dropdown-menu a[data-page-link="media.html"]').forEach((link) => link.remove());
const navTargets = { Programs:"programs.html", Events:"events.html", Media:"media.html" };
document.querySelectorAll(".nav-dropdown").forEach((dropdown) => {
  const summary = dropdown.querySelector(":scope > summary");
  const label = summary?.textContent.replace("+", "").trim();
  const target = navTargets[label];
  summary?.addEventListener("click", (event) => { if (target) { event.preventDefault(); window.location.href = target; } });
  dropdown.addEventListener("mouseenter", () => dropdown.setAttribute("open", ""));
  dropdown.addEventListener("mouseleave", () => { if (!document.body.classList.contains("menu-open")) dropdown.removeAttribute("open"); });
  dropdown.addEventListener("focusin", () => dropdown.setAttribute("open", ""));
  dropdown.addEventListener("focusout", (event) => { if (!document.body.classList.contains("menu-open") && !dropdown.contains(event.relatedTarget)) dropdown.removeAttribute("open"); });
  dropdown.addEventListener("toggle", () => { if (dropdown.open && !document.body.classList.contains("menu-open")) document.querySelectorAll(".nav-dropdown").forEach((other) => { if (other !== dropdown) other.removeAttribute("open"); }); });
});
const currentPage = window.location.pathname.split("/").pop() || "index.html";
document.querySelectorAll("[data-page-link]").forEach((link) => link.classList.toggle("active", link.dataset.pageLink === currentPage));
const syncHeader = () => header?.classList.toggle("scrolled", window.scrollY > 12);
syncHeader(); window.addEventListener("scroll", syncHeader, { passive:true });
document.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", () => { const filter = button.dataset.filter; document.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("active", item === button)); document.querySelectorAll("[data-category]").forEach((card) => card.classList.toggle("is-hidden", filter !== "all" && card.dataset.category !== filter)); }));
const cartNote = document.querySelector("[data-cart-note]");
document.querySelectorAll("[data-cart]").forEach((button) => button.addEventListener("click", () => { if (cartNote) cartNote.textContent = `${button.dataset.cart} added to your sample preorder list.`; }));
const form = document.querySelector("[data-contact-form]");
form?.addEventListener("submit", (event) => { event.preventDefault(); const note = form.querySelector("[data-form-note]"); if (note) note.textContent = "Thanks. This template form is ready to connect to your backend."; form.reset(); });
