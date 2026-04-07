import { useEffect, useState } from "react";
import { S } from "../styles";
import { fmt } from "../utils";
import { GRINDS, ROAST_C, DELIVERY_FEE, DEF_IMG } from "../constants";

export default function ProductView({ product: p, vendor: v, grind, setGrind, onAdd, onBack, onVendor, isWished, onWish, reviews, avgRating, onReview, user, onLoad, onOpenCart }) {
    useEffect(() => { if (onLoad) onLoad(); }, [p.id]);
    const [addedMsg, setAddedMsg] = useState(false);

    const handleAdd = () => {
        if (!grind) return;
        onAdd(p, grind);
        setAddedMsg(true);
        setTimeout(() => setAddedMsg(false), 4000);
    };

    return (
        <div style={S.prodPage} className="prod-page">
            <button style={S.backBtn} onClick={onBack}>← Back to Shop</button>

            <div style={S.prodLayout} className="prod-layout">
                {/* LEFT — Image + badges + reviews summary */}
                <div>
                    <div style={{ position: "relative" }}>
                        <img src={p.image || DEF_IMG} alt={p.name} style={S.prodImg} />
                        <div style={{ position: "absolute", top: 12, right: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                            <button style={{ ...S.wishOverlay, position: "relative", top: 0, right: 0, ...(isWished ? S.wishOverlayOn : {}) }} onClick={onWish} title="Add to Wishlist">
                                {isWished ? "♥" : "♡"}
                            </button>
                            <button style={{ ...S.wishOverlay, position: "relative", top: 0, right: 0, color: "#111" }} onClick={async () => {
                                const url = `${window.location.origin}${window.location.pathname}?p=${p.id}`;
                                const shareData = { title: `Grind - ${p.name}`, text: `Check out ${p.name} at Grind!`, url };
                                if (navigator.share) {
                                    try { await navigator.share(shareData); } catch (e) {}
                                } else {
                                    navigator.clipboard.writeText(url);
                                    alert("Link copied to clipboard!");
                                }
                            }} title="Share this coffee">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                            </button>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 14 }}>
                        <span style={{ ...S.badgePill, background: ROAST_C[p.roastType] || "#7a3f10" }}>{p.roastType} Roast</span>
                        <span style={S.badgePill}>{p.process}</span>
                        <span style={S.badgePill}>{p.origin}</span>
                    </div>

                    {reviews.length > 0 && (
                        <div style={S.reviewSummary}>
                            <span style={S.reviewBig}>{avgRating}</span>
                            <div>
                                <p style={{ color: "#c8864a", fontSize: 18 }}>{"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))}</p>
                                <p style={{ color: "#5a4a3a", fontSize: 11, fontFamily: "sans-serif" }}>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT — Details + grind + CTA */}
                <div>
                    <p style={S.prodOrig}>{p.origin}</p>
                    <h1 style={S.prodTitle}>{p.name}</h1>

                    {v && (
                        <button style={S.roasterLink} onClick={() => onVendor(v)}>
                            <img src={v.avatar || DEF_IMG} alt={v.name} style={S.roasterAv} />
                            <div>
                                <span style={{ display: "block", color: "#4a3a2a", fontSize: 9, fontFamily: "sans-serif", letterSpacing: 1.5, textTransform: "uppercase" }}>Roasted by</span>
                                <span style={{ display: "block", color: "#c8864a", fontSize: 14, fontWeight: 700 }}>{v.name} →</span>
                            </div>
                        </button>
                    )}

                    <p style={S.prodDesc}>{p.description}</p>

                    {/* Specs grid */}
                    <div style={S.specsGrid}>
                        {[
                            ["Farm / Co-op", p.farmName],
                            ["Altitude", p.altitude],
                            ["Process", p.process],
                            ["Roast Type", p.roastType],
                            ["Roast Date", p.roastDate ? new Date(p.roastDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"],
                            ["Tasting Notes", p.notes],
                        ].map(([lbl, val], i) => {
                            const isWide = lbl === "Tasting Notes" || lbl === "Roast Date";
                            const isLast = i === 5;
                            return (
                                <div key={lbl} style={{ ...S.specItem, gridColumn: isWide ? "1/-1" : undefined, borderBottom: isLast ? "none" : "1px solid #e5e5e5", borderRight: isWide ? "none" : i % 2 === 1 ? "none" : "1px solid #e5e5e5" }}>
                                    <span style={S.specLbl}>{lbl}</span>
                                    <span style={S.specVal}>{val}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Brewing Method selector */}
                    <p style={{ ...S.specLbl, marginBottom: 10, marginTop: 24 }}>Brewing Method</p>
                    <div style={S.grindGrid} className="grind-grid">
                        {GRINDS.map(g => (
                            <button key={g.id} style={{ ...S.grindBtn, ...(grind === g.id ? S.grindOn : {}), display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }} onClick={() => setGrind(g.id)}>
                                <span style={{ fontWeight: 700, fontSize: 12 }}>{g.label}</span>
                                <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 400 }}>{g.sub}</span>
                            </button>
                        ))}
                    </div>
                    {!grind && <p style={{ color: "#4a3a2a", fontSize: 11, marginTop: 7, fontFamily: "sans-serif" }}>Choose your brewing method to add to cart</p>}

                    {/* Price + CTA — desktop only */}
                    <div style={S.priceCta} className="price-cta-desktop">
                        <div>
                            <div style={S.priceMain}>{fmt(p.price)}</div>
                            <div style={{ color: "#6b7280", fontSize: 11, fontFamily: "sans-serif" }}>per 250g bag</div>
                        </div>
                        {addedMsg ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                                <span style={{ color: "#1b4332", fontFamily: "sans-serif", fontSize: 13, fontWeight: 700 }}>✓ Added to cart!</span>
                                <button style={{ ...S.ctaBtn, background: "#1b4332", padding: "9px 18px", fontSize: 13 }} onClick={onOpenCart}>View Cart →</button>
                            </div>
                        ) : (
                            <button style={{ ...S.ctaBtn, opacity: grind ? 1 : .4, cursor: grind ? "pointer" : "default" }} onClick={handleAdd}>
                                Add to Cart
                            </button>
                        )}
                    </div>

                    {/* Delivery ETA */}
                    <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 16px", marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 22 }}>⚡</span>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: "#2d6a4f", fontFamily: "sans-serif" }}>Express Delivery · Bengaluru</p>
                            <p style={{ fontSize: 12, color: "#1b4332", fontFamily: "sans-serif" }}>Order now → arrives in 45–90 mins · Flat ₹{DELIVERY_FEE} delivery fee</p>
                        </div>
                    </div>

                    {p.stock < 20 && p.stock > 0 && <p style={{ color: "#e07040", fontSize: 12, marginTop: 8, fontFamily: "sans-serif" }}>⚠ Only {p.stock} bags left</p>}
                    {p.stock === 0 && <p style={{ color: "#e05050", fontSize: 12, marginTop: 8, fontFamily: "sans-serif", fontWeight: 700 }}>Out of Stock</p>}

                    {onReview && (
                        <button style={{ ...S.ghostBtn, marginTop: 20, fontSize: 13 }} onClick={onReview}>✍ Write a Review</button>
                    )}
                    {!user && <p style={{ color: "#4a3a2a", fontSize: 12, marginTop: 16, fontFamily: "sans-serif" }}>Sign in to save this coffee or write a review.</p>}
                </div>
            </div>

            {/* ── STICKY CART BAR — mobile only ── */}
            <div className="sticky-cart-bar">
                <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{fmt(p.price)}</div>
                    <div style={{ color: "#6b7280", fontSize: 11, fontFamily: "sans-serif" }}>
                        {grind ? GRINDS.find(g => g.id === grind)?.label : "Pick brewing method ↑"}
                    </div>
                </div>
                {addedMsg ? (
                    <button style={{ ...S.ctaBtn, background: "#1b4332", padding: "11px 18px" }} onClick={onOpenCart}>
                        View Cart →
                    </button>
                ) : (
                    <button
                        style={{ ...S.ctaBtn, opacity: grind ? 1 : .45, cursor: grind ? "pointer" : "default", padding: "12px 20px" }}
                        onClick={handleAdd}
                        disabled={!grind}
                    >
                        Add to Cart
                    </button>
                )}
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (
                <div style={S.reviewsSection}>
                    <h3 style={S.sectionH}>Customer Reviews</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {reviews.map(r => (
                            <div key={r.id} style={S.reviewCard}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                                    <div>
                                        <span style={{ fontWeight: 700, fontSize: 14 }}>{r.customerName}</span>
                                        <span style={{ color: "#c8864a", fontSize: 14, marginLeft: 10 }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                                    </div>
                                    <span style={{ color: "#888", fontSize: 11, fontFamily: "sans-serif" }}>{new Date(r.date).toLocaleDateString("en-IN")}</span>
                                </div>
                                <p style={{ color: "#555", fontSize: 13, fontFamily: "sans-serif", lineHeight: 1.6 }}>{r.comment}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
