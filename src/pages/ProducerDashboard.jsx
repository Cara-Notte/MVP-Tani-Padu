import { useMemo, useState } from "react";
import { StatusBadge } from "../components/StatusBadge";
import { StatCard } from "../components/StatCard";
import { formatNumber, formatRupiah } from "../utils/formatters";

const emptyProductForm = {
  name: "",
  category: "",
  location: "",
  price: "",
  unit: "kg",
  stock: "",
  description: "",
  imageUrl: "",
  imageName: ""
};

const maxProductImageSize = 2 * 1024 * 1024;

function statusClass(status) {
  return String(status || "stabil").toLowerCase();
}

function statusVariant(status) {
  if (status === "Inflasi") return "warning";
  if (status === "Deflasi") return "success";
  return "default";
}

function formatPercent(value) {
  const rounded = Math.abs(value).toFixed(1).replace(".", ",");
  if (value > 0) return `+${rounded}%`;
  if (value < 0) return `-${rounded}%`;
  return "0%";
}

function roundPrice(value) {
  return Math.max(1000, Math.round((Number(value) || 0) / 100) * 100);
}

function TrendIcon({ direction }) {
  const isUp = direction === "up";
  const isDown = direction === "down";

  return (
    <span className={`trend-pill ${isUp ? "trend-up" : isDown ? "trend-down" : "trend-neutral"}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        {isUp ? <path d="m5 15 5-5 4 4 5-7" /> : isDown ? <path d="m5 9 5 5 4-4 5 7" /> : <path d="M5 12h14" />}
        {isUp ? <path d="M14 7h5v5" /> : isDown ? <path d="M14 17h5v-5" /> : null}
      </svg>
      {isUp ? "Naik" : isDown ? "Turun" : "Stabil"}
    </span>
  );
}

function ForecastIcon({ status }) {
  const iconStatus = status === "Inflasi" ? "naik" : status === "Deflasi" ? "turun" : "stabil";

  return (
    <span className={`trend-icon trend-icon-${iconStatus}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        {status === "Inflasi" ? (
          <>
            <path d="m5 15 5-5 4 4 5-7" />
            <path d="M14 7h5v5" />
          </>
        ) : status === "Deflasi" ? (
          <>
            <path d="m5 9 5 5 4-4 5 7" />
            <path d="M14 17h5v-5" />
          </>
        ) : (
          <path d="M5 12h14" />
        )}
      </svg>
    </span>
  );
}

function commoditySensitivity(product) {
  const text = `${product.name} ${product.category}`.toLowerCase();
  if (text.includes("cabai")) return 1.35;
  if (text.includes("bawang")) return 1.05;
  if (text.includes("beras")) return 0.62;
  if (text.includes("tomat")) return 0.72;
  if (text.includes("bayam") || text.includes("sayur")) return 0.54;
  if (text.includes("jagung")) return 0.38;
  return 0.58;
}

function productSalesQuantity(product, transactions) {
  return transactions.reduce(
    (sum, transaction) =>
      sum +
      transaction.items
        .filter((item) => item.productId === product.id)
        .reduce((itemSum, item) => itemSum + Number(item.quantity || 0), 0),
    0
  );
}

function buildProductForecast(product, transactions) {
  const price = Number(product.price) || 0;
  const stock = Number(product.stock) || 0;
  const soldQuantity = productSalesQuantity(product, transactions);
  const sensitivity = commoditySensitivity(product);
  const stockPressure = stock <= 60 ? 1.18 : stock <= 120 ? 0.66 : stock >= 300 ? -0.36 : 0.16;
  const demandPressure = soldQuantity ? Math.min(1.1, soldQuantity / Math.max(6, stock * 0.06)) : 0.22;
  const pressureScore = sensitivity + stockPressure + demandPressure - 1.25;
  const dailyRate = Math.max(-0.0025, Math.min(0.0045, pressureScore * 0.0017));
  const sevenDayPrice = roundPrice(price * (1 + dailyRate * 7));
  const thirtyDayPrice = roundPrice(price * (1 + dailyRate * 30));
  const thirtyDayChangePercent = ((thirtyDayPrice - price) / Math.max(1, price)) * 100;
  const status =
    thirtyDayChangePercent > 2.4 ? "Inflasi" : thirtyDayChangePercent < -1.4 ? "Deflasi" : "Stabil";
  const confidence = Math.min(94, Math.round(66 + Math.abs(pressureScore) * 12));
  const series = [0, 4, 7, 14, 21, 30].map((day, index) => {
    const wave = Math.sin(index * 0.9) * price * 0.006;
    return roundPrice(price * (1 + dailyRate * day) + wave);
  });
  const recommendation =
    status === "Inflasi"
      ? "Pertimbangkan penyesuaian bertahap sebelum stok menipis."
      : status === "Deflasi"
        ? "Harga bisa dijaga kompetitif untuk mempercepat perputaran stok."
        : "Harga saat ini masih berada di rentang aman.";

  return {
    confidence,
    pressureScore,
    recommendation,
    series,
    sevenDayChangePercent: ((sevenDayPrice - price) / Math.max(1, price)) * 100,
    sevenDayPrice,
    status,
    thirtyDayChangePercent,
    thirtyDayPrice
  };
}

function ForecastChart({ series, status, productName }) {
  const width = 300;
  const height = 104;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = Math.max(1, max - min);
  const points = series
    .map((value, index) => {
      const x = 12 + (index / Math.max(1, series.length - 1)) * 276;
      const y = 88 - ((value - min) / range) * 68;
      return `${x},${y}`;
    })
    .join(" ");
  const areaPoints = `12,88 ${points} 288,88`;

  return (
    <div className={`producer-forecast-chart forecast-${statusClass(status)}`}>
      <svg viewBox={`0 0 ${width} ${height}`} aria-label={`Grafik prediksi harga ${productName}`}>
        <path className="forecast-grid-line" d="M12 88H288" />
        <path className="forecast-grid-line" d="M12 54H288" />
        <path className="forecast-grid-line" d="M12 20H288" />
        <polygon points={areaPoints} />
        <polyline points={points} />
        {series.map((value, index) => {
          const x = 12 + (index / Math.max(1, series.length - 1)) * 276;
          const y = 88 - ((value - min) / range) * 68;
          return <circle key={`${value}-${index}`} cx={x} cy={y} r={index === series.length - 1 ? 4.5 : 3} />;
        })}
      </svg>
      <div className="forecast-chart-labels">
        <span>Hari ini</span>
        <span>7 hari</span>
        <span>30 hari</span>
      </div>
    </div>
  );
}

function ProductForecastSection({ products, transactions, onApplyPrice }) {
  if (!products.length) {
    return null;
  }

  return (
    <section className="producer-forecast-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Prediksi harga produsen</p>
          <h2>Proyeksi 7 hari dan 30 hari</h2>
        </div>
      </div>
      <div className="producer-forecast-grid">
        {products.map((product) => {
          const forecast = buildProductForecast(product, transactions);

          return (
            <article className={`producer-forecast-card forecast-${statusClass(forecast.status)}`} key={product.id}>
              <div className="forecast-card-head">
                <div>
                  <p className="eyebrow">{product.category}</p>
                  <h3>{product.name}</h3>
                  <small>Harga saat ini {formatRupiah(product.price)} / {product.unit}</small>
                </div>
                <ForecastIcon status={forecast.status} />
              </div>

              <div className="forecast-status-row">
                <StatusBadge variant={statusVariant(forecast.status)}>{forecast.status}</StatusBadge>
                <span>Keyakinan {forecast.confidence}%</span>
              </div>

              <ForecastChart series={forecast.series} status={forecast.status} productName={product.name} />

              <div className="forecast-metrics">
                <div>
                  <span>7 hari</span>
                  <strong>{formatRupiah(forecast.sevenDayPrice)}</strong>
                  <small>{formatPercent(forecast.sevenDayChangePercent)}</small>
                </div>
                <div>
                  <span>30 hari</span>
                  <strong>{formatRupiah(forecast.thirtyDayPrice)}</strong>
                  <small>{formatPercent(forecast.thirtyDayChangePercent)}</small>
                </div>
              </div>

              <p className="forecast-note">{forecast.recommendation}</p>

              <div className="forecast-actions">
                <button
                  type="button"
                  className="btn btn-small btn-secondary"
                  onClick={() => onApplyPrice(product, forecast.sevenDayPrice, "7 hari")}
                >
                  Pakai Harga 7 Hari
                </button>
                <button
                  type="button"
                  className="btn btn-small btn-primary"
                  onClick={() => onApplyPrice(product, forecast.thirtyDayPrice, "30 hari")}
                >
                  Pakai Harga 30 Hari
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function IncomeChart({ total }) {
  const base = Math.max(Number(total) || 0, 100000);
  const series = [0.36, 0.5, 0.44, 0.68, 0.74, 1].map((ratio) => Math.round(base * ratio));
  const max = Math.max(...series);
  const points = series
    .map((value, index) => {
      const x = 16 + index * 52;
      const y = 96 - (value / max) * 72;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <article className="producer-chart-panel">
      <div>
        <p className="eyebrow">Estimasi pendapatan</p>
        <h2>{formatRupiah(total)}</h2>
        <p>Tren 6 periode terakhir</p>
      </div>
      <svg className="income-chart" viewBox="0 0 292 112" aria-label="Grafik estimasi pendapatan">
        <path d="M16 98H276" />
        <polyline points={points} />
        {series.map((value, index) => (
          <circle key={value + index} cx={16 + index * 52} cy={96 - (value / max) * 72} r="4" />
        ))}
      </svg>
    </article>
  );
}

function ProductModal({
  form,
  editingId,
  error,
  onClose,
  onSubmit,
  onChange,
  onImageUpload,
  onImageRemove,
  hint
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="upgrade-dialog product-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-dialog-title"
      >
        <button type="button" className="modal-close-button" onClick={onClose} aria-label="Tutup form produk">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M6 6l12 12" />
            <path d="M18 6 6 18" />
          </svg>
        </button>

        <p className="eyebrow">Produk hasil panen</p>
        <h2 id="product-dialog-title">{editingId ? "Edit Produk" : "Tambah Produk Baru"}</h2>
        {hint ? <p className="form-hint">{hint}</p> : null}

        <form className="form-stack product-form modal-product-form" onSubmit={onSubmit}>
          <div className="product-image-field">
            <div className={`product-image-preview ${form.imageUrl ? "has-image" : ""}`}>
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="Pratinjau gambar produk" />
              ) : (
                <div>
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M4 5h16v14H4z" />
                    <path d="m4 15 4-4 4 4 3-3 5 5" />
                    <path d="M15 8h.01" />
                  </svg>
                  <strong>Belum ada gambar</strong>
                  <span>Unggah foto produk agar tampil lebih jelas di pasar pangan.</span>
                </div>
              )}
            </div>
            <div className="product-image-actions">
              <label className="btn btn-secondary product-upload-button">
                <input
                  className="product-image-input"
                  type="file"
                  accept="image/*"
                  onChange={onImageUpload}
                />
                {form.imageUrl ? "Ganti Gambar" : "Unggah Gambar"}
              </label>
              {form.imageUrl ? (
                <button type="button" className="btn btn-danger" onClick={onImageRemove}>
                  Hapus Gambar
                </button>
              ) : null}
            </div>
            <small>
              {form.imageName ? `Gambar terpilih: ${form.imageName}` : "Format gambar umum, maksimal 2 MB."}
            </small>
          </div>

          <label>
            Nama produk
            <input
              value={form.name}
              onChange={(event) => onChange("name", event.target.value)}
              placeholder="Contoh: Kacang Panjang"
            />
          </label>
          <label>
            Kategori
            <input
              value={form.category}
              onChange={(event) => onChange("category", event.target.value)}
              placeholder="Contoh: Sayuran"
            />
          </label>
          <label>
            Desa / lokasi
            <input
              value={form.location}
              onChange={(event) => onChange("location", event.target.value)}
              placeholder="Contoh: Desa Rajeg"
            />
          </label>
          <div className="form-row">
            <label>
              Harga
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(event) => onChange("price", event.target.value)}
                placeholder="12000"
              />
            </label>
            <label>
              Satuan
              <select value={form.unit} onChange={(event) => onChange("unit", event.target.value)}>
                <option value="kg">kg</option>
                <option value="ikat">ikat</option>
                <option value="karung">karung</option>
                <option value="buah">buah</option>
              </select>
            </label>
          </div>
          <label>
            Stok
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(event) => onChange("stock", event.target.value)}
              placeholder="100"
            />
          </label>
          <label>
            Deskripsi singkat
            <textarea
              value={form.description}
              onChange={(event) => onChange("description", event.target.value)}
              placeholder="Ceritakan kualitas atau jadwal panen produk"
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="btn btn-primary" type="submit">
            {editingId ? "Simpan Perubahan" : "Tambah Produk"}
          </button>
        </form>
      </section>
    </div>
  );
}

export function ProducerDashboard({
  user,
  products,
  orders,
  transactions,
  onSaveProduct,
  onDeleteProduct
}) {
  const [form, setForm] = useState(emptyProductForm);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [formHint, setFormHint] = useState("");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const producerProducts = useMemo(
    () => products.filter((product) => product.ownerEmail === user.email),
    [products, user.email]
  );

  const producerTransactions = useMemo(
    () =>
      transactions.filter((transaction) =>
        transaction.items.some((item) => item.producerEmail === user.email)
      ),
    [transactions, user.email]
  );

  const totalStock = producerProducts.reduce((sum, product) => sum + Number(product.stock || 0), 0);
  const activeProducts = producerProducts.filter((product) => Number(product.stock) > 0).length;
  const incomingOrders = orders.filter((order) => order.producerEmail === user.email);
  const currentOrderCount = incomingOrders.length + producerTransactions.length;
  const previousOrderCount = Math.max(0, currentOrderCount - 1);
  const orderDelta = currentOrderCount - previousOrderCount;
  const orderTrendDirection = orderDelta > 0 ? "up" : orderDelta < 0 ? "down" : "neutral";
  const orderTrendLabel = orderDelta > 0 ? "Meningkat" : orderDelta < 0 ? "Menurun" : "Stabil";
  const orderTrendVariant = orderDelta > 0 ? "success" : orderDelta < 0 ? "danger" : "default";
  const lowStockProducts = producerProducts.filter((product) => Number(product.stock) <= 70).length;
  const estimatedIncome = producerTransactions.reduce(
    (sum, transaction) =>
      sum +
      transaction.items
        .filter((item) => item.producerEmail === user.email)
        .reduce((itemSum, item) => itemSum + item.price * item.quantity, 0),
    incomingOrders.reduce((orderSum, order) => orderSum + Number(order.total || 0), 0)
  );

  const resetForm = () => {
    setForm(emptyProductForm);
    setEditingId("");
    setFormError("");
    setFormHint("");
  };

  const openAddProduct = () => {
    resetForm();
    setMessage("");
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    resetForm();
  };

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleImageUpload = (event) => {
    const input = event.target;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("File yang diunggah harus berupa gambar.");
      input.value = "";
      return;
    }

    if (file.size > maxProductImageSize) {
      setFormError("Ukuran gambar maksimal 2 MB agar penyimpanan lokal tetap ringan.");
      input.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({
        ...current,
        imageUrl: String(reader.result || ""),
        imageName: file.name
      }));
      setFormError("");
      input.value = "";
    };
    reader.onerror = () => {
      setFormError("Gambar gagal dibaca. Coba unggah file lain.");
      input.value = "";
    };
    reader.readAsDataURL(file);
  };

  const removeProductImage = () => {
    setForm((current) => ({
      ...current,
      imageUrl: "",
      imageName: ""
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const requiredFields = [form.name, form.category, form.location, form.price, form.unit, form.stock];

    if (requiredFields.some((field) => !String(field).trim())) {
      setFormError("Lengkapi nama, kategori, lokasi, harga, satuan, dan stok produk.");
      return;
    }

    onSaveProduct(
      {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        producer: user.producerProfile?.businessName || user.name,
        ownerEmail: user.email,
        imageTone: form.category.toLowerCase().replace(/\s+/g, "-")
      },
      editingId
    );

    setMessage(editingId ? "Produk berhasil diperbarui." : "Produk baru berhasil ditambahkan.");
    closeProductModal();
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setMessage("");
    setFormError("");
    setFormHint("");
    setForm({
      name: product.name,
      category: product.category,
      location: product.location,
      price: product.price,
      unit: product.unit,
      stock: product.stock,
      description: product.description || "",
      imageUrl: product.imageUrl || "",
      imageName: product.imageName || ""
    });
    setIsProductModalOpen(true);
  };

  const startForecastPriceEdit = (product, price, horizon) => {
    setEditingId(product.id);
    setMessage("");
    setFormError("");
    setFormHint(`Harga otomatis diisi dari prediksi ${horizon}. Anda masih bisa menyesuaikannya sebelum disimpan.`);
    setForm({
      name: product.name,
      category: product.category,
      location: product.location,
      price,
      unit: product.unit,
      stock: product.stock,
      description: product.description || "",
      imageUrl: product.imageUrl || "",
      imageName: product.imageName || ""
    });
    setIsProductModalOpen(true);
  };

  return (
    <main className="page-shell">
      <section className="section-heading with-actions">
        <div>
          <p className="eyebrow">Dashboard Produsen</p>
          <h1>Kelola hasil panen</h1>
          <p>Atur produk, stok, harga, pesanan, dan pendapatan dari satu tempat.</p>
        </div>
      </section>

      <section className="producer-overview">
        <div className="producer-stat-grid">
          <StatCard label="Total produk aktif" value={formatNumber(activeProducts)} helper="Stok di atas nol" />
          <StatCard
            label="Total stok tersedia"
            value={`${formatNumber(totalStock)} unit`}
            helper={`${formatNumber(lowStockProducts)} komoditas perlu perhatian`}
          />
          <StatCard
            label="Pesanan masuk"
            value={formatNumber(currentOrderCount)}
            helper={`Periode sebelumnya ${formatNumber(previousOrderCount)}`}
            badge={{
              label: orderTrendLabel,
              variant: orderTrendVariant
            }}
          />
        </div>
        <div className="producer-trend-card">
          <TrendIcon direction={orderTrendDirection} />
          <strong>{orderDelta >= 0 ? `+${formatNumber(orderDelta)}` : formatNumber(orderDelta)} pesanan</strong>
          <span>Dibanding periode sebelumnya</span>
        </div>
        <IncomeChart total={estimatedIncome} />
      </section>

      {message ? <div className="notice success">{message}</div> : null}

      <ProductForecastSection
        products={producerProducts}
        transactions={producerTransactions}
        onApplyPrice={startForecastPriceEdit}
      />

      <section className="producer-products-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Produk milik produsen</p>
            <h2>Daftar produk</h2>
          </div>
          <button type="button" className="btn btn-primary" onClick={openAddProduct}>
            Tambah Produk
          </button>
        </div>

        {producerProducts.length ? (
          <div className="producer-product-list">
            {producerProducts.map((product) => (
              <article className="producer-product-row" key={product.id}>
                <div
                  className={`producer-product-thumb tone-${product.imageTone || "default"}`}
                  aria-hidden="true"
                >
                  {product.imageUrl ? <img src={product.imageUrl} alt="" /> : <span>{product.category}</span>}
                </div>
                <div className="producer-product-copy">
                  <p className="eyebrow">{product.location}</p>
                  <h3>{product.name}</h3>
                  <div className="producer-product-meta">
                    <span>{product.category}</span>
                    <span>{formatRupiah(product.price)}</span>
                    <span>
                      Stok {formatNumber(product.stock)} {product.unit}
                    </span>
                  </div>
                </div>
                <div className="producer-product-actions">
                  <button type="button" className="btn btn-small btn-secondary" onClick={() => startEdit(product)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-icon btn-danger"
                    onClick={() => {
                      if (window.confirm("Hapus produk ini dari pasar pangan?")) {
                        onDeleteProduct(product.id);
                        setMessage("Produk berhasil dihapus.");
                      }
                    }}
                    aria-label={`Hapus ${product.name}`}
                    title="Hapus produk"
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
        ) : (
          <div className="empty-state compact-empty">
            <h3>Belum ada produk milik akun ini</h3>
            <p>Tambahkan produk pertama agar tampil di pasar pangan konsumen.</p>
            <button type="button" className="btn btn-primary" onClick={openAddProduct}>
              Tambah Produk
            </button>
          </div>
        )}
      </section>

      {isProductModalOpen ? (
        <ProductModal
          form={form}
          editingId={editingId}
          error={formError}
          onClose={closeProductModal}
          onSubmit={handleSubmit}
          onChange={updateForm}
          onImageUpload={handleImageUpload}
          onImageRemove={removeProductImage}
          hint={formHint}
        />
      ) : null}
    </main>
  );
}
