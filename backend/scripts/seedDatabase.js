const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
require('dotenv').config();

// Product data from your frontend
const products = [
  {
    name: "Apple Watch Ultra 2",
    price: 799.99,
    category: "watches",
    image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400&h=400&fit=crop",
    description: "The most rugged and capable Apple Watch ever. Features titanium case, precision dual-frequency GPS, and up to 36 hours of battery life.",
    inStock: true,
    stock: 25,
    rating: 4.9,
    reviews: 256,
    featured: true,
    brand: "Apple"
  },
  {
    name: "AirPods Pro (3rd Gen)",
    price: 249.99,
    category: "earphones",
    image: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=400&h=400&fit=crop",
    description: "Active Noise Cancellation, Transparency mode, and Spatial Audio. Up to 6 hours of listening time with ANC enabled.",
    inStock: true,
    stock: 50,
    rating: 4.8,
    reviews: 412,
    featured: true,
    brand: "Apple"
  },
  {
    name: "Samsung Galaxy Watch 6",
    price: 329.99,
    category: "watches",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    description: "Advanced health monitoring with body composition analysis, sleep tracking, and GPS. Compatible with Android devices.",
    inStock: true,
    stock: 30,
    rating: 4.7,
    reviews: 189,
    featured: false,
    brand: "Samsung"
  },
  {
    name: "Sony WH-1000XM5",
    price: 399.99,
    category: "earphones",
    image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop",
    description: "Industry-leading noise canceling with Dual Noise Sensor technology. Up to 30-hour battery life with quick charge.",
    inStock: true,
    stock: 20,
    rating: 4.9,
    reviews: 328,
    featured: true,
    brand: "Sony"
  },
  {
    name: "Garmin Fenix 7X Solar",
    price: 899.99,
    category: "watches",
    image: "https://images.unsplash.com/photo-1579586337278-3f436f25d4d3?w=400&h=400&fit=crop",
    description: "Rugged GPS smartwatch with solar charging, multi-sport tracking, and up to 28 days of battery life in smartwatch mode.",
    inStock: true,
    stock: 15,
    rating: 4.8,
    reviews: 167,
    featured: false,
    brand: "Garmin"
  },
  {
    name: "Bose QuietComfort Earbuds",
    price: 279.99,
    category: "earphones",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop",
    description: "World-class noise cancellation in a wireless earbud design. Comfortable, secure fit with up to 6 hours of battery life.",
    inStock: true,
    stock: 35,
    rating: 4.6,
    reviews: 294,
    featured: false,
    brand: "Bose"
  },
  {
    name: "Fitbit Versa 4",
    price: 199.99,
    category: "watches",
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop",
    description: "Health and fitness smartwatch with built-in GPS, 40+ exercise modes, and 6+ day battery life.",
    inStock: false,
    stock: 0,
    rating: 4.5,
    reviews: 245,
    featured: false,
    brand: "Fitbit"
  },
  {
    name: "JBL Live Pro 2",
    price: 149.99,
    category: "earphones",
    image: "https://images.unsplash.com/photo-1606400082777-ef05f3c5cde2?w=400&h=400&fit=crop",
    description: "True adaptive noise cancelling earbuds with smart ambient technology. 40 hours total battery life with case.",
    inStock: true,
    stock: 40,
    rating: 4.4,
    reviews: 178,
    featured: false,
    brand: "JBL"
  },
  {
    name: "Fossil Gen 6 Smartwatch",
    price: 255.99,
    category: "watches",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400&h=400&fit=crop",
    description: "Wear OS by Google smartwatch with heart rate & activity tracker, GPS, NFC, and smartphone notifications.",
    inStock: true,
    stock: 22,
    rating: 4.3,
    reviews: 203,
    featured: false,
    brand: "Fossil"
  },
  {
    name: "Wireless Charging Pad",
    price: 39.99,
    category: "accessories",
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop",
    description: "Fast wireless charging pad compatible with iPhone, Samsung Galaxy, and other Qi-enabled devices. LED indicator included.",
    inStock: true,
    stock: 100,
    rating: 4.2,
    reviews: 156,
    featured: false,
    brand: "Generic"
  },
  {
    name: "Sennheiser Momentum 4",
    price: 349.99,
    category: "earphones",
    image: "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=400&h=400&fit=crop",
    description: "Audiophile-grade wireless headphones with adaptive noise cancellation and 60-hour battery life.",
    inStock: true,
    stock: 18,
    rating: 4.7,
    reviews: 134,
    featured: true,
    brand: "Sennheiser"
  },
  {
    name: "Premium Watch Band",
    price: 49.99,
    category: "accessories",
    image: "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=400&h=400&fit=crop",
    description: "Genuine leather watch band compatible with Apple Watch and Samsung Galaxy Watch. Available in multiple colors.",
    inStock: true,
    stock: 75,
    rating: 4.4,
    reviews: 91,
    featured: false,
    brand: "Generic"
  },
  {
    name: "Apple Watch Series 9",
    price: 399.99,
    category: "watches",
    image: "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=400&h=400&fit=crop",
    description: "The most advanced Apple Watch yet with S9 chip, Double Tap gesture, and improved Siri. Available in multiple colors.",
    inStock: true,
    stock: 45,
    rating: 4.8,
    reviews: 543,
    featured: true,
    brand: "Apple"
  },
  {
    name: "Beats Studio Pro",
    price: 349.99,
    category: "earphones",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop",
    description: "Premium wireless headphones with active noise cancelling, spatial audio, and 40-hour battery life.",
    inStock: true,
    stock: 28,
    rating: 4.6,
    reviews: 287,
    featured: false,
    brand: "Beats"
  },
  {
    name: "Google Pixel Watch 2",
    price: 349.99,
    category: "watches",
    image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop",
    description: "Google's smartwatch with Fitbit integration, advanced health sensors, and seamless Android integration.",
    inStock: true,
    stock: 32,
    rating: 4.5,
    reviews: 198,
    featured: false,
    brand: "Google"
  },
  {
    name: "Anker PowerCore 10000",
    price: 29.99,
    category: "accessories",
    image: "https://images.unsplash.com/photo-1609592806974-20b9e20b9dde?w=400&h=400&fit=crop",
    description: "Compact portable charger with 10000mAh capacity. Fast charging for phones, tablets, and earbuds.",
    inStock: true,
    stock: 150,
    rating: 4.7,
    reviews: 876,
    featured: true,
    brand: "Anker"
  },
  {
    name: "Nothing Ear (2)",
    price: 149.99,
    category: "earphones",
    image: "https://images.unsplash.com/photo-1609592804234-8f59aa8003c4?w=400&h=400&fit=crop",
    description: "Transparent earbuds with Hi-Res Audio certification, active noise cancellation, and unique design.",
    inStock: true,
    stock: 42,
    rating: 4.4,
    reviews: 312,
    featured: false,
    brand: "Nothing"
  },
  {
    name: "Amazfit GTR 4",
    price: 199.99,
    category: "watches",
    image: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=400&fit=crop",
    description: "Fitness smartwatch with 14-day battery life, 150+ sports modes, and comprehensive health monitoring.",
    inStock: true,
    stock: 38,
    rating: 4.6,
    reviews: 445,
    featured: false,
    brand: "Amazfit"
  },
  {
    name: "Phone Stand with Wireless Charging",
    price: 79.99,
    category: "accessories",
    image: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&h=400&fit=crop",
    description: "Adjustable phone stand with 15W fast wireless charging. Perfect for desk setup and video calls.",
    inStock: true,
    stock: 65,
    rating: 4.5,
    reviews: 234,
    featured: false,
    brand: "Generic"
  },
  {
    name: "Audio-Technica ATH-M50xBT2",
    price: 199.99,
    category: "earphones",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop",
    description: "Professional wireless headphones with studio-quality sound, 50-hour battery life, and low latency mode.",
    inStock: true,
    stock: 26,
    rating: 4.8,
    reviews: 567,
    featured: false,
    brand: "Audio-Technica"
  },
  {
    name: "Apple Watch SE (2nd Gen)",
    price: 249.99,
    category: "watches",
    image: "https://images.unsplash.com/photo-1606400082262-9f0d3068aa4c?w=400&h=400&fit=crop",
    description: "Essential Apple Watch features with crash detection, heart rate monitoring, and family setup support.",
    inStock: true,
    stock: 55,
    rating: 4.7,
    reviews: 389,
    featured: false,
    brand: "Apple"
  },
  {
    name: "Multi-Device Charging Station",
    price: 89.99,
    category: "accessories",
    image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=400&fit=crop",
    description: "Charge up to 6 devices simultaneously. Includes wireless charging pad and multiple USB ports.",
    inStock: true,
    stock: 45,
    rating: 4.6,
    reviews: 201,
    featured: false,
    brand: "Generic"
  },
  {
    name: "Xiaomi Redmi Buds 4 Pro",
    price: 69.99,
    category: "earphones",
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop",
    description: "Premium sound quality with 43dB active noise cancellation and 36-hour total playback time.",
    inStock: true,
    stock: 60,
    rating: 4.3,
    reviews: 445,
    featured: false,
    brand: "Xiaomi"
  },
  {
    name: "Suunto 9 Peak Pro",
    price: 569.99,
    category: "watches",
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&h=400&fit=crop",
    description: "Ultra-endurance GPS sports watch with titanium construction and up to 300 hours of GPS tracking.",
    inStock: true,
    stock: 12,
    rating: 4.9,
    reviews: 156,
    featured: true,
    brand: "Suunto"
  },
  {
    name: "Car Phone Mount with Wireless Charging",
    price: 59.99,
    category: "accessories",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    description: "Secure car mount with 15W fast wireless charging. Auto-grip technology and 360-degree rotation.",
    inStock: false,
    stock: 0,
    rating: 4.4,
    reviews: 178,
    featured: false,
    brand: "Generic"
  }
];

// Sample users
const users = [
  {
    name: "Demo User",
    email: "demo@techstore.com",
    password: "demo123456",
    role: "user",
    phone: "+1-555-0101",
    address: {
      street: "123 Demo Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      country: "United States"
    }
  },
  {
    name: "Admin User",
    email: "admin@techstore.com",
    password: "admin123456",
    role: "admin",
    phone: "+1-555-0102",
    address: {
      street: "456 Admin Avenue",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "United States"
    }
  },
  {
    name: "John Doe",
    email: "john.doe@email.com",
    password: "password123",
    role: "user",
    phone: "+1-555-0103",
    address: {
      street: "789 Customer Lane",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      country: "United States"
    }
  }
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'techstore',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Product.deleteMany({});
    await User.deleteMany({});

    // Seed products
    console.log('📦 Seeding products...');
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products`);

    // Seed users
    console.log('👥 Seeding users...');
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Products: ${createdProducts.length}`);
    console.log(`   Users: ${createdUsers.length}`);
    
    console.log('\n🔐 Demo Credentials:');
    console.log('   Demo User: demo@techstore.com / demo123456');
    console.log('   Admin User: admin@techstore.com / admin123456');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
