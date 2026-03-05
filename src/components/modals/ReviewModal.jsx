import { useState } from "react";
import { S } from "../../styles";

export default function ReviewModal({ productId, user, onSubmit, onClose }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");

    return (
        <div style={S.overlay} onClick={onClose}>
            <div style={{ ...S.modal, maxWidth: 400 }} onClick={e => e.stopPropagation()}>
                <button style={S.mClose} onClick={onClose}>✕</button>
                <h2 style={S.mTitle}>Write a Review</h2>
                <p style={{ color: "#5a4a3a", fontSize: 12, fontFamily: "sans-serif", marginBottom: 20 }}>
                    Share your experience with this coffee
                </p>

                {/* Star picker */}
                <div style={{ display: "flex", gap: 6, marginBottom: 20, justifyContent: "center" }}>
                    {[1, 2, 3, 4, 5].map(n => (
                        <button
                            key={n}
                            style={{ background: "none", border: "none", fontSize: 32, cursor: "pointer", color: (hover || rating) >= n ? "#c8864a" : "#2a1a0a", transition: "transform .1s" }}
                            onMouseEnter={() => setHover(n)}
                            onMouseLeave={() => setHover(0)}
                            onClick={() => setRating(n)}
                        >★</button>
                    ))}
                </div>

                {rating > 0 && (
                    <p style={{ textAlign: "center", color: "#c8864a", fontSize: 13, fontFamily: "sans-serif", marginBottom: 16 }}>
                        {"Terrible/Poor/Average/Good/Excellent".split("/")[rating - 1]}
                    </p>
                )}

                <label style={S.fLabel}>Your Review</label>
                <textarea
                    style={{ ...S.inp, minHeight: 100, resize: "vertical", marginBottom: 16 }}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="What did you think of this coffee? Describe the flavour, aroma, and your brewing experience…"
                />

                <button
                    style={{ ...S.ctaBtn, width: "100%", opacity: rating && comment ? 1 : .4 }}
                    onClick={() => rating && comment && onSubmit(productId, rating, comment)}
                >
                    Submit Review
                </button>
            </div>
        </div>
    );
}
