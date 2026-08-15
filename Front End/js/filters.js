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
