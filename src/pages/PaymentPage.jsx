import { useMemo, useState } from "react";
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

export function PaymentPage({ user, cart, products, onCheckout, navigate }) {
  const deliveryProfile = user?.deliveryProfile || {};
  const [receiver, setReceiver] = useState(deliveryProfile.receiverName || user?.name || "");
  const [phone, setPhone] = useState(deliveryProfile.phone || "");
  const [address, setAddress] = useState(deliveryProfile.address || "");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0].id);
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
  const serviceFee = cartItems.length ? 2500 : 0;
  const total = subtotal + serviceFee;
  const selectedMethod = paymentMethods.find((method) => method.id === paymentMethod);

  const handlePay = (event) => {
    event.preventDefault();

    if (!receiver.trim() || !phone.trim() || !address.trim()) {
      setError("Lengkapi nama penerima, nomor kontak, dan alamat pengantaran.");
      return;
    }

    const result = onCheckout();
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
