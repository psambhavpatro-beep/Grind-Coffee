import { useState } from "react";
import { S } from "../../styles";
import { Inp } from "../ui";
import { DEMO_VENDORS } from "../../constants";
import * as api from "../../api";

export default function AuthModal({ mode, loginType, setLoginType, onClose, onSuccess, onSwitch, pop }) {
    const [f, setF] = useState({ name: "", email: "", pass: "", pass2: "", store: "", tagline: "", location: "", phone: "" });
    const [err, setErr] = useState("");
    const [busy, setBusy] = useState(false);

    const s = (k, v) => setF(x => ({ ...x, [k]: v }));

    const googleLogin = async () => {
        if (loginType === "admin") return;
        setErr(""); setBusy(true);
        try {
            const user = await api.loginWithGoogle(loginType);
            onSuccess(user);
        } catch (e) {
            if (e.message.includes("closed by user") || e.code === "auth/popup-closed-by-user") return;
            setErr(e.message || "Google sign in failed");
        } finally {
            setBusy(false);
        }
    };

    const submit = async () => {
        setErr(""); setBusy(true);
        try {
            // ── LOGIN ──────────────────────────────────
            if (mode === "login") {
                // Demo vendor shortcut (no Firebase account needed)
                if (loginType === "vendor") {
                    const demo = Object.values(DEMO_VENDORS).find(v => v.email === f.email && v.password === f.pass);
                    if (demo) { onSuccess({ id: demo.id, name: demo.name, role: "vendor", email: demo.email }); return; }
                }
                // All other logins (customer, vendor w/ real account, admin) via api.js
                const user = await api.loginUser(f.email, f.pass, loginType);
                onSuccess(user);
                return;
            }

            // ── SIGNUP ─────────────────────────────────
            if (!f.email || !f.pass) { setErr("Email and password required"); return; }
            if (f.pass !== f.pass2) { setErr("Passwords don't match"); return; }

            if (loginType === "vendor") {
                if (!f.store) { setErr("Roastery name required"); return; }
                await api.signupVendor({ store: f.store, email: f.email, password: f.pass, tagline: f.tagline, location: f.location, phone: f.phone });
                pop("Application submitted! Awaiting approval."); onClose(); return;
            }

            if (!f.name) { setErr("Full name required"); return; }
            const user = await api.signupCustomer(f.name, f.email, f.pass, f.phone);
            onSuccess(user);

        } catch (e) {
            if (e.code === "auth/email-already-in-use") setErr("Email already registered");
            else if (e.code === "auth/wrong-password" || e.code === "auth/invalid-credential") setErr("Wrong email or password");
            else if (e.code === "auth/user-not-found") setErr("No account found with that email");
            else if (e.code === "auth/weak-password") setErr("Password must be at least 6 characters");
            else setErr(e.message || "Something went wrong");
        } finally { setBusy(false); }
    };

    const tabs = mode === "login" ? ["customer", "vendor", "admin"] : ["customer", "vendor"];
    const lbl = { customer: "Customer", vendor: "Vendor", admin: "Owner" };

    return (
        <div style={S.overlay} className="modal-overlay" onClick={onClose}>
            <div style={S.modal} className="modal-box" onClick={e => e.stopPropagation()}>
                <button style={S.mClose} onClick={onClose}>✕</button>
                <h2 style={S.mTitle}>{mode === "login" ? "Sign In" : "Create Account"}</h2>

                <div style={S.typeTabs}>
                    {tabs.map(t => (
                        <button key={t} style={{ ...S.typeTab, ...(loginType === t ? S.typeTabOn : {}) }} onClick={() => setLoginType(t)}>
                            {lbl[t]}
                        </button>
                    ))}
                </div>

                {mode === "signup" && loginType !== "admin" && <Inp label="Full Name *" val={f.name} set={v => s("name", v)} />}
                {mode === "signup" && loginType === "vendor" && (
                    <>
                        <Inp label="Roastery Name *" val={f.store} set={v => s("store", v)} />
                        <Inp label="Tagline" val={f.tagline} set={v => s("tagline", v)} ph="e.g. Small-batch, obsessively sourced" />
                        <Inp label="Location" val={f.location} set={v => s("location", v)} ph="City, State" />
                    </>
                )}

                {loginType === "admin" && mode === "login"
                    ? <Inp label="Username" val={f.email} set={v => s("email", v)} ph="admin" />
                    : <Inp label="Email *" type="email" val={f.email} set={v => s("email", v)} />}

                <Inp label="Password *" type="password" val={f.pass} set={v => s("pass", v)} />
                {mode === "signup" && <Inp label="Confirm Password *" type="password" val={f.pass2} set={v => s("pass2", v)} />}
                {mode === "signup" && loginType !== "admin" && <Inp label="Phone (optional)" type="tel" val={f.phone} set={v => s("phone", v)} ph="+91 98xxx xxxxx" />}

                {err && <p style={S.errTxt}>{err}</p>}
                {loginType === "vendor" && mode === "signup" && (
                    <p style={S.infoNote}>Your application will be reviewed before activation.</p>
                )}

                <button
                    style={{ ...S.ctaBtn, width: "100%", marginTop: 4, opacity: busy ? 0.6 : 1 }}
                    onClick={submit}
                    disabled={busy}
                >
                    {busy ? "Please wait…" : mode === "login" ? "Sign In" : loginType === "vendor" ? "Submit Application" : "Create Account"}
                </button>

                {loginType !== "admin" && (
                    <button
                        style={{ ...S.ghostBtn, width: "100%", marginTop: 12, border: "1px solid #ddd", background: "#fff", color: "#333", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                        onClick={googleLogin}
                        disabled={busy}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                        Continue with Google
                    </button>
                )}

                {loginType !== "admin" && (
                    <p style={{ color: "#5a4a3a", fontSize: 12, marginTop: 14, textAlign: "center", fontFamily: "sans-serif" }}>
                        {mode === "login" ? "No account? " : "Have an account? "}
                        <button style={{ background: "none", border: "none", color: "#c8864a", cursor: "pointer", fontSize: 12, fontFamily: "sans-serif" }} onClick={onSwitch}>
                            {mode === "login" ? "Sign up" : "Sign in"}
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
}
