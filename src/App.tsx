import React from "react";
import Header from "./components/layout/Header";
import Hero from "./components/sections/Hero";
import Footer from "./components/layout/Footer";
// Note: The actual RainbowKit provider would be imported here,
// but we're keeping it simple for now since there were API compatibility issues

function App() {
  return (
    // Note: In a complete implementation, we would wrap this with:
    // <RainbowKitProvider>...</RainbowKitProvider>
    <div className="min-h-screen bg-[#0B1120] text-white overflow-x-hidden">
      <Header />
      <main>
        <Hero />
      </main>
      <Footer />
    </div>
  );
}

export default App;
