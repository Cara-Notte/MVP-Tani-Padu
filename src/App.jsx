import { useEffect, useMemo, useState } from "react";
import { AccessGate } from "./components/AccessGate";
import { Navbar } from "./components/Navbar";
import TargetCursor from "./components/TargetCursor";
import { CartPage } from "./pages/CartPage";
import { GovernmentDashboard } from "./pages/GovernmentDashboard";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { PasarPanganPage } from "./pages/PasarPanganPage";
import { PaymentPage } from "./pages/PaymentPage";
import { ProducerDashboard } from "./pages/ProducerDashboard";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { useHashRoute } from "./hooks/useHashRoute";
import {
  ensureSeedData,
  getCart,
  getCurrentUser,
  getOrders,
  getProducts,
  getTransactions,
  getUsers,
  publicUser,
  saveCurrentUser,
  setCart,
  setProducts,
  setTransactions,
  setUsers
} from "./utils/storage";

ensureSeedData();

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function createProductId(name, products) {
  const base =
    String(name || "produk")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "produk";
  let id = base;
  let index = 1;

  while (products.some((product) => product.id === id)) {
    index += 1;
    id = `${base}-${index}`;
  }

  return id;
}

function NotFoundPage({ navigate }) {
  return (
    <main className="page-shell narrow">
      <div className="empty-state">
        <h1>Halaman tidak ditemukan</h1>
        <p>Alamat yang dibuka belum tersedia di MVP Tani Padu.</p>
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          Kembali ke Beranda
        </button>
      </div>
    </main>
  );
}

function FlashMessage({ flash, onClose, navigate }) {
  const message = typeof flash === "string" ? flash : flash?.message;

  if (!message) return null;

  return (
    <div className="flash-wrap">
      <div className="notice success flash-message">
        <span>{message}</span>
        {flash?.action ? (
          <button
            className="btn btn-small btn-secondary"
            onClick={() => {
              navigate(flash.action.path);
              onClose();
            }}
          >
            {flash.action.label}
          </button>
        ) : (
          <button className="link-button" onClick={onClose}>
            Tutup
          </button>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const { route, navigate } = useHashRoute();
  const [currentUser, setCurrentUserState] = useState(getCurrentUser);
  const [products, setProductsState] = useState(getProducts);
  const [orders] = useState(getOrders);
  const [transactionsState, setTransactionsState] = useState(getTransactions);
  const [cart, setCartState] = useState(() => {
    const storedUser = getCurrentUser();
    return storedUser ? getCart(storedUser.email) : [];
  });
  const [flash, setFlash] = useState("");

  useEffect(() => {
    setCartState(currentUser ? getCart(currentUser.email) : []);
  }, [currentUser?.email, currentUser]);

  useEffect(() => {
    if (!flash) return undefined;
    const timeout = window.setTimeout(() => setFlash(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [flash]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cart]
  );

  const persistCurrentUser = (user) => {
    const visibleUser = publicUser(user);
    saveCurrentUser(visibleUser);
    setCurrentUserState(visibleUser);
  };

  const replaceUser = (updatedUser) => {
    const users = getUsers();
    const nextUsers = users.map((user) =>
      user.email === updatedUser.email ? { ...user, ...updatedUser } : user
    );
    const storedUser = nextUsers.find((user) => user.email === updatedUser.email);

    setUsers(nextUsers);
    persistCurrentUser(storedUser);
  };

  const persistProducts = (nextProducts) => {
    setProductsState(nextProducts);
    setProducts(nextProducts);
  };

  const persistCart = (nextCart) => {
    if (!currentUser) return;
    setCartState(nextCart);
    setCart(currentUser.email, nextCart);
  };

  const persistTransactions = (nextTransactions) => {
    setTransactionsState(nextTransactions);
    setTransactions(nextTransactions);
  };

  const handleLogin = ({ email, password }) => {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return { ok: false, message: "Email dan kata sandi wajib diisi." };
    }

    const user = getUsers().find(
      (entry) => normalizeEmail(entry.email) === normalizedEmail && entry.password === password
    );

    if (!user) {
      return { ok: false, message: "Email atau kata sandi tidak sesuai." };
    }

    persistCurrentUser(user);
    return { ok: true };
  };

  const handleRegister = ({ name, email, password, confirmPassword }) => {
    const normalizedEmail = normalizeEmail(email);

    if (!name.trim() || !normalizedEmail || !password || !confirmPassword) {
      return { ok: false, message: "Semua kolom wajib diisi." };
    }

    if (password.length < 6) {
      return { ok: false, message: "Kata sandi minimal 6 karakter." };
    }

    if (password !== confirmPassword) {
      return { ok: false, message: "Ulangi kata sandi belum sama." };
    }

    const users = getUsers();
    if (users.some((user) => normalizeEmail(user.email) === normalizedEmail)) {
      return { ok: false, message: "Email sudah terdaftar." };
    }

    const newUser = {
      id: `USR-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "Konsumen",
      createdAt: new Date().toISOString()
    };

    setUsers([...users, newUser]);
    persistCurrentUser(newUser);
    return { ok: true };
  };

  const handleLogout = () => {
    saveCurrentUser(null);
    setCurrentUserState(null);
    setCartState([]);
    setFlash("Anda berhasil keluar dari akun.");
    navigate("/");
  };

  const handleUpgradeToProducer = (profile) => {
    if (!currentUser) return;

    replaceUser({
      ...currentUser,
      role: "Produsen",
      producerProfile: {
        ...profile,
        verifiedAt: new Date().toISOString()
      }
    });
  };

  const handleUpgradeToGovernment = (profile) => {
    if (!currentUser) return;

    replaceUser({
      ...currentUser,
      role: "Pemerintah",
      governmentProfile: {
        ...profile,
        verifiedAt: new Date().toISOString()
      }
    });
  };

  const handleUpdateProfile = (profile) => {
    if (!currentUser) return;

    replaceUser({
      ...currentUser,
      name: profile.name.trim(),
      deliveryProfile: {
        receiverName: profile.receiverName.trim(),
        phone: profile.phone.trim(),
        address: profile.address.trim(),
        updatedAt: new Date().toISOString()
      }
    });
  };

  const addToCart = (productId, quantity = 1) => {
    if (!currentUser) {
      setFlash("Silakan masuk akun untuk memasukkan produk ke keranjang.");
      navigate("/masuk");
      return;
    }

    const product = products.find((item) => item.id === productId);
    if (!product || Number(product.stock) <= 0) {
      setFlash("Produk tidak tersedia untuk dimasukkan ke keranjang.");
      return;
    }

    const requestedQuantity = Math.max(1, Number(quantity) || 1);
    const existingItem = cart.find((item) => item.productId === productId);
    const nextQuantity = Math.min(
      Number(product.stock),
      (existingItem?.quantity || 0) + requestedQuantity
    );
    const nextCart = existingItem
      ? cart.map((item) =>
          item.productId === productId ? { ...item, quantity: nextQuantity } : item
        )
      : [...cart, { productId, quantity: nextQuantity }];

    persistCart(nextCart);
    setFlash({
      message: `${product.name} berhasil ditambahkan ke keranjang.`,
      action: {
        label: "Cek Keranjang",
        path: "/keranjang"
      }
    });
  };

  const updateCartQuantity = (productId, quantity) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    const nextQuantity = Math.min(Math.max(1, Number(quantity) || 1), Math.max(product.stock, 1));
    persistCart(
      cart.map((item) => (item.productId === productId ? { ...item, quantity: nextQuantity } : item))
    );
  };

  const removeCartItem = (productId) => {
    persistCart(cart.filter((item) => item.productId !== productId));
  };

  const checkout = () => {
    if (!currentUser) {
      return { ok: false, message: "Silakan masuk untuk melakukan checkout." };
    }

    if (!cart.length) {
      return { ok: false, message: "Keranjang masih kosong." };
    }

    const cartItems = cart
      .map((item) => {
        const product = products.find((entry) => entry.id === item.productId);
        return product ? { ...item, product } : null;
      })
      .filter(Boolean);

    const stockProblem = cartItems.find((item) => item.quantity > item.product.stock);
    if (stockProblem) {
      return {
        ok: false,
        message: `Stok ${stockProblem.product.name} tidak cukup untuk jumlah yang dipilih.`
      };
    }

    const transaction = {
      id: `TPD-${Date.now()}`,
      customerEmail: currentUser.email,
      customerName: currentUser.name,
      createdAt: new Date().toISOString(),
      status: "Pembayaran Dicatat",
      items: cartItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        producerEmail: item.product.ownerEmail,
        producerName: item.product.producer,
        quantity: item.quantity,
        unit: item.product.unit,
        price: item.product.price
      })),
      total: cartItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0)
    };

    const nextProducts = products.map((product) => {
      const cartItem = cartItems.find((item) => item.productId === product.id);
      if (!cartItem) return product;

      return {
        ...product,
        stock: Math.max(0, Number(product.stock) - Number(cartItem.quantity))
      };
    });
    const nextTransactions = [...transactionsState, transaction];

    persistProducts(nextProducts);
    persistTransactions(nextTransactions);
    persistCart([]);

    return { ok: true, transaction };
  };

  const saveProducerProduct = (payload, editingId) => {
    if (!currentUser) return;

    if (editingId) {
      const nextProducts = products.map((product) =>
        product.id === editingId && product.ownerEmail === currentUser.email
          ? {
              ...product,
              ...payload,
              updatedAt: new Date().toISOString()
            }
          : product
      );
      persistProducts(nextProducts);
      return;
    }

    const newProduct = {
      id: createProductId(payload.name, products),
      ...payload,
      description: payload.description || "Produk hasil panen lokal yang ditambahkan oleh produsen.",
      createdAt: new Date().toISOString()
    };

    persistProducts([newProduct, ...products]);
  };

  const deleteProducerProduct = (productId) => {
    if (!currentUser) return;
    persistProducts(
      products.filter(
        (product) => !(product.id === productId && product.ownerEmail === currentUser.email)
      )
    );
    persistCart(cart.filter((item) => item.productId !== productId));
  };

  const page = (() => {
    if (route === "/") return <LandingPage navigate={navigate} />;
    if (route === "/masuk") return <LoginPage onLogin={handleLogin} navigate={navigate} />;
    if (route === "/daftar") return <RegisterPage onRegister={handleRegister} navigate={navigate} />;
    if (route === "/pasar-pangan") {
      return <PasarPanganPage products={products} onAddToCart={addToCart} navigate={navigate} />;
    }
    if (route.startsWith("/produk/")) {
      const productId = decodeURIComponent(route.replace("/produk/", ""));
      const product = products.find((item) => item.id === productId);
      return <ProductDetailPage product={product} onAddToCart={addToCart} navigate={navigate} />;
    }
    if (route === "/keranjang") {
      return (
        <CartPage
          user={currentUser}
          cart={cart}
          products={products}
          onUpdateCart={updateCartQuantity}
          onRemoveCartItem={removeCartItem}
          navigate={navigate}
        />
      );
    }
    if (route === "/pembayaran") {
      return (
        <PaymentPage
          user={currentUser}
          cart={cart}
          products={products}
          onCheckout={checkout}
          navigate={navigate}
        />
      );
    }
    if (route === "/profil") {
      return (
        <ProfilePage
          user={currentUser}
          onUpdateProfile={handleUpdateProfile}
          onUpgradeToProducer={handleUpgradeToProducer}
          onUpgradeToGovernment={handleUpgradeToGovernment}
          onLogout={handleLogout}
          navigate={navigate}
        />
      );
    }
    if (route === "/produsen") {
      return (
        <AccessGate user={currentUser} allowedRole="Produsen" navigate={navigate}>
          <ProducerDashboard
            user={currentUser}
            products={products}
            orders={orders}
            transactions={transactionsState}
            onSaveProduct={saveProducerProduct}
            onDeleteProduct={deleteProducerProduct}
          />
        </AccessGate>
      );
    }
    if (route === "/pemerintah") {
      return (
        <AccessGate user={currentUser} allowedRole="Pemerintah" navigate={navigate}>
          <GovernmentDashboard />
        </AccessGate>
      );
    }

    return <NotFoundPage navigate={navigate} />;
  })();

  return (
    <div className="app-shell">
      <TargetCursor
        targetSelector="button, input, select, textarea, .cursor-target"
        spinDuration={4}
        hideDefaultCursor
        parallaxOn
        hoverDuration={0.15}
        cursorColor="#ffffff"
        cursorColorOnTarget="#f8b84e"
      />
      <Navbar user={currentUser} cartCount={cartCount} route={route} navigate={navigate} />
      <FlashMessage flash={flash} onClose={() => setFlash("")} navigate={navigate} />
      {page}
    </div>
  );
}
