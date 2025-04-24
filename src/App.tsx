import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import Hero from "./components/sections/Hero";
import Footer from "./components/layout/Footer";
import CollectionDetails from "./components/sections/CollectionDetails";

function App() {
  return (
    <Router>
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
          <Route path="/collections/" element={<CollectionDetails />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
