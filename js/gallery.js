// js/gallery.js - Gallery & Highlights page only.
// Handles filters, view tabs, saved highlights, and the detail popup.
(function () {
  /* --- 1. Filter by game --- */
  const filterButtons = document.querySelectorAll("[data-filter]");
  const mediaTiles = document.querySelectorAll('[data-view-panel="all"] [data-media-grid] [data-category]');

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => item.classList.toggle("active", item === button));
      mediaTiles.forEach((tile) => {
        tile.classList.toggle("is-hidden", filter !== "all" && tile.dataset.category !== filter);
      });
    });
  });

  /* --- 2. View tabs: All highlights / Player highlights / My saved --- */
  const viewTabs = document.querySelectorAll("[data-view-tab]");
  const viewPanels = document.querySelectorAll("[data-view-panel]");

  viewTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.viewTab;
      viewTabs.forEach((item) => item.classList.toggle("active", item === tab));
      viewPanels.forEach((panel) => panel.toggleAttribute("hidden", panel.dataset.viewPanel !== target));
    });
  });

  /* --- 3. Saved highlights (localStorage) --- */
  const STORAGE_KEY = "ug_saved_highlights";
  const savedList = document.querySelector("[data-saved-list]");
  const savedEmpty = document.querySelector("[data-saved-empty]");
  const savedCount = document.querySelector("[data-saved-count]");
  const clearBtn = document.querySelector("[data-clear-saved]");
  const saveButtons = document.querySelectorAll("[data-save]");
  if (!savedList || !saveButtons.length) return;

  function readSaved() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }

  function writeSaved(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      /* Storage may be unavailable in private browsing. */
    }
  }

  function isSaved(id, items) {
    return items.some((item) => item.id === id);
  }

  function syncButtons(items) {
    saveButtons.forEach((button) => {
      const saved = isSaved(button.dataset.id, items);
      button.classList.toggle("is-saved", saved);
      button.innerHTML = saved ? "&#9733; Saved" : "&#9734; Save";
      button.setAttribute("aria-pressed", String(saved));
    });
  }

  function renderSavedPanel(items) {
    savedList.innerHTML = "";
    if (!items.length) {
      savedEmpty.removeAttribute("hidden");
      return;
    }
    savedEmpty.setAttribute("hidden", "");
    items.forEach((item) => {
      const originalTile = Array.from(saveButtons)
        .find((button) => button.dataset.id === item.id)
        ?.closest(".media-tile");
      const card = originalTile
        ? originalTile.cloneNode(true)
        : document.createElement("article");
      card.classList.add("saved-card");
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", "Open " + (card.querySelector("h3")?.textContent || item.title));

      if (!originalTile) {
        card.innerHTML =
          '<span>Saved highlight &middot; ' +
          item.game.replace(/</g, "&lt;").replace(/>/g, "&gt;") +
          '</span><h3></h3><p class="media-tile-desc"></p><button class="bookmark-btn" type="button" data-save></button>';
        card.querySelector("h3").textContent = item.title;
        card.querySelector(".media-tile-desc").textContent = "Saved highlight";
      }

      const savedButton = card.querySelector("[data-save]");
      savedButton?.classList.add("is-saved");
      if (savedButton) {
        savedButton.innerHTML = "&#9733; Saved";
        savedButton.setAttribute("aria-pressed", "true");
      }
      savedButton?.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleSave(item.id, item.title, item.game);
      });
      card.addEventListener("click", () => jumpToTile(item.id));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          jumpToTile(item.id);
        }
      });
      savedList.appendChild(card);
    });
  }

  function jumpToTile(id) {
    const tile = document.querySelector('[data-save][data-id="' + id + '"]')?.closest(".media-tile");
    if (!tile) return;
    const panel = tile.closest("[data-view-panel]");
    const targetTab = panel && document.querySelector('[data-view-tab="' + panel.dataset.viewPanel + '"]');
    if (targetTab) targetTab.click();
    if (panel?.dataset.viewPanel === "all") {
      document.querySelector('[data-filter="all"]')?.click();
    }
    tile.scrollIntoView({ behavior: "smooth", block: "center" });
    tile.classList.add("is-jumped-to");
    setTimeout(() => tile.classList.remove("is-jumped-to"), 1600);
    window.dispatchEvent(new CustomEvent("open-highlight-modal", { detail: { id: id } }));
  }

  function refresh() {
    const items = readSaved();
    syncButtons(items);
    renderSavedPanel(items);
    if (savedCount) savedCount.textContent = "(" + items.length + ")";
  }

  function toggleSave(id, title, game) {
    let items = readSaved();
    items = isSaved(id, items)
      ? items.filter((item) => item.id !== id)
      : items.concat({ id: id, title: title, game: game });
    writeSaved(items);
    refresh();
  }

  saveButtons.forEach((button) => {
    button.addEventListener("click", () => {
      toggleSave(button.dataset.id, button.dataset.title, button.dataset.game);
    });
  });
  clearBtn?.addEventListener("click", () => {
    writeSaved([]);
    refresh();
  });
  refresh();

  /* --- 4. Highlight detail popup --- */
  const modal = document.querySelector("[data-highlight-modal]");
  const allTiles = document.querySelectorAll("[data-media-grid] .media-tile, [data-player-grid] .media-tile");
  if (!modal || !allTiles.length) return;

  const modalGame = modal.querySelector("[data-modal-game]");
  const modalTitle = modal.querySelector("[data-modal-title]");
  const modalDesc = modal.querySelector("[data-modal-desc]");
  const modalImage = modal.querySelector("[data-modal-image]");
  const modalVideo = modal.querySelector("[data-modal-video]");
  const modalPlaceholder = modal.querySelector("[data-modal-placeholder]");
  const modalSave = modal.querySelector("[data-modal-save]");
  const modalCloseTriggers = modal.querySelectorAll("[data-modal-close]");
  let lastFocused = null;
  let currentId = null;

  function syncModalSaveButton() {
    const realBtn = currentId ? document.querySelector('[data-save][data-id="' + currentId + '"]') : null;
    if (!realBtn || !modalSave) return;
    modalSave.classList.toggle("is-saved", realBtn.classList.contains("is-saved"));
    modalSave.innerHTML = realBtn.innerHTML;
  }

  function stopModalVideo() {
    if (!modalVideo) return;
    modalVideo.pause();
    modalVideo.removeAttribute("src");
    modalVideo.load();
    modalVideo.setAttribute("hidden", "");
  }

  function showModalVideo(videoSrc, posterSrc) {
    if (!modalVideo) return;
    modalImage.setAttribute("hidden", "");
    modalImage.removeAttribute("src");
    modalPlaceholder?.setAttribute("hidden", "");
    if (posterSrc) modalVideo.setAttribute("poster", posterSrc);
    else modalVideo.removeAttribute("poster");
    modalVideo.src = videoSrc;
    modalVideo.removeAttribute("hidden");
    modalVideo.autoplay = true;
    const playRequest = modalVideo.play();
    playRequest?.catch(() => {
      // Some browsers wait until the media element has finished loading.
      modalVideo.addEventListener("canplay", () => modalVideo.play().catch(() => {}), { once: true });
    });
  }

  function showModalPhoto(tileImage) {
    stopModalVideo();
    modalImage.onerror = null;
    modalImage.src = tileImage.src;
    modalImage.alt = tileImage.alt;
    modalImage.removeAttribute("hidden");
    modalPlaceholder?.setAttribute("hidden", "");
    modalImage.onerror = () => {
      modalImage.setAttribute("hidden", "");
      modalImage.removeAttribute("src");
      modalPlaceholder?.removeAttribute("hidden");
    };
  }

  function showModalPlaceholder() {
    stopModalVideo();
    modalImage.onerror = null;
    modalImage.setAttribute("hidden", "");
    modalImage.removeAttribute("src");
    modalPlaceholder?.removeAttribute("hidden");
  }

  function openModal(tile, trigger) {
    const saveBtn = tile.querySelector("[data-save]");
    currentId = saveBtn?.dataset.id || null;
    modalGame.textContent = tile.querySelector("span:not(.video-badge)")?.textContent || "";
    modalTitle.textContent = tile.querySelector("h3")?.textContent || "";
    modalDesc.textContent = tile.querySelector(".media-tile-desc, .tile-desc")?.textContent || "";

    const videoSrc = tile.dataset.video;
    const tileImage = tile.querySelector("img");
    if (videoSrc) showModalVideo(videoSrc, tileImage ? tileImage.src : "");
    else if (tileImage) showModalPhoto(tileImage);
    else showModalPlaceholder();

    syncModalSaveButton();
    modal.removeAttribute("hidden");
    document.body.classList.add("highlight-modal-open");
    lastFocused = trigger || null;
    modal.querySelector(".news-modal-close")?.focus();
  }

  function closeModal() {
    modal.setAttribute("hidden", "");
    document.body.classList.remove("highlight-modal-open");
    stopModalVideo();
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  allTiles.forEach((tile) => {
    tile.addEventListener("click", (event) => {
      if (event.target.closest("[data-save]")) return;
      openModal(tile, tile);
    });
    tile.addEventListener("keydown", (event) => {
      if (event.target.closest("[data-save]")) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal(tile, tile);
      }
    });
  });

  modalSave?.addEventListener("click", () => {
    const realBtn = currentId ? document.querySelector('[data-save][data-id="' + currentId + '"]') : null;
    realBtn?.click();
    syncModalSaveButton();
  });
  modalCloseTriggers.forEach((trigger) => trigger.addEventListener("click", closeModal));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hasAttribute("hidden")) closeModal();
  });
  window.addEventListener("open-highlight-modal", (event) => {
    const id = event.detail?.id;
    const tile = id ? document.querySelector('[data-save][data-id="' + id + '"]')?.closest(".media-tile") : null;
    if (tile) openModal(tile, null);
  });
})();
