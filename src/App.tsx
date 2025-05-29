import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Header from "./components/layout/Header";
import Hero from "./components/sections/Hero";
import Mission from "./components/sections/Mission";
import TimelessTurtle from "./components/sections/TimelessTurtle";
import Benefits from "./components/sections/Benefits";
// import NftBenefits from "./components/sections/NftBenefits";
import Footer from "./components/layout/Footer";
import CollectionDetails from "./components/sections/CollectionDetails";
import MyNFTs from "./components/sections/MyNFTs";
// import CartSidebar from "./components/cart/CartSidebar";
import { AuthProvider } from "./contexts/AuthContext";
// import { CartProvider } from "./contexts/CartContext";
import FAQ from "./components/sections/FAQ";

// Component to handle layout and footer visibility
const AppLayout = () => {
  const location = useLocation();

  // List of paths where footer should not be shown
  const noFooterPaths = ["/my-nfts", "/collection/turtle-timepiece-genesis"];

  const shouldShowFooter =
    !noFooterPaths.includes(location.pathname) &&
    !location.pathname.startsWith("/collection/");

  return (
    <div className="min-h-screen bg-[#0B1120] text-white overflow-x-hidden">
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <main>
              <Hero />
              <Mission />
              <TimelessTurtle />
              <Benefits />
              {/* <NftBenefits /> */}
              <FAQ />
            </main>
          }
        />
        <Route path="/collection/:id" element={<CollectionDetails />} />
        <Route path="/my-nfts" element={<MyNFTs />} />
      </Routes>
      {shouldShowFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Commented out CartProvider */}
        {/* <CartProvider> */}
        <AppLayout />
        {/* </CartProvider> */}
      </AuthProvider>
    </Router>
  );
}

export default App;
