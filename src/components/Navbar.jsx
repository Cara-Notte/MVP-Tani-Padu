import { useState } from "react";

function isActive(route, target) {
  if (target === "/") return route === "/";
  return route === target || route.startsWith(`${target}/`);
}

function NavIcon({ type }) {
  const icons = {
    home: (
      <>
        <path d="m4 11 8-7 8 7" />
        <path d="M6 10v10h12V10" />
        <path d="M10 20v-6h4v6" />
      </>
    ),
    market: (
      <>
        <path d="M4 10h16l-1 10H5L4 10Z" />
        <path d="M7 10V7a5 5 0 0 1 10 0v3" />
        <path d="M9 15h6" />
      </>
    ),
    cart: (
      <>
        <path d="M4 5h2l2 10h9l2-7H7" />
        <path d="M9 20h.01" />
        <path d="M17 20h.01" />
      </>
    ),
    profile: (
      <>
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    producer: (
      <>
        <path d="M12 21V7" />
        <path d="M12 12C7 11 5 8 4 4c5 0 8 3 8 8Z" />
        <path d="M12 15c5-1 7-4 8-8-5 0-8 3-8 8Z" />
      </>
    ),
    government: (
      <>
        <path d="M4 10h16" />
        <path d="M6 10v8" />
        <path d="M10 10v8" />
        <path d="M14 10v8" />
        <path d="M18 10v8" />
        <path d="M3 18h18" />
        <path d="M12 4 4 8h16l-8-4Z" />
      </>
    ),
    login: (
      <>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M14 4h5v16h-5" />
      </>
    ),
    register: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
        <path d="M4 4h16v16H4z" />
      </>
    )
  };

  return (
    <span className="nav-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        {icons[type] || icons.home}
      </svg>
    </span>
  );
}

export function Navbar({ user, cartCount, route, navigate }) {
  const [isOpen, setIsOpen] = useState(false);

  const closeAndGo = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const baseItems = [
    { label: "Beranda", path: "/", icon: "home" },
    { label: "Pasar Pangan", path: "/pasar-pangan", icon: "market" },
    { label: `Keranjang${cartCount ? ` (${cartCount})` : ""}`, path: "/keranjang", icon: "cart" }
  ];

  const accountItems = user ? [{ label: "Profil", path: "/profil", icon: "profile" }] : [];
  const producerItems =
    user?.role === "Produsen" ? [{ label: "Dashboard Produsen", path: "/produsen", icon: "producer" }] : [];
  const governmentItems =
    user?.role === "Pemerintah" ? [{ label: "Monitoring Pangan", path: "/pemerintah", icon: "government" }] : [];
  const guestItems = !user
    ? [
        { label: "Masuk", path: "/masuk", icon: "login" },
        { label: "Daftar", path: "/daftar", icon: "register", emphasized: true }
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
              <NavIcon type={item.icon} />
              <span className="nav-link-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
