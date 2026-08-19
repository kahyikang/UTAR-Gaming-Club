// 1) filter-by-game buttons, 2) localStorage-backed saved highlights.
(function () {
  /* --- 1. Filter by game --- */
  const filterButtons = document.querySelectorAll("[data-filter]");
  const mediaTiles = document.querySelectorAll("[data-media-grid] [data-category]");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => item.classList.toggle("active", item === button));
      mediaTiles.forEach((tile) => {
        tile.classList.toggle("is-hidden", filter !== "all" && tile.dataset.category !== filter);
      });
    });
  });

  /* --- 2. Saved highlights (localStorage) --- */
  const STORAGE_KEY = "ug_saved_highlights";

  const savedList = document.querySelector("[data-saved-list]");
  const savedEmpty = document.querySelector("[data-saved-empty]");
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
      /* localStorage unavailable (e.g. private mode limits) - fail silently */
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
      const card = document.createElement("div");
      card.className = "saved-card";
      card.innerHTML =
        '<div><strong></strong><span></span></div><button class="saved-remove" type="button" aria-label="Remove ' +
        item.title.replace(/"/g, "&quot;") +
        ' from saved highlights">&times;</button>';
      card.querySelector("strong").textContent = item.title;
      card.querySelector("span").textContent = item.game;
      card.querySelector(".saved-remove").addEventListener("click", () => toggleSave(item.id, item.title, item.game));
      savedList.appendChild(card);
    });
  }

  function refresh() {
    const items = readSaved();
    syncButtons(items);
    renderSavedPanel(items);
  }

  function toggleSave(id, title, game) {
    let items = readSaved();
    if (isSaved(id, items)) {
      items = items.filter((item) => item.id !== id);
    } else {
      items.push({ id: id, title: title, game: game });
    }
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
})();

/* --- 3. Click-to-feature: clicking a tile promotes it into the big hero slot on the left.
   The CSS already makes .media-tile:first-child the large hero slot, so this just moves the
   clicked tile to the front of the grid — the previous hero naturally falls back to normal size. */
(function () {
  const mediaGrid = document.querySelector("[data-media-grid]");
  if (!mediaGrid) return;
  const tiles = Array.from(mediaGrid.querySelectorAll(".media-tile"));
  if (tiles.length < 2) return;

  let swapTimer = null;

  function feature(tile) {
    if (!tile || mediaGrid.firstElementChild === tile) return;
    window.clearTimeout(swapTimer);
    mediaGrid.classList.add("is-swapping");
    swapTimer = window.setTimeout(() => {
      mediaGrid.insertBefore(tile, mediaGrid.firstElementChild);
      mediaGrid.classList.remove("is-swapping");
    }, 160);
  }

  tiles.forEach((tile) => {
    tile.addEventListener("click", (event) => {
      if (event.target.closest(".bookmark-btn")) return; // clicking Save should just save, not also swap
      feature(tile);
    });
  });

  /* Tabbing onto a tile (e.g. reaching its Save button by keyboard) promotes it the same way a click does. */
  mediaGrid.addEventListener("focusin", (event) => {
    const tile = event.target.closest(".media-tile");
    if (tile) feature(tile);
  });
})();