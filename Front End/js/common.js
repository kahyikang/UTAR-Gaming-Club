const commonHeader = document.querySelector("[data-header]");
const commonMenuToggle = document.querySelector("[data-menu-toggle]");
const commonSiteNav = document.querySelector("[data-site-nav]");
const closeSubmenus = () => document.querySelectorAll(".nav-dropdown").forEach((dropdown) => dropdown.removeAttribute("open"));
const closeMenu = () => { document.body.classList.remove("menu-open"); commonMenuToggle?.setAttribute("aria-expanded", "false"); commonMenuToggle?.querySelector("b")?.replaceChildren(document.createTextNode("Open menu")); closeSubmenus(); };
commonMenuToggle?.addEventListener("click", () => { const isOpen = document.body.classList.toggle("menu-open"); commonMenuToggle.setAttribute("aria-expanded", String(isOpen)); commonMenuToggle.querySelector("b")?.replaceChildren(document.createTextNode(isOpen ? "Close menu" : "Open menu")); document.querySelectorAll(".nav-dropdown").forEach((dropdown) => dropdown.toggleAttribute("open", isOpen)); });
commonSiteNav?.addEventListener("click", (event) => { if (event.target.closest("a")) closeMenu(); });
const programLink = commonSiteNav?.querySelector('[data-page-link="programs.html"]');
if (programLink) {
  const programDropdown = document.createElement("details");
  programDropdown.className = "nav-dropdown";
  programDropdown.innerHTML = '<summary>Programs <span aria-hidden="true">+</span></summary><div class="dropdown-menu"><a data-page-link="pubg.html" href="pubg.html">PUBG</a><a data-page-link="mobile-legends.html" href="mobile-legends.html">Mobile Legends</a><a data-page-link="brawl-stars.html" href="brawl-stars.html">Brawl Stars</a><a data-page-link="clash-of-clans.html" href="clash-of-clans.html">Clash of Clans</a><a data-page-link="roblox.html" href="roblox.html">Roblox</a></div>';
  programLink.replaceWith(programDropdown);
}
document.querySelectorAll('.dropdown-menu a[data-page-link="events.html"], .dropdown-menu a[data-page-link="media.html"]').forEach((link) => link.remove());
const navTargets = { Programs: "programs.html", Events: "events.html", Media: "media.html" };
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
const syncHeader = () => commonHeader?.classList.toggle("scrolled", window.scrollY > 12);
syncHeader(); window.addEventListener("scroll", syncHeader, { passive: true });
