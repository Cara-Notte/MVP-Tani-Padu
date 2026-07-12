import { useMemo } from "react";
import { formatNumber, formatRupiah } from "../utils/formatters";

export function CartPage({ user, cart, products, onUpdateCart, onRemoveCartItem, navigate }) {
  const cartItems = useMemo(
    () =>
      cart
        .map((item) => {
          const product = products.find((entry) => entry.id === item.productId);
          return product ? { ...item, product } : null;
        })
        .filter(Boolean),
    [cart, products]
  );

  const total = cartItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

  if (!user) {
    return (
      <main className="page-shell narrow">
        <div className="empty-state">
          <h1>Keranjang membutuhkan akun</h1>
          <p>Silakan masuk untuk menyimpan keranjang dan melanjutkan checkout.</p>
          <button className="btn btn-primary" onClick={() => navigate("/masuk")}>
            Masuk Akun
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="cart-purpose">
        <h1>Kelola keranjang sebelum checkout.</h1>
      </section>

      {cartItems.length ? (
        <section className="cart-layout">
          <div className="cart-list">
            {cartItems.map((item) => (
              <article className="cart-item" key={item.productId}>
                <div className="cart-product">
                  <div
                    className={`cart-thumb tone-${item.product.imageTone || "default"}`}
                    aria-hidden="true"
                  >
                    {item.product.imageUrl ? (
                      <img src={item.product.imageUrl} alt="" />
                    ) : (
                      <span>{item.product.category}</span>
                    )}
                  </div>
                  <div className="cart-copy">
                    <div className="cart-title-row">
                      <p className="eyebrow">{item.product.producer}</p>
                      <span className="cart-unit">per {item.product.unit}</span>
                    </div>
                    <h3>{item.product.name}</h3>
                    <div className="cart-meta-row">
                      <span>{formatRupiah(item.product.price)}</span>
                      <span>
                        Stok {formatNumber(item.product.stock)} {item.product.unit}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="cart-controls">
                  <label className="cart-qty">
                    Jumlah
                    <div className="quantity-input-wrap cart-quantity-input">
                      <input
                        type="number"
                        min="1"
                        max={Math.max(item.product.stock, 1)}
                        value={item.quantity}
                        onChange={(event) =>
                          onUpdateCart(item.productId, Math.max(1, Number(event.target.value) || 1))
                        }
                        aria-label={`Jumlah ${item.product.name}`}
                      />
                      <span>{item.product.unit}</span>
                    </div>
                  </label>
                  <div className="cart-subtotal">
                    <span>Subtotal</span>
                    <strong>{formatRupiah(item.quantity * item.product.price)}</strong>
                  </div>
                  <button
                    className="btn btn-icon btn-danger"
                    onClick={() => onRemoveCartItem(item.productId)}
                    aria-label={`Hapus ${item.product.name} dari keranjang`}
                    title="Hapus dari keranjang"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M6 6l1 15h10l1-15" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                    </svg>
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="summary-panel">
            <p className="eyebrow">Rincian checkout</p>
            <h2>{formatRupiah(total)}</h2>
            <div className="summary-breakdown">
              <div>
                <span>Produk</span>
                <strong>{formatNumber(cartItems.length)}</strong>
              </div>
              <div>
                <span>Total item</span>
                <strong>{formatNumber(cartItems.reduce((sum, item) => sum + item.quantity, 0))}</strong>
              </div>
            </div>
            <button className="btn btn-primary btn-full" onClick={() => navigate("/pembayaran")}>
              Checkout
            </button>
          </aside>
        </section>
      ) : (
        <div className="empty-state">
          <h2>Keranjang masih kosong</h2>
          <p>Tambahkan produk dari pasar pangan untuk mulai checkout.</p>
          <button className="btn btn-primary" onClick={() => navigate("/pasar-pangan")}>
            Lihat Pasar Pangan
          </button>
        </div>
      )}
    </main>
  );
}
