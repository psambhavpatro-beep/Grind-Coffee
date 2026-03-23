import { useState } from "react";
import { S } from "../styles";

const FF = ({ label, k, type = "text", opts, ph, span, rows, f, s }) => (
    <div style={{ gridColumn: span ? "1/-1" : undefined }}>
        <label style={S.fLabel}>{label}</label>
        {opts ? (
            <select style={S.inp} value={f[k]} onChange={e => s(k, e.target.value)}>
                <option value="">— select —</option>
                {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
        ) : rows ? (
            <textarea style={{ ...S.inp, minHeight: 90, resize: "vertical" }} value={f[k]} onChange={e => s(k, e.target.value)} placeholder={ph} />
        ) : (
            <input style={S.inp} type={type} value={f[k]} onChange={e => s(k, e.target.value)} placeholder={ph} />
        )}
    </div>
);

const PROCESSES = ["Washed", "Natural", "Honey", "Anaerobic", "Wet-Hulled"];

// Parse an existing process string (e.g. from saved product) into chips + custom text
function parseProcess(processStr) {
    if (!processStr) return { selected: [], custom: "" };
    const parts = processStr.split(",").map(p => p.trim()).filter(Boolean);
    const selected = [];
    let custom = "";
    for (const p of parts) {
        if (p.startsWith("Custom:")) {
            selected.push("Custom");
            custom = p.replace("Custom:", "").trim();
        } else if (PROCESSES.includes(p)) {
            selected.push(p);
        } else {
            // Legacy value that isn't a standard process → treat as custom
            selected.push("Custom");
            if (!custom) custom = p;
        }
    }
    return { selected: [...new Set(selected)], custom };
}

function buildProcessString(selected, custom) {
    return selected
        .map(p => {
            if (p === "Custom") return custom.trim() ? `Custom: ${custom.trim()}` : "Custom";
            return p;
        })
        .join(", ");
}

export default function ProdForm({ product, vendors, isAdmin, user, onSave, onCancel }) {
    const [uploading, setUploading] = useState(false);
    const [f, setF] = useState(product || {
        name: "", origin: "", farmName: "", altitude: "", process: "Washed",
        roastDate: "", roastType: "Medium", notes: "", description: "",
        price: "", stock: "", image: "",
        vendorId: isAdmin ? "" : user.id,
        featured: false, weight: "250g",
    });
    const s = (k, v) => setF(x => ({ ...x, [k]: v }));

    // ── Process: own local state so Custom chip + text work independently ──
    const init = parseProcess(f.process || "Washed");
    const [selProc, setSelProc] = useState(init.selected.length ? init.selected : ["Washed"]);
    const [customText, setCustomTextState] = useState(init.custom);

    // Sync selProc + customText → f.process
    const syncProcess = (sel, txt) => {
        s("process", buildProcessString(sel, txt));
    };

    const toggleProcess = (proc) => {
        const next = selProc.includes(proc)
            ? selProc.filter(p => p !== proc)
            : [...selProc, proc];
        setSelProc(next);
        syncProcess(next, customText);
    };

    const handleCustomText = (txt) => {
        setCustomTextState(txt);
        syncProcess(selProc, txt);
    };

    const chipStyle = (on, accent = "#7a3f10") => ({
        padding: "7px 16px",
        borderRadius: 20,
        border: `2px solid ${on ? accent : "#d9cfc7"}`,
        background: on ? accent : "#faf8f5",
        color: on ? "#fff" : "#5a4a3a",
        fontFamily: "sans-serif",
        fontSize: 13,
        fontWeight: on ? 700 : 400,
        cursor: "pointer",
        transition: "all 0.15s",
    });

    return (
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "28px 28px 60px" }}>
            <h2 style={S.dashH}>{product ? "Edit Product" : "Add Product"}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 20 }}>
                <FF label="Product Name *" k="name" span f={f} s={s} />
                {isAdmin && (
                    <FF label="Vendor" k="vendorId" span opts={Object.values(vendors).filter(v => v.approved).map(v => ({ v: v.id, l: v.name }))} f={f} s={s} />
                )}
                <FF label="Origin Country" k="origin" f={f} s={s} />
                <FF label="Farm / Co-op" k="farmName" f={f} s={s} />
                <FF label="Altitude" k="altitude" ph="e.g. 1,700–1,950 m" f={f} s={s} />

                {/* ── MULTI-SELECT PROCESS ── */}
                <div style={{ gridColumn: "1/-1" }}>
                    <label style={S.fLabel}>
                        Process{" "}
                        <span style={{ color: "#9a8878", fontWeight: 400, fontSize: 12 }}>(select all that apply)</span>
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                        {PROCESSES.map(proc => (
                            <button
                                key={proc}
                                type="button"
                                onClick={() => toggleProcess(proc)}
                                style={chipStyle(selProc.includes(proc))}
                            >
                                {selProc.includes(proc) ? "✓ " : ""}{proc}
                            </button>
                        ))}
                        {/* Custom chip — orange accent */}
                        <button
                            type="button"
                            onClick={() => toggleProcess("Custom")}
                            style={chipStyle(selProc.includes("Custom"), "#c8864a")}
                        >
                            {selProc.includes("Custom") ? "✓ Custom" : "+ Custom"}
                        </button>
                    </div>

                    {/* Custom text input — only when Custom chip is on */}
                    {selProc.includes("Custom") && (
                        <input
                            style={{ ...S.inp, marginTop: 10, borderColor: "#c8864a" }}
                            value={customText}
                            onChange={e => handleCustomText(e.target.value)}
                            placeholder="e.g. Carbonic Maceration, Thermal Shock, Lactic Fermentation…"
                            autoFocus
                        />
                    )}

                    {selProc.length === 0 && (
                        <p style={{ color: "#e07040", fontSize: 12, fontFamily: "sans-serif", marginTop: 6 }}>
                            Please select at least one process.
                        </p>
                    )}
                </div>

                <FF label="Roast Type" k="roastType" opts={["Light", "Medium-Light", "Medium", "Medium-Dark", "Dark"].map(o => ({ v: o, l: o }))} f={f} s={s} />
                <FF label="Roast Date" k="roastDate" type="date" f={f} s={s} />
                <FF label="Price ₹ / 250g" k="price" type="number" f={f} s={s} />
                <FF label="Stock (bags)" k="stock" type="number" f={f} s={s} />
                <FF label="Tasting Notes" k="notes" ph="e.g. Blueberry, chocolate, jasmine" f={f} s={s} />

                {/* ── IMAGE UPLOAD ── */}
                <div style={{ gridColumn: "1/-1" }}>
                    <label style={S.fLabel}>Product Image *</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {f.image && <img src={f.image} alt="Preview" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, border: "1px solid #ddd" }} />}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                try {
                                    setUploading(true);
                                    const { uploadImageToImgBB } = await import("../api");
                                    const url = await uploadImageToImgBB(file);
                                    s("image", url);
                                } catch (err) {
                                    alert(err.message);
                                } finally {
                                    setUploading(false);
                                }
                            }}
                            style={{ ...S.inp, padding: "8px 12px", cursor: "pointer", background: "#f8f9f5" }}
                            disabled={uploading}
                        />
                        {uploading && <span style={{ color: "#888", fontSize: 13, fontFamily: "sans-serif" }}>Uploading...</span>}
                    </div>
                </div>

                <FF label="Description" k="description" rows span f={f} s={s} />
                <div>
                    <label style={S.fLabel}>Featured Product</label>
                    <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                        {[true, false].map(v => (
                            <button
                                key={String(v)}
                                style={{ ...S.filterChip, ...(f.featured === v ? S.filterChipOn : {}) }}
                                onClick={() => s("featured", v)}
                            >
                                {v ? "Yes — feature this" : "No"}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
                <button
                    style={S.ctaBtn}
                    onClick={() => onSave({ ...f, price: +f.price, stock: +f.stock })}
                    disabled={uploading}
                >
                    {uploading ? "Uploading Image..." : (product ? "Save Changes" : "Add Product")}
                </button>
                <button style={S.ghostBtn} onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
}
