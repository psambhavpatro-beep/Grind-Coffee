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
        <div style={S.overlay} onClick={onClose}>
            <div style={S.modal} onClick={e => e.stopPropagation()}>
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
