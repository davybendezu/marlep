export default function FilterBar({ products, active, onChange }) {
  const filters = [{ slug: 'todas', name: 'Todas' }, ...products.map((p) => ({ slug: p.slug, name: p.name }))];

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {filters.map((f) => (
        <button
          key={f.slug}
          onClick={() => onChange(f.slug)}
          className={`chip ${active === f.slug ? 'chip-active' : 'bg-white'}`}
        >
          {f.name}
        </button>
      ))}
    </div>
  );
}
