import { useState } from "react";
import { S } from "../styles";
import { fmt } from "../utils";
import { ROAST_C, DEF_IMG } from "../constants";

// ─── PRODUCT CARD ──────────────────────────────────────────────────
export function PCard({ p, v, onProd, onVendor, wished, onWish, rating }) {
    return (
        <div style={S.card} className="card">
            <div style={S.cardTop} onClick={() => onProd(p)}>
                <img src={p.image || DEF_IMG} alt={p.name} style={S.cardImg} />
                <span style={{ ...S.roastPill, background: ROAST_C[p.roastType] || "#7a3f10" }}>{p.roastType}</span>
                {p.featured && <span style={S.featBadge}>✦ Featured</span>}
            </div>
            <div style={S.cardBody}>
                <p style={S.cardOrig}>{p.origin}</p>
                <h3 style={S.cardName} onClick={() => onProd(p)}>{p.name}</h3>
                <p style={S.cardNotes}>{p.notes}</p>
                <div style={S.etaBadge}>⚡ Delivered in 45 min · BLR</div>
                {parseFloat(rating) > 0 && (
                    <p style={S.cardRating}>
                        {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
                        <span style={{ opacity: .6, fontSize: 10 }}> {rating}</span>
                    </p>
                )}
                {v && <button style={S.roasterTag} onClick={() => onVendor(v)}>☕ {v.name}</button>}
                <div style={S.cardFoot}>
                    <span style={S.cardPrice}>{fmt(p.price)}<small style={{ opacity: .55, fontSize: 10 }}>/250g</small></span>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <button style={{ ...S.wishBtn, ...(wished ? S.wishBtnOn : {}) }} onClick={() => onWish(p.id)}>
                            {wished ? "♥" : "♡"}
                        </button>
                        <button style={S.viewBtn} onClick={() => onProd(p)}>View →</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── SHOP VIEW ────────────────────────────────────────────────────
export default function ShopView({ products, allProducts, vendors, filter, setFilter, onProd, onVendor, isWished, onWish, avgRating }) {
    const [showFilters, setShowFilters] = useState(false);
    const sf = (k, v) => setFilter(f => ({ ...f, [k]: v }));
    const featured = allProducts.filter(p => p.featured && vendors[p.vendorId]?.approved);
    const roastTypes = [...new Set(allProducts.map(p => p.roastType))].filter(Boolean);
    const processes = [...new Set(allProducts.map(p => p.process))].filter(Boolean);
    const hasFilter = filter.search || filter.roast !== "all" || filter.process !== "all";

    return (
        <div>
            {/* Hero */}
            <div style={S.hero} className="hero-section">
                <p style={S.heroEye}>⚡ Delivered in 45 Minutes Across Bengaluru</p>
                <h1 style={S.heroH}>Specialty coffee<br />in under 45 mins.</h1>
                <p style={S.heroP}>Single-origin, freshly roasted, straight from Bengaluru's finest roasters — to your door.</p>
                <div style={S.heroSearch}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>🔍</span>
                    <input
                        style={S.heroSearchInp}
                        placeholder="Search coffees, origins, roast levels, tasting notes…"
                        value={filter.search}
                        onChange={e => sf("search", e.target.value)}
                    />
                    {filter.search && (
                        <button style={S.heroSearchClear} onClick={() => sf("search", "")}>✕</button>
                    )}
                </div>
            </div>

            {/* Featured strip */}
            {!hasFilter && featured.length > 0 && (
                <div style={S.featuredStrip}>
                    <div style={S.featuredInner}>
                        <p style={S.eyeLabel}>✦ Featured Coffees</p>
                        <div style={S.featuredRow}>
                            {featured.map(p => (
                                <div key={p.id} style={S.featuredItem} className="feat" onClick={() => onProd(p)}>
                                    <img src={p.image || DEF_IMG} alt={p.name} style={S.featuredItemImg} />
                                    <div style={S.featuredItemBody}>
                                        <p style={{ color: "#c8864a", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", fontFamily: "sans-serif" }}>{p.origin}</p>
                                        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{p.name}</p>
                                        <p style={{ color: "#c8864a", fontWeight: 700, fontSize: 14 }}>{fmt(p.price)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Toggle Bar */}
            <div style={{ padding: "16px 26px 8px", maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ color: "#4a3a2a", fontSize: 13, fontFamily: "sans-serif", fontWeight: 600 }}>
                    {products.length} coffee{products.length !== 1 ? "s" : ""} found
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                    {hasFilter && (
                        <button style={{ background: "none", border: "2px solid #ddd", borderRadius: 20, padding: "5px 12px", fontSize: 11, fontFamily: "sans-serif", cursor: "pointer", fontWeight: 600 }} onClick={() => setFilter({ search: "", roast: "all", process: "all", sort: "default" })}>
                            Clear All
                        </button>
                    )}
                    <button style={{ background: "#111", color: "#fff", border: "none", borderRadius: 20, padding: "7px 16px", fontSize: 12, fontFamily: "sans-serif", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }} onClick={() => setShowFilters(true)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                        Filters & Sort
                    </button>
                </div>
            </div>

            {/* Filters Modal */}
            {showFilters && (
                <div style={S.overlay} onClick={() => setShowFilters(false)}>
                    <div style={{ ...S.modal, maxWidth: 400 }} onClick={e => e.stopPropagation()}>
                        <button style={S.mClose} onClick={() => setShowFilters(false)}>✕</button>
                        <h2 style={S.mTitle}>Filters & Sort</h2>

                        <div style={{ marginBottom: 20 }}>
                            <span style={S.filterLabel}>Sort By</span>
                            <select style={{ ...S.sortSelect, width: "100%", marginTop: 6 }} value={filter.sort} onChange={e => sf("sort", e.target.value)}>
                                <option value="default">Featured</option>
                                <option value="newest">Newest First</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <span style={S.filterLabel}>Roast Level</span>
                            <div style={{ ...S.filterGroup, marginTop: 6 }}>
                                {["all", ...roastTypes].map(r => (
                                    <button key={r} style={{ ...S.filterChip, ...(filter.roast === r ? S.filterChipOn : {}) }} onClick={() => sf("roast", r)}>
                                        {r === "all" ? "All Roasts" : r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <span style={S.filterLabel}>Process</span>
                            <div style={{ ...S.filterGroup, marginTop: 6 }}>
                                {["all", ...processes].map(p => (
                                    <button key={p} style={{ ...S.filterChip, ...(filter.process === p ? S.filterChipOn : {}) }} onClick={() => sf("process", p)}>
                                        {p === "all" ? "All Processes" : p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button style={{ ...S.ctaBtn, width: "100%" }} onClick={() => setShowFilters(false)}>
                            Show {products.length} Coffees
                        </button>
                    </div>
                </div>
            )}

            {products.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 28px" }}>
                    <p style={{ fontSize: 40, marginBottom: 12 }}>☕</p>
                    <p style={{ color: "#5a4a3a", fontFamily: "sans-serif", marginBottom: 14 }}>No coffees match your filters.</p>
                    <button style={S.ghostBtn} onClick={() => setFilter({ search: "", roast: "all", process: "all", sort: "default" })}>Clear filters</button>
                </div>
            ) : (
                <div style={S.grid}>
                    {products.map(p => (
                        <PCard key={p.id} p={p} v={vendors[p.vendorId]} onProd={onProd} onVendor={onVendor} wished={isWished(p.id)} onWish={onWish} rating={avgRating(p.id)} />
                    ))}
                </div>
            )}
        </div>
    );
}
