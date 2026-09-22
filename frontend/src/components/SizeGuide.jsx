const SIZES = [
  { label: 'Mini Bolsillo', grams: '7g', use: 'Ideal para uso facial o probar la fragancia.' },
  { label: 'Tamaño de Viaje', grams: '15g', use: 'Perfecta para llevar en tu cartera o maleta.' },
  { label: 'Tamaño Estándar', grams: '30g', use: 'El favorito para uso diario en casa.' },
  { label: 'Tamaño Familiar', grams: '45g', use: 'Rinde mas, ideal para toda la familia.' },
];

export default function SizeGuide() {
  return (
    <section className="container-page py-16">
      <div className="text-center">
        <span className="chip chip-active inline-block">Elige tu tama&ntilde;o</span>
        <h2 className="mt-4 text-3xl font-bold text-leaf-700">Una presentaci&oacute;n para cada momento</h2>
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-2 md:items-center">
        <img
          src="/images/tallas.jpg"
          alt="Presentaciones Marlep Cosmetics: familiar, estandar, viaje y mini bolsillo"
          className="mx-auto w-full max-w-xl rounded-[2rem] shadow-soft"
        />
        <div className="grid grid-cols-2 gap-4">
          {SIZES.map((size) => (
            <div key={size.label} className="rounded-2xl border border-honey-500/30 bg-white p-4 shadow-sm">
              <p className="font-display text-lg font-semibold text-leaf-700">{size.label}</p>
              <p className="text-sm font-medium text-honey-600">{size.grams}</p>
              <p className="mt-2 text-xs text-leaf-700/70">{size.use}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
