export default function SummaryCard({ label, value }) {
  return (
    <div className="card summary">
      <div className="summary-label">{label}</div>
      <div className="summary-value">{value}</div>
    </div>
  );
}
