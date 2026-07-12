import { useEffect, useMemo, useState } from "react";
import { StatusBadge } from "../components/StatusBadge";
import { formatNumber, formatRupiah } from "../utils/formatters";
import { getFoodPrices, getFoodStocks, setFoodPrices, setFoodStocks } from "../utils/storage";

function priceStatus(change) {
  if (change > 0) return "Naik";
  if (change < 0) return "Turun";
  return "Stabil";
}

function stockStatus(stock) {
  if (stock <= 70) return "Kritis";
  if (stock <= 120) return "Menipis";
  return "Aman";
}

function statusVariant(status) {
  if (status === "Naik" || status === "Menipis") return "warning";
  if (status === "Turun" || status === "Aman" || status === "Stabil") return "success";
  return "danger";
}

function statusClass(status) {
  return String(status || "stabil").toLowerCase();
}

function formatPriceChange(change) {
  if (change > 0) return `+${formatRupiah(change)}`;
  if (change < 0) return formatRupiah(change);
  return formatRupiah(0);
}

function formatPercent(value) {
  const rounded = Math.abs(value).toFixed(1).replace(".", ",");
  if (value > 0) return `+${rounded}%`;
  if (value < 0) return `-${rounded}%`;
  return "0%";
}

function formatShortRupiah(value) {
  const number = Number(value) || 0;
  if (number >= 1000) return `Rp${formatNumber(Math.round(number / 1000))} rb`;
  return formatRupiah(number);
}

function formatShortNumber(value) {
  const number = Number(value) || 0;
  if (number >= 1000) return `${formatNumber(Math.round(number / 1000))} rb`;
  return formatNumber(number);
}

function buildPriceHistory(currentValue, change, length = 14) {
  const current = Math.max(1000, Number(currentValue) || 1000);
  const dailyChange = Number(change) || current * 0.002;
  const rangeBase = Math.max(Math.abs(dailyChange) * 5, current * 0.025);

  return Array.from({ length }, (_, index) => {
    const progress = index / (length - 1);
    const trend = dailyChange * (progress - 1) * 6;
    const wave = Math.sin(index * 0.95) * rangeBase * 0.18;
    return Math.max(1000, Math.round(current + trend + wave));
  });
}

function buildStockHistory(currentTotal, stocks, length = 14) {
  const total = Math.max(1, Number(currentTotal) || 1);
  const stockPressure = stocks.reduce((sum, item) => {
    if (item.status === "Kritis") return sum - 18;
    if (item.status === "Menipis") return sum - 8;
    return sum + 7;
  }, 0);
  const movement = stockPressure || total * 0.006;

  return Array.from({ length }, (_, index) => {
    const progress = index / (length - 1);
    const trend = movement * (progress - 1);
    const wave = Math.cos(index * 0.8) * Math.max(8, total * 0.008);
    return Math.max(0, Math.round(total + trend + wave));
  });
}

function seriesTrend(series, neutralThreshold = 0) {
  const first = series[0] || 0;
  const last = series[series.length - 1] || 0;
  const diff = last - first;
  if (Math.abs(diff) <= neutralThreshold) return "Stabil";
  return diff > 0 ? "Naik" : "Turun";
}

function seriesPercent(series) {
  const first = series[0] || 1;
  const last = series[series.length - 1] || 0;
  return ((last - first) / Math.max(1, first)) * 100;
}

function buildPrediction(prices, stocks) {
  const averagePrice =
    prices.reduce((sum, item) => sum + item.price, 0) / Math.max(1, prices.length);
  const averageChange =
    prices.reduce((sum, item) => sum + item.change, 0) / Math.max(1, prices.length);
  const lowStockCount = stocks.filter((item) => item.status !== "Aman").length;
  const criticalStockCount = stocks.filter((item) => item.status === "Kritis").length;
  const lowStockRatio = lowStockCount / Math.max(1, stocks.length);
  const criticalStockRatio = criticalStockCount / Math.max(1, stocks.length);
  const priceMomentum = (averageChange / Math.max(1, averagePrice)) * 100;
  const stockPressure = lowStockRatio * 1.4 + criticalStockRatio * 1.1;
  const pressureScore = priceMomentum * 1.8 + stockPressure;
  const status = pressureScore > 0.8 ? "Inflasi" : pressureScore < -0.8 ? "Deflasi" : "Stabil";
  const iconStatus = status === "Inflasi" ? "Naik" : status === "Deflasi" ? "Turun" : "Stabil";
  const confidence = Math.min(94, Math.round(64 + Math.abs(pressureScore) * 11));
  const forecastSeries = Array.from({ length: 10 }, (_, index) => {
    const progress = index / 9;
    const projectedMove = averagePrice * pressureScore * 0.012 * progress;
    const wave = Math.sin(index * 0.9) * averagePrice * 0.006;
    return Math.max(1000, Math.round(averagePrice + projectedMove + wave));
  });

  return {
    averagePrice,
    averageChange,
    confidence,
    forecastSeries,
    iconStatus,
    lowStockCount,
    pressureScore,
    priceMomentum,
    status,
    stockPressure
  };
}

function TrendIcon({ status }) {
  const normalized = statusClass(status);

  return (
    <span className={`trend-icon trend-icon-${normalized}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        {status === "Naik" ? (
          <>
            <path d="m5 15 5-5 4 4 5-7" />
            <path d="M14 7h5v5" />
          </>
        ) : status === "Turun" ? (
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

function PriceSparkline({ item }) {
  const basePrice = Math.max(1000, item.price - item.change);
  const steps = [0, 0.18, 0.38, 0.6, 0.8, 1];
  const values = steps.map((step, index) => {
    const wave = Math.sin(index * 1.2) * Math.abs(item.change || 120) * 0.16;
    return basePrice + item.change * step + wave;
  });
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const points = values
    .map((value, index) => {
      const x = 8 + index * 24;
      const y = 38 - ((value - min) / range) * 28;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      className={`sparkline sparkline-${statusClass(item.status)}`}
      viewBox="0 0 136 48"
      aria-label={`Grafik perubahan harga ${item.commodity}`}
    >
      <path d="M8 40H128" />
      <polyline points={points} />
      <circle cx="128" cy={points.split(" ").at(-1)?.split(",")[1] || 24} r="4" />
    </svg>
  );
}

function StockMeter({ item, maxStock }) {
  const percent = Math.max(5, Math.min(100, (item.stock / Math.max(1, maxStock)) * 100));

  return (
    <div className="stock-meter">
      <div className="stock-meter-track" aria-hidden="true">
        <div
          className={`stock-meter-fill stock-${statusClass(item.status)}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span>
        {formatNumber(item.stock)} {item.unit}
      </span>
    </div>
  );
}

function StockStatusMark({ status }) {
  return (
    <span className="stock-status-mark">
      <span className={`stock-strip stock-${statusClass(status)}`} aria-hidden="true" />
      <StatusBadge variant={statusVariant(status)}>{status}</StatusBadge>
    </span>
  );
}

function LongTrendChart({ series, status, type = "price", ariaLabel }) {
  const width = 360;
  const height = 150;
  const paddingX = 20;
  const paddingY = 20;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = Math.max(1, max - min);
  const pointsData = series.map((value, index) => ({
    value,
    x: paddingX + (index / Math.max(1, series.length - 1)) * (width - paddingX * 2),
    y: height - paddingY - ((value - min) / range) * (height - paddingY * 2)
  }));
  const points = pointsData.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPoints = `${paddingX},${height - paddingY} ${points} ${width - paddingX},${height - paddingY}`;
  const tickValues = [max, (max + min) / 2, min];

  return (
    <div className={`long-chart long-chart-${type} sparkline-${statusClass(status)}`}>
      <svg viewBox={`0 0 ${width} ${height}`} aria-label={ariaLabel}>
        {tickValues.map((tick, index) => {
          const y = paddingY + index * ((height - paddingY * 2) / 2);
          return (
            <g key={tick + index}>
              <path className="chart-grid-line" d={`M${paddingX} ${y}H${width - paddingX}`} />
              <text x="0" y={y + 4}>
                {type === "price" ? formatShortRupiah(tick) : formatShortNumber(tick)}
              </text>
            </g>
          );
        })}
        <polygon points={areaPoints} />
        <polyline points={points} />
        {pointsData.map((point, index) =>
          index % 3 === 0 || index === pointsData.length - 1 ? (
            <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r={index === pointsData.length - 1 ? 5 : 3} />
          ) : null
        )}
      </svg>
      <div className="long-chart-labels">
        <span>14 periode lalu</span>
        <span>Sekarang</span>
      </div>
    </div>
  );
}

function AnalyticMetricCard({ label, value, helper, series, status, deltaLabel, type = "price" }) {
  return (
    <article className={`analytic-card analytic-card-${type}`}>
      <div className="analytic-card-top">
        <div>
          <p className="stat-label">{label}</p>
          <strong>{value}</strong>
        </div>
        <TrendIcon status={status} />
      </div>
      <div className={`analytic-delta price-${statusClass(status)}`}>
        <span>{deltaLabel}</span>
        <small>{helper}</small>
      </div>
      <LongTrendChart
        series={series}
        status={status}
        type={type}
        ariaLabel={`Grafik ${label.toLowerCase()}`}
      />
    </article>
  );
}

function PredictionPanel({ prediction }) {
  const predictionVariant =
    prediction.status === "Inflasi" ? "warning" : prediction.status === "Deflasi" ? "success" : "default";
  const pressurePercent = Math.min(100, Math.max(0, 50 + prediction.pressureScore * 18));

  return (
    <section className={`prediction-panel prediction-${statusClass(prediction.status)}`}>
      <div className="prediction-copy">
        <p className="eyebrow">Prediksi harga pangan</p>
        <div className="prediction-title-row">
          <TrendIcon status={prediction.iconStatus} />
          <div>
            <h2>{prediction.status}</h2>
            <p>
              Proyeksi berdasarkan momentum harga, tekanan stok, dan komoditas yang perlu
              pemantauan.
            </p>
          </div>
        </div>
        <StatusBadge variant={predictionVariant}>Keyakinan {prediction.confidence}%</StatusBadge>
      </div>

      <LongTrendChart
        series={prediction.forecastSeries}
        status={prediction.iconStatus}
        type="price"
        ariaLabel="Grafik prediksi harga pangan"
      />

      <div className="prediction-metrics">
        <div>
          <span>Momentum harga</span>
          <strong>{formatPercent(prediction.priceMomentum)}</strong>
        </div>
        <div>
          <span>Tekanan stok</span>
          <strong>{prediction.lowStockCount} komoditas</strong>
        </div>
        <div>
          <span>Indeks tekanan</span>
          <div className="pressure-meter">
            <div style={{ width: `${pressurePercent}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function GovernmentDashboard() {
  const [prices, setPrices] = useState(getFoodPrices);
  const [stocks, setStocks] = useState(getFoodStocks);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPrices((current) => {
        const nextPrices = current.map((item) => {
          const change = Math.round((Math.random() - 0.45) * 500);
          const nextPrice = Math.max(1000, item.price + change);

          return {
            ...item,
            price: nextPrice,
            change,
            status: priceStatus(change)
          };
        });

        setFoodPrices(nextPrices);
        return nextPrices;
      });

      setStocks((current) => {
        const nextStocks = current.map((item) => {
          const movement = Math.round((Math.random() - 0.55) * 18);
          const nextStock = Math.max(0, item.stock + movement);

          return {
            ...item,
            stock: nextStock,
            status: stockStatus(nextStock)
          };
        });

        setFoodStocks(nextStocks);
        return nextStocks;
      });
    }, 3500);

    return () => window.clearInterval(interval);
  }, []);

  const summary = useMemo(() => {
    const averageFor = (keyword) => {
      const entries = prices.filter((item) => item.commodity.toLowerCase().includes(keyword));
      if (!entries.length) {
        return {
          average: 0,
          change: 0,
          series: buildPriceHistory(1000, 0),
          status: "Stabil"
        };
      }

      const average = entries.reduce((sum, item) => sum + item.price, 0) / entries.length;
      const change = entries.reduce((sum, item) => sum + item.change, 0) / entries.length;
      const series = buildPriceHistory(average, change);

      return {
        average,
        change,
        series,
        status: seriesTrend(series, Math.max(80, average * 0.004))
      };
    };

    const totalStock = stocks.reduce((sum, item) => sum + item.stock, 0);
    const lowestStock = [...stocks].sort((first, second) => first.stock - second.stock)[0];
    const stockSeries = buildStockHistory(totalStock, stocks);
    const stockDelta = stockSeries[stockSeries.length - 1] - stockSeries[0];
    const prediction = buildPrediction(prices, stocks);

    return {
      chili: averageFor("cabai"),
      lowestStock,
      prediction,
      rice: averageFor("beras"),
      stockDelta,
      stockSeries,
      stockTrend: seriesTrend(stockSeries, Math.max(8, totalStock * 0.01)),
      totalStock,
    };
  }, [prices, stocks]);

  const maxPrice = Math.max(1, ...prices.map((item) => item.price));
  const maxStock = Math.max(1, ...stocks.map((item) => item.stock));

  return (
    <main className="page-shell">
      <section className="section-heading with-actions">
        <div>
          <p className="eyebrow">Dashboard Pemerintah</p>
          <h1>Monitoring harga dan stok pangan live</h1>
          <p>Data harga dan ketersediaan pangan Rajeg untuk mendukung pemantauan harian.</p>
        </div>
      </section>

      <section className="analytics-grid">
        <AnalyticMetricCard
          label="Rata-rata harga beras"
          value={formatRupiah(summary.rice.average)}
          helper="Tren 14 periode terakhir"
          series={summary.rice.series}
          status={summary.rice.status}
          deltaLabel={formatPercent(seriesPercent(summary.rice.series))}
        />
        <AnalyticMetricCard
          label="Rata-rata harga cabai"
          value={formatRupiah(summary.chili.average)}
          helper="Tren 14 periode terakhir"
          series={summary.chili.series}
          status={summary.chili.status}
          deltaLabel={formatPercent(seriesPercent(summary.chili.series))}
        />
        <AnalyticMetricCard
          label="Total stok pangan tersedia"
          value={`${formatNumber(summary.totalStock)} unit`}
          helper="Pergerakan stok gabungan"
          series={summary.stockSeries}
          status={summary.stockTrend}
          deltaLabel={`${summary.stockDelta >= 0 ? "+" : ""}${formatNumber(summary.stockDelta)} unit`}
          type="stock"
        />
        <article className="analytic-card stock-focus-card">
          <div className="analytic-card-top">
            <div>
              <p className="stat-label">Komoditas stok rendah</p>
              <strong>{summary.lowestStock?.commodity || "-"}</strong>
            </div>
            {summary.lowestStock ? <StockStatusMark status={summary.lowestStock.status} /> : null}
          </div>
          <p className="muted">
            {summary.lowestStock
              ? `${formatNumber(summary.lowestStock.stock)} ${summary.lowestStock.unit} tersedia di ${summary.lowestStock.region}`
              : "-"}
          </p>
          {summary.lowestStock ? <StockMeter item={summary.lowestStock} maxStock={maxStock} /> : null}
        </article>
      </section>

      <PredictionPanel prediction={summary.prediction} />

      <section className="monitor-grid">
        <div className="table-panel monitor-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Harga pangan live</p>
              <h2>Pergerakan harga pangan</h2>
            </div>
          </div>
          <div className="monitor-list">
            <div className="monitor-list-header price-list-header" aria-hidden="true">
              <span>Komoditas</span>
              <span>Harga saat ini</span>
              <span>Perubahan</span>
              <span>Tren</span>
            </div>
            {prices.map((item) => (
              <article className="monitor-record price-record" key={item.id}>
                <div className="monitor-cell monitor-primary">
                  <span className="monitor-label">Komoditas</span>
                  <strong>{item.commodity}</strong>
                  <small>{item.region}</small>
                </div>
                <div className="monitor-cell">
                  <span className="monitor-label">Harga saat ini</span>
                  <strong>{formatRupiah(item.price)}</strong>
                </div>
                <div className="monitor-cell">
                  <span className="monitor-label">Perubahan harga</span>
                  <span className={`price-change price-${statusClass(item.status)}`}>
                    <TrendIcon status={item.status} />
                    {formatPriceChange(item.change)}
                  </span>
                </div>
                <div className="monitor-cell monitor-trend-cell">
                  <span className="monitor-label">Tren</span>
                  <PriceSparkline item={item} />
                  <StatusBadge variant={statusVariant(item.status)}>{item.status}</StatusBadge>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="table-panel monitor-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Stok pangan live</p>
              <h2>Ketersediaan stok pangan</h2>
            </div>
          </div>
          <div className="monitor-list">
            <div className="monitor-list-header stock-list-header" aria-hidden="true">
              <span>Komoditas</span>
              <span>Stok tersedia</span>
              <span>Wilayah/desa</span>
              <span>Status</span>
            </div>
            {stocks.map((item) => (
              <article className={`monitor-record stock-record stock-${statusClass(item.status)}`} key={item.id}>
                <div className="monitor-cell monitor-primary">
                  <span className="monitor-label">Komoditas</span>
                  <strong>{item.commodity}</strong>
                  <small>{item.status === "Aman" ? "Ketersediaan terjaga" : "Butuh pemantauan"}</small>
                </div>
                <div className="monitor-cell">
                  <span className="monitor-label">Stok tersedia</span>
                  <StockMeter item={item} maxStock={maxStock} />
                </div>
                <div className="monitor-cell">
                  <span className="monitor-label">Wilayah/desa</span>
                  <strong>{item.region}</strong>
                </div>
                <div className="monitor-cell">
                  <span className="monitor-label">Status</span>
                  <StockStatusMark status={item.status} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="chart-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Grafik pangan</p>
            <h2>Perbandingan harga dan stok</h2>
          </div>
        </div>
        <div className="chart-grid">
          <div>
            <h3>Harga pangan</h3>
            <div className="bar-list">
              {prices.map((item) => (
                <div className="bar-row" key={item.id}>
                  <span>{item.commodity}</span>
                  <div className="bar-track">
                    <div className="bar-fill price" style={{ width: `${(item.price / maxPrice) * 100}%` }} />
                  </div>
                  <strong>{formatRupiah(item.price)}</strong>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3>Stok pangan</h3>
            <div className="bar-list">
              {stocks.map((item) => (
                <div className="bar-row" key={item.id}>
                  <span>{item.commodity}</span>
                  <div className="bar-track">
                    <div className="bar-fill stock" style={{ width: `${(item.stock / maxStock) * 100}%` }} />
                  </div>
                  <strong>
                    {formatNumber(item.stock)} {item.unit}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
