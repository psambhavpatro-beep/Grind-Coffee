import axios from "axios";
import admin from "firebase-admin";

if (!admin.apps.length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } catch (e) {
            console.error("Error parsing FIREBASE_SERVICE_ACCOUNT", e);
        }
    } else {
        // Fallback for local dev if they have default credentials or just initializeApp if they use env vars
        admin.initializeApp();
    }
}
const db = admin.firestore();

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        const { orderId } = req.body;
        if (!orderId) return res.status(400).json({ error: "orderId is required." });

        const orderRef = db.collection("orders").doc(orderId);
        const orderSnap = await orderRef.get();
        if (!orderSnap.exists) return res.status(404).json({ error: `Order ${orderId} not found.` });
        const o = orderSnap.data();

        if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
            return res.status(500).json({ error: "Shiprocket credentials missing." });
        }

        // ── Get Shiprocket auth token ──────────────────────────────────
        const authRes = await axios.post("https://apiv2.shiprocket.in/v1/external/auth/login", {
            email: process.env.SHIPROCKET_EMAIL,
            password: process.env.SHIPROCKET_PASSWORD,
        });
        const token = authRes.data.token;
        const headers = { Authorization: `Bearer ${token}` };

        const totalQty = o.items.reduce((s, i) => s + i.qty, 0);
        const weightKg = Math.max(0.25, totalQty * 0.25).toFixed(2);

        const shiprocketPayload = {
            order_id: o.id,
            order_date: o.date.split("T")[0],
            pickup_location: "Primary",
            channel_id: "",
            comment: "Grind order",
            billing_customer_name: o.address.name,
            billing_last_name: "",
            billing_address: o.address.line1,
            billing_city: o.address.city || "Bengaluru",
            billing_pincode: o.address.pin,
            billing_state: o.address.state || "Karnataka",
            billing_country: "India",
            billing_email: o.customerEmail,
            billing_phone: o.address.phone,
            shipping_is_billing: true,
            order_items: o.items.map(item => ({
                name: `${item.name} (${item.grind})`,
                sku: item.vendorId + "_" + item.name.slice(0, 10).replace(/\s/g, "_"),
                units: item.qty,
                selling_price: item.unitPrice,
            })),
            payment_method: o.paymentStatus === "paid" ? "Prepaid" : "COD",
            sub_total: o.total,
            length: 15,
            breadth: 15,
            height: 10,
            weight: weightKg,
        };

        const createRes = await axios.post(
            "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
            shiprocketPayload, { headers }
        );
        const shiprocketOrder = createRes.data;

        const awb = shiprocketOrder.awb_code || shiprocketOrder.shipment_id?.toString() || "";
        const trackingUrl = awb ? `https://shiprocket.co/tracking/${awb}` : "";

        await orderRef.update({ trackingId: awb, trackingUrl });
        console.log(`Shiprocket shipment created for ${orderId}: AWB=${awb}`);

        return res.status(200).json({ data: { trackingId: awb, trackingUrl } });
    } catch (err) {
        console.error("Shiprocket error:", err.response?.data || err.message);
        return res.status(500).json({ error: "Shiprocket Error" });
    }
}
