import { useState } from "react";
import { BLR_ZONES } from "../constants";

const DB = {
    bar: { background: "#f0fdf4", borderBottom: "1px solid #bbf7d0", position: "relative", zIndex: 99 },
    inner: { maxWidth: 1200, margin: "0 auto", padding: "8px 28px", display: "flex", alignItems: "center", gap: 10 },
    pin: { fontSize: 14 },
    label: { flex: 1, fontSize: 13, fontFamily: "sans-serif", color: "#166534" },
    changeBtn: { background: "none", border: "1px solid #16a34a", color: "#16a34a", borderRadius: 6, padding: "3px 11px", fontSize: 12, cursor: "pointer", fontFamily: "sans-serif", fontWeight: 600 },
    dropdown: { position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", borderBottom: "2px solid #111", boxShadow: "0 8px 32px rgba(0,0,0,.12)", zIndex: 200, padding: "20px 28px 24px" },
    dropHead: { fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#999", fontFamily: "sans-serif", marginBottom: 14, fontWeight: 700 },
    zoneGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 8, maxWidth: 1200, margin: "0 auto" },
    zoneBtn: { background: "#f8f9f5", border: "2px solid #e5e7eb", borderRadius: 10, padding: "10px 14px", cursor: "pointer", display: "flex", flexDirection: "column", textAlign: "left", transition: "all .15s", fontFamily: "sans-serif" },
    zoneBtnOn: { background: "#16a34a", border: "2px solid #16a34a", color: "#fff" },
};

export default function DeliveryBanner({ zone, setZone }) {
    const [open, setOpen] = useState(false);
    const sel = BLR_ZONES.find(z => z.id === zone);

    return (
        <div style={DB.bar}>
            <div style={DB.inner}>
                <span style={DB.pin}>📍</span>
                <span style={DB.label}>
                    {sel
                        ? <><strong>Delivering to </strong>{sel.label} · ⚡ ~{sel.eta} mins</>
                        : <>Delivering across <strong>Bengaluru</strong> · Set your area for ETA</>}
                </span>
                <button style={DB.changeBtn} onClick={() => setOpen(o => !o)}>
                    {sel ? "Change" : "Set Area ▾"}
                </button>
            </div>

            {open && (
                <div style={DB.dropdown}>
                    <p style={DB.dropHead}>Select your area in Bengaluru</p>
                    <div style={DB.zoneGrid}>
                        {BLR_ZONES.map(z => (
                            <button
                                key={z.id}
                                style={{ ...DB.zoneBtn, ...(zone === z.id ? DB.zoneBtnOn : {}) }}
                                onClick={() => { setZone(z.id); setOpen(false); }}
                            >
                                <span style={{ fontWeight: 700, fontSize: 13 }}>{z.label}</span>
                                <span style={{ fontSize: 11, color: zone === z.id ? "#fff" : "#16a34a", marginTop: 2 }}>
                                    ⚡ ~{z.eta} min
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
