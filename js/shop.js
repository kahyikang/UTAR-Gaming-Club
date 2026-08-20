const cart = window.UtarCart;
const cartNote = document.querySelector("[data-cart-note]");
const productFilter = document.querySelector("[data-product-filter]");
const filterStatus = document.querySelector("[data-filter-status]");
const productCards = [...document.querySelectorAll("[data-product-card]")];
const wearableCategories = new Set(["t-shirt", "jacket", "hoodie", "sweatshirt", "pant"]);

const modal = document.querySelector("[data-product-modal]");
const modalImage = document.querySelector("[data-modal-image]");
const modalName = document.querySelector("[data-modal-name]");
const modalDescription = document.querySelector("[data-modal-description]");
const modalPrice = document.querySelector("[data-modal-price]");
const modalSizeField = document.querySelector("[data-modal-size-field]");
const modalSize = document.querySelector("[data-modal-size]");
const modalQuantity = document.querySelector("[data-modal-quantity]");
const modalAdd = document.querySelector("[data-modal-add]");
const modalStatus = document.querySelector("[data-modal-status]");
const galleryCount = document.querySelector("[data-gallery-count]");
const galleryPrevious = document.querySelector("[data-gallery-prev]");
const galleryNext = document.querySelector("[data-gallery-next]");
const shopToast = document.querySelector("[data-shop-toast]");
const shopToastMessage = document.querySelector("[data-shop-toast-message]");

let activeProduct = null;
let activeImageIndex = 0;
let lastFocusedElement = null;
let toastTimer = null;
let galleryTimer = null;

const galleryAutoplayMs = 3000;

const productDescriptions = {
    "Black Smiley Sweatshirt": "Everyday black sweatshirt featuring the Smiley collection design.",
    "Black Smiley T-Shirt": "Relaxed black tee with a simple Smiley collection finish.",
    "Black UTAR Gaming Jacket": "Lightweight gaming jacket with a clean UTAR Gaming look.",
    "Black UTAR Logo Sweatshirt": "Minimal sweatshirt with a subtle UTAR Gaming logo.",
    "Club Gaming Headset": "Over-ear headset for focused game audio and voice chat.",
    "Club Gaming Keyboard": "Responsive club keyboard for daily play and study.",
    "Club Gaming Mouse": "Comfortable gaming mouse for precise everyday control.",
    "Cream Smiley Hoodie": "Soft club hoodie with a relaxed fit for match days and campus life.",
    "Cream Smiley Tote Bag": "Roomy canvas tote for carrying your daily campus essentials.",
    "Solo Leveling Pants": "Comfortable wide-leg pants with a bold side graphic.",
    "White UTAR Gaming T-Shirt": "Lightweight white tee with UTAR Gaming club branding.",
    "World of Warcraft Keyboard": "Full-size themed keyboard built for a vivid gaming setup.",
    "World of Warcraft Mouse Pad": "Large desk mat designed for smooth, steady movement."
};

const slugify = (value) => value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const setModelButtonState = (button, showingModel) => {
    const label = showingModel ? "View product" : "View model";
    button.setAttribute("aria-pressed", String(showingModel));
    button.setAttribute("aria-label", label);
    button.title = label;
};

const updateCartCount = () => {
    const count = cart?.getCount() || 0;
    document.querySelectorAll("[data-cart-count]").forEach((element) => {
        element.textContent = count;
    });
};

const readProduct = (card) => {
    const name = card.querySelector("h3")?.textContent.trim() || "Merchandise";
    const priceText = card.querySelector(".product-meta strong")?.textContent || "0";
    const images = [...card.querySelectorAll(".product-image")].map((image) => ({
        alt: image.alt,
        src: image.getAttribute("src")
    }));

    return {
        category: card.dataset.category || "accessories",
        id: card.dataset.productId || slugify(name),
        images,
        name,
        price: Number(priceText.replace(/[^\d.]/g, "")) || 0,
        description: productDescriptions[name] || "A UTAR Gaming club item made for players and supporters.",
        wearable: wearableCategories.has(card.dataset.category)
    };
};

const renderGallery = () => {
    if (!activeProduct || !modalImage) return;

    const image = activeProduct.images[activeImageIndex] || activeProduct.images[0];
    const hasMultipleImages = activeProduct.images.length > 1;
    modalImage.src = image?.src || "";
    modalImage.alt = image?.alt || activeProduct.name;
    galleryCount.textContent = hasMultipleImages ? `${activeImageIndex + 1} / ${activeProduct.images.length}` : "";
    galleryCount.hidden = !hasMultipleImages;
    galleryPrevious.hidden = !hasMultipleImages;
    galleryNext.hidden = !hasMultipleImages;
};

const openProductModal = (product, trigger) => {
    if (!modal || !product) return;

    stopGalleryAutoplay();
    activeProduct = product;
    activeImageIndex = 0;
    lastFocusedElement = trigger || document.activeElement;
    modalName.textContent = product.name;
    modalDescription.textContent = product.description;
    modalPrice.textContent = cart?.formatPrice(product.price) || `RM ${product.price.toFixed(2)}`;
    modalSizeField.hidden = !product.wearable;
    modalQuantity.value = "1";
    modalStatus.textContent = "";
    renderGallery();
    modal.hidden = false;
    document.body.classList.add("shop-modal-open");
    startGalleryAutoplay();
    document.querySelector("[data-modal-close]")?.focus({ preventScroll: true });
};

const closeProductModal = () => {
    if (!modal || modal.hidden) return;

    stopGalleryAutoplay();
    modal.hidden = true;
    activeProduct = null;
    document.body.classList.remove("shop-modal-open");
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
        lastFocusedElement.focus({ preventScroll: true });
    }
};

const moveGallery = (direction) => {
    if (!activeProduct || activeProduct.images.length < 2) return;
    const total = activeProduct.images.length;
    activeImageIndex = (activeImageIndex + direction + total) % total;
    renderGallery();
};

const stopGalleryAutoplay = () => {
    if (galleryTimer === null) return;
    window.clearInterval(galleryTimer);
    galleryTimer = null;
};

const startGalleryAutoplay = () => {
    stopGalleryAutoplay();
    if (!activeProduct || activeProduct.images.length < 2) return;

    galleryTimer = window.setInterval(() => {
        if (!modal || modal.hidden || !activeProduct) {
            stopGalleryAutoplay();
            return;
        }
        moveGallery(1);
    }, galleryAutoplayMs);
};

const showCartToast = (name) => {
    if (!shopToast || !shopToastMessage) return;
    window.clearTimeout(toastTimer);
    shopToastMessage.textContent = `${name} added to your cart.`;
    shopToast.hidden = false;
    toastTimer = window.setTimeout(() => {
        shopToast.hidden = true;
    }, 4500);
};

const applyProductFilter = () => {
    const selectedCategory = productFilter?.value || "all";
    let visibleCount = 0;

    productCards.forEach((card) => {
        const isVisible = selectedCategory === "all" || card.dataset.category === selectedCategory;
        card.hidden = !isVisible;
        if (isVisible) visibleCount += 1;

        card.classList.remove("is-model-view");
        const modelButton = card.querySelector("[data-model-toggle]");
        if (modelButton) setModelButtonState(modelButton, false);
    });

    if (filterStatus) {
        filterStatus.textContent = `${visibleCount} merchandise item${visibleCount === 1 ? "" : "s"} shown.`;
    }
};

productFilter?.addEventListener("change", applyProductFilter);
applyProductFilter();
updateCartCount();

productCards.forEach((card) => {
    const product = readProduct(card);
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `View details for ${product.name}`);

    card.addEventListener("click", (event) => {
        if (event.target.closest("button, a, input, select")) return;
        openProductModal(product, card);
    });

    card.addEventListener("keydown", (event) => {
        if (event.target !== card || !["Enter", " "].includes(event.key)) return;
        event.preventDefault();
        openProductModal(product, card);
    });

    card.querySelector("[data-cart]")?.addEventListener("click", (event) => {
        event.stopPropagation();
        openProductModal(product, event.currentTarget);
    });
});

document.querySelectorAll("[data-model-toggle]").forEach((button) => {
    button.addEventListener("click", (event) => {
        event.stopPropagation();
        const card = button.closest("[data-product-card]");
        if (!card || !card.classList.contains("has-model")) return;

        const showingModel = card.classList.toggle("is-model-view");
        setModelButtonState(button, showingModel);
    });
});

document.querySelectorAll("[data-modal-close]").forEach((element) => {
    element.addEventListener("click", closeProductModal);
});

galleryPrevious?.addEventListener("click", () => moveGallery(-1));
galleryNext?.addEventListener("click", () => moveGallery(1));

modalAdd?.addEventListener("click", () => {
    if (!activeProduct || !cart) return;

    const addedName = activeProduct.name;
    const quantity = Math.min(99, Math.max(1, Math.round(Number(modalQuantity.value) || 1)));
    modalQuantity.value = String(quantity);
    cart.addItem({
        category: activeProduct.category,
        id: activeProduct.id,
        image: activeProduct.images[0]?.src || "",
        images: activeProduct.images,
        name: activeProduct.name,
        price: activeProduct.price,
        quantity,
        size: activeProduct.wearable ? modalSize.value : "One size"
    });
    updateCartCount();
    modalStatus.textContent = `${addedName} added to your cart.`;
    if (cartNote) cartNote.textContent = `${addedName} added to your cart.`;
    closeProductModal();
    showCartToast(addedName);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeProductModal();
});

document.addEventListener("utar-cart-updated", updateCartCount);
