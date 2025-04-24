import React from "react";

const Hero = () => {
  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24 px-4 md:px-8 lg:px-20 xl:px-24 overflow-hidden bg-[#0B1120]">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col">
            {/* Main Heading Section */}
            <div className="mb-8 md:mb-12">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4">
                Be a part of <span className="text-[#1E9AD3]">history</span>
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-white">
                Timeless Assets
              </h2>
            </div>

            {/* Introduction Section */}
            <div className="mb-10">
              <p className="text-lg text-gray-300 mb-5">
                Since the dawn of time, there have existed treasures formed
                under immense pressure, heat and the patience of millennia.
              </p>
              <p className="text-lg text-gray-300">
                Diamonds are amongst the rarest and most enduring assets in the
                natural world. While diamonds are forever, their journeys are
                not.
              </p>
            </div>

            {/* Timeless Turtle Section */}
            <div>
              <h3 className="text-xl md:text-2xl font-semibold text-white mb-5">
                The Timeless Turtle
              </h3>
              <p className="text-lg text-gray-300 mb-5">
                The Timeless Turtle was born as a guardian of these rare assets,
                a steady guide across turbulent seas of time.
              </p>
              <p className="text-lg text-gray-300">
                In the world of fleeting trends, the Timeless Turtle moves at
                its own deliberate pace, honoring the eternal nature of the
                treasures it protects.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="w-full h-[500px] md:h-[600px] relative overflow-hidden rounded-2xl">
              <video
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src="/videos/nft-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
