import { S } from "../styles";
import { DEF_IMG } from "../constants";
import { PCard } from "./ShopView";

export default function RoasterPage({ vendor: v, products, onProd, onBack, isWished, onWish, avgRating }) {
    return (
        <div>
            {/* Hero */}
            <div style={S.roasterHero}>
                <div style={{ maxWidth: 1000, margin: "0 auto", padding: "22px 28px 0" }}>
                    <button style={S.backBtn} onClick={onBack}>← Back to Shop</button>
                    <div style={S.roasterProf}>
                        <img src={v.avatar || DEF_IMG} alt={v.name} style={S.roasterProfImg} />
                        <div style={{ flex: 1 }}>
                            <p style={{ color: "#4ade80", fontSize: 9, letterSpacing: 4, textTransform: "uppercase", marginBottom: 6, fontFamily: "sans-serif", fontWeight: 700 }}>ROASTERY</p>
                            <h1 style={S.roasterName}>{v.name}</h1>
                            {v.tagline && <p style={{ color: "#ccc", fontSize: 15, fontStyle: "italic", marginBottom: 12 }}>"{v.tagline}"</p>}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, color: "#aaa", fontSize: 12, fontFamily: "sans-serif" }}>
                                {v.location && <span>📍 {v.location}</span>}
                                {v.since && <span>🗓 Since {v.since}</span>}
                                {v.phone && <span>📞 {v.phone}</span>}
                                {v.website && <span>🌐 {v.website}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {v.story && (
                <div style={{ maxWidth: 700, margin: "0 auto", padding: "44px 28px" }}>
                    <h2 style={S.sectionH}>Our Story</h2>
                    <p style={{ color: "#444", lineHeight: 1.85, fontSize: 15, fontFamily: "sans-serif" }}>{v.story}</p>
                </div>
            )}

            <div style={{ borderTop: "1px solid #1e1208", padding: "40px 0 60px" }}>
                <h2 style={{ ...S.sectionH, textAlign: "center", marginBottom: 0 }}>Our Coffees</h2>
                {products.length === 0
                    ? <p style={{ textAlign: "center", color: "#4a3a2a", fontFamily: "sans-serif", padding: "32px" }}>No products listed yet.</p>
                    : (
                        <div style={S.grid}>
                            {products.map(p => (
                                <PCard key={p.id} p={p} v={v} onProd={onProd} onVendor={() => { }} wished={isWished && isWished(p.id)} onWish={onWish || (() => { })} rating={avgRating && avgRating(p.id) || 0} />
                            ))}
                        </div>
                    )}
            </div>
        </div>
    );
}
