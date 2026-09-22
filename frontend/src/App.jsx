import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import SplashScreen from './components/SplashScreen.jsx';
import Home from './pages/Home.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <div className="flex min-h-screen flex-col bg-cream-50">
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      <Header />
      <CartDrawer />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/pedido/:code" element={<OrderSuccess />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
