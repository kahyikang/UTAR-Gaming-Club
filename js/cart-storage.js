(() => {
    const CART_KEY = "utar_gaming_cart";
    const SESSION_CART_KEY = "utar_gaming_cart_session";
    const CART_COOKIE = "utar_gaming_cart_count";

    const readJson = (storage, key, fallback) => {
        try {
            const value = storage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch {
            return fallback;
        }
    };

    const writeJson = (storage, key, value) => {
        try {
            storage.setItem(key, JSON.stringify(value));
        } catch {
            // Storage can be unavailable in private browsing or a restricted context.
        }
    };

    const readItems = () => {
        const items = readJson(window.localStorage, CART_KEY, []);
        return Array.isArray(items) ? items : [];
    };

    const setCartCookie = (count) => {
        try {
            document.cookie = `${CART_COOKIE}=${count}; max-age=2592000; path=/; SameSite=Lax`;
        } catch {
            // Cookies are an enhancement; localStorage remains the source of truth.
        }
    };

    const publish = (items) => {
        const count = items.reduce((total, item) => total + Number(item.quantity || 0), 0);
        setCartCookie(count);
        document.dispatchEvent(new CustomEvent("utar-cart-updated", {
            detail: { items, count }
        }));
    };

    const saveItems = (items) => {
        const normalized = items
            .filter((item) => item && item.id && Number(item.quantity) > 0)
            .map((item) => ({
                id: String(item.id),
                name: String(item.name || "Merchandise"),
                price: Number(item.price) || 0,
                category: String(item.category || "accessories"),
                size: String(item.size || "One size"),
                quantity: Math.min(99, Math.max(1, Number(item.quantity) || 1)),
                image: String(item.image || ""),
                images: Array.isArray(item.images) ? item.images : []
            }));

        writeJson(window.localStorage, CART_KEY, normalized);
        writeJson(window.sessionStorage, SESSION_CART_KEY, normalized);
        publish(normalized);
        return normalized;
    };

    const addItem = (item) => {
        const items = readItems();
        const existing = items.find((row) => row.id === item.id && row.size === (item.size || "One size"));

        if (existing) {
            existing.quantity = Math.min(99, existing.quantity + (Number(item.quantity) || 1));
        } else {
            items.push(item);
        }

        return saveItems(items);
    };

    const updateItem = (id, size, quantity) => {
        const items = readItems();
        const nextQuantity = Number(quantity);
        const match = items.find((item) => item.id === id && item.size === size);

        if (!match) return items;
        if (!Number.isFinite(nextQuantity) || nextQuantity <= 0) {
            return removeItem(id, size);
        }

        match.quantity = Math.min(99, Math.max(1, Math.round(nextQuantity)));
        return saveItems(items);
    };

    const removeItem = (id, size) => {
        return saveItems(readItems().filter((item) => !(item.id === id && item.size === size)));
    };

    const clear = () => saveItems([]);

    const getItems = () => readItems();

    const getCount = () => getItems().reduce((total, item) => total + Number(item.quantity || 0), 0);

    const getSubtotal = () => getItems().reduce((total, item) => total + (Number(item.price) || 0) * Number(item.quantity || 0), 0);

    const formatPrice = (value) => `RM ${Number(value || 0).toFixed(2)}`;

    window.UtarCart = {
        addItem,
        clear,
        formatPrice,
        getCount,
        getItems,
        getSubtotal,
        removeItem,
        saveItems,
        updateItem
    };
})();
