import { useState } from "react";
import { S } from "../styles";
import { ROAST_C, DEF_IMG } from "../constants";

export default function ExploreRoasters({ vendors, products, onVendor }) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    const approved = Object.values(vendors).filter(v => v.approved);
    const prodCount = vid => products.filter(p => p.vendorId === vid).length;
    const roastTypes = vid => [...new Set(products.filter(p => p.vendorId === vid).map(p => p.roastType?.toLowerCase()))];

    const filtered = approved.filter(v => {
        const ms = !search ||
            v.name.toLowerCase().includes(search.toLowerCase()) ||
            (v.location || "").toLowerCase().includes(search.toLowerCase()) ||
            (v.tagline || "").toLowerCase().includes(search.toLowerCase());
        if (!ms) return false;
        if (filter === "all") return true;
        return roastTypes(v.id).some(t => t && t.includes(filter));
    });

    const featured = approved[0];

    return (
        <div>
            {/* Hero */}
            <div style={S.exploreHero}>
                <div style={{ position: "relative", zIndex: 2 }}>
                    <p style={S.heroEye}>The People Behind Your Cup</p>
                    <h1 style={S.heroH}>Explore Roasters</h1>
                    <p style={S.heroP}>Discover the passionate artisans sourcing and roasting India's finest specialty coffees.</p>
                </div>
                <div style={S.decCircle1} /><div style={S.decCircle2} />
            </div>

            {/* Featured roaster */}
            {featured && (
                <div style={{ background: "#0e0906", borderBottom: "1px solid #1e1208", padding: "48px 28px" }}>
                    <div style={{ maxWidth: 1060, margin: "0 auto" }}>
                        <p style={S.eyeLabel}>✦ Featured Roaster</p>
                        <div style={S.featRoasterCard} className="feat-card" onClick={() => onVendor(featured)}>
                            <img src={featured.avatar || DEF_IMG} alt={featured.name} style={S.featRoasterImg} />
                            <div style={{ padding: "32px", flex: 1 }}>
                                <p style={{ color: "#aaa", fontSize: 12, fontFamily: "sans-serif", marginBottom: 6 }}>📍 {featured.location || "India"}</p>
                                <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 10, color: "#fff" }}>{featured.name}</h2>
                                {featured.tagline && <p style={{ color: "#4ade80", fontSize: 15, fontStyle: "italic", marginBottom: 14 }}>"{featured.tagline}"</p>}
                                {featured.story && <p style={{ color: "#bbb", fontSize: 14, lineHeight: 1.7, fontFamily: "sans-serif", marginBottom: 18 }}>{featured.story.slice(0, 220)}…</p>}
                                <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
                                    {featured.since && <span style={S.metaChip}>🗓 Since {featured.since}</span>}
                                    <span style={S.metaChip}>☕ {prodCount(featured.id)} coffees</span>
                                </div>
                                <button style={{ ...S.ghostBtn, fontSize: 13 }}>Visit Roastery →</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search + filter */}
            <div style={{ maxWidth: 1060, margin: "0 auto", padding: "32px 28px 0", display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
                <div style={{ flex: 1, minWidth: 200, position: "relative", display: "flex", alignItems: "center" }}>
                    <span style={{ position: "absolute", left: 12, fontSize: 14, pointerEvents: "none" }}>🔍</span>
                    <input style={{ ...S.inp, paddingLeft: 36 }} placeholder="Search by name, location…" value={search} onChange={e => setSearch(e.target.value)} />
                    {search && <button style={{ position: "absolute", right: 12, background: "none", border: "none", color: "#4a3a2a", cursor: "pointer" }} onClick={() => setSearch("")}>✕</button>}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {[["all", "All"], ["light", "Light"], ["medium", "Medium"], ["dark", "Dark"]].map(([v, l]) => (
                        <button key={v} style={{ ...S.filterChip, ...(filter === v ? S.filterChipOn : {}) }} onClick={() => setFilter(v)}>{l} Roast</button>
                    ))}
                </div>
            </div>

            <div style={{ maxWidth: 1060, margin: "0 auto", padding: "12px 28px 0" }}>
                <p style={{ color: "#4a3a2a", fontSize: 12, fontFamily: "sans-serif" }}>{filtered.length} roaster{filtered.length !== 1 ? "s" : ""}</p>
            </div>

            {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px" }}>
                    <p style={{ fontSize: 36, marginBottom: 10 }}>☕</p>
                    <p style={{ color: "#4a3a2a", fontFamily: "sans-serif" }}>No roasters match your search.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 22, padding: "20px 28px 60px", maxWidth: 1060, margin: "0 auto" }}>
                    {filtered.map(v => (
                        <div key={v.id} style={S.roasterCard} className="rcard" onClick={() => onVendor(v)}>
                            <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
                                <img src={v.avatar || DEF_IMG} alt={v.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .35s" }} />
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(11,8,5,.7) 0%,transparent 50%)" }} />
                                {v.since && <span style={S.sinceTag}>Est. {v.since}</span>}
                            </div>
                            <div style={{ padding: "14px 18px 18px" }}>
                                {v.location && <p style={{ color: "#4a3a2a", fontSize: 11, fontFamily: "sans-serif", marginBottom: 4 }}>📍 {v.location}</p>}
                                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 5 }}>{v.name}</h3>
                                {v.tagline && <p style={{ color: "#8a7060", fontSize: 12, fontStyle: "italic", marginBottom: 12, lineHeight: 1.4, fontFamily: "sans-serif" }}>"{v.tagline}"</p>}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                        {roastTypes(v.id).slice(0, 3).map(t => (
                                            <span key={t} style={{ background: ROAST_C[t.charAt(0).toUpperCase() + t.slice(1)] || "#7a3f10", color: "#fff", fontSize: 9, padding: "2px 8px", borderRadius: 20, fontFamily: "sans-serif", fontWeight: 700, textTransform: "capitalize" }}>{t}</span>
                                        ))}
                                    </div>
                                    <span style={{ color: "#4a3a2a", fontSize: 11, fontFamily: "sans-serif" }}>{prodCount(v.id)} coffees</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ textAlign: "center", padding: "48px 28px 64px", borderTop: "1px solid #1e1208", background: "#0e0906" }}>
                <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Are you a specialty coffee roaster?</p>
                <p style={{ color: "#5a4a3a", fontSize: 14, fontFamily: "sans-serif" }}>Join our platform and connect your coffees with passionate drinkers.</p>
            </div>
        </div>
    );
}
