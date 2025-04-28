import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import Hero from "./components/sections/Hero";
import Footer from "./components/layout/Footer";
import CollectionDetails from "./components/sections/CollectionDetails";
import CollectionsList from "./components/sections/CollectionsList";
import MyNFTs from "./components/sections/MyNFTs";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-[#0B1120] text-white overflow-x-hidden">
            <Header />
            <Routes>
              <Route
                path="/"
                element={
                  <main>
                    <Hero />
                  </main>
                }
              />
              <Route path="/collections" element={<CollectionDetails />} />
              <Route path="/browse-collections" element={<CollectionsList />} />
              <Route path="/my-nfts" element={<MyNFTs />} />
            </Routes>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
