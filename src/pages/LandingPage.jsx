import { useEffect, useState } from "react";
import BounceCards from "../components/BounceCards";

const featureCards = [
  {
    number: "01",
    title: "Untuk Konsumen",
    description: "Beli pangan segar langsung dari petani Rajeg dengan informasi stok dan harga jelas.",
    tone: "konsumen"
  },
  {
    number: "02",
    title: "Untuk Petani",
    description: "Jual hasil panen dengan rantai distribusi lebih pendek dan kelola produk sendiri.",
    tone: "petani"
  },
  {
    number: "03",
    title: "Untuk Pemerintah",
    description: "Pantau harga dan stok pangan secara real-time melalui data simulasi yang mudah dibaca.",
    tone: "pemerintah"
  }
];

function useCompactCards() {
  const [isCompact, setIsCompact] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia("(max-width: 760px)").matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 760px)");
    const update = () => setIsCompact(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isCompact;
}

export function LandingPage({ navigate }) {
  const isCompact = useCompactCards();
  const transformStyles = isCompact
    ? ["rotate(-3deg) translateY(-250px)", "rotate(1deg)", "rotate(3deg) translateY(250px)"]
    : ["rotate(-7deg) translate(-245px)", "rotate(2deg)", "rotate(7deg) translate(245px)"];

  return (
    <main>
      <section className="hero-section">
        <div className="hero-content">
          <p className="eyebrow">Pasar pangan Rajeg</p>
          <h1>Tani Padu</h1>
          <p className="hero-subtitle">
            Menghubungkan petani Rajeg langsung dengan konsumen dan mendukung pemantauan pangan
            secara transparan.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-large" onClick={() => navigate("/pasar-pangan")}>
              Mulai Belanja
            </button>
            <button className="btn btn-ghost btn-large" onClick={() => navigate("/masuk")}>
              Masuk Akun
            </button>
          </div>
        </div>
      </section>

      <section className="page-shell">
        <div className="section-heading section-heading-center">
          <p className="eyebrow">Satu tempat, tiga kebutuhan</p>
          <h2>Alur sederhana untuk konsumen, petani, dan pemerintah</h2>
        </div>
        <BounceCards
          className="home-feature-bounce"
          cards={featureCards}
          containerWidth={isCompact ? 360 : 860}
          containerHeight={isCompact ? 760 : 320}
          animationDelay={0.25}
          animationStagger={0.1}
          easeType="elastic.out(1, 0.65)"
          transformStyles={transformStyles}
          enableHover={!isCompact}
        />
      </section>
    </main>
  );
}
