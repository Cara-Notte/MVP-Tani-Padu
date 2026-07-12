import { useState } from "react";
import { StatusBadge } from "../components/StatusBadge";
import { formatDate } from "../utils/formatters";

const emptyProducerForm = {
  businessName: "",
  region: "",
  commodity: "",
  contact: "",
  documentName: ""
};

const emptyGovernmentForm = {
  institution: "",
  position: "",
  assignmentRegion: "",
  officialEmail: "",
  documentName: ""
};

function createProfileForm(user) {
  const deliveryProfile = user?.deliveryProfile || {};

  return {
    name: user?.name || "",
    receiverName: deliveryProfile.receiverName || user?.name || "",
    phone: deliveryProfile.phone || "",
    address: deliveryProfile.address || ""
  };
}

export function ProfilePage({
  user,
  onUpdateProfile,
  onUpgradeToProducer,
  onUpgradeToGovernment,
  onLogout,
  navigate
}) {
  const [mode, setMode] = useState("");
  const [profileForm, setProfileForm] = useState(() => createProfileForm(user));
  const [producerForm, setProducerForm] = useState(emptyProducerForm);
  const [governmentForm, setGovernmentForm] = useState(emptyGovernmentForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!user) {
    return (
      <main className="page-shell narrow">
        <div className="empty-state">
          <h1>Profil membutuhkan akun</h1>
          <p>Silakan masuk untuk melihat profil dan mengajukan upgrade akun.</p>
          <button className="btn btn-primary" onClick={() => navigate("/masuk")}>
            Masuk Akun
          </button>
        </div>
      </main>
    );
  }

  const validateFields = (values) => Object.values(values).every((value) => String(value).trim());
  const deliveryProfile = user.deliveryProfile || {};
  const isDeliveryComplete = Boolean(
    deliveryProfile.receiverName && deliveryProfile.phone && deliveryProfile.address
  );

  const submitProfile = (event) => {
    event.preventDefault();
    const requiredFields = [
      profileForm.name,
      profileForm.receiverName,
      profileForm.phone,
      profileForm.address
    ];

    if (requiredFields.some((field) => !String(field).trim())) {
      setError("Lengkapi nama, nama penerima, nomor kontak, dan alamat pengantaran.");
      setSuccess("");
      return;
    }

    onUpdateProfile(profileForm);
    setError("");
    setSuccess("Data profil dan pengantaran berhasil disimpan.");
  };

  const submitProducer = (event) => {
    event.preventDefault();
    if (!validateFields(producerForm)) {
      setError("Lengkapi semua data produsen dan unggah dokumen dummy.");
      return;
    }

    onUpgradeToProducer(producerForm);
    setError("");
    setSuccess("Status akun berhasil diubah menjadi Produsen secara simulasi.");
    setMode("");
  };

  const submitGovernment = (event) => {
    event.preventDefault();
    if (!validateFields(governmentForm)) {
      setError("Lengkapi semua data pemerintah dan unggah surat tugas dummy.");
      return;
    }

    onUpgradeToGovernment(governmentForm);
    setError("");
    setSuccess("Status akun berhasil diverifikasi sebagai Pemerintah secara simulasi.");
    setMode("");
  };

  const closeUpgradeModal = () => {
    setMode("");
    setError("");
  };

  return (
    <main className="page-shell profile-layout">
      <section className="profile-card">
        <div className="profile-avatar" aria-hidden="true">
          <svg viewBox="0 0 48 48" focusable="false">
            <circle cx="24" cy="17" r="8" />
            <path d="M9 40c3-9 10-14 15-14s12 5 15 14" />
            <path d="M13 38c6 4 16 4 22 0" />
          </svg>
        </div>
        <p className="eyebrow">Profil Pengguna</p>
        <h1>{user.name}</h1>
        <p>{user.email}</p>
        <div className="profile-meta">
          <span>Status akun</span>
          <StatusBadge variant={user.role.toLowerCase()}>{user.role}</StatusBadge>
        </div>
        <div className="profile-side-list">
          <div>
            <span>Data checkout</span>
            <strong>{isDeliveryComplete ? "Lengkap" : "Perlu dilengkapi"}</strong>
          </div>
          <div>
            <span>Nomor kontak</span>
            <strong>{deliveryProfile.phone || "-"}</strong>
          </div>
          <div>
            <span>Alamat</span>
            <strong>{deliveryProfile.address || "-"}</strong>
          </div>
        </div>
        {user.role === "Konsumen" ? (
          <div className="upgrade-mini profile-upgrade-mini">
            <span>Upgrade Akunmu Ke</span>
            <div className="upgrade-mini-actions">
              <button
                className={`btn btn-small ${mode === "produsen" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => {
                  setMode("produsen");
                  setError("");
                  setSuccess("");
                }}
              >
                Produsen
              </button>
              <button
                className={`btn btn-small ${mode === "pemerintah" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => {
                  setMode("pemerintah");
                  setError("");
                  setSuccess("");
                }}
              >
                Pemerintah
              </button>
            </div>
          </div>
        ) : null}
        {user.role === "Produsen" ? (
          <div className="profile-role-panel">
            <p className="eyebrow">Status aktif</p>
            <h2>Akun Produsen Aktif</h2>
            <p>
              {user.producerProfile?.businessName || user.name} terdaftar untuk wilayah{" "}
              {user.producerProfile?.region || "-"}.
            </p>
            <small>Terverifikasi simulasi pada {formatDate(user.producerProfile?.verifiedAt)}.</small>
            <button className="btn btn-primary btn-full" onClick={() => navigate("/produsen")}>
              Buka Dashboard Produsen
            </button>
          </div>
        ) : null}
        {user.role === "Pemerintah" ? (
          <div className="profile-role-panel">
            <p className="eyebrow">Status aktif</p>
            <h2>Akun Pemerintah Terverifikasi</h2>
            <p>
              {user.governmentProfile?.institution || "Instansi"} dapat memantau harga dan stok
              pangan simulasi untuk {user.governmentProfile?.assignmentRegion || "wilayah tugas"}.
            </p>
            <small>Terverifikasi simulasi pada {formatDate(user.governmentProfile?.verifiedAt)}.</small>
            <button className="btn btn-primary btn-full" onClick={() => navigate("/pemerintah")}>
              Buka Monitoring Pangan
            </button>
          </div>
        ) : null}
      </section>

      <section className="profile-main">
        {success ? <div className="notice success">{success}</div> : null}
        {error ? <div className="notice danger">{error}</div> : null}

        <section className="profile-section">
          <div className="section-heading compact">
            <p className="eyebrow">Data profil</p>
            <h2>Lengkapi data untuk checkout lebih cepat</h2>
          </div>
          <form className="form-stack profile-data-form" onSubmit={submitProfile}>
            <div className="profile-form-grid">
              <label>
                Nama lengkap
                <input
                  value={profileForm.name}
                  onChange={(event) =>
                    setProfileForm((value) => ({ ...value, name: event.target.value }))
                  }
                  placeholder="Nama lengkap Anda"
                />
              </label>
              <label>
                Email
                <input value={user.email} disabled />
              </label>
              <label>
                Nama penerima
                <input
                  value={profileForm.receiverName}
                  onChange={(event) =>
                    setProfileForm((value) => ({ ...value, receiverName: event.target.value }))
                  }
                  placeholder="Nama penerima pesanan"
                />
              </label>
              <label>
                Nomor kontak
                <input
                  value={profileForm.phone}
                  onChange={(event) =>
                    setProfileForm((value) => ({ ...value, phone: event.target.value }))
                  }
                  placeholder="Contoh: 0812-3456-7890"
                />
              </label>
            </div>
            <label>
              Alamat pengantaran
              <textarea
                value={profileForm.address}
                onChange={(event) =>
                  setProfileForm((value) => ({ ...value, address: event.target.value }))
                }
                placeholder="Tulis alamat lengkap, patokan, dan wilayah/desa"
              />
            </label>
            <button className="btn btn-primary" type="submit">
              Simpan Data Profil
            </button>
          </form>
        </section>

        <div className="profile-logout-row">
          <button
            className="btn btn-danger profile-logout-button"
            onClick={() => setShowLogoutConfirm(true)}
          >
            Keluar Akun
          </button>
        </div>

      </section>

      {showLogoutConfirm ? (
        <div className="modal-backdrop" role="presentation">
          <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="logout-title">
            <p className="eyebrow">Konfirmasi</p>
            <h2 id="logout-title">Keluar dari akun?</h2>
            <p>Anda perlu masuk kembali untuk mengakses profil, keranjang, dan checkout.</p>
            <div className="confirm-actions">
              <button className="btn btn-secondary" onClick={() => setShowLogoutConfirm(false)}>
                Batal
              </button>
              <button className="btn btn-danger profile-logout-button" onClick={onLogout}>
                Keluar Akun
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {user.role === "Konsumen" && mode ? (
        <div className="modal-backdrop" role="presentation">
          <section
            className="upgrade-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upgrade-title"
          >
            <button className="modal-close-button" onClick={closeUpgradeModal} aria-label="Tutup form upgrade">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M6 6l12 12" />
                <path d="M18 6 6 18" />
              </svg>
            </button>
            <p className="eyebrow">Upgrade akun</p>
            <h2 id="upgrade-title">
              {mode === "produsen" ? "Jadikan Akun sebagai Produsen" : "Verifikasi Akun sebagai Pemerintah"}
            </h2>

            {mode === "produsen" ? (
              <form className="form-stack upgrade-form modal-upgrade-form" onSubmit={submitProducer}>
                <label>
                  Nama kelompok tani / nama usaha tani
                  <input
                    value={producerForm.businessName}
                    onChange={(event) =>
                      setProducerForm((value) => ({ ...value, businessName: event.target.value }))
                    }
                    placeholder="Contoh: Kelompok Tani Mandiri"
                  />
                </label>
                <label>
                  Desa / wilayah
                  <input
                    value={producerForm.region}
                    onChange={(event) =>
                      setProducerForm((value) => ({ ...value, region: event.target.value }))
                    }
                    placeholder="Contoh: Desa Rajeg Mulya"
                  />
                </label>
                <label>
                  Jenis komoditas utama
                  <input
                    value={producerForm.commodity}
                    onChange={(event) =>
                      setProducerForm((value) => ({ ...value, commodity: event.target.value }))
                    }
                    placeholder="Contoh: Beras dan cabai"
                  />
                </label>
                <label>
                  Nomor kontak
                  <input
                    value={producerForm.contact}
                    onChange={(event) =>
                      setProducerForm((value) => ({ ...value, contact: event.target.value }))
                    }
                    placeholder="Contoh: 0812-3456-7890"
                  />
                </label>
                <label>
                  Unggah dokumen/verifikasi dummy
                  <input
                    type="file"
                    onChange={(event) =>
                      setProducerForm((value) => ({
                        ...value,
                        documentName: event.target.files?.[0]?.name || ""
                      }))
                    }
                  />
                </label>
                <button className="btn btn-primary" type="submit">
                  Aktifkan sebagai Produsen
                </button>
              </form>
            ) : null}

            {mode === "pemerintah" ? (
              <form className="form-stack upgrade-form modal-upgrade-form" onSubmit={submitGovernment}>
                <label>
                  Nama instansi
                  <input
                    value={governmentForm.institution}
                    onChange={(event) =>
                      setGovernmentForm((value) => ({ ...value, institution: event.target.value }))
                    }
                    placeholder="Contoh: Kecamatan Rajeg"
                  />
                </label>
                <label>
                  Jabatan
                  <input
                    value={governmentForm.position}
                    onChange={(event) =>
                      setGovernmentForm((value) => ({ ...value, position: event.target.value }))
                    }
                    placeholder="Contoh: Petugas Ketahanan Pangan"
                  />
                </label>
                <label>
                  Wilayah tugas
                  <input
                    value={governmentForm.assignmentRegion}
                    onChange={(event) =>
                      setGovernmentForm((value) => ({
                        ...value,
                        assignmentRegion: event.target.value
                      }))
                    }
                    placeholder="Contoh: Kecamatan Rajeg"
                  />
                </label>
                <label>
                  Email instansi
                  <input
                    type="email"
                    value={governmentForm.officialEmail}
                    onChange={(event) =>
                      setGovernmentForm((value) => ({ ...value, officialEmail: event.target.value }))
                    }
                    placeholder="nama@instansi.go.id"
                  />
                </label>
                <label>
                  Unggah surat tugas/verifikasi dummy
                  <input
                    type="file"
                    onChange={(event) =>
                      setGovernmentForm((value) => ({
                        ...value,
                        documentName: event.target.files?.[0]?.name || ""
                      }))
                    }
                  />
                </label>
                <button className="btn btn-primary" type="submit">
                  Verifikasi sebagai Pemerintah
                </button>
              </form>
            ) : null}
          </section>
        </div>
      ) : null}
    </main>
  );
}
