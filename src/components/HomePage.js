import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShoppingBagIcon, 
  DevicePhoneMobileIcon, 
  ComputerDesktopIcon,
  TvIcon,
  HomeIcon,
  SparklesIcon,
  GiftIcon,
  TruckIcon,
  CameraIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const HomePage = ({ onCategorySelect, onPageChange }) => {
  const { products } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  const categories = [
    {
      id: 'offers',
      name: 'Top Offers',
      icon: SparklesIcon,
      color: 'bg-gradient-to-br from-purple-500 to-pink-500',
      discount: 'Up to 80% Off'
    },
    {
      id: 'electronics',
      name: 'Mobiles & Tablets',
      icon: DevicePhoneMobileIcon,
      color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      discount: 'Up to 40% Off'
    },
    {
      id: 'electronics',
      name: 'TVs & Appliances',
      icon: TvIcon,
      color: 'bg-gradient-to-br from-green-500 to-teal-500',
      discount: 'Great Deals'
    },
    {
      id: 'electronics',
      name: 'Electronics',
      icon: ComputerDesktopIcon,
      color: 'bg-gradient-to-br from-indigo-500 to-purple-500',
      discount: 'Best Prices'
    },
    {
      id: 'clothing',
      name: 'Fashion',
      icon: SparklesIcon,
      color: 'bg-gradient-to-br from-pink-500 to-rose-500',
      discount: 'Min 50% Off'
    },
    {
      id: 'beauty',
      name: 'Beauty, Food..',
      icon: HeartIcon,
      color: 'bg-gradient-to-br from-orange-500 to-red-500',
      discount: 'Up to 60% Off'
    },
    {
      id: 'home',
      name: 'Home & Kitchen',
      icon: HomeIcon,
      color: 'bg-gradient-to-br from-yellow-500 to-orange-500',
      discount: 'From ₹199'
    },
    {
      id: 'home',
      name: 'Furniture',
      icon: HomeIcon,
      color: 'bg-gradient-to-br from-teal-500 to-green-500',
      discount: 'Up to 70% Off'
    },
    {
      id: 'offers',
      name: 'Flight Bookings',
      icon: TruckIcon,
      color: 'bg-gradient-to-br from-sky-500 to-blue-500',
      discount: 'Book Now'
    },
    {
      id: 'offers',
      name: 'Grocery',
      icon: ShoppingBagIcon,
      color: 'bg-gradient-to-br from-emerald-500 to-green-500',
      discount: 'Fresh & Fast'
    }
  ];

  const bannerSlides = [
    {
      id: 1,
      title: 'MEGA SALE IS LIVE',
      subtitle: 'Up to 80% Off on Electronics',
      description: 'Laptops, Smartphones, TVs & More',
      buttonText: 'Shop Now',
      image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200&h=400&fit=crop',
      gradient: 'from-purple-600 to-pink-600'
    },
    {
      id: 2,
      title: 'FASHION WEEK',
      subtitle: 'Trendy Outfits Starting ₹299',
      description: 'Latest Collection for Men & Women',
      buttonText: 'Explore Fashion',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop',
      gradient: 'from-blue-600 to-purple-600'
    },
    {
      id: 3,
      title: 'HOME MAKEOVER',
      subtitle: 'Transform Your Space',
      description: 'Furniture, Decor & Kitchen Essentials',
      buttonText: 'Shop Home',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=400&fit=crop',
      gradient: 'from-green-600 to-teal-600'
    }
  ];

  const handleCategoryClick = (category) => {
    onCategorySelect(category.id);
    onPageChange('products');
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  // Featured products
  const featuredProducts = products.slice(0, 8);
  const topDeals = products.filter(p => p.rating >= 4.5).slice(0, 6);

  // Auto-slide effect
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);

    return () => clearInterval(slideInterval);
  }, [bannerSlides.length]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Categories Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
            {categories.map((category, index) => (
              <div
                key={index}
                onClick={() => handleCategoryClick(category)}
                className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:scale-105"
              >
                <div className={`${category.color} p-3 rounded-full mb-2 shadow-lg`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-900 text-center leading-tight">
                  {category.name}
                </span>
                <span className="text-xs text-green-600 font-semibold mt-1">
                  {category.discount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Banner Carousel */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="relative h-80 md:h-96 rounded-xl overflow-hidden shadow-2xl">
          {bannerSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className={`bg-gradient-to-r ${slide.gradient} h-full flex items-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="relative z-10 max-w-xl mx-auto text-center px-6 md:mx-0 md:text-left md:ml-16">
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                    {slide.title}
                  </h1>
                  <h2 className="text-xl md:text-2xl text-white mb-2 font-semibold">
                    {slide.subtitle}
                  </h2>
                  <p className="text-lg text-white mb-8 opacity-90">
                    {slide.description}
                  </p>
                  <button
                    onClick={() => onPageChange('products')}
                    className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg transform hover:scale-105"
                  >
                    {slide.buttonText}
                  </button>
                </div>
                <div className="hidden md:block absolute right-0 top-0 h-full w-1/2">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover opacity-30"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {bannerSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Top Deals Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Top Deals of the Day</h2>
          <button
            onClick={() => onPageChange('products')}
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            View All →
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {topDeals.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
              onClick={() => onPageChange('products')}
            >
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                  {Math.floor(Math.random() * 40 + 20)}% OFF
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600">${product.price}</span>
                  <div className="flex items-center">
                    <span className="text-xs text-yellow-500">★</span>
                    <span className="text-xs text-gray-600 ml-1">{product.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Products</h2>
          <button
            onClick={() => onPageChange('products')}
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            Explore All →
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1"
              onClick={() => onPageChange('products')}
            >
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <HeartIcon className="w-4 h-4 text-gray-600 hover:text-red-500" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-blue-600">${product.price}</span>
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
