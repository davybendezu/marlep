function priceRange(variants) {
  const prices = variants.map((v) => Number(v.price));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? `S/ ${min.toFixed(2)}` : `Desde S/ ${min.toFixed(2)}`;
}

export default function ProductCard({ product, onSelect }) {
  const hasDiscount = product.variants.some((v) => v.compare_price && Number(v.compare_price) > Number(v.price));

  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-honey-500/10 transition hover:-translate-y-1 hover:shadow-soft">
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-100">
        {hasDiscount && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-blush-500 px-3 py-1 text-xs font-semibold text-white">
            Oferta
          </span>
        )}
        <img
          src={product.image_url}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        {/* <span
          className="mb-2 inline-block w-fit rounded-full px-3 py-1 text-xs font-semibold text-leaf-700"
          style={{ backgroundColor: `${product.accent_color}40` }}
        >
          {product.variants.length} presentaciones
        </span> */}
        <h3 className="font-display text-lg font-semibold text-leaf-700">{product.name}</h3>
        <p className="mt-1 flex-1 text-sm text-leaf-700/70">{product.short_desc}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-semibold text-honey-600">{priceRange(product.variants)}</span>
          <button onClick={() => onSelect(product)} className="btn-primary !px-4 !py-2 text-xs">
            Comprar
          </button>
        </div>
      </div>
    </div>
  );
}
