import ProductCard from './ProductCard.jsx';

export default function ProductGrid({ products, onSelect }) {
  if (products.length === 0) {
    return <p className="mt-10 text-center text-leaf-700/60">No hay productos en esta categoria por ahora.</p>;
  }

  return (
    <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} onSelect={onSelect} />
      ))}
    </div>
  );
}
