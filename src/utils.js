// ─── SHARED PURE HELPERS ─────────────────────────────────────────────

/** Format a number as Indian Rupees (e.g. ₹1,250) */
export const fmt = n =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(n);

/** Generate a short random alphanumeric ID */
export const uid = () => Math.random().toString(36).slice(2, 9);

/** Today's date as a readable string (e.g. "3 Mar 2026") */
export const today = () =>
    new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

/** Render n filled stars + (5-n) empty stars */
export const stars = n => "★".repeat(n) + "☆".repeat(5 - n);
