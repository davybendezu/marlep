import { useEffect, useMemo, useState } from 'react';
import { fetchProducts } from '../api.js';
import Hero from '../components/Hero.jsx';
import FilterBar from '../components/FilterBar.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import ProductModal from '../components/ProductModal.jsx';
import StorySection from '../components/StorySection.jsx';
import IngredientsSection from '../components/IngredientsSection.jsx';
import SizeGuide from '../components/SizeGuide.jsx';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('todas');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(
    () => (activeFilter === 'todas' ? products : products.filter((p) => p.slug === activeFilter)),
    [products, activeFilter]
  );

  return (
    <>
      <Hero />

      <section id="productos" className="container-page py-16">
        <div className="text-center">
          <span className="chip chip-active inline-block">Coleccion Marlep</span>
          <h2 className="mt-4 text-3xl font-bold text-leaf-700">Elige tu fragancia favorita</h2>
          <p className="mx-auto mt-2 max-w-xl text-leaf-700/70">
            Tres formulas artesanales, cuatro tamanos. Encuentra la crema perfecta para ti.
          </p>
        </div>

        <div className="mt-8">
          <FilterBar products={products} active={activeFilter} onChange={setActiveFilter} />
        </div>

        {loading ? (
          <p className="mt-10 text-center text-leaf-700/60">Cargando productos...</p>
        ) : (
          <ProductGrid products={filteredProducts} onSelect={setSelectedProduct} />
        )}
      </section>

      <StorySection />
      <IngredientsSection />
      <SizeGuide />

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </>
  );
}
