import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { CartIcon, MenuIcon, CloseIcon } from './icons.jsx';

const NAV_LINKS = [
  { label: 'Productos', href: '#productos' },
  { label: 'Ingredientes', href: '#ingredientes' },
  { label: 'Nuestra Historia', href: '#historia' },
  { label: 'Contacto', href: '#contacto' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalCount, setIsOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-honey-500/20 bg-cream-50/95 backdrop-blur">
      <div className="container-page flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-3">
          <img src="/images/logo.png" alt="Marlep Cosmetics" className="h-12 w-12 rounded-full object-cover shadow-soft" />
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold text-leaf-700">Marlep Cosmetics</p>
            <p className="text-xs tracking-wide text-honey-600">Suavidad Natural</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-leaf-700 transition hover:text-honey-600">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(true)}
            className="relative rounded-full p-2 text-leaf-700 transition hover:bg-honey-500/10"
            aria-label="Abrir carrito"
          >
            <CartIcon className="h-6 w-6" />
            {totalCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blush-500 text-[11px] font-bold text-white">
                {totalCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-full p-2 text-leaf-700 transition hover:bg-honey-500/10 md:hidden"
            aria-label="Abrir menu"
          >
            {menuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-honey-500/20 bg-cream-50 px-4 pb-4 pt-2 md:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-leaf-700 hover:bg-honey-500/10"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
