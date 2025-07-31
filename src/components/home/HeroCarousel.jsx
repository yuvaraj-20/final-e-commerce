import React from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const slides = [
  {
    image: '/assets/slide1.jpg',
    title: 'Elevate Your Style',
    subtitle: 'Explore curated fashion driven by AI',
    cta: 'Shop Now',
    link: '/products',
  },
  {
    image: '/assets/slide2.jpg',
    title: 'Design Your Own Fit',
    subtitle: 'Customize clothing in 3D, powered by intelligent design tools',
    cta: 'Start Designing',
    link: '/design',
  },
  {
    image: '/assets/slide3.jpg',
    title: 'Thrift Luxury Pieces',
    subtitle: 'Rare finds, sustainable fashion, one-of-a-kind',
    cta: 'Visit Thrift Store',
    link: '/thrift',
  },
];

export default function HeroCarousel() {
  const [sliderRef] = useKeenSlider({
    loop: true,
    slides: { perView: 1 },
    mode: 'snap',
  });

  return (
    <div ref={sliderRef} className="keen-slider h-screen relative overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={i}
          className="keen-slider__slide relative h-screen w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10" />
          <div className="z-20 relative h-full flex flex-col items-center justify-center text-center text-white px-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-4xl sm:text-6xl font-bold"
            >
              {slide.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-4 text-lg sm:text-xl text-white/80 max-w-2xl"
            >
              {slide.subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="mt-6"
            >
              <Link
                to={slide.link}
                className="bg-white text-black px-6 py-3 rounded-full text-sm font-semibold shadow hover:bg-white/90 transition"
              >
                {slide.cta}
              </Link>
            </motion.div>
          </div>
        </div>
      ))}
    </div>
  );
}
