// ─── GLOBAL CSS STRING (injected once by App) ─────────────────────────
export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f8f9f5; }
  .card:hover  { transform: translateY(-4px); box-shadow: 6px 6px 0 #111; }
  .card:hover img  { transform: scale(1.05); }
  .rcard:hover { transform: translateY(-4px); box-shadow: 6px 6px 0 #111; }
  .rcard:hover img { transform: scale(1.06); }
  .feat-card:hover { transform: translateY(-3px); box-shadow: 8px 8px 0 #16a34a !important; }
  .feat:hover  { transform: translateY(-2px); box-shadow: 4px 4px 0 #111; }
  .ocard:hover { box-shadow: 4px 4px 0 #111; }
  input:focus, textarea:focus, select:focus { outline: none; border-color: #16a34a !important; }
  select option { background: #fff; color: #111; }
  button:hover { opacity: .88; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #f5f5f5; }
  ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
  @media (max-width: 700px) { .prod-layout { grid-template-columns: 1fr !important; } }
`;

// ─── INLINE STYLE OBJECT ─────────────────────────────────────────────
export const S = {
    root: { fontFamily: "'Libre Baskerville',Georgia,serif", background: "#f8f9f5", minHeight: "100vh", color: "#111" },
    toast: { position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", borderRadius: 8, color: "#fff", zIndex: 999, fontFamily: "sans-serif", fontSize: 13, pointerEvents: "none", whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,.25)" },

    // NAV
    nav: { position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", height: 58, background: "#fff", backdropFilter: "blur(12px)", borderBottom: "2px solid #111" },
    logo: { background: "none", border: "none", color: "#111", fontFamily: "'Libre Baskerville',serif", fontSize: 17, fontWeight: 700, letterSpacing: 1, cursor: "pointer", flexShrink: 0 },
    nb: { background: "none", border: "none", color: "#555", fontSize: 13, cursor: "pointer", padding: "6px 10px", fontFamily: "sans-serif", fontWeight: 500 },
    chip: { background: "#16a34a", color: "#fff", borderRadius: 20, padding: "4px 13px", fontSize: 12, fontFamily: "sans-serif", fontWeight: 600 },
    signInBtn: { background: "#111", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "sans-serif", fontWeight: 600 },
    drop: { position: "absolute", right: 0, top: "calc(100% + 6px)", background: "#fff", border: "2px solid #111", borderRadius: 10, width: 220, overflow: "hidden", boxShadow: "4px 4px 0 #111" },
    dropSection: { padding: "8px 14px 4px", fontSize: 9, letterSpacing: 2, color: "#999", fontFamily: "sans-serif", textTransform: "uppercase" },
    dropItem: { display: "block", width: "100%", background: "none", border: "none", color: "#333", padding: "10px 16px", textAlign: "left", cursor: "pointer", fontSize: 13, fontFamily: "sans-serif" },
    dropDiv: { height: 2, background: "#111", margin: "4px 0" },
    cartBtn: { background: "#111", border: "none", color: "#fff", padding: "7px 14px", borderRadius: 20, cursor: "pointer", fontSize: 15, position: "relative", fontFamily: "sans-serif" },
    cartBadge: { position: "absolute", top: -5, right: -5, background: "#16a34a", color: "#fff", borderRadius: "50%", fontSize: 9, width: 17, height: 17, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", fontWeight: 700 },

    // HERO
    hero: { background: "#111", padding: "80px 32px 60px", textAlign: "center", borderBottom: "none" },
    heroEye: { color: "#16a34a", letterSpacing: 5, fontSize: 9, textTransform: "uppercase", marginBottom: 14, fontFamily: "sans-serif", fontWeight: 600 },
    heroH: { fontSize: "clamp(38px,7vw,82px)", fontWeight: 700, lineHeight: 1.04, marginBottom: 14, color: "#fff" },
    heroP: { color: "#aaa", fontSize: 15, maxWidth: 420, margin: "0 auto 28px", fontFamily: "sans-serif" },
    heroSearch: { position: "relative", maxWidth: 500, margin: "0 auto", display: "flex", alignItems: "center" },
    heroSearchInp: { width: "100%", background: "rgba(255,255,255,.08)", border: "2px solid rgba(255,255,255,.15)", borderRadius: 12, padding: "14px 42px 14px 42px", color: "#fff", fontSize: 14, fontFamily: "sans-serif", outline: "none" },
    heroSearchClear: { position: "absolute", right: 14, background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 14 },
    exploreHero: { position: "relative", background: "#111", padding: "80px 32px 70px", textAlign: "center", overflow: "hidden" },
    decCircle1: { position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", border: "1px solid rgba(22,163,74,.15)", pointerEvents: "none" },
    decCircle2: { position: "absolute", bottom: -60, left: -60, width: 240, height: 240, borderRadius: "50%", border: "1px solid rgba(22,163,74,.1)", pointerEvents: "none" },

    // FEATURED STRIP
    featuredStrip: { background: "#fff", borderBottom: "2px solid #111", padding: "36px 28px" },
    featuredInner: { maxWidth: 1200, margin: "0 auto" },
    featuredRow: { display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4 },
    featuredItem: { flexShrink: 0, width: 200, background: "#f8f9f5", border: "2px solid #111", borderRadius: 10, overflow: "hidden", cursor: "pointer", transition: "box-shadow .15s,transform .15s" },
    featuredItemImg: { width: "100%", height: 120, objectFit: "cover" },
    featuredItemBody: { padding: "10px 12px 14px" },
    featRoasterCard: { display: "flex", background: "#f8f9f5", border: "2px solid #111", borderRadius: 16, overflow: "hidden", cursor: "pointer", transition: "box-shadow .2s,transform .2s" },
    featRoasterImg: { width: 280, flexShrink: 0, objectFit: "cover", minHeight: 260 },

    // FILTERS
    filtersBar: { display: "flex", flexWrap: "wrap", gap: 14, padding: "24px 26px 12px", maxWidth: 1200, margin: "0 auto", alignItems: "center", background: "#fff", borderBottom: "1px solid #e5e5e5" },
    filterGroup: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
    filterLabel: { color: "#999", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "sans-serif", fontWeight: 600, marginRight: 4 },
    filterChip: { background: "#fff", border: "2px solid #ddd", color: "#555", padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontFamily: "sans-serif", fontWeight: 600, transition: "all .15s" },
    filterChipOn: { background: "#111", border: "2px solid #111", color: "#fff" },
    sortSelect: { background: "#fff", border: "2px solid #ddd", color: "#333", padding: "7px 12px", borderRadius: 8, fontSize: 12, fontFamily: "sans-serif", cursor: "pointer", marginLeft: "auto", fontWeight: 600 },

    // PRODUCT GRID
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 24, padding: "24px 26px 48px", maxWidth: 1200, margin: "0 auto" },
    card: { background: "#fff", border: "2px solid #111", borderRadius: 14, overflow: "hidden", transition: "transform .2s,box-shadow .2s" },
    cardTop: { position: "relative", height: 200, overflow: "hidden", cursor: "pointer" },
    cardImg: { width: "100%", height: "100%", objectFit: "cover", transition: "transform .35s" },
    roastPill: { position: "absolute", top: 10, right: 10, color: "#fff", fontSize: 10, padding: "3px 10px", borderRadius: 20, fontFamily: "sans-serif", fontWeight: 700 },
    featBadge: { position: "absolute", top: 10, left: 10, background: "#16a34a", color: "#fff", fontSize: 9, padding: "3px 9px", borderRadius: 20, fontFamily: "sans-serif", fontWeight: 700, letterSpacing: .5 },
    cardBody: { padding: "14px 18px 18px" },
    cardOrig: { color: "#16a34a", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", marginBottom: 3, fontFamily: "sans-serif", fontWeight: 700 },
    etaBadge: { display: "inline-flex", alignItems: "center", gap: 4, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, color: "#16a34a", fontSize: 10, padding: "2px 8px", fontFamily: "sans-serif", fontWeight: 700, marginBottom: 7 },
    cardName: { fontSize: 17, fontWeight: 700, marginBottom: 5, cursor: "pointer", color: "#111" },
    cardNotes: { color: "#777", fontSize: 12, marginBottom: 8, lineHeight: 1.5, fontFamily: "sans-serif" },
    cardRating: { color: "#f59e0b", fontSize: 12, marginBottom: 7, fontFamily: "sans-serif" },
    roasterTag: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, color: "#16a34a", fontSize: 11, padding: "3px 10px", cursor: "pointer", marginBottom: 10, fontFamily: "sans-serif", fontWeight: 600, display: "inline-block" },
    cardFoot: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    cardPrice: { fontSize: 19, fontWeight: 700, color: "#111" },
    wishBtn: { background: "none", border: "2px solid #ddd", color: "#ccc", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" },
    wishBtnOn: { color: "#ef4444", borderColor: "#ef4444", background: "#fff5f5" },
    viewBtn: { background: "none", border: "none", color: "#16a34a", cursor: "pointer", fontSize: 13, fontWeight: 700 },

    // PRODUCT PAGE
    prodPage: { maxWidth: 1060, margin: "0 auto", padding: "28px 26px 60px", background: "#f8f9f5" },
    backBtn: { background: "none", border: "none", color: "#16a34a", cursor: "pointer", fontSize: 13, marginBottom: 22, padding: 0, fontFamily: "sans-serif", fontWeight: 700 },
    prodLayout: { display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 48, alignItems: "start", marginBottom: 48 },
    prodImg: { width: "100%", borderRadius: 12, aspectRatio: "4/3", objectFit: "cover", border: "2px solid #111" },
    wishOverlay: { position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,.9)", border: "2px solid #111", color: "#999", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" },
    wishOverlayOn: { color: "#ef4444", borderColor: "#ef4444" },
    reviewSummary: { display: "flex", alignItems: "center", gap: 14, background: "#fff", border: "2px solid #111", borderRadius: 10, padding: "14px 18px", marginTop: 14 },
    reviewBig: { fontSize: 36, fontWeight: 700, color: "#16a34a" },
    badgePill: { background: "#f0fdf4", color: "#15803d", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontFamily: "sans-serif", fontWeight: 600, border: "1px solid #bbf7d0" },
    prodOrig: { color: "#16a34a", fontSize: 9, letterSpacing: 4, textTransform: "uppercase", marginBottom: 8, fontFamily: "sans-serif", fontWeight: 700 },
    prodTitle: { fontSize: 32, fontWeight: 700, lineHeight: 1.15, marginBottom: 14, color: "#111" },
    roasterLink: { display: "flex", alignItems: "center", gap: 12, background: "#f0fdf4", border: "2px solid #bbf7d0", borderRadius: 10, padding: "10px 14px", marginBottom: 18, cursor: "pointer", width: "fit-content" },
    roasterAv: { width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: "2px solid #111" },
    prodDesc: { color: "#555", lineHeight: 1.75, fontSize: 14, marginBottom: 20, fontFamily: "sans-serif" },
    specsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, background: "#fff", border: "2px solid #e5e5e5", borderRadius: 10, overflow: "hidden" },
    specItem: { background: "#fff", padding: "12px 16px", borderBottom: "1px solid #e5e5e5", borderRight: "1px solid #e5e5e5" },
    specLbl: { display: "block", color: "#999", fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 3, fontFamily: "sans-serif", fontWeight: 600 },
    specVal: { color: "#111", fontSize: 13, fontWeight: 600 },
    grindGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
    grindBtn: { background: "#fff", border: "2px solid #ddd", borderRadius: 8, padding: "9px 11px", cursor: "pointer", color: "#777", textAlign: "left", fontSize: 11, fontFamily: "sans-serif", transition: "all .15s", fontWeight: 600 },
    grindOn: { borderColor: "#16a34a", background: "#f0fdf4", color: "#15803d" },
    priceCta: { display: "flex", alignItems: "center", gap: 22, marginTop: 26 },
    priceMain: { fontSize: 30, fontWeight: 700, color: "#111" },
    reviewsSection: { borderTop: "2px solid #111", paddingTop: 36 },
    reviewCard: { background: "#fff", border: "2px solid #eee", borderRadius: 10, padding: "16px 18px" },

    // ROASTER PAGE
    roasterHero: { background: "#111", borderBottom: "none", paddingBottom: 44 },
    roasterProf: { display: "flex", alignItems: "flex-start", gap: 26, marginTop: 24 },
    roasterProfImg: { width: 100, height: 100, borderRadius: 14, objectFit: "cover", border: "3px solid #fff", flexShrink: 0 },
    roasterName: { fontSize: 34, fontWeight: 700, marginBottom: 8, lineHeight: 1, color: "#fff" },
    sectionH: { fontSize: 20, fontWeight: 700, marginBottom: 16, color: "#111" },
    metaChip: { background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", color: "#ccc", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontFamily: "sans-serif" },
    roasterCard: { background: "#fff", border: "2px solid #111", borderRadius: 14, overflow: "hidden", cursor: "pointer", transition: "transform .2s,box-shadow .2s" },
    sinceTag: { position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,.7)", color: "#fff", fontSize: 10, padding: "3px 9px", borderRadius: 20, fontFamily: "sans-serif", fontWeight: 600 },

    // AUTH MODAL
    overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
    modal: { background: "#fff", border: "2px solid #111", borderRadius: 16, width: "100%", maxWidth: 430, padding: "32px 36px", position: "relative", maxHeight: "92vh", overflowY: "auto", boxShadow: "6px 6px 0 #111" },
    mClose: { position: "absolute", top: 12, right: 16, background: "none", border: "none", color: "#999", fontSize: 17, cursor: "pointer" },
    mTitle: { fontSize: 24, fontWeight: 700, marginBottom: 18, color: "#111" },
    typeTabs: { display: "flex", gap: 3, marginBottom: 20, background: "#f5f5f5", borderRadius: 8, padding: 4 },
    typeTab: { flex: 1, background: "none", border: "none", color: "#888", padding: "8px 4px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: "sans-serif", fontWeight: 700 },
    typeTabOn: { background: "#111", color: "#fff" },
    errTxt: { color: "#ef4444", fontSize: 12, marginBottom: 12, fontFamily: "sans-serif" },
    infoNote: { color: "#16a34a", fontSize: 11, marginBottom: 14, fontStyle: "italic", fontFamily: "sans-serif" },

    // BUTTONS
    ctaBtn: { background: "#111", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "sans-serif", transition: "background .15s" },
    ghostBtn: { background: "#fff", border: "2px solid #111", color: "#111", padding: "11px 18px", borderRadius: 8, cursor: "pointer", fontFamily: "sans-serif", fontSize: 13, fontWeight: 700 },

    // INPUTS
    inp: { width: "100%", background: "#fff", border: "2px solid #ddd", borderRadius: 8, padding: "10px 13px", color: "#111", fontSize: 13, fontFamily: "sans-serif", boxSizing: "border-box", transition: "border-color .15s" },
    fLabel: { display: "block", color: "#888", fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 5, fontFamily: "sans-serif", fontWeight: 700 },
    eyeLabel: { color: "#16a34a", fontSize: 9, letterSpacing: 4, textTransform: "uppercase", marginBottom: 16, fontFamily: "sans-serif", fontWeight: 700 },

    // DASHBOARD
    dash: { maxWidth: 1060, margin: "0 auto", padding: "28px 26px 60px", background: "#f8f9f5", minHeight: "calc(100vh - 58px)" },
    dashH: { fontSize: 26, fontWeight: 700, marginBottom: 4, color: "#111" },
    tabs: { display: "flex", gap: 2, borderBottom: "2px solid #111", marginBottom: 24, flexWrap: "wrap" },
    tab: { background: "none", border: "none", color: "#888", padding: "10px 16px", cursor: "pointer", fontSize: 13, fontFamily: "sans-serif", fontWeight: 600, borderBottom: "3px solid transparent", marginBottom: -2 },
    tabOn: { color: "#16a34a", borderBottomColor: "#16a34a" },
    statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 14, marginBottom: 28 },
    statCard: { background: "#fff", border: "2px solid #111", borderRadius: 10, padding: "16px 20px", boxShadow: "3px 3px 0 #111" },
    statVal: { fontSize: 24, fontWeight: 700, color: "#16a34a", marginBottom: 2 },
    statLbl: { color: "#888", fontSize: 10, fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 },
    table: { width: "100%", borderCollapse: "collapse", fontFamily: "sans-serif", background: "#fff", border: "2px solid #111", borderRadius: 10, overflow: "hidden" },
    th: { background: "#111", color: "#fff", fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", padding: "11px 14px", textAlign: "left" },
    td: { padding: "11px 14px", fontSize: 13, borderBottom: "1px solid #f0f0f0" },
    actBtn: { background: "#fff", border: "2px solid #ddd", color: "#555", padding: "3px 9px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: "sans-serif", fontWeight: 600 },
    vCard: { background: "#fff", border: "2px solid #111", borderRadius: 10, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" },

    // ORDERS
    orderCard: { background: "#fff", border: "2px solid #111", borderRadius: 10, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", transition: "box-shadow .15s" },
    statusBadge: { color: "#fff", fontSize: 10, padding: "3px 10px", borderRadius: 20, fontFamily: "sans-serif", fontWeight: 700, textTransform: "capitalize" },
    stepper: { display: "flex", alignItems: "flex-start", marginBottom: 24, padding: "20px 0" },
    stepDot: { width: 28, height: 28, borderRadius: "50%", background: "#f5f5f5", border: "2px solid #ddd", color: "#bbb", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "sans-serif", fontWeight: 700 },
    stepDotOn: { background: "#16a34a", borderColor: "#16a34a", color: "#fff" },
    stepLine: { flex: 1, height: 2, background: "#e5e5e5", margin: "13px 0 0" },
    stepLineOn: { background: "#16a34a" },

    // CART DRAWER
    drawerOv: { position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 200, display: "flex", justifyContent: "flex-end" },
    drawer: { background: "#fff", width: 390, maxWidth: "100vw", padding: 24, overflowY: "auto", borderLeft: "2px solid #111", boxShadow: "-6px 0 0 #111" },
    qBtn: { background: "#f5f5f5", border: "2px solid #ddd", color: "#333", width: 26, height: 26, borderRadius: "50%", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 },
};
