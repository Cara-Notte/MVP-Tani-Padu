import { formatNumber, formatRupiah } from "../utils/formatters";
import { StatusBadge } from "./StatusBadge";

function stockVariant(stock) {
  if (stock <= 0) return "danger";
  if (stock <= 70) return "warning";
  return "success";
}

function stockLabel(stock) {
  if (stock <= 0) return "Habis";
  if (stock <= 70) return "Terbatas";
  return "Tersedia";
}

export function ProductCard({ product, onDetail, onAddToCart }) {
  const computeImageSrc = (url) => {
    if (!url) return null;
    // If the url is absolute-root (starts with '/assets/'), prefix current pathname (repo subpath)
    if (typeof window !== 'undefined' && typeof url === 'string' && url.startsWith('/')) {
      const base = window.location.pathname.replace(/\/$/, '');
      return `${base}${url}`;
    }
    return url;
  };

  return (
    <article className="product-card">
      <div
        className={`product-image tone-${product.imageTone || "default"}`}
        role="img"
        aria-label={product.imageUrl ? `Foto ${product.name}` : `Ilustrasi ${product.name}`}
      >
        {product.imageUrl ? <img src={computeImageSrc(product.imageUrl)} alt={product.name} /> : null}
        <span>{product.category}</span>
      </div>
      <div className="product-body">
        <div className="product-heading">
          <div>
            <p className="eyebrow">{product.location}</p>
            <h3>{product.name}</h3>
          </div>
          <StatusBadge variant={stockVariant(product.stock)}>{stockLabel(product.stock)}</StatusBadge>
        </div>
        <p className="muted">{product.producer}</p>
        <div className="product-meta">
          <strong>{formatRupiah(product.price)}</strong>
          <span>
            Stok {formatNumber(product.stock)} {product.unit}
          </span>
        </div>
        <div className="card-actions">
          <button className="btn btn-secondary" onClick={() => onDetail(product.id)}>
            Detail
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onAddToCart(product.id, 1)}
            disabled={product.stock <= 0}
          >
            Tambah
          </button>
        </div>
      </div>
    </article>
  );
}
