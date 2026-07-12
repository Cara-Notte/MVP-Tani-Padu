export function AccessGate({ user, allowedRole, children, navigate }) {
  if (!user) {
    return (
      <section className="page-shell narrow">
        <div className="empty-state">
          <p className="eyebrow">Akses akun</p>
          <h1>Silakan masuk terlebih dahulu</h1>
          <p>Masuk akun diperlukan untuk membuka halaman ini.</p>
          <button className="btn btn-primary" onClick={() => navigate("/masuk")}>
            Masuk Akun
          </button>
        </div>
      </section>
    );
  }

  if (user.role !== allowedRole) {
    return (
      <section className="page-shell narrow">
        <div className="empty-state">
          <p className="eyebrow">Akses terbatas</p>
          <h1>Fitur ini hanya tersedia untuk akun yang sudah diverifikasi.</h1>
          <p>Buka Profil untuk mengajukan upgrade atau verifikasi akun.</p>
          <button className="btn btn-primary" onClick={() => navigate("/profil")}>
            Buka Profil
          </button>
        </div>
      </section>
    );
  }

  return children;
}
