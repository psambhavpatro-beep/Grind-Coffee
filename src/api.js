import {
  collection, doc, getDocs, getDoc,
  addDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp,
  onSnapshot
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { db, auth } from "./firebase";

// ─── AUTH ──────────────────────────────────────────────────────────

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async (role) => {
  if (role === "admin") throw new Error("Google login not allowed for admin");

  const cred = await signInWithPopup(auth, googleProvider);
  const col = role === "vendor" ? "vendors" : "customers";
  const snap = await getDoc(doc(db, col, cred.user.uid));

  if (!snap.exists()) {
    if (role === "customer") {
      const newCust = {
        id: cred.user.uid,
        name: cred.user.displayName || "Coffee Lover",
        email: cred.user.email,
        phone: cred.user.phoneNumber || "",
        role: "customer",
        createdAt: serverTimestamp()
      };
      await setDoc(doc(db, "customers", cred.user.uid), newCust);
      return newCust;
    } else {
      await setDoc(doc(db, "vendors", cred.user.uid), {
        id: cred.user.uid, name: cred.user.displayName || "New Roastery", email: cred.user.email,
        tagline: "", location: "", phone: cred.user.phoneNumber || "",
        story: "", since: new Date().getFullYear().toString(),
        avatar: cred.user.photoURL || "", approved: false, role: "vendor",
        createdAt: serverTimestamp()
      });
      await signOut(auth);
      throw new Error("Application submitted! Awaiting approval.");
    }
  }

  const data = snap.data();
  if (role === "vendor" && !data.approved) {
    await signOut(auth);
    throw new Error("Account pending admin approval");
  }

  return { id: snap.id, name: data.name, email: data.email, role };
};

export const signupCustomer = async (name, email, password, phone) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "customers", cred.user.uid), {
    id: cred.user.uid, name, email, phone, role: "customer",
    defaultAddress: null,
    createdAt: serverTimestamp()
  });
  return { id: cred.user.uid, name, email, role: "customer" };
};

export const signupVendor = async (data) => {
  const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
  await setDoc(doc(db, "vendors", cred.user.uid), {
    id: cred.user.uid, name: data.store, email: data.email,
    tagline: data.tagline, location: data.location, phone: data.phone,
    story: "", since: new Date().getFullYear().toString(),
    avatar: "", approved: false, role: "vendor",
    createdAt: serverTimestamp()
  });
  return null;
};

export const loginUser = async (email, password, role) => {
  if (role === "admin") {
    if (email !== "admin" || password !== "admin123")
      throw new Error("Invalid admin credentials");
    // Sign into Firebase Auth with a real admin account so Firestore writes work.
    // Set VITE_ADMIN_EMAIL + VITE_ADMIN_PASSWORD in your .env file.
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const adminPass = import.meta.env.VITE_ADMIN_PASSWORD;
    if (adminEmail && adminPass) {
      try {
        await signInWithEmailAndPassword(auth, adminEmail, adminPass);
      } catch (e) {
        console.warn("Admin Firebase Auth sign-in failed:", e.message);
        // Continue anyway — Firestore rules may still allow it in open-rule projects.
      }
    }
    return { id: "admin", name: "Owner", role: "admin", email: "owner@roastorigin.com" };
  }
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const col = role === "vendor" ? "vendors" : "customers";
  const snap = await getDoc(doc(db, col, cred.user.uid));
  if (!snap.exists()) throw new Error("Account not found");
  const data = snap.data();
  if (role === "vendor" && !data.approved) {
    await signOut(auth);
    throw new Error("Account pending admin approval");
  }
  return { id: snap.id, name: data.name, email: data.email, role };
};

export const getUserProfile = async (uid, role) => {
  if (role === "admin") return null;
  const col = role === "vendor" ? "vendors" : "customers";
  const snap = await getDoc(doc(db, col, uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data(), role };
};

export const updateCustomerAddress = async (uid, address) => {
  if (!uid) return;
  await updateDoc(doc(db, "customers", uid), { defaultAddress: address });
};

export const logoutUser = () => signOut(auth);
export const logout = () => signOut(auth);    // alias for App.jsx


// ─── PRODUCTS ──────────────────────────────────────────────────────

export const fetchProducts = async () => {
  const snap = await getDocs(collection(db, "products"));
  return snap.docs.map(d => ({ ...d.data(), id: d.id }));
};

export const saveProduct = async (product) => {
  if (product.id && typeof product.id === "string" && product.id.length > 10) {
    const { id, ...data } = product;
    await updateDoc(doc(db, "products", id), data);
    return product;
  } else {
    const { id: _ignored, ...data } = product;
    const ref = await addDoc(collection(db, "products"), {
      ...data, createdAt: serverTimestamp()
    });
    return { ...data, id: ref.id };
  }
};

export const deleteProduct = async (id) => {
  await deleteDoc(doc(db, "products", id));
};

export const toggleFeatured = async (id, current) => {
  await updateDoc(doc(db, "products", id), { featured: !current });
};

// Used by the dev-only seed function in App.jsx
export const seedVendor = async (id, data) => {
  await setDoc(doc(db, "vendors", id), data);
};

export const seedProduct = async (id, data) => {
  await setDoc(doc(db, "products", id), data);
};

// ─── VENDORS ───────────────────────────────────────────────────────

export const fetchVendors = async () => {
  const snap = await getDocs(collection(db, "vendors"));
  return Object.fromEntries(snap.docs.map(d => [d.id, { ...d.data(), id: d.id }]));
};

export const updateVendorProfile = async (vendorId, data) => {
  await updateDoc(doc(db, "vendors", vendorId), data);
};

export const approveVendor = async (vendorId) => {
  await updateDoc(doc(db, "vendors", vendorId), { approved: true });
};

export const rejectVendor = async (vendorId) => {
  await deleteDoc(doc(db, "vendors", vendorId));
};

// ─── ORDERS ────────────────────────────────────────────────────────

export const placeOrder = async (order) => {
  await setDoc(doc(db, "orders", order.id), {
    ...order, createdAt: serverTimestamp()
  });
  return order;
};

export const fetchMyOrders = async (customerId) => {
  // No orderBy to avoid mandatory composite index — sort client-side
  const q = query(collection(db, "orders"), where("customerId", "==", customerId));
  const snap = await getDocs(q);
  const docs = snap.docs.map(d => ({ ...d.data(), id: d.id }));
  return docs.sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const fetchAllOrders = async () => {
  // No orderBy to avoid mandatory composite index — sort client-side
  const snap = await getDocs(collection(db, "orders"));
  const docs = snap.docs.map(d => ({ ...d.data(), id: d.id }));
  return docs.sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const listenToAllOrders = (callback) => {
  return onSnapshot(collection(db, "orders"), (snap) => {
    const docs = snap.docs.map(d => ({ ...d.data(), id: d.id }));
    callback(docs.sort((a, b) => new Date(b.date) - new Date(a.date)));
  });
};


export const updateOrderStatus = async (orderId, status) => {
  await updateDoc(doc(db, "orders", orderId), { status });
};

// ─── REVIEWS ───────────────────────────────────────────────────────

export const fetchReviews = async (productId) => {
  const q = query(collection(db, "reviews"), where("productId", "==", productId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...d.data(), id: d.id }));
};

export const addReview = async (review) => {
  const ref = await addDoc(collection(db, "reviews"), {
    ...review, createdAt: serverTimestamp()
  });
  return { ...review, id: ref.id };
};

// ─── WISHLIST ──────────────────────────────────────────────────────

export const fetchWishlist = async (customerId) => {
  const q = query(collection(db, "wishlist"), where("customerId", "==", customerId));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data().productId);
};

export const toggleWishlist = async (customerId, productId, isWished) => {
  const id = `${customerId}_${productId}`;
  if (isWished) {
    await deleteDoc(doc(db, "wishlist", id));
  } else {
    await setDoc(doc(db, "wishlist", id), { customerId, productId });
  }
};

// ─── UTILITIES ─────────────────────────────────────────────────────

export const uploadImageToImgBB = async (file) => {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
  if (!apiKey) throw new Error("VITE_IMGBB_API_KEY is not set in environment variables");

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error?.message || "Failed to upload image to ImgBB");
  }

  return data.data.display_url;
};

// ─── SHIPROCKET ────────────────────────────────────────────────────
// Called after a successful order write. Triggers the Vercel Serverless Function
// that authenticates with Shiprocket, creates a shipment, and writes
// the tracking AWB back to the Firestore order document.
// This is fire-and-forget — the caller .catch()es any errors.
export const triggerShiprocket = async (orderId) => {
  const res = await fetch("/api/create-shiprocket-shipment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId })
  });
  const result = await res.json();
  if (result.error) throw new Error(result.error);
  return result.data; // { trackingId, trackingUrl }
};
