const cartNote = document.querySelector("[data-cart-note]");

document.querySelectorAll("[data-cart]").forEach((button) => {
    button.addEventListener("click", () => {
        if (cartNote) {
            cartNote.textContent = `${button.dataset.cart} added to your sample preorder list.`;
        }
    });
});

document.querySelectorAll("[data-model-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
        const card = button.closest("[data-product-card]");
        if (!card || !card.classList.contains("has-model")) return;

        const showingModel = card.classList.toggle("is-model-view");
        button.setAttribute("aria-pressed", String(showingModel));
        button.textContent = showingModel ? "View product" : "View model";
    });
});
