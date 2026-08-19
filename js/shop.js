const cartNote = document.querySelector("[data-cart-note]");
document.querySelectorAll("[data-cart]").forEach((button) => button.addEventListener("click", () => { if (cartNote) cartNote.textContent = `${button.dataset.cart} added to your sample preorder list.`; }));
