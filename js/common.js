const commonHeader = document.querySelector("[data-header]");
const commonMenuToggle = document.querySelector("[data-menu-toggle]");
const commonSiteNav = document.querySelector("[data-site-nav]");
const closeSubmenus = () => document.querySelectorAll(".nav-dropdown").forEach((dropdown) => dropdown.removeAttribute("open"));
const closeMenu = () => { document.body.classList.remove("menu-open"); commonMenuToggle?.setAttribute("aria-expanded", "false"); commonMenuToggle?.querySelector("b")?.replaceChildren(document.createTextNode("Open menu")); closeSubmenus(); };
commonMenuToggle?.addEventListener("click", () => { const isOpen = document.body.classList.toggle("menu-open"); commonMenuToggle.setAttribute("aria-expanded", String(isOpen)); commonMenuToggle.querySelector("b")?.replaceChildren(document.createTextNode(isOpen ? "Close menu" : "Open menu")); document.querySelectorAll(".nav-dropdown").forEach((dropdown) => dropdown.toggleAttribute("open", isOpen)); });
commonSiteNav?.addEventListener("click", (event) => { if (event.target.closest("a")) closeMenu(); });
const isProgramPage = window.location.pathname.split("/").some((part) => part.toLowerCase() === "program");
const programPath = (page) => `${isProgramPage ? "" : "program/"}${page}`;
const programLink = commonSiteNav?.querySelector('[data-page-link="programs.html"]');
if (programLink) {
  const programDropdown = document.createElement("details");
  programDropdown.className = "nav-dropdown";
  programDropdown.innerHTML = `<summary>Programs <span aria-hidden="true">+</span></summary><div class="dropdown-menu"><a data-page-link="pubg.html" href="${programPath("pubg.html")}">PUBG</a><a data-page-link="mobile-legends.html" href="${programPath("mobile-legends.html")}">Mobile Legends</a><a data-page-link="brawl-stars.html" href="${programPath("brawl-stars.html")}">Brawl Stars</a><a data-page-link="clash-of-clans.html" href="${programPath("clash-of-clans.html")}">Clash of Clans</a><a data-page-link="roblox.html" href="${programPath("roblox.html")}">Roblox</a></div>`;
  programLink.replaceWith(programDropdown);
}
document.querySelectorAll('.dropdown-menu a[data-page-link="events.html"], .dropdown-menu a[data-page-link="media.html"]').forEach((link) => link.remove());
const navTargets = { Programs: programPath("programs.html"), Events: isProgramPage ? "../events.html" : "events.html", Media: isProgramPage ? "../media.html" : "media.html" };
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

const muteAllVideos = () => document.querySelectorAll("video").forEach((video) => {
  video.muted = true;
  video.defaultMuted = true;
  video.setAttribute("muted", "");
});
muteAllVideos();

const socialLinks = [
  { name: "Facebook", file: "facebook.png", href: "https://www.facebook.com/", external: true },
  { name: "Discord", file: "discord.png", href: "https://discord.com/", external: true },
  { name: "Email", file: "gmail.png", href: "mailto:utargaming@gmail.com", external: false },
  { name: "YouTube", file: "youtube.png", href: "https://www.youtube.com/", external: true },
  { name: "Instagram", file: "instagram.png", href: "https://www.instagram.com/", external: true }
];

document.querySelectorAll(".footer-inner").forEach((footerInner) => {
  if (footerInner.querySelector("[data-footer-socials]")) return;

  const socialGroup = document.createElement("div");
  socialGroup.className = "footer-social";
  socialGroup.dataset.footerSocials = "";
  socialGroup.innerHTML = `<span class="footer-social-label">Connect with us</span><div class="footer-social-links"></div><span class="footer-social-status" aria-live="polite"></span>`;

  const socialLinksContainer = socialGroup.querySelector(".footer-social-links");
  const socialStatus = socialGroup.querySelector(".footer-social-status");
  const assetRoot = isProgramPage ? "../assets/social/" : "assets/social/";

  socialLinks.forEach((social) => {
    const link = document.createElement("a");
    link.className = "footer-social-link";
    link.href = social.href;
    link.setAttribute("aria-label", social.name);
    link.title = social.name;
    link.dataset.socialPlatform = social.name;
    if (social.external) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }

    const icon = document.createElement("img");
    icon.src = `${assetRoot}${social.file}`;
    icon.alt = "";
    icon.width = 22;
    icon.height = 22;
    icon.addEventListener("error", () => link.remove(), { once: true });
    link.append(icon);

    link.addEventListener("click", () => {
      socialStatus.textContent = `Opening ${social.name}`;
      window.setTimeout(() => { socialStatus.textContent = ""; }, 1800);
    });
    socialLinksContainer.append(link);
  });

  const copyright = footerInner.querySelector("p");
  if (copyright) copyright.before(socialGroup);
  else footerInner.append(socialGroup);
});

document.querySelectorAll(".site-footer").forEach((footer) => {
  if (footer.querySelector("[data-academic-disclaimer]")) return;

  const disclaimer = document.createElement("div");
  disclaimer.className = "footer-disclaimer";
  disclaimer.dataset.academicDisclaimer = "";
  disclaimer.setAttribute("role", "note");
  disclaimer.innerHTML = `
    <div class="site-shell footer-disclaimer-inner">
      <strong>Academic use disclaimer</strong>
      <p>All images, videos, trademarks, and other media on this website are used solely for academic and educational purposes. No commercial use is intended.</p>
    </div>
  `;
  footer.append(disclaimer);
});

const COOKIE_CONSENT_NAME = "utar_gaming_cookie_consent";
const COOKIE_CONSENT_STORAGE_NAME = "utar_gaming_cookie_consent";
const COOKIE_CONSENT_MAX_AGE = 60 * 60 * 24 * 180;

const readCookie = (name) => document.cookie
  .split(";")
  .map((cookie) => cookie.trim())
  .find((cookie) => cookie.startsWith(`${name}=`))
  ?.slice(name.length + 1) || "";

const setCookie = (name, value, maxAge) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
};

const hasCookieConsent = () => {
  if (readCookie(COOKIE_CONSENT_NAME)) return true;

  try {
    return Boolean(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_NAME));
  } catch {
    return false;
  }
};

const createCookieBanner = () => {
  if (hasCookieConsent()) return;

  const banner = document.createElement("section");
  banner.className = "cookie-banner";
  banner.dataset.cookieBanner = "";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", "Cookie preferences");
  banner.innerHTML = `
    <div class="cookie-banner-copy">
      <strong>Cookies on this website</strong>
      <p>We use cookies to remember your preferences and keep club features working smoothly.</p>
    </div>
    <div class="cookie-banner-actions">
      <button class="cookie-banner-decline" type="button" data-cookie-decline>Continue without accepting</button>
      <button class="button button-primary cookie-banner-accept" type="button" data-cookie-accept>Accept cookies</button>
    </div>
  `;

  const closeBanner = (value) => {
    setCookie(COOKIE_CONSENT_NAME, value, COOKIE_CONSENT_MAX_AGE);
    try {
      window.localStorage.setItem(COOKIE_CONSENT_STORAGE_NAME, value);
    } catch {
      /* The root-scoped cookie remains the primary consent record. */
    }
    banner.remove();
  };

  banner.querySelector("[data-cookie-accept]")?.addEventListener("click", () => closeBanner("accepted"));
  banner.querySelector("[data-cookie-decline]")?.addEventListener("click", () => closeBanner("declined"));
  document.body.append(banner);
};

createCookieBanner();
