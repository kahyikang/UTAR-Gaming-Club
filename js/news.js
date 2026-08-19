// js/news.js — news.html only.
// common.js no longer includes generic filter handling, so this file owns:
// 1) filter-by-category buttons, 2) sessionStorage-backed recently viewed.
(function () {
  /* --- 1. Filter by category --- */
  const filterButtons = document.querySelectorAll("[data-filter]");
  const newsCards = document.querySelectorAll("[data-news-grid] [data-category]");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => item.classList.toggle("active", item === button));
      newsCards.forEach((card) => {
        card.classList.toggle("is-hidden", filter !== "all" && card.dataset.category !== filter);
      });
    });
  });

  /* --- 2. Recently viewed (sessionStorage) --- */
  const STORAGE_KEY = "ug_recent_news";

  const recentList = document.querySelector("[data-recent-list]");
  const recentEmpty = document.querySelector("[data-recent-empty]");
  const clearBtn = document.querySelector("[data-clear-recent]");
  const readMoreButtons = document.querySelectorAll("[data-read-more]");
  if (!recentList || !readMoreButtons.length) return;

  function readRecent() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }

  function writeRecent(items) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      /* sessionStorage unavailable - fail silently */
    }
  }

  function renderRecent(items) {
    recentList.innerHTML = "";
    if (!items.length) {
      recentEmpty.removeAttribute("hidden");
      return;
    }
    recentEmpty.setAttribute("hidden", "");
    items
      .slice()
      .reverse()
      .forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item.title;
        const time = document.createElement("span");
        time.textContent = item.time;
        li.appendChild(time);
        recentList.appendChild(li);
      });
  }

  function logView(id, title) {
    const items = readRecent().filter((item) => item.id !== id);
    items.push({
      id: id,
      title: title,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
    writeRecent(items);
    renderRecent(readRecent());
  }

  /* --- 3. Read more popup (modal) --- */
  const modal = document.querySelector("[data-news-modal]");
  const modalCategory = document.querySelector("[data-modal-category]");
  const modalTitle = document.querySelector("[data-modal-title]");
  const modalExcerpt = document.querySelector("[data-modal-excerpt]");
  const modalFull = document.querySelector("[data-modal-full]");
  const modalCloseTriggers = document.querySelectorAll("[data-modal-close]");
  let lastFocusedButton = null;

  function openModal(card, triggerButton) {
    const category = card.querySelector("small")?.textContent || "";
    const title = card.querySelector("h3")?.textContent || card.dataset.title || "";
    const excerpt = card.querySelector("p:not(.news-full)")?.textContent || "";
    const full = card.querySelector(".news-full")?.textContent || "";

    modalCategory.textContent = category;
    modalTitle.textContent = title;
    modalExcerpt.textContent = excerpt;
    modalFull.textContent = full;

    modal.removeAttribute("hidden");
    document.body.classList.add("news-modal-open");
    lastFocusedButton = triggerButton;
    modal.querySelector(".news-modal-close")?.focus();
  }

  function closeModal() {
    modal.setAttribute("hidden", "");
    document.body.classList.remove("news-modal-open");
    lastFocusedButton?.focus();
  }

  readMoreButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".news-card");
      if (!card) return;
      openModal(card, button);
      logView(card.dataset.id, card.dataset.title);
    });
  });

  modalCloseTriggers.forEach((trigger) => trigger.addEventListener("click", closeModal));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hasAttribute("hidden")) closeModal();
  });

  clearBtn?.addEventListener("click", () => {
    writeRecent([]);
    renderRecent([]);
  });

  renderRecent(readRecent());
})();