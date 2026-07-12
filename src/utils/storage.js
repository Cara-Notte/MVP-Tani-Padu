import { mockFoodPrices } from "../data/foodPrices";
import { mockFoodStocks } from "../data/foodStocks";
import { mockOrders } from "../data/orders";
import { mockProducts } from "../data/products";

export const STORAGE_KEYS = {
  users: "tanipadu_users",
  currentUser: "tanipadu_current_user",
  products: "tanipadu_products",
  cart: "tanipadu_cart",
  transactions: "tanipadu_transactions",
  orders: "tanipadu_orders",
  foodPrices: "tanipadu_food_prices",
  foodStocks: "tanipadu_food_stocks"
};

const seedUsers = [
  {
    id: "USR-KONSUMEN",
    name: "Konsumen Demo",
    email: "konsumen@tanipadu.id",
    password: "demo123",
    role: "Konsumen",
    createdAt: "2026-07-09T00:00:00.000Z",
    deliveryProfile: {
      receiverName: "Konsumen Demo",
      phone: "0812-1111-2026",
      address: "Desa Rajeg Mulya, Kecamatan Rajeg",
      updatedAt: "2026-07-09T00:00:00.000Z"
    }
  },
  {
    id: "USR-PRODUSEN",
    name: "Produsen Demo",
    email: "produsen@tanipadu.id",
    password: "demo123",
    role: "Produsen",
    createdAt: "2026-07-09T00:00:00.000Z",
    deliveryProfile: {
      receiverName: "Produsen Demo",
      phone: "0812-3456-7890",
      address: "Desa Sukamanah, Kecamatan Rajeg",
      updatedAt: "2026-07-09T00:00:00.000Z"
    },
    producerProfile: {
      businessName: "Kelompok Tani Suka Makmur",
      region: "Desa Sukamanah",
      commodity: "Beras, cabai, dan sayuran",
      contact: "0812-3456-7890",
      documentName: "dokumen-produsen-demo.pdf",
      verifiedAt: "2026-07-09T00:00:00.000Z"
    }
  },
  {
    id: "USR-PEMERINTAH",
    name: "Pemerintah Demo",
    email: "pemerintah@tanipadu.id",
    password: "demo123",
    role: "Pemerintah",
    createdAt: "2026-07-09T00:00:00.000Z",
    deliveryProfile: {
      receiverName: "Pemerintah Demo",
      phone: "0812-9000-2026",
      address: "Kantor Kecamatan Rajeg",
      updatedAt: "2026-07-09T00:00:00.000Z"
    },
    governmentProfile: {
      institution: "Kecamatan Rajeg",
      position: "Petugas Ketahanan Pangan",
      assignmentRegion: "Kecamatan Rajeg",
      officialEmail: "pangan@rajeg.go.id",
      documentName: "surat-tugas-demo.pdf",
      verifiedAt: "2026-07-09T00:00:00.000Z"
    }
  }
];

function hasStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function readStorage(key, fallback) {
  if (!hasStorage()) return fallback;

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  if (!hasStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeStorage(key) {
  if (!hasStorage()) return;
  window.localStorage.removeItem(key);
}

export function publicUser(user) {
  if (!user) return null;
  const { password, ...profile } = user;
  return profile;
}

export function ensureSeedData() {
  if (!readStorage(STORAGE_KEYS.users, null)) {
    writeStorage(STORAGE_KEYS.users, seedUsers);
  }

  const storedProducts = readStorage(STORAGE_KEYS.products, null);
  if (!storedProducts) {
    writeStorage(STORAGE_KEYS.products, mockProducts);
  } else {
    const productsWithFreshAssets = storedProducts.map((product) => {
      const mockProduct = mockProducts.find((item) => item.id === product.id);
      if (!mockProduct || product.imageUrl) return product;

      return {
        ...product,
        imageUrl: mockProduct.imageUrl,
        imageTone: product.imageTone || mockProduct.imageTone
      };
    });
    writeStorage(STORAGE_KEYS.products, productsWithFreshAssets);
  }

  if (!readStorage(STORAGE_KEYS.orders, null)) {
    writeStorage(STORAGE_KEYS.orders, mockOrders);
  }

  if (!readStorage(STORAGE_KEYS.transactions, null)) {
    writeStorage(STORAGE_KEYS.transactions, []);
  }

  if (!readStorage(STORAGE_KEYS.cart, null)) {
    writeStorage(STORAGE_KEYS.cart, {});
  }

  if (!readStorage(STORAGE_KEYS.foodPrices, null)) {
    writeStorage(STORAGE_KEYS.foodPrices, mockFoodPrices);
  }

  if (!readStorage(STORAGE_KEYS.foodStocks, null)) {
    writeStorage(STORAGE_KEYS.foodStocks, mockFoodStocks);
  }
}

export function getUsers() {
  return readStorage(STORAGE_KEYS.users, []);
}

export function setUsers(users) {
  writeStorage(STORAGE_KEYS.users, users);
}

export function getCurrentUser() {
  return readStorage(STORAGE_KEYS.currentUser, null);
}

export function saveCurrentUser(user) {
  if (!user) {
    removeStorage(STORAGE_KEYS.currentUser);
    return;
  }

  writeStorage(STORAGE_KEYS.currentUser, publicUser(user));
}

export function getProducts() {
  const products = readStorage(STORAGE_KEYS.products, mockProducts);
  try {
    return (products || []).map((p) => {
      if (!p || !p.imageUrl) return p;
      // normalize leading slash to relative path so GitHub Pages serves correctly
      if (typeof p.imageUrl === "string" && p.imageUrl.startsWith("/assets/")) {
        return { ...p, imageUrl: `.${p.imageUrl}` };
      }
      return p;
    });
  } catch {
    return products;
  }
}

export function setProducts(products) {
  writeStorage(STORAGE_KEYS.products, products);
}

export function getCart(userEmail) {
  if (!userEmail) return [];
  const carts = readStorage(STORAGE_KEYS.cart, {});
  return carts[userEmail] || [];
}

export function setCart(userEmail, cart) {
  if (!userEmail) return;
  const carts = readStorage(STORAGE_KEYS.cart, {});
  writeStorage(STORAGE_KEYS.cart, {
    ...carts,
    [userEmail]: cart
  });
}

export function getTransactions() {
  return readStorage(STORAGE_KEYS.transactions, []);
}

export function setTransactions(transactions) {
  writeStorage(STORAGE_KEYS.transactions, transactions);
}

export function getOrders() {
  return readStorage(STORAGE_KEYS.orders, mockOrders);
}

export function getFoodPrices() {
  return readStorage(STORAGE_KEYS.foodPrices, mockFoodPrices);
}

export function setFoodPrices(prices) {
  writeStorage(STORAGE_KEYS.foodPrices, prices);
}

export function getFoodStocks() {
  return readStorage(STORAGE_KEYS.foodStocks, mockFoodStocks);
}

export function setFoodStocks(stocks) {
  writeStorage(STORAGE_KEYS.foodStocks, stocks);
}
