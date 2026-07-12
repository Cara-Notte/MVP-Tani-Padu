import { useEffect, useMemo, useState } from "react";
import { formatNumber, formatRupiah } from "../utils/formatters";

const paymentMethods = [
  {
    id: "transfer-bank",
    title: "Transfer Bank",
    description: "Virtual account otomatis",
    detail: "BCA Virtual Account 8808 1207 2026"
  },
  {
    id: "qris",
    title: "QRIS",
    description: "Pindai kode QR dari aplikasi pembayaran",
    detail: "QRIS Tani Padu"
  },
  {
    id: "dompet-digital",
    title: "Dompet Digital",
    description: "Bayar dengan saldo dompet digital",
    detail: "Dana, OVO, atau GoPay"
  }
];

const unitWeightKg = {
  kg: 1,
  karung: 25,
  ikat: 0.35,
  buah: 0.25
};

const courierOptions = [
  {
    id: "motor",
    title: "Kurir Motor",
    capacityKg: 20,
    fee: 10000,
    description: "Cocok untuk belanja ringan, sayur ikat, buah, dan pesanan harian."
  },
  {
    id: "motor-box",
    title: "Motor Box Pangan",
    capacityKg: 60,
    fee: 18000,
    description: "Untuk kombinasi beberapa komoditas dengan perlindungan box."
  },
  {
    id: "pickup",
    title: "Mobil Pickup",
    capacityKg: 300,
    fee: 45000,
    description: "Untuk pesanan pasar, warung, atau pembelian stok lebih besar."
  },
  {
    id: "truk-ringan",
    title: "Truk Ringan",
    capacityKg: 1000,
    fee: 95000,
    description: "Untuk pengiriman komoditas skala besar dan banyak karung."
  }
];

function estimateItemWeight(item) {
  const unit = String(item.product.unit || "kg").toLowerCase();
  const unitWeight = unitWeightKg[unit] || 1;
  return Number(item.quantity || 0) * unitWeight;
}

function formatWeight(weight) {
  const value = Number(weight) || 0;
  if (value < 1) return `${formatNumber(Math.round(value * 1000))} gram`;
  return `${formatNumber(Math.round(value * 10) / 10)} kg`;
}

function getRecommendedCourier(weight) {
  return (
    courierOptions.find((courier) => courier.capacityKg >= weight) ||
    courierOptions[courierOptions.length - 1]
  );
}

function PaymentMethodIcon({ type }) {
  if (type === "transfer-bank") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 10h16" />
        <path d="M6 10v8" />
        <path d="M10 10v8" />
        <path d="M14 10v8" />
        <path d="M18 10v8" />
        <path d="M3 18h18" />
        <path d="M12 4 4 8h16l-8-4Z" />
      </svg>
    );
  }

  if (type === "qris") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 4h6v6H4z" />
        <path d="M14 4h6v6h-6z" />
        <path d="M4 14h6v6H4z" />
        <path d="M14 14h2v2h-2z" />
        <path d="M18 14h2v6h-4" />
        <path d="M14 18h2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 7h13a3 3 0 0 1 3 3v8H5a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2h12" />
      <path d="M16 12h5v4h-5a2 2 0 0 1 0-4Z" />
      <path d="M6 7V4" />
    </svg>
  );
}

function CourierIcon({ type }) {
  if (type === "motor") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M5 16h3" />
        <path d="M15 16h4" />
        <path d="M8 16l3-7h4l2 7" />
        <path d="M7 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M18 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      </svg>
    );
  }

  if (type === "motor-box") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 15h4" />
        <path d="M15 15h5" />
        <path d="M8 15l3-6h4l2 6" />
        <path d="M12 5h6v5h-6z" />
        <path d="M7 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M18 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3 7h11v9H3z" />
      <path d="M14 10h4l3 3v3h-7z" />
      <path d="M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      <path d="M18 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    </svg>
  );
}

export function PaymentPage({ user, cart, products, onCheckout, navigate }) {
  const deliveryProfile = user?.deliveryProfile || {};
  const [receiver, setReceiver] = useState(deliveryProfile.receiverName || user?.name || "");
  const [phone, setPhone] = useState(deliveryProfile.phone || "");
  const [address, setAddress] = useState(deliveryProfile.address || "");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0].id);
  const [courierId, setCourierId] = useState(courierOptions[0].id);
  const [error, setError] = useState("");
  const [paymentResult, setPaymentResult] = useState(null);

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

  const subtotal = cartItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
  const estimatedWeightKg = cartItems.reduce((sum, item) => sum + estimateItemWeight(item), 0);
  const recommendedCourier = getRecommendedCourier(estimatedWeightKg);
  const selectedCourier =
    courierOptions.find((courier) => courier.id === courierId) || recommendedCourier;
  const serviceFee = cartItems.length ? 2500 : 0;
  const deliveryFee = cartItems.length ? selectedCourier.fee : 0;
  const total = subtotal + serviceFee + deliveryFee;
  const selectedMethod = paymentMethods.find((method) => method.id === paymentMethod);
  const maxCourierCapacity = courierOptions[courierOptions.length - 1].capacityKg;

  useEffect(() => {
    if (!cartItems.length) return;
    if (selectedCourier.capacityKg < estimatedWeightKg) {
      setCourierId(recommendedCourier.id);
    }
  }, [cartItems.length, estimatedWeightKg, recommendedCourier.id, selectedCourier.capacityKg]);

  const handlePay = (event) => {
    event.preventDefault();

    if (!receiver.trim() || !phone.trim() || !address.trim()) {
      setError("Lengkapi nama penerima, nomor kontak, dan alamat pengantaran.");
      return;
    }

    if (estimatedWeightKg > maxCourierCapacity) {
      setError("Muatan pesanan melebihi kapasitas kurir yang tersedia. Kurangi jumlah pesanan terlebih dahulu.");
      return;
    }

    if (selectedCourier.capacityKg < estimatedWeightKg) {
      setError("Pilih tipe kurir dengan kapasitas yang mencukupi untuk pesanan ini.");
      return;
    }

    const result = onCheckout({
      delivery: {
        courierId: selectedCourier.id,
        courierName: selectedCourier.title,
        courierCapacityKg: selectedCourier.capacityKg,
        deliveryFee,
        estimatedWeightKg,
        receiver,
        phone,
        address,
        note
      },
      payment: {
        method: selectedMethod.title,
        serviceFee,
        paidTotal: total
      }
    });
    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError("");
    setPaymentResult({
      ...result.transaction,
      method: selectedMethod.title,
      receiver,
      phone,
      address,
      note,
      courier: selectedCourier.title,
      courierCapacityKg: selectedCourier.capacityKg,
      deliveryFee,
      estimatedWeightKg,
      paidTotal: total
    });
  };

  if (!user) {
    return (
      <main className="page-shell narrow">
        <div className="empty-state">
          <h1>Pembayaran membutuhkan akun</h1>
          <p>Silakan masuk untuk melanjutkan pembayaran.</p>
          <button className="btn btn-primary" onClick={() => navigate("/masuk")}>
            Masuk Akun
          </button>
        </div>
      </main>
    );
  }

  if (paymentResult) {
    return (
      <main className="page-shell narrow">
        <section className="payment-success">
          <div className="payment-success-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <p className="eyebrow">Pembayaran berhasil</p>
          <h1>Pesanan Anda sudah diterima.</h1>
          <div className="success-receipt">
            <div>
              <span>Nomor transaksi</span>
              <strong>{paymentResult.id}</strong>
            </div>
            <div>
              <span>Metode pembayaran</span>
              <strong>{paymentResult.method}</strong>
            </div>
            <div>
              <span>Kurir pengiriman</span>
              <strong>{paymentResult.courier}</strong>
            </div>
            <div>
              <span>Estimasi muatan</span>
              <strong>{formatWeight(paymentResult.estimatedWeightKg)}</strong>
            </div>
            <div>
              <span>Total pembayaran</span>
              <strong>{formatRupiah(paymentResult.paidTotal)}</strong>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={() => navigate("/pasar-pangan")}>
              Belanja Lagi
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/")}>
              Kembali ke Beranda
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (!cartItems.length) {
    return (
      <main className="page-shell narrow">
        <div className="empty-state">
          <h1>Belum ada pesanan untuk dibayar</h1>
          <p>Keranjang Anda masih kosong. Pilih produk pangan terlebih dahulu.</p>
          <button className="btn btn-primary" onClick={() => navigate("/pasar-pangan")}>
            Lihat Pasar Pangan
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="payment-heading">
        <p className="eyebrow">Pembayaran</p>
        <h1>Selesaikan pembayaran pesanan Anda.</h1>
      </section>

      <form className="payment-layout" onSubmit={handlePay}>
        <section className="payment-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Data pengantaran</p>
              <h2>Alamat penerima</h2>
            </div>
          </div>

          <div className="form-stack">
            <label>
              Nama penerima
              <input value={receiver} onChange={(event) => setReceiver(event.target.value)} />
            </label>
            <label>
              Nomor kontak
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Contoh: 0812-3456-7890"
              />
            </label>
            <label>
              Alamat pengantaran
              <textarea
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Tulis alamat lengkap, patokan, dan wilayah/desa"
              />
            </label>
            <label>
              Catatan untuk produsen
              <input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Opsional, contoh: kirim pagi hari"
              />
            </label>
          </div>
        </section>

        <section className="payment-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Kurir pengiriman</p>
              <h2>Pilih tipe armada</h2>
            </div>
          </div>

          <div className="courier-insight">
            <div>
              <span>Estimasi muatan</span>
              <strong>{formatWeight(estimatedWeightKg)}</strong>
            </div>
            <div>
              <span>Rekomendasi</span>
              <strong>{recommendedCourier.title}</strong>
            </div>
          </div>

          <p className="courier-rule">
            Armada di bawah kapasitas muatan otomatis tidak tersedia. Anda tetap bisa memilih
            armada dengan kapasitas lebih besar.
          </p>

          <div className="courier-load-list">
            {cartItems.map((item) => (
              <div key={item.productId}>
                <span>
                  {item.product.name} - {formatNumber(item.quantity)} {item.product.unit}
                </span>
                <strong>{formatWeight(estimateItemWeight(item))}</strong>
              </div>
            ))}
          </div>

          <small className="courier-unit-note">
            Konversi muatan: 1 kg = 1 kg, 1 karung = 25 kg, 1 ikat = 0,35 kg, 1 buah = 0,25 kg.
          </small>

          <div className="payment-methods courier-methods">
            {courierOptions.map((courier) => {
              const isDisabled = courier.capacityKg < estimatedWeightKg;

              return (
                <label
                  className={`payment-method courier-method cursor-target ${
                    courierId === courier.id ? "is-selected" : ""
                  } ${isDisabled ? "is-disabled" : ""}`}
                  key={courier.id}
                >
                  <span className="payment-method-icon">
                    <CourierIcon type={courier.id} />
                  </span>
                  <span className="payment-method-copy">
                    <strong>{courier.title}</strong>
                    <small>{courier.description}</small>
                    <small>
                      Kapasitas hingga {formatWeight(courier.capacityKg)} - {formatRupiah(courier.fee)}
                    </small>
                  </span>
                  <input
                    type="radio"
                    name="courierType"
                    value={courier.id}
                    checked={courierId === courier.id}
                    disabled={isDisabled}
                    onChange={(event) => setCourierId(event.target.value)}
                    aria-label={courier.title}
                  />
                </label>
              );
            })}
          </div>
        </section>

        <section className="payment-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Metode pembayaran</p>
              <h2>Pilih cara bayar</h2>
            </div>
          </div>

          <div className="payment-methods">
            {paymentMethods.map((method) => (
              <label
                className={`payment-method cursor-target ${
                  paymentMethod === method.id ? "is-selected" : ""
                }`}
                key={method.id}
              >
                <span className="payment-method-icon">
                  <PaymentMethodIcon type={method.id} />
                </span>
                <span className="payment-method-copy">
                  <strong>{method.title}</strong>
                  <small>{method.description}</small>
                </span>
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  aria-label={method.title}
                />
              </label>
            ))}
          </div>

          <div className="payment-code-card">
            <span>{selectedMethod.detail}</span>
            <strong>{paymentMethod === "qris" ? "TP-QRIS-RAJEG" : "880812072026"}</strong>
          </div>
        </section>

        <aside className="payment-summary">
          <p className="eyebrow">Ringkasan pesanan</p>
          <div className="payment-items">
            {cartItems.map((item) => (
              <div className="payment-item" key={item.productId}>
                <span>
                  {item.product.name} x {formatNumber(item.quantity)} {item.product.unit}
                </span>
                <strong>{formatRupiah(item.quantity * item.product.price)}</strong>
              </div>
            ))}
          </div>

          <div className="payment-total-list">
            <div>
              <span>Subtotal</span>
              <strong>{formatRupiah(subtotal)}</strong>
            </div>
            <div>
              <span>Biaya layanan</span>
              <strong>{formatRupiah(serviceFee)}</strong>
            </div>
            <div>
              <span>Kurir {selectedCourier.title}</span>
              <strong>{formatRupiah(deliveryFee)}</strong>
            </div>
            <div className="payment-grand-total">
              <span>Total bayar</span>
              <strong>{formatRupiah(total)}</strong>
            </div>
          </div>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="btn btn-primary btn-full" type="submit">
            Bayar Sekarang
          </button>
          <button className="btn btn-secondary btn-full" type="button" onClick={() => navigate("/keranjang")}>
            Kembali ke Keranjang
          </button>
        </aside>
      </form>
    </main>
  );
}
