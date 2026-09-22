const INGREDIENTS = [
  { name: 'Harina de Avena Natural', detail: 'Exfolia suavemente y calma la piel irritada.' },
  { name: 'Miel de Abeja (flores silvestres)', detail: 'Nutre intensamente y aporta brillo natural.' },
  { name: 'Extracto de Aloe Vera', detail: 'Hidrata en profundidad y refresca la piel.' },
  { name: 'Aceite de Almendras Dulces', detail: 'Prensado en frio, suaviza y repara la barrera cutanea.' },
  { name: 'Esencia de Vainilla', detail: 'Aroma relajante, apto para piel delicada.' },
];

export default function IngredientsSection() {
  return (
    <section id="ingredientes" className="bg-cream-100 py-16">
      <div className="container-page grid items-center gap-10 md:grid-cols-2">
        <div>
          <span className="chip chip-active inline-block">Formula artesanal completa</span>
          <h2 className="mt-4 text-3xl font-bold text-leaf-700">Ingredientes que reconoces</h2>
          <p className="mt-4 text-leaf-700/80">
            Nada de quimicos dificiles de pronunciar. Cada crema Marlep se elabora con
            ingredientes naturales seleccionados por sus beneficios comprobados para la piel.
          </p>
          <dl className="mt-6 space-y-4">
            {INGREDIENTS.map((item) => (
              <div key={item.name} className="border-l-2 border-honey-500 pl-4">
                <dt className="font-semibold text-leaf-700">{item.name}</dt>
                <dd className="text-sm text-leaf-700/70">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
        <img
          src="/images/ingredientes.jpg"
          alt="Formula artesanal completa Marlep Cosmetics"
          className="mx-auto w-full max-w-lg rounded-[2rem] shadow-soft"
        />
      </div>
    </section>
  );
}
