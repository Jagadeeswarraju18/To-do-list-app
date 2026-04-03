export const ACTIVE_PRODUCT_STORAGE_KEY = "mardis:active-product-id";
export const ACTIVE_PRODUCT_CHANGED_EVENT = "mardis:active-product-changed";

export function notifyActiveProductChanged(productId: string | null) {
    if (typeof window === "undefined") return;

    const payload = {
        productId,
        updatedAt: Date.now(),
    };

    window.localStorage.setItem(ACTIVE_PRODUCT_STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent(ACTIVE_PRODUCT_CHANGED_EVENT, { detail: payload }));
}
