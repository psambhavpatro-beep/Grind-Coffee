import { useState } from "react";
import { S } from "../styles";

export default function ProdForm({ product, vendors, isAdmin, user, onSave, onCancel }) {
    const [f, setF] = useState(product || {
        name: "", origin: "", farmName: "", altitude: "", process: "Washed",
        roastDate: "", roastType: "Medium", notes: "", description: "",
        price: "", stock: "", image: "",
        vendorId: isAdmin ? "" : user.id,
        featured: false, weight: "250g",
    });
    const s = (k, v) => setF(x => ({ ...x, [k]: v }));

    const FF = ({ label, k, type = "text", opts, ph, span, rows }) => (
        <div style={{ gridColumn: span ? "1/-1" : undefined }}>
            <label style={S.fLabel}>{label}</label>
            {opts ? <select style={S.inp} value={f[k]} onChange={e => s(k, e.target.value)}><option value="">— select —</option>{opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}</select>
                : rows ? <textarea style={{ ...S.inp, minHeight: 90, resize: "vertical" }} value={f[k]} onChange={e => s(k, e.target.value)} placeholder={ph} />
                    : <input style={S.inp} type={type} value={f[k]} onChange={e => s(k, e.target.value)} placeholder={ph} />}
        </div>
    );

    return (
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "28px 28px 60px" }}>
            <h2 style={S.dashH}>{product ? "Edit Product" : "Add Product"}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 20 }}>
                <FF label="Product Name *" k="name" span />
                {isAdmin && (
                    <FF label="Vendor" k="vendorId" span opts={Object.values(vendors).filter(v => v.approved).map(v => ({ v: v.id, l: v.name }))} />
                )}
                <FF label="Origin Country" k="origin" />
                <FF label="Farm / Co-op" k="farmName" />
                <FF label="Altitude" k="altitude" ph="e.g. 1,700–1,950 m" />
                <FF label="Process" k="process" opts={["Washed", "Natural", "Honey", "Anaerobic", "Wet-Hulled", "Other"].map(o => ({ v: o, l: o }))} />
                <FF label="Roast Type" k="roastType" opts={["Light", "Medium-Light", "Medium", "Medium-Dark", "Dark"].map(o => ({ v: o, l: o }))} />
                <FF label="Roast Date" k="roastDate" type="date" />
                <FF label="Price ₹ / 250g" k="price" type="number" />
                <FF label="Stock (bags)" k="stock" type="number" />
                <FF label="Tasting Notes" k="notes" ph="e.g. Blueberry, chocolate, jasmine" />
                <FF label="Image URL" k="image" span />
                <FF label="Description" k="description" rows span />
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
                <button style={S.ctaBtn} onClick={() => onSave({ ...f, price: +f.price, stock: +f.stock })}>
                    {product ? "Save Changes" : "Add Product"}
                </button>
                <button style={S.ghostBtn} onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
}
