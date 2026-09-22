export default function StorySection() {
  return (
    <section id="historia" className="container-page grid items-center gap-10 py-16 md:grid-cols-2">
      <img
        src="/images/story-natural.jpg"
        alt="Suavidad natural para tus manos - ingredientes Marlep"
        className="mx-auto w-full max-w-md rounded-[2rem] shadow-soft"
      />
      <div>
        <span className="chip chip-active inline-block">Nuestra historia</span>
        <h2 className="mt-4 text-3xl font-bold text-leaf-700">Hecho con amor, en casa</h2>
        <p className="mt-4 text-leaf-700/80">
          Marlep Cosmetics nace de la busqueda de una crema de manos que realmente funcione:
          sin quimicos agresivos, con ingredientes que reconoces y en porciones pensadas para
          cada momento del dia. Elaboramos cada lote de forma artesanal, cuidando cada detalle
          desde la mezcla hasta el envasado.
        </p>
        <ul className="mt-6 space-y-3 text-sm text-leaf-700/80">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-honey-500" />
            Formulas artesanales elaboradas en pequenos lotes.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-honey-500" />
            Ingredientes naturales: avena, miel de abeja, aloe vera y vainilla.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-honey-500" />
            Presentaciones para cada necesidad: mini, viaje, estandar y familiar.
          </li>
        </ul>
      </div>
    </section>
  );
}
