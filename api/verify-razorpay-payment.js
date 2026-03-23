import crypto from "crypto";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: "Missing payment verification fields." });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expected = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expected !== razorpay_signature) {
            console.error("Razorpay signature mismatch — possible fraud attempt.");
            return res.status(403).json({ error: "Payment verification failed." });
        }

        return res.status(200).json({ data: { success: true } });
    } catch (err) {
        console.error("Verification error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
