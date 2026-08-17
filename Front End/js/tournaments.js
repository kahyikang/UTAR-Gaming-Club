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
const bookmarkFilterToggle = document.querySelector("[data-bookmark-filter]");
if (bookmarkFilterToggle) {
  const archiveCards = document.querySelectorAll("[data-archive-grid] .simple-card, [data-archive-grid] .archive-card");
  const emptyMessage = document.querySelector("[data-archive-empty]");
  const applyBookmarkFilter = () => {
    const onlySaved = bookmarkFilterToggle.checked;
    const saved = getBookmarks();
    let visibleCount = 0;
    archiveCards.forEach((card) => {
      const button = card.querySelector("[data-bookmark]");
      const isSaved = !!button && saved.includes(button.dataset.bookmark);
      const shouldHide = onlySaved && !isSaved;
      card.classList.toggle("is-hidden", shouldHide);
      if (!shouldHide) visibleCount += 1;
    });
    emptyMessage?.toggleAttribute("hidden", !onlySaved || visibleCount > 0);
  };
  bookmarkFilterToggle.addEventListener("change", applyBookmarkFilter);
  document.querySelectorAll("[data-bookmark]").forEach((button) => button.addEventListener("click", applyBookmarkFilter));
  applyBookmarkFilter();
}
