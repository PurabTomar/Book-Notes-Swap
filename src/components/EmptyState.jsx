export default function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state__icon">{icon}</div>}
      <h2 className="empty-state__title">{title}</h2>
      {subtitle && <p className="empty-state__subtitle">{subtitle}</p>}
      {action}
    </div>
  );
}