// ─── BREWING METHODS (shown as grind selector on product page) ───────
export const GRINDS = [
    { id: "whole", label: "Whole Bean", sub: "Grind yourself" },
    { id: "espresso", label: "Espresso", sub: "Fine grind" },
    { id: "aeropress", label: "AeroPress", sub: "Fine-Medium grind" },
    { id: "pour-over", label: "Pour Over / V60", sub: "Medium-Fine grind" },
    { id: "drip", label: "Drip / Filter", sub: "Medium grind" },
    { id: "french", label: "French Press", sub: "Coarse grind" },
    { id: "cold-brew", label: "Cold Brew", sub: "Extra Coarse grind" },
    { id: "moka", label: "Moka Pot", sub: "Fine grind" },
    { id: "turkish", label: "Turkish Coffee", sub: "Extra Fine grind" },
];

// ─── COLOUR MAPS ─────────────────────────────────────────────────────
export const ROAST_C = {
    Light: "#40916c",
    "Medium-Light": "#2d6a4f",
    Medium: "#1b4332",
    "Medium-Dark": "#14532d",
    Dark: "#052e16",
};

export const STATUS_C = {
    confirmed: "#2563eb",
    preparing: "#d97706",
    "out for delivery": "#1b4332",
    delivered: "#2d6a4f",
    cancelled: "#dc2626",
    pending: "#d97706",
};

// ─── DELIVERY ─────────────────────────────────────────────────────────
export const DELIVERY_FEE = 38;

export const BLR_ZONES = [
    { id: "indiranagar", label: "Indiranagar", eta: 45 },
    { id: "koramangala", label: "Koramangala", eta: 40 },
    { id: "hsr", label: "HSR Layout", eta: 50 },
    { id: "whitefield", label: "Whitefield", eta: 75 },
    { id: "jayanagar", label: "Jayanagar", eta: 55 },
    { id: "jp_nagar", label: "JP Nagar", eta: 60 },
    { id: "btm", label: "BTM Layout", eta: 50 },
    { id: "electronic_city", label: "Electronic City", eta: 80 },
    { id: "hebbal", label: "Hebbal", eta: 65 },
    { id: "mg_road", label: "MG Road / UB City", eta: 35 },
    { id: "marathahalli", label: "Marathahalli", eta: 55 },
    { id: "bannerghatta", label: "Bannerghatta Road", eta: 70 },
];

export const getSlots = () => {
    const now = new Date();
    const slots = [];
    const h = now.getHours();
    if (h < 21) {
        const etaMins = 45;
        const arrival = new Date(now.getTime() + etaMins * 60000);
        slots.push({
            id: "express",
            label: "Express Delivery",
            sub: `Arrives by ${arrival.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`,
            badge: "⚡ Fastest",
            fee: 0,
        });
    }
    for (let offset = 1; offset <= 3; offset++) {
        const start = new Date(now.getTime() + offset * 90 * 60000);
        const end = new Date(start.getTime() + 60 * 60000);
        const sh = start.getHours();
        if (sh >= 8 && sh < 22) {
            slots.push({
                id: `slot_${offset}`,
                label: `${start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`,
                sub: "Scheduled delivery",
                badge: null,
                fee: 0,
            });
        }
    }
    return slots;
};

// ─── FALLBACK IMAGE ───────────────────────────────────────────────────
export const DEF_IMG = "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=600&q=80";

// ─── DEMO VENDOR FALLBACK ─────────────────────────────────────────────
export const DEMO_VENDORS = {
    demo_vendor: {
        id: "demo_vendor", name: "Blue Kettle Roasters", email: "hello@bluekettle.com",
        password: "vendor123", role: "vendor",
        tagline: "Small-batch, obsessively sourced.",
        story: "Blue Kettle started in a converted garage in Coorg in 2018. Our founder Aditya spent three years travelling to farms across Ethiopia, Colombia, and Myanmar before roasting his first bag. Every coffee is personally cupped at origin — we believe the roaster's job is simply to get out of the way of a great green bean.",
        location: "Coorg, Karnataka", since: "2018",
        avatar: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&q=80",
        approved: true, phone: "+91 98400 12345", website: "bluekettle.in",
    },
    dark_vendor: {
        id: "dark_vendor", name: "Dark Matter Coffee", email: "roast@darkmatter.in",
        password: "dark123", role: "vendor",
        tagline: "Deep roasts, deeper stories.",
        story: "We started Dark Matter because we believed dark roast coffee deserved as much care as light roast. Our sourcing focuses on coffees with natural density and sweetness to survive a dark roast without turning bitter. Every bag tells a story of terroir, craft, and obsession.",
        location: "Bengaluru, Karnataka", since: "2020",
        avatar: "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=300&q=80",
        approved: true, phone: "+91 80000 56789", website: "darkmatter.coffee",
    },
};
