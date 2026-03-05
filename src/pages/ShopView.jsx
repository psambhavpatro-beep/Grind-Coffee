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
                <div style={S.etaBadge}>⚡ 45–90 min delivery · BLR</div>
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
    const sf = (k, v) => setFilter(f => ({ ...f, [k]: v }));
    const featured = allProducts.filter(p => p.featured && vendors[p.vendorId]?.approved);
    const roastTypes = [...new Set(allProducts.map(p => p.roastType))].filter(Boolean);
    const processes = [...new Set(allProducts.map(p => p.process))].filter(Boolean);
    const hasFilter = filter.search || filter.roast !== "all" || filter.process !== "all";

    return (
        <div>
            {/* Hero */}
            <div style={S.hero}>
                <p style={S.heroEye}>⚡ Bengaluru's Fastest Coffee Delivery</p>
                <h1 style={S.heroH}>Specialty coffee<br />in under 90 mins.</h1>
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

            {/* Filters */}
            <div style={S.filtersBar}>
                <div style={S.filterGroup}>
                    <span style={S.filterLabel}>Roast</span>
                    {["all", ...roastTypes].map(r => (
                        <button key={r} style={{ ...S.filterChip, ...(filter.roast === r ? S.filterChipOn : {}) }} onClick={() => sf("roast", r)}>
                            {r === "all" ? "All" : r}
                        </button>
                    ))}
                </div>
                <div style={S.filterGroup}>
                    <span style={S.filterLabel}>Process</span>
                    {["all", ...processes].map(p => (
                        <button key={p} style={{ ...S.filterChip, ...(filter.process === p ? S.filterChipOn : {}) }} onClick={() => sf("process", p)}>
                            {p === "all" ? "All" : p}
                        </button>
                    ))}
                </div>
                <select style={S.sortSelect} value={filter.sort} onChange={e => sf("sort", e.target.value)}>
                    <option value="default">Sort: Featured</option>
                    <option value="newest">Newest First</option>
                    <option value="price-asc">Price: Low → High</option>
                    <option value="price-desc">Price: High → Low</option>
                </select>
            </div>

            <div style={{ padding: "0 26px 8px", maxWidth: 1200, margin: "0 auto" }}>
                <p style={{ color: "#4a3a2a", fontSize: 12, fontFamily: "sans-serif" }}>
                    {products.length} coffee{products.length !== 1 ? "s" : ""} found
                </p>
            </div>

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
