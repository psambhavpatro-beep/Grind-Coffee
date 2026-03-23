import Razorpay from "razorpay";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { amount, currency = "INR" } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ error: "amount must be at least 100 paise (₹1)." });
    }

    const razorpay = new Razorpay({
      key_id: process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `rcpt_${Date.now()}`,
    });

    return res.status(200).json({ data: { razorpayOrderId: order.id, amount: order.amount, currency: order.currency } });
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    return res.status(500).json({ error: "Could not create payment order. Please try again." });
  }
}
