import { StatusBadge } from "./StatusBadge";

export function StatCard({ label, value, helper, badge }) {
  return (
    <article className="stat-card">
      <div>
        <p className="stat-label">{label}</p>
        <strong>{value}</strong>
      </div>
      {badge ? <StatusBadge variant={badge.variant}>{badge.label}</StatusBadge> : null}
      {helper ? <p className="muted">{helper}</p> : null}
    </article>
  );
}
