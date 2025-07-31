import React, { useRef, useState, useEffect } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { motion } from 'framer-motion';
import ProductCard from '../common/ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const NewArrivalsCarousel = ({ items = [] }) => {
  const sliderRef = useRef(null);
  const [sliderInstance, setSliderInstance] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [ref] = useKeenSlider({
    loop: true,
    slides: {
      perView: 1.2,
      spacing: 15,
      breakpoints: {
        '(min-width: 640px)': {
          perView: 2.2,
        },
        '(min-width: 1024px)': {
          perView: 4,
        },
      },
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created(slider) {
      setSliderInstance(slider);
    },
  });

  // Autoplay
  useEffect(() => {
    if (!sliderInstance) return;
    const interval = setInterval(() => {
      sliderInstance.next();
    }, 3500);

    const sliderEl = sliderRef.current;
    sliderEl.addEventListener('mouseenter', () => clearInterval(interval));
    sliderEl.addEventListener('mouseleave', () => {
      setInterval(() => {
        sliderInstance.next();
      }, 3500);
    });

    return () => clearInterval(interval);
  }, [sliderInstance]);

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      ref={sliderRef}
    >
      {/* Carousel Slides */}
      <div ref={ref} className="keen-slider">
        {items.map((product, index) => (
          <div key={product.id} className="keen-slider__slide">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              viewport={{ once: true }}
              className="p-2"
            >
              <ProductCard product={product} index={index} />
            </motion.div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={() => sliderInstance?.prev()}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full z-10 hidden group-hover:block"
      >
        <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-white" />
      </button>
      <button
        onClick={() => sliderInstance?.next()}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full z-10 hidden group-hover:block"
      >
        <ChevronRight className="h-5 w-5 text-gray-700 dark:text-white" />
      </button>

      {/* Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => sliderInstance?.moveToIdx(idx)}
            className={`h-2 w-2 rounded-full transition-all ${
              idx === currentSlide ? 'bg-purple-600 dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default NewArrivalsCarousel;
