import { useMemo, useState } from "react";
import { ProductCard } from "../components/ProductCard";

export function PasarPanganPage({ products, onAddToCart, navigate }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");

  const categories = useMemo(
    () => ["Semua", ...Array.from(new Set(products.map((product) => product.category)))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = category === "Semua" || product.category === category;
      const matchesKeyword =
        !keyword ||
        [product.name, product.producer, product.location, product.category]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      return matchesCategory && matchesKeyword;
    });
  }, [category, products, query]);

  return (
    <main className="page-shell">
      <section className="filter-bar">
        <label>
          Cari produk
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari beras, cabai, desa, atau produsen"
          />
        </label>
        <label>
          Kategori
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </section>

      {filteredProducts.length ? (
        <section className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDetail={(id) => navigate(`/produk/${id}`)}
              onAddToCart={onAddToCart}
            />
          ))}
        </section>
      ) : (
        <div className="empty-state">
          <h2>Produk tidak ditemukan</h2>
          <p>Coba gunakan kata kunci lain atau pilih kategori berbeda.</p>
        </div>
      )}
    </main>
  );
}
