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
const syncHeader = () => header?.classList.toggle("scrolled", window.scrollY > 12);
syncHeader(); window.addEventListener("scroll", syncHeader, { passive: true });
document.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", () => {
  const filter = button.dataset.filter;
  document.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("active", item === button));
  document.querySelectorAll("[data-category]").forEach((card) => {
    const shouldShow = filter === "all" || card.dataset.category === filter;
    if (shouldShow) {
      card.classList.remove("is-hidden");
      requestAnimationFrame(() => card.classList.remove("is-fading"));
    } else if (!card.classList.contains("is-hidden")) {
      card.classList.add("is-fading");
      window.setTimeout(() => { if (card.classList.contains("is-fading")) card.classList.add("is-hidden"); }, 200);
    }
  });
}));
const cartNote = document.querySelector("[data-cart-note]");
document.querySelectorAll("[data-cart]").forEach((button) => button.addEventListener("click", () => { if (cartNote) cartNote.textContent = `${button.dataset.cart} added to your sample preorder list.`; }));
const form = document.querySelector("[data-contact-form]");
form?.addEventListener("submit", (event) => { event.preventDefault(); const note = form.querySelector("[data-form-note]"); if (note) note.textContent = "Thanks. This template form is ready to connect to your backend."; form.reset(); });

/* --- Cookies: dismissible promo banner (7-day memory) --- */
const setCookie = (name, value, days) => { document.cookie = `${name}=${value}; expires=${new Date(Date.now() + days * 864e5).toUTCString()}; path=/`; };
const getCookie = (name) => document.cookie.split("; ").find((row) => row.startsWith(`${name}=`))?.split("=")[1];
const promoBanner = document.querySelector("[data-promo-banner]");
if (promoBanner && !getCookie("ugc_promo_dismissed")) promoBanner.removeAttribute("hidden");
document.querySelector("[data-promo-dismiss]")?.addEventListener("click", () => { promoBanner?.setAttribute("hidden", ""); setCookie("ugc_promo_dismissed", "1", 7); });

/* --- sessionStorage: remember the schedule filter for this browser tab only --- */
const scheduleFilterRow = document.querySelector("[data-schedule-filter]");
if (scheduleFilterRow) {
  scheduleFilterRow.addEventListener("click", (event) => { const button = event.target.closest("[data-filter]"); if (button) sessionStorage.setItem("ugc_schedule_filter", button.dataset.filter); });
  const rememberedFilter = sessionStorage.getItem("ugc_schedule_filter");
  if (rememberedFilter) scheduleFilterRow.querySelector(`[data-filter="${rememberedFilter}"]`)?.click();
}

/* --- localStorage: bookmark tournaments, persists across visits on this device --- */
const getBookmarks = () => { try { return JSON.parse(localStorage.getItem("ugc_bookmarked_tournaments")) || []; } catch { return []; } };
const renderBookmarkCount = () => document.querySelectorAll("[data-bookmark-count]").forEach((el) => { el.textContent = getBookmarks().length; });
document.querySelectorAll("[data-bookmark]").forEach((button) => {
  const id = button.dataset.bookmark;
  const syncButton = (saved) => { button.classList.toggle("is-saved", saved); button.setAttribute("aria-pressed", String(saved)); };
  syncButton(getBookmarks().includes(id));
  button.addEventListener("click", () => {
    const current = getBookmarks();
    const isSaved = current.includes(id);
    const next = isSaved ? current.filter((item) => item !== id) : [...current, id];
    localStorage.setItem("ugc_bookmarked_tournaments", JSON.stringify(next));
    syncButton(!isSaved);
    renderBookmarkCount();
  });
});
renderBookmarkCount();

/* --- Countdown: live days/hours/minutes to any [data-countdown] target date --- */
const countdownEls = document.querySelectorAll("[data-countdown]");
if (countdownEls.length) {
  const pad = (n) => String(n).padStart(2, "0");
  const tickCountdowns = () => {
    countdownEls.forEach((el) => {
      const diff = new Date(el.dataset.countdown).getTime() - Date.now();
      const daysEl = el.querySelector("[data-cd-days]");
      const hoursEl = el.querySelector("[data-cd-hours]");
      const minsEl = el.querySelector("[data-cd-mins]");
      if (diff <= 0) {
        el.classList.add("is-live");
        const label = el.querySelector(".countdown-label");
        if (label) label.textContent = "Happening now";
        [daysEl, hoursEl, minsEl].forEach((n) => { if (n) n.textContent = "00"; });
        return;
      }
      if (daysEl) daysEl.textContent = pad(Math.floor(diff / 864e5));
      if (hoursEl) hoursEl.textContent = pad(Math.floor((diff % 864e5) / 36e5));
      if (minsEl) minsEl.textContent = pad(Math.floor((diff % 36e5) / 6e4));
    });
  };
  tickCountdowns();
  setInterval(tickCountdowns, 30000);
}

/* --- Highlight the next upcoming item in the event schedule --- */
const scheduleItems = document.querySelectorAll("[data-schedule-item]");
if (scheduleItems.length) {
  const now = new Date();
  let nextItem = null;
  let nextDate = null;
  scheduleItems.forEach((item) => {
    const timeEl = item.querySelector("time[datetime]");
    const itemDate = timeEl ? new Date(timeEl.getAttribute("datetime")) : null;
    if (itemDate && itemDate >= now && (!nextDate || itemDate < nextDate)) { nextItem = item; nextDate = itemDate; }
  });
  if (nextItem) {
    nextItem.classList.add("is-next");
    const badge = document.createElement("span");
    badge.className = "next-badge";
    badge.textContent = "Next up";
    nextItem.querySelector(".schedule-copy")?.prepend(badge);
  }
}

/* --- "Show only my saved tournaments" filter for the archive grid --- */
const bookmarkFilterToggle = document.querySelector("[data-bookmark-filter]");
if (bookmarkFilterToggle) {
  const archiveCards = document.querySelectorAll("[data-archive-grid] .simple-card");
  const emptyMessage = document.querySelector("[data-archive-empty]");
  const applyBookmarkFilter = () => {
    const onlySaved = bookmarkFilterToggle.checked;
    const saved = getBookmarks();
    let visibleCount = 0;
    archiveCards.forEach((card) => {
      const btn = card.querySelector("[data-bookmark]");
      const isSaved = !!btn && saved.includes(btn.dataset.bookmark);
      const shouldHide = onlySaved && !isSaved;
      card.classList.toggle("is-hidden", shouldHide);
      if (!shouldHide) visibleCount += 1;
    });
    emptyMessage?.toggleAttribute("hidden", !onlySaved || visibleCount > 0);
  };
  bookmarkFilterToggle.addEventListener("change", applyBookmarkFilter);
  document.querySelectorAll("[data-bookmark]").forEach((btn) => btn.addEventListener("click", applyBookmarkFilter));
  applyBookmarkFilter();
}