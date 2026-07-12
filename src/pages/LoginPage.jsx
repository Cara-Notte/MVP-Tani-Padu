import { useState } from "react";

export function LoginPage({ onLogin, navigate }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = onLogin(form);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError("");
    navigate("/pasar-pangan");
  };

  const fillDemo = (email) => {
    setForm({ email, password: "demo123" });
    setError("");
  };

  return (
    <main className="page-shell auth-layout">
      <section className="auth-panel">
        <p className="eyebrow">Masuk akun</p>
        <h1>Masuk ke Tani Padu</h1>
        <p className="muted">Gunakan akun yang sudah terdaftar untuk berbelanja atau membuka dashboard.</p>

        <form className="form-stack" onSubmit={handleSubmit}>
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

          {error ? <p className="form-error">{error}</p> : null}

          <button className="btn btn-primary btn-full" type="submit">
            Masuk Akun
          </button>
        </form>

        <p className="auth-switch">
          Belum punya akun?{" "}
          <button className="link-button" onClick={() => navigate("/daftar")}>
            Daftar sebagai Konsumen
          </button>
        </p>
      </section>

      <aside className="demo-panel">
        <p className="eyebrow">Akun demo</p>
        <h2>Coba setiap peran</h2>
        <div className="demo-list">
          <button onClick={() => fillDemo("konsumen@tanipadu.id")}>
            <strong>Konsumen</strong>
            <span>konsumen@tanipadu.id</span>
          </button>
          <button onClick={() => fillDemo("produsen@tanipadu.id")}>
            <strong>Produsen</strong>
            <span>produsen@tanipadu.id</span>
          </button>
          <button onClick={() => fillDemo("pemerintah@tanipadu.id")}>
            <strong>Pemerintah</strong>
            <span>pemerintah@tanipadu.id</span>
          </button>
        </div>
        <p className="muted">Kata sandi semua akun demo adalah demo123.</p>
      </aside>
    </main>
  );
}
