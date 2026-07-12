export function StatusBadge({ children, variant = "default" }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}
