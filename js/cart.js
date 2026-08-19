const cart = window.UtarCart;
const cartItems = document.querySelector("[data-cart-items]");
const cartEmpty = document.querySelector("[data-cart-empty]");
const cartClear = document.querySelector("[data-clear-cart]");
const clearModal = document.querySelector("[data-clear-modal]");
const clearConfirm = document.querySelector("[data-clear-confirm]");
const cartItemCount = document.querySelector("[data-cart-item-count]");
const cartSubtotal = document.querySelector("[data-cart-subtotal]");
const checkoutForm = document.querySelector("[data-checkout-form]");
const checkoutStatus = document.querySelector("[data-checkout-status]");
const shippingFields = document.querySelector("[data-shipping-fields]");
const pickupFields = document.querySelector("[data-pickup-fields]");
const confirmation = document.querySelector("[data-order-confirmation]");
const orderIdOutput = document.querySelector("[data-order-id]");

const escapeHtml = (value) => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const setStorageValue = (storage, key, value) => {
    try {
        storage.setItem(key, JSON.stringify(value));
    } catch {
        // The order remains visible in the current page if storage is unavailable.
    }
};

const getDraft = () => {
    try {
        const draft = sessionStorage.getItem("utar_gaming_checkout_draft");
        return draft ? JSON.parse(draft) : {};
    } catch {
        return {};
    }
};

const saveDraft = () => {
    if (!checkoutForm) return;
    const values = Object.fromEntries(new FormData(checkoutForm).entries());
    setStorageValue(sessionStorage, "utar_gaming_checkout_draft", values);
};

const restoreDraft = () => {
    if (!checkoutForm) return;
    const draft = getDraft();

    Object.entries(draft).forEach(([name, value]) => {
        const fields = [...checkoutForm.querySelectorAll(`[name="${name}"]`)];
        const radio = fields.find((field) => field.type === "radio" && field.value === value);
        if (radio) {
            radio.checked = true;
        } else if (fields[0]) {
            fields[0].value = value;
        }
    });
};

const setFulfillment = () => {
    const selected = checkoutForm?.querySelector("[name=fulfillment]:checked")?.value || "shipping";
    const isShipping = selected === "shipping";
    shippingFields.hidden = !isShipping;
    pickupFields.hidden = isShipping;

    shippingFields.querySelectorAll("input, textarea").forEach((field) => {
        field.required = isShipping;
    });
};

const renderCart = () => {
    if (!cart) return;
    const items = cart.getItems();
    const isEmpty = items.length === 0;

    cartItems.innerHTML = items.map((item) => `
        <article class="cart-line-item" data-line-id="${escapeHtml(item.id)}" data-line-size="${escapeHtml(item.size)}">
            <img class="cart-line-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" />
            <div class="cart-line-copy">
                <h3>${escapeHtml(item.name)}</h3>
                <span>Size: ${escapeHtml(item.size)}</span>
                <p class="cart-line-price">${escapeHtml(cart.formatPrice(item.price))}</p>
            </div>
            <div class="cart-line-controls">
                <button class="cart-quantity-button" type="button" data-line-action="decrease" aria-label="Decrease ${escapeHtml(item.name)} quantity">-</button>
                <input class="cart-line-quantity" type="number" min="1" max="99" value="${item.quantity}" data-line-quantity aria-label="${escapeHtml(item.name)} quantity" />
                <button class="cart-quantity-button" type="button" data-line-action="increase" aria-label="Increase ${escapeHtml(item.name)} quantity">+</button>
                <button class="cart-remove-button" type="button" data-line-action="remove">Remove</button>
            </div>
        </article>
    `).join("");

    cartEmpty.hidden = !isEmpty;
    cartClear.disabled = isEmpty;
    checkoutForm.hidden = isEmpty;
    cartItemCount.textContent = cart.getCount();
    cartSubtotal.textContent = cart.formatPrice(cart.getSubtotal());
};

const openClearModal = () => {
    if (!clearModal) return;
    clearModal.hidden = false;
    document.body.classList.add("cart-confirm-open");
    clearModal.querySelector("[data-clear-cancel]")?.focus({ preventScroll: true });
};

const closeClearModal = () => {
    if (!clearModal) return;
    clearModal.hidden = true;
    document.body.classList.remove("cart-confirm-open");
    cartClear?.focus({ preventScroll: true });
};

const getLine = (element) => {
    const line = element.closest("[data-line-id]");
    return line ? { id: line.dataset.lineId, size: line.dataset.lineSize, line } : null;
};

cartItems?.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-line-action]");
    if (!actionButton || !cart) return;

    const line = getLine(actionButton);
    if (!line) return;
    const item = cart.getItems().find((row) => row.id === line.id && row.size === line.size);
    if (!item) return;

    if (actionButton.dataset.lineAction === "remove") {
        cart.removeItem(line.id, line.size);
    } else {
        const change = actionButton.dataset.lineAction === "increase" ? 1 : -1;
        cart.updateItem(line.id, line.size, item.quantity + change);
    }
});

cartItems?.addEventListener("change", (event) => {
    if (!event.target.matches("[data-line-quantity]") || !cart) return;
    const line = getLine(event.target);
    if (line) cart.updateItem(line.id, line.size, event.target.value);
});

cartClear?.addEventListener("click", () => {
    if (!cart || !cart.getItems().length) return;
    openClearModal();
});

document.querySelectorAll("[data-clear-cancel]").forEach((element) => {
    element.addEventListener("click", closeClearModal);
});

clearConfirm?.addEventListener("click", () => {
    cart?.clear();
    closeClearModal();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && clearModal && !clearModal.hidden) closeClearModal();
});

checkoutForm?.querySelectorAll("[data-fulfillment-option]").forEach((option) => {
    option.addEventListener("change", () => {
        setFulfillment();
        saveDraft();
    });
});

checkoutForm?.addEventListener("input", saveDraft);
checkoutForm?.addEventListener("change", saveDraft);

checkoutForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!cart || !cart.getItems().length) {
        checkoutStatus.textContent = "Add at least one item before placing an order.";
        return;
    }
    if (!checkoutForm.reportValidity()) return;

    const orderId = `UG-${Date.now().toString(36).toUpperCase()}`;
    const customer = Object.fromEntries(new FormData(checkoutForm).entries());
    const order = {
        createdAt: new Date().toISOString(),
        customer,
        fulfillment: customer.fulfillment,
        items: cart.getItems(),
        orderId,
        subtotal: cart.getSubtotal()
    };
    setStorageValue(localStorage, "utar_gaming_last_order", order);
    setStorageValue(sessionStorage, "utar_gaming_last_order", order);

    const itemLines = order.items.map((item) => `- ${item.name} | Size: ${item.size} | Qty: ${item.quantity} | ${cart.formatPrice(item.price * item.quantity)}`);
    const fulfillmentLines = order.fulfillment === "shipping"
        ? ["Fulfillment: Shipping", `Address: ${customer.address}`, `City: ${customer.city}`, `State: ${customer.state}`, `Postcode: ${customer.postcode}`]
        : ["Fulfillment: Pickup at UTAR Gaming E-Sports Club, Kampar Campus"];
    const emailBody = [
        `New UTAR Gaming merchandise order: ${orderId}`,
        "",
        `Customer: ${customer.name}`,
        `Email: ${customer.email}`,
        `Phone: ${customer.phone}`,
        ...fulfillmentLines,
        "",
        "Items:",
        ...itemLines,
        "",
        `Subtotal: ${cart.formatPrice(order.subtotal)}`,
        `Notes: ${customer.notes || "None"}`
    ].join("\n");
    const mailto = `mailto:utargaming@gmail.com?subject=${encodeURIComponent(`UTAR Gaming order ${orderId}`)}&body=${encodeURIComponent(emailBody)}&bcc=${encodeURIComponent(customer.email)}`;

    cart.clear();
    try {
        sessionStorage.removeItem("utar_gaming_checkout_draft");
    } catch {
        // Draft cleanup is optional.
    }

    checkoutStatus.textContent = "Your order is saved. Opening your email app...";
    orderIdOutput.textContent = `Order number: ${orderId}`;
    confirmation.hidden = false;
    checkoutForm.hidden = true;
    window.setTimeout(() => {
        window.location.href = mailto;
    }, 250);
});

restoreDraft();
setFulfillment();
renderCart();
document.addEventListener("utar-cart-updated", renderCart);
