import { useState, useEffect, useRef } from "react";
import { S } from "../../styles";
import { fmt } from "../../utils";
import { DELIVERY_FEE } from "../../constants";
import { openRazorpayCheckout } from "../../razorpay";
import { updateCustomerAddress } from "../../api";

// ─── CheckoutModal ──────────────────────────────────────────────────────────
export default function CheckoutModal({ cart, total, user, onPlace, onClose }) {
    const [step, setStep] = useState(1);
    const [addr, setAddr] = useState({
        name: user?.name || "",
        phone: user?.phone || "",
        line1: user?.defaultAddress?.line1 || "", 
        city: user?.defaultAddress?.city || "", 
        state: user?.defaultAddress?.state || "Karnataka", 
        pin: user?.defaultAddress?.pin || "",
    });
    const [paying, setPaying] = useState(false);
    const [payError, setPayError] = useState("");

    const line1Ref = useRef(null);
    const sa = (k, v) => setAddr(a => ({ ...a, [k]: v }));

    const deliveryFee = DELIVERY_FEE;
    const grandTotal = total + deliveryFee;
    const grandTotalPaise = grandTotal * 100; // Razorpay uses paise

    const isBangalore = ["bangalore", "bengaluru"].includes(
        addr.city.trim().toLowerCase().replace(/\s+/g, "")
    );
    const valid = addr.name && addr.phone && addr.line1 && addr.city && addr.pin;
    const razorpayKeySet = import.meta.env.VITE_RAZORPAY_KEY_ID &&
        import.meta.env.VITE_RAZORPAY_KEY_ID !== "rzp_test_REPLACE_ME";

    // ── Payment handler ──────────────────────────────────────────────
    const handlePay = async () => {
        setPayError("");
        setPaying(true);

        // If Razorpay key not set yet → fall back to COD (dev convenience)
        if (!razorpayKeySet) {
            try {
                if (user?.id) await updateCustomerAddress(user.id, addr);
                await onPlace(addr, null);
            } finally {
                setPaying(false);
            }
            return;
        }

        try {
            // Step 1: Create Razorpay order via Vercel API
            const orderRes = await fetch("/api/create-razorpay-order", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: grandTotalPaise, currency: "INR" })
            });
            const { data } = await orderRes.json();

            // Step 2: Open Razorpay modal
            openRazorpayCheckout({
                razorpayOrderId: data.razorpayOrderId,
                amount: grandTotalPaise,
                name: addr.name,
                email: user?.email || "",
                phone: addr.phone,
                description: `Grind — ${cart.length} item(s)`,
                onSuccess: async (paymentResponse) => {
                    try {
                        // Step 3: Verify payment via Vercel API
                        const verifyRes = await fetch("/api/verify-razorpay-payment", {
                            method: "POST", headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(paymentResponse)
                        });
                        const result = await verifyRes.json();
                        if (!result.data || !result.data.success) throw new Error("Payment verification failed");

                        // Step 4: Write order to Firestore (only on verified success)
                        if (user?.id) await updateCustomerAddress(user.id, addr);
                        await onPlace(addr, {
                            razorpayOrderId: paymentResponse.razorpay_order_id,
                            razorpayPaymentId: paymentResponse.razorpay_payment_id,
                        });
                    } catch (err) {
                        setPayError(err.message || "Payment verification failed. Contact support.");
                    } finally {
                        setPaying(false);
                    }
                },
                onFailure: (msg) => {
                    if (msg !== "Payment cancelled") setPayError(msg);
                    setPaying(false);
                },
            });
        } catch (err) {
            setPayError(err.message || "Could not initiate payment. Please try again.");
            setPaying(false);
        }
    };

    // ── Styles (inline, matching existing app style) ─────────────────
    const stepCircle = (n) => ({
        width: 26, height: 26, borderRadius: "50%",
        background: step > n ? "#1b4332" : step === n ? "#111" : "#f0f0f0",
        color: step >= n ? "#fff" : "#bbb",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontFamily: "sans-serif", fontWeight: 700, margin: "0 auto 4px",
    });

    return (
        <div style={S.overlay} onClick={onClose}>
            <div style={{ ...S.modal, maxWidth: 480 }} onClick={e => e.stopPropagation()}>
                <button style={S.mClose} onClick={onClose}>✕</button>
                <h2 style={S.mTitle}>Checkout</h2>

                {/* Step indicator */}
                <div style={{ display: "flex", gap: 4, marginBottom: 22 }}>
                    {["Delivery Address", "Review & Pay"].map((lbl, i) => (
                        <div key={i} style={{ flex: 1, textAlign: "center" }}>
                            <div style={stepCircle(i + 1)}>
                                {step > i + 1 ? "✓" : i + 1}
                            </div>
                            <p style={{ fontSize: 10, fontFamily: "sans-serif", color: step === i + 1 ? "#111" : "#bbb", fontWeight: step === i + 1 ? 700 : 400 }}>
                                {lbl}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ── STEP 1 — Address ────────────────────────────────── */}
                {step === 1 && (
                    <div>
                        <p style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontFamily: "sans-serif", color: "#92400e", marginBottom: 14 }}>
                            🚚 We currently deliver within <strong>Bangalore / Bengaluru only</strong>.
                        </p>

                        {/* Full Name */}
                        <div style={{ marginBottom: 12 }}>
                            <label style={S.fLabel}>Full Name</label>
                            <input style={S.inp} type="text" value={addr.name} onChange={e => sa("name", e.target.value)} placeholder="Your full name" />
                        </div>

                        {/* Phone */}
                        <div style={{ marginBottom: 12 }}>
                            <label style={S.fLabel}>Phone Number</label>
                            <input style={S.inp} type="tel" value={addr.phone} onChange={e => sa("phone", e.target.value)} placeholder="+91 98XXX XXXXX" />
                        </div>

                        {/* Address */}
                        <div style={{ marginBottom: 12 }}>
                            <label style={S.fLabel}>Flat / Building / Street</label>
                            <input
                                ref={line1Ref}
                                style={S.inp}
                                type="text"
                                value={addr.line1}
                                onChange={e => sa("line1", e.target.value)}
                                placeholder="Flat 101, Oak Apartments, 3rd Main Rd"
                                autoComplete="off"
                            />
                        </div>

                        {/* City */}
                        <div style={{ marginBottom: 12 }}>
                            <label style={S.fLabel}>City</label>
                            <input style={S.inp} type="text" value={addr.city} onChange={e => sa("city", e.target.value)} placeholder="Bangalore" />
                            {addr.city && !isBangalore && (
                                <p style={{ color: "#dc2626", fontSize: 11, fontFamily: "sans-serif", marginTop: 4 }}>
                                    ⚠️ Sorry, we only deliver within Bangalore / Bengaluru right now.
                                </p>
                            )}
                        </div>

                        {/* State */}
                        <div style={{ marginBottom: 12 }}>
                            <label style={S.fLabel}>State</label>
                            <input style={S.inp} type="text" value={addr.state} onChange={e => sa("state", e.target.value)} />
                        </div>

                        {/* PIN */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={S.fLabel}>PIN Code</label>
                            <input style={S.inp} type="text" value={addr.pin} onChange={e => sa("pin", e.target.value)} placeholder="560001" maxLength={6} />
                        </div>

                        <button
                            style={{ ...S.ctaBtn, width: "100%", opacity: (valid && isBangalore) ? 1 : 0.38 }}
                            onClick={() => valid && isBangalore && setStep(2)}
                        >
                            Review Order →
                        </button>
                    </div>
                )}

                {/* ── STEP 2 — Review & Pay ───────────────────────────── */}
                {step === 2 && (
                    <div>
                        {/* Address summary */}
                        <div style={{ background: "#f8f9f5", border: "1px solid #e5e5e5", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontFamily: "sans-serif", fontSize: 13 }}>
                            <p style={{ fontWeight: 700, color: "#111", marginBottom: 3 }}>📍 Delivering to</p>
                            <p style={{ color: "#555" }}>{addr.name} · {addr.phone}</p>
                            <p style={{ color: "#555" }}>{addr.line1}, {addr.city}, {addr.state} - {addr.pin}</p>
                            <button style={{ background: "none", border: "none", color: "#1b4332", cursor: "pointer", fontSize: 11, marginTop: 4, fontWeight: 700, padding: 0 }} onClick={() => setStep(1)}>
                                Edit address
                            </button>
                        </div>

                        {/* Cart items */}
                        {cart.map(i => (
                            <div key={i.key} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f0f0f0" }}>
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{i.product.name}</p>
                                    <p style={{ color: "#888", fontSize: 11, fontFamily: "sans-serif" }}>{i.grind} × {i.qty}</p>
                                </div>
                                <p style={{ fontWeight: 700, fontFamily: "sans-serif", color: "#111" }}>{fmt(i.unitPrice * i.qty)}</p>
                            </div>
                        ))}

                        {/* Totals */}
                        <div style={{ marginTop: 12, borderTop: "2px solid #111", paddingTop: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontFamily: "sans-serif", fontSize: 13 }}>
                                <span style={{ color: "#888" }}>Subtotal</span><span>{fmt(total)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontFamily: "sans-serif", fontSize: 13 }}>
                                <span style={{ color: "#888" }}>Delivery fee</span>
                                {deliveryFee === 0
                                    ? <span style={{ color: "#1b4332", fontWeight: 700 }}>FREE ✓</span>
                                    : <span>{fmt(deliveryFee)}</span>}
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "sans-serif" }}>
                                <span style={{ fontWeight: 700, fontSize: 15 }}>Total</span>
                                <strong style={{ fontSize: 20, color: "#111" }}>{fmt(grandTotal)}</strong>
                            </div>
                        </div>

                        {/* Pay error */}
                        {payError && (
                            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", marginTop: 14, fontSize: 12, color: "#dc2626", fontFamily: "sans-serif" }}>
                                ⚠️ {payError}
                            </div>
                        )}

                        {/* Pay button */}
                        <button
                            style={{ ...S.ctaBtn, width: "100%", marginTop: 16, opacity: paying ? 0.7 : 1, cursor: paying ? "not-allowed" : "pointer" }}
                            onClick={handlePay}
                            disabled={paying}
                        >
                            {paying ? "Processing…" : razorpayKeySet
                                ? `Pay ${fmt(grandTotal)} →`
                                : `Place Order · ${fmt(grandTotal)} →`}
                        </button>

                        <p style={{ textAlign: "center", fontSize: 11, color: "#999", fontFamily: "sans-serif", marginTop: 10 }}>
                            {razorpayKeySet
                                ? "🔒 Secured by Razorpay · UPI, Card, Net Banking"
                                : "Cash on delivery · UPI / Card at door"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
