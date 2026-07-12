import { useState } from "react";

function isActive(route, target) {
  if (target === "/") return route === "/";
  return route === target || route.startsWith(`${target}/`);
}

export function Navbar({ user, cartCount, route, navigate }) {
  const [isOpen, setIsOpen] = useState(false);

  const closeAndGo = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const baseItems = [
    { label: "Beranda", path: "/" },
    { label: "Pasar Pangan", path: "/pasar-pangan" },
    { label: `Keranjang${cartCount ? ` (${cartCount})` : ""}`, path: "/keranjang" }
  ];

  const accountItems = user ? [{ label: "Profil", path: "/profil" }] : [];
  const producerItems =
    user?.role === "Produsen" ? [{ label: "Dashboard Produsen", path: "/produsen" }] : [];
  const governmentItems =
    user?.role === "Pemerintah" ? [{ label: "Monitoring Pangan", path: "/pemerintah" }] : [];
  const guestItems = !user
    ? [
        { label: "Masuk", path: "/masuk" },
        { label: "Daftar", path: "/daftar", emphasized: true }
      ]
    : [];

  const navItems = [
    ...baseItems,
    ...accountItems,
    ...producerItems,
    ...governmentItems,
    ...guestItems
  ];

  return (
    <header className="navbar">
      <div className="nav-inner">
        <button className="brand-button" onClick={() => closeAndGo("/")} aria-label="Beranda Tani Padu">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 48 48" role="img" focusable="false">
              <path d="M24 39V12" />
              <path d="M24 17C17 15 12 10 10 5C18 5 23 10 24 17Z" />
              <path d="M24 22C17 21 11 17 8 11C17 10 23 15 24 22Z" />
              <path d="M24 18C31 15 36 10 38 5C30 5 25 10 24 18Z" />
              <path d="M24 24C31 22 37 17 40 11C31 10 25 16 24 24Z" />
              <path d="M24 30C17 29 13 25 10 20C18 19 23 24 24 30Z" />
              <path d="M24 30C31 29 35 25 38 20C30 19 25 24 24 30Z" />
            </svg>
          </span>
          <span className="brand-text">
            <strong>Tani Padu</strong>
          </span>
        </button>

        <button
          className="menu-toggle"
          onClick={() => setIsOpen((value) => !value)}
          aria-expanded={isOpen}
          aria-label="Buka menu navigasi"
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav-links ${isOpen ? "is-open" : ""}`}>
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`nav-link ${isActive(route, item.path) ? "active" : ""} ${
                item.emphasized ? "nav-cta" : ""
              }`}
              onClick={() => closeAndGo(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
