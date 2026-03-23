import { S } from "../styles";

export function Toast({ msg, type }) {
    return (
        <div style={{ ...S.toast, background: type === "err" ? "#6a1500" : "#0a2214" }}>
            {msg}
        </div>
    );
}

export function Inp({ label, type = "text", val, set, ph }) {
    return (
        <div style={{ marginBottom: 13 }}>
            {label && <label style={S.fLabel}>{label}</label>}
            <input
                style={S.inp}
                type={type}
                value={val}
                onChange={e => set(e.target.value)}
                placeholder={ph}
            />
        </div>
    );
}

export function StatCard({ label, value, alert }) {
    return (
        <div style={{ ...S.statCard, borderColor: alert ? "#dc2626" : "#111" }}>
            <div style={{ ...S.statVal, color: alert ? "#dc2626" : "#1b4332" }}>{value}</div>
            <div style={S.statLbl}>{label}</div>
        </div>
    );
}
