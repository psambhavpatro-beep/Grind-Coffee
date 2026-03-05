import {
  collection, doc, getDocs, getDoc,
  addDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { db, auth } from "./firebase";

// ─── AUTH ──────────────────────────────────────────────────────────

export const signupCustomer = async (name, email, password, phone) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "customers", cred.user.uid), {
    id: cred.user.uid, name, email, phone, role: "customer",
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
    if (email === "admin" && password === "admin123")
      return { id: "admin", name: "Owner", role: "admin", email: "owner@roastorigin.com" };
    throw new Error("Invalid admin credentials");
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
  const q = query(collection(db, "orders"), where("customerId", "==", customerId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...d.data(), id: d.id }));
};

export const fetchAllOrders = async () => {
  const snap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
  return snap.docs.map(d => ({ ...d.data(), id: d.id }));
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