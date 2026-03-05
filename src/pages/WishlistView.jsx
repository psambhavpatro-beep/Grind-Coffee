import { S } from "../styles";
import { PCard } from "./ShopView";

export default function WishlistView({ items, onProd, onWish, onBack }) {
    return (
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "28px 28px 60px" }}>
            <button style={S.backBtn} onClick={onBack}>← Back to Shop</button>
            <h2 style={S.dashH}>Saved Coffees</h2>

            {items.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <p style={{ fontSize: 36, marginBottom: 12 }}>♡</p>
                    <p style={{ color: "#888", fontFamily: "sans-serif" }}>You haven't saved any coffees yet.</p>
                </div>
            ) : (
                <div style={S.grid}>
                    {items.map(p => (
                        <PCard
                            key={p.id}
                            p={p}
                            v={{ name: p.vendorId }}
                            onProd={onProd}
                            onVendor={() => { }}
                            wished={true}
                            onWish={onWish}
                            rating={0}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
