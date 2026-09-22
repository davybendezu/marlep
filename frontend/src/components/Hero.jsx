export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream-100">
      <div className="container-page grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
        <div>
          <span className="chip chip-active inline-block">Hecho a mano · Ingredientes naturales</span>
          <h1 className="mt-5 text-4xl font-bold leading-tight text-leaf-700 sm:text-5xl">
            Suavidad natural <br /> para tus manos
          </h1>
          <p className="mt-4 max-w-md text-base text-leaf-700/80">
            Cremas artesanales de avena, miel y vainilla que hidratan, exfolian y calman
            profundamente. Elaboradas en pequenos lotes, con amor por el detalle.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#productos" className="btn-primary">
              Ver productos
            </a>
            <a href="#ingredientes" className="btn-secondary">
              Conocer la formula
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-honey-400/20 blur-2xl" />
          <img
            src="/images/hero-banner.jpg"
            alt="Coleccion Marlep Cosmetics - cremas artesanales para manos"
            className="mx-auto w-full max-w-lg rounded-[2rem] shadow-soft"
          />
        </div>
      </div>
    </section>
  );
}
