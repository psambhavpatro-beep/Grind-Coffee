// ─── Razorpay Frontend Helper ──────────────────────────────────────────────
//
// This file handles the Razorpay checkout flow on the frontend.
// It does NOT create the order (that happens securely in the Cloud Function).
// Flow:
//   1. Cloud Function creates a Razorpay order → returns { razorpayOrderId, amount }
//   2. This helper opens the Razorpay modal pre-filled with that order
//   3. On success → Cloud Function verifies the payment signature
//   4. Only after verification → Firestore order is written

/**
 * Opens the Razorpay payment modal.
 *
 * @param {object} opts
 * @param {string} opts.razorpayOrderId  - The order ID from Razorpay (from Cloud Function)
 * @param {number} opts.amount           - Amount in paise (e.g., ₹500 → 50000)
 * @param {string} opts.name             - Customer name
 * @param {string} opts.email            - Customer email
 * @param {string} opts.phone            - Customer phone (optional)
 * @param {string} opts.description      - Order description shown in modal
 * @param {function} opts.onSuccess      - Called with { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * @param {function} opts.onFailure      - Called with error message string
 */
export function openRazorpayCheckout({ razorpayOrderId, amount, name, email, phone = "", description = "Grind Order", onSuccess, onFailure }) {
    if (typeof window.Razorpay === "undefined") {
        onFailure("Razorpay SDK failed to load. Check your internet connection and try again.");
        return;
    }

    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!keyId || keyId === "rzp_test_REPLACE_ME") {
        onFailure("Razorpay key not configured. Add VITE_RAZORPAY_KEY_ID to your .env file.");
        return;
    }

    const options = {
        key: keyId,
        amount,                     // in paise
        currency: "INR",
        name: "Grind",
        description,
        order_id: razorpayOrderId,  // from your Cloud Function
        prefill: { name, email, contact: phone },
        theme: { color: "#111111" },
        modal: {
            ondismiss: () => onFailure("Payment cancelled"),
        },
        handler: (response) => {
            // response = { razorpay_payment_id, razorpay_order_id, razorpay_signature }
            onSuccess(response);
        },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (resp) => {
        onFailure(resp.error?.description || "Payment failed. Please try again.");
    });
    rzp.open();
}
