export default function SectionCard({ title, children, className = '' }) {
  return (
    <div className={`bg-card border border-border rounded-lg overflow-hidden ${className}`}>
      {title && (
        <div className="bg-secondary/50 border-b border-border px-4 py-2">
          <h3 className="font-cinzel text-sm font-semibold text-primary tracking-wide uppercase">{title}</h3>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}