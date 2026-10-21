import { useEffect, useMemo, useState } from 'react';
import { fetchProducts } from '../api.js';
import Hero from '../components/Hero.jsx';
import FilterBar from '../components/FilterBar.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import ProductModal from '../components/ProductModal.jsx';
import StorySection from '../components/StorySection.jsx';
import IngredientsSection from '../components/IngredientsSection.jsx';
import SizeGuide from '../components/SizeGuide.jsx';
import { FRAGRANCES } from '../data/fragrances.js';

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

  useEffect(() => {
    // Al recargar con un hash en la URL (ej. /#productos), el navegador intenta
    // hacer scroll al elemento antes de que React lo haya montado, asi que se
    // queda en el inicio. Lo repetimos manualmente una vez montado.
    if (window.location.hash) {
      document.querySelector(window.location.hash)?.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
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
          <h2 className="mt-4 text-3xl font-bold text-leaf-700">Elige tu producto</h2>

          <div className="mx-auto mt-6 max-w-lg">
            <div className="flex items-center gap-4">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-honey-500/40" />
              <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-honey-600">
                Disponible en {FRAGRANCES.length} fragancias
              </p>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-honey-500/40" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
              {FRAGRANCES.map((f) => (
                <div
                  key={f.value}
                  className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 text-left shadow-sm ring-1 ring-honey-500/15 transition hover:-translate-y-0.5 hover:shadow-soft"
                >
                  <span
                    className="h-10 w-10 flex-shrink-0 rounded-full shadow-inner ring-4 ring-cream-100"
                    style={{ background: `radial-gradient(circle at 30% 30%, #ffffff 0%, ${f.color} 65%)` }}
                  />
                  <div className="min-w-0">
                    <p className="font-display text-lg font-semibold leading-tight text-leaf-700">{f.label}</p>
                    <p className="truncate text-xs text-leaf-700/60">{f.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* <p className="mx-auto mt-2 max-w-xl text-leaf-700/70">
            Tres formulas artesanales, cuatro tamanos. Encuentra la crema perfecta para ti.
          </p> */}
        </div>

        {/* <div className="mt-8">
          <FilterBar products={products} active={activeFilter} onChange={setActiveFilter} />
        </div> */}

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
