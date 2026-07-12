import { useState } from "react";
import { formatNumber, formatRupiah } from "../utils/formatters";
import { StatusBadge } from "../components/StatusBadge";

export function ProductDetailPage({ product, onAddToCart, navigate }) {
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <main className="page-shell narrow">
        <div className="empty-state">
          <h1>Produk tidak ditemukan</h1>
          <p>Produk yang Anda buka tidak tersedia di data simulasi.</p>
          <button className="btn btn-primary" onClick={() => navigate("/pasar-pangan")}>
            Kembali ke Pasar Pangan
          </button>
        </div>
      </main>
    );
  }

  const isLowStock = product.stock <= 70;
  const stockLabel = product.stock <= 0 ? "Habis" : isLowStock ? "Terbatas" : "Tersedia";

  return (
    <main className="page-shell detail-layout">
      <section
        className={`detail-image tone-${product.imageTone || "default"}`}
        role="img"
        aria-label={`Foto ${product.name}`}
      >
        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : null}
        <span>{product.category}</span>
      </section>

      <section className="detail-panel">
        <p className="eyebrow">{product.location}</p>
        <h1>{product.name}</h1>
        <p className="muted">{product.description}</p>

        <div className="detail-price">
          <strong>{formatRupiah(product.price)}</strong>
          <span>per {product.unit}</span>
        </div>

        <div className="detail-list">
          <div>
            <span>Produsen</span>
            <strong>{product.producer}</strong>
          </div>
          <div>
            <span>Stok tersedia</span>
            <strong>
              {formatNumber(product.stock)} {product.unit}
            </strong>
          </div>
          <div>
            <span>Status</span>
            <StatusBadge variant={product.stock <= 0 ? "danger" : isLowStock ? "warning" : "success"}>
              {stockLabel}
            </StatusBadge>
          </div>
        </div>

        <div className="quantity-row">
          <label>
            Jumlah
            <div className="quantity-input-wrap">
              <input
                type="number"
                min="1"
                max={Math.max(product.stock, 1)}
                value={quantity}
                onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                aria-describedby="quantity-unit"
              />
              <span id="quantity-unit">{product.unit}</span>
            </div>
          </label>
          <div className="detail-actions">
            <button
              className="btn btn-primary"
              onClick={() => onAddToCart(product.id, quantity)}
              disabled={product.stock <= 0}
            >
              Masukkan ke Keranjang
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/pasar-pangan")}>
              Kembali ke Pasar Pangan
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
