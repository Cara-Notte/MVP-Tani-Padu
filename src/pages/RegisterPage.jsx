import { useState } from "react";

export function RegisterPage({ onRegister, navigate }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = onRegister(form);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError("");
    navigate("/pasar-pangan");
  };

  return (
    <main className="page-shell auth-layout auth-layout-single">
      <section className="auth-panel">
        <p className="eyebrow">Daftar akun</p>
        <h1>Buat akun Konsumen</h1>
        <p className="muted">
          Registrasi hanya membuat akun Konsumen. Upgrade Produsen atau Pemerintah tersedia dari
          halaman Profil setelah masuk.
        </p>

        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            Nama lengkap
            <input
              value={form.name}
              onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))}
              placeholder="Nama Anda"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))}
              placeholder="nama@email.com"
            />
          </label>
          <label>
            Kata sandi
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((value) => ({ ...value, password: event.target.value }))}
              placeholder="Minimal 6 karakter"
            />
          </label>
          <label>
            Ulangi kata sandi
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(event) =>
                setForm((value) => ({ ...value, confirmPassword: event.target.value }))
              }
              placeholder="Ketik ulang kata sandi"
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="btn btn-primary btn-full" type="submit">
            Daftar sebagai Konsumen
          </button>
        </form>

        <p className="auth-switch">
          Sudah punya akun?{" "}
          <button className="link-button" onClick={() => navigate("/masuk")}>
            Masuk Akun
          </button>
        </p>
      </section>

    </main>
  );
}
