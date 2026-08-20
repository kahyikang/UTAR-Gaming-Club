// js/news.js - News & Media page only.
// Handles category filters, view tabs, recently viewed items, and the article popup.
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

  /* --- 2. View tabs: All news / Recently viewed --- */
  const viewTabs = document.querySelectorAll("[data-view-tab]");
  const viewPanels = document.querySelectorAll("[data-view-panel]");

  viewTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.viewTab;
      viewTabs.forEach((item) => {
        const selected = item === tab;
        item.classList.toggle("active", selected);
        item.setAttribute("aria-selected", String(selected));
      });
      viewPanels.forEach((panel) => panel.toggleAttribute("hidden", panel.dataset.viewPanel !== target));
    });
  });

  /* --- 3. Recently viewed (sessionStorage) --- */
  const STORAGE_KEY = "ug_recent_news";
  const recentList = document.querySelector("[data-recent-list]");
  const recentEmpty = document.querySelector("[data-recent-empty]");
  const recentCount = document.querySelector("[data-recent-count]");
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
      /* Storage may be unavailable in private browsing. */
    }
  }

  function renderRecent(items) {
    recentList.innerHTML = "";
    if (recentCount) recentCount.textContent = "(" + items.length + ")";
    if (!items.length) {
      recentEmpty.removeAttribute("hidden");
      return;
    }
    recentEmpty.setAttribute("hidden", "");
    items.slice().reverse().forEach((item) => {
      const originalCard = document.querySelector('.news-card[data-id="' + item.id + '"]');
      if (!originalCard) return;

      const card = originalCard.cloneNode(true);
      card.classList.remove("is-jumped-to");
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", "Open " + (item.title || originalCard.dataset.title) + " again");

      const readMore = card.querySelector("[data-read-more]");
      readMore?.addEventListener("click", (event) => {
        event.stopPropagation();
        openCard(originalCard, readMore);
      });
      card.addEventListener("click", (event) => {
        if (event.target.closest("[data-read-more]")) return;
        openCard(originalCard, card);
      });
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openCard(originalCard, card);
        }
      });
      recentList.appendChild(card);
    });
  }

  function jumpToArticle(id) {
    document.querySelector('[data-view-tab="all"]')?.click();
    document.querySelector('[data-filter="all"]')?.click();
    const card = document.querySelector('.news-card[data-id="' + id + '"]');
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.classList.add("is-jumped-to");
    setTimeout(() => card.classList.remove("is-jumped-to"), 1600);
    card.querySelector("[data-read-more]")?.click();
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

  /* --- 4. Read more popup --- */
  const modal = document.querySelector("[data-news-modal]");
  const modalCategory = document.querySelector("[data-modal-category]");
  const modalTitle = document.querySelector("[data-modal-title]");
  const modalExcerpt = document.querySelector("[data-modal-excerpt]");
  const modalFull = document.querySelector("[data-modal-full]");
  const modalImage = document.querySelector("[data-modal-image]");
  const modalPlaceholder = document.querySelector("[data-modal-placeholder]");
  const modalCloseTriggers = document.querySelectorAll("[data-modal-close]");
  let lastFocusedButton = null;

  function openModal(card, triggerButton) {
    const category = card.querySelector("small")?.textContent || "";
    const title = card.querySelector("h3")?.textContent || card.dataset.title || "";
    const excerpt = card.querySelector("p:not(.news-full)")?.textContent || "";
    const full = card.querySelector(".news-full")?.textContent || "";
    const cardImage = card.querySelector("img");

    modalCategory.textContent = category;
    modalTitle.textContent = title;
    modalExcerpt.textContent = excerpt;
    modalFull.textContent = full;

    if (cardImage && modalImage) {
      modalImage.onerror = null;
      modalImage.src = cardImage.src;
      modalImage.alt = cardImage.alt;
      modalImage.removeAttribute("hidden");
      modalPlaceholder?.setAttribute("hidden", "");
      modalImage.onerror = () => {
        modalImage.setAttribute("hidden", "");
        modalImage.removeAttribute("src");
        modalPlaceholder?.removeAttribute("hidden");
      };
    } else {
      modalImage?.setAttribute("hidden", "");
      modalImage?.removeAttribute("src");
      modalPlaceholder?.removeAttribute("hidden");
    }

    modal.removeAttribute("hidden");
    document.body.classList.add("news-modal-open");
    lastFocusedButton = triggerButton;
    modal.querySelector(".news-modal-close")?.focus();
  }

  function closeModal() {
    modal.setAttribute("hidden", "");
    document.body.classList.remove("news-modal-open");
    if (lastFocusedButton && typeof lastFocusedButton.focus === "function") lastFocusedButton.focus();
  }

  function openCard(card, trigger) {
    openModal(card, trigger);
    logView(card.dataset.id, card.dataset.title);
  }

  newsCards.forEach((card) => {
    const title = card.dataset.title || card.querySelector("h3")?.textContent.trim() || "news article";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", "Open " + title);
    card.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("[data-read-more]")) return;
      openCard(card, card);
    });
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openCard(card, card);
    });
  });

  readMoreButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".news-card");
      if (!card) return;
      openCard(card, button);
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
