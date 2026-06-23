/**
 * dev-server.js — Development server with in-memory MongoDB
 * Run this instead of server.js when you don't have MongoDB installed locally.
 * All data is seeded automatically on start and lives in memory.
 */
require('dotenv').config();
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

async function startDevServer() {
  console.log('🔄 Starting in-memory MongoDB...');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;
  console.log('✅ In-memory MongoDB ready at', uri);

  // Now require & start the main app
  await mongoose.connect(uri);
  console.log('✅ Mongoose connected to in-memory DB');

  // Auto-seed
  await seedDatabase();

  // Start express
  const express = require('express');
  const cors = require('cors');
  const helmet = require('helmet');
  const morgan = require('morgan');
  const rateLimit = require('express-rate-limit');
  const { errorHandler, notFound } = require('./middlewares/errorHandler');
  const authRoutes = require('./routes/authRoutes');
  const productRoutes = require('./routes/productRoutes');
  const categoryRoutes = require('./routes/categoryRoutes');

  const app = express();
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }));
  app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));

  app.get('/api/health', (req, res) => {
    res.json({ success: true, message: '🚀 CommerceGrid API running (in-memory DB)', version: '1.0.0' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use(notFound);
  app.use(errorHandler);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`\n🚀 CommerceGrid API (dev) → http://localhost:${PORT}`);
    console.log(`🗃️  Database: In-Memory MongoDB (data resets on restart)`);
    console.log(`👤 Admin login: admin@commercegrid.com / Admin@123\n`);
  });

  // Cleanup on exit
  process.on('SIGINT', async () => {
    await mongoose.disconnect();
    await mongod.stop();
    process.exit(0);
  });
}

// ── Seed Data ─────────────────────────────────────────────────
async function seedDatabase() {
  const Category = require('./models/Category');
  const Product = require('./models/Product');
  const User = require('./models/User');

  const CATEGORIES = [
    { name: 'Mobiles', icon: '📱', color: '#F97316', order: 0, description: 'Smartphones and mobile accessories' },
    { name: 'Laptops', icon: '💻', color: '#10B981', order: 1, description: 'Laptops, notebooks and accessories' },
    { name: 'Accessories', icon: '🎧', color: '#8B5CF6', order: 2, description: 'Earphones, chargers, cables and more' },
    { name: 'Electronics', icon: '🔌', color: '#3B82F6', order: 3, description: 'Cameras, TVs, smart devices' },
    { name: 'Fashion', icon: '👕', color: '#EC4899', order: 4, description: 'Clothing, footwear and apparel' },
    { name: 'Books', icon: '📚', color: '#6366F1', order: 5, description: 'Books, stationery and education' },
    { name: 'Sports', icon: '🏏', color: '#14B8A6', order: 6, description: 'Sports gear and fitness equipment' },
    { name: 'Furniture', icon: '🪑', color: '#F59E0B', order: 7, description: 'Home and office furniture' },
    { name: 'Gaming', icon: '🎮', color: '#EF4444', order: 8, description: 'Gaming consoles, games and accessories' },
    { name: 'Home Appliances', icon: '🏠', color: '#22C55E', order: 9, description: 'Kitchen and home appliances' },
  ];

  const cats = await Category.create(CATEGORIES);
  const catMap = {};
  cats.forEach((c) => { catMap[c.name] = c._id; });

  const admin = await User.create({
    email: 'admin@commercegrid.com',
    password: 'Admin@123',
    firstName: 'Admin',
    lastName: 'CommerceGrid',
    role: 'admin',
  });

  const PRODUCTS = [
    { title: 'Apple iPhone 15 Pro Max 256GB Natural Titanium', description: 'Brand new iPhone 15 Pro Max with A17 Pro chip, titanium design, and 48MP camera system. Includes USB-C fast charging.', price: 134900, originalPrice: 159900, brand: 'Apple', condition: 'new', isFeatured: true, stock: 10, tags: ['iphone','apple','smartphone','5g'], city: 'Mumbai', state: 'Maharashtra', catName: 'Mobiles', images: [{ url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80', isPrimary: true, order: 0 }] },
    { title: 'Samsung Galaxy S24 Ultra 512GB Titanium Black', description: 'Galaxy S24 Ultra with built-in S Pen, 200MP camera, and Snapdragon 8 Gen 3 processor. AI-powered features.', price: 129999, originalPrice: 149999, brand: 'Samsung', condition: 'new', isFeatured: true, stock: 8, tags: ['samsung','galaxy','android','s-pen'], city: 'Delhi', state: 'Delhi', catName: 'Mobiles', images: [{ url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80', isPrimary: true, order: 0 }] },
    { title: 'OnePlus 12 16GB/512GB Silky Black', description: 'OnePlus 12 with Snapdragon 8 Gen 3, 50W wireless charging, and Hasselblad camera system.', price: 64999, originalPrice: 69999, brand: 'OnePlus', condition: 'new', stock: 15, tags: ['oneplus','android','5g'], city: 'Bengaluru', state: 'Karnataka', catName: 'Mobiles', images: [{ url: 'https://images.unsplash.com/photo-1598327105854-c8674faddf79?w=600&q=80', isPrimary: true, order: 0 }] },
    { title: 'MacBook Pro 14" M3 Pro 18GB/512GB Space Black', description: 'MacBook Pro with M3 Pro chip, Liquid Retina XDR display, 18GB unified memory. Perfect for developers and creators.', price: 198900, originalPrice: 229900, brand: 'Apple', condition: 'new', isFeatured: true, stock: 5, tags: ['macbook','apple','laptop','m3'], city: 'Bengaluru', state: 'Karnataka', catName: 'Laptops', images: [{ url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80', isPrimary: true, order: 0 }] },
    { title: 'Dell XPS 15 Intel Core i7 RTX 4060 16GB/512GB', description: 'Dell XPS 15 with 4K OLED display, dedicated RTX 4060 GPU, perfect for creators and gamers.', price: 149990, originalPrice: 175990, brand: 'Dell', condition: 'new', stock: 6, tags: ['dell','xps','laptop','gaming'], city: 'Hyderabad', state: 'Telangana', catName: 'Laptops', images: [{ url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80', isPrimary: true, order: 0 }] },
    { title: 'HP Spectre x360 14" Touch 16GB/1TB', description: 'Premium 2-in-1 laptop with OLED display, Intel Core Ultra 7, and 17-hour battery life.', price: 179990, originalPrice: 199990, brand: 'HP', condition: 'new', stock: 4, tags: ['hp','spectre','2-in-1','touch'], city: 'Chennai', state: 'Tamil Nadu', catName: 'Laptops', images: [{ url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80', isPrimary: true, order: 0 }] },
    { title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones', description: 'Industry-leading noise cancellation with 30-hour battery life, multipoint connection, and Speak-to-Chat.', price: 24990, originalPrice: 34990, brand: 'Sony', condition: 'new', isFeatured: true, stock: 20, tags: ['sony','headphones','wireless','anc'], city: 'Pune', state: 'Maharashtra', catName: 'Accessories', images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80', isPrimary: true, order: 0 }] },
    { title: 'Apple AirPods Pro (2nd Gen) with MagSafe Case', description: 'AirPods Pro with up to 2x more Active Noise Cancellation, Adaptive Audio, and USB-C charging.', price: 24900, originalPrice: 26900, brand: 'Apple', condition: 'new', stock: 15, tags: ['airpods','apple','earbuds','anc'], city: 'Chennai', state: 'Tamil Nadu', catName: 'Accessories', images: [{ url: 'https://images.unsplash.com/photo-1606741965326-cb990ae01bb2?w=600&q=80', isPrimary: true, order: 0 }] },
    { title: 'Anker 100W GaN USB-C Charger (4 Ports)', description: '100W GaN fast charger with 4 ports, charges MacBook Pro, iPad, iPhone, and more simultaneously.', price: 3999, originalPrice: 5999, brand: 'Anker', condition: 'new', stock: 50, tags: ['charger','gan','usb-c','fast-charging'], city: 'Jaipur', state: 'Rajasthan', catName: 'Accessories', images: [{ url: 'https://images.unsplash.com/photo-1609592806596-b8e5d0e80a87?w=600&q=80', isPrimary: true, order: 0 }] },
    { title: 'Canon EOS R50 Mirrorless Camera with RF-S 18-45mm', description: 'Compact mirrorless camera with 24.2MP APS-C sensor, 4K video, and Dual Pixel CMOS AF II.', price: 72995, originalPrice: 84995, brand: 'Canon', condition: 'new', isFeatured: true, stock: 4, tags: ['canon','camera','mirrorless','4k'], city: 'Kolkata', state: 'West Bengal', catName: 'Electronics', images: [{ url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80', isPrimary: true, order: 0 }] },
    { title: 'LG 55" 4K OLED Smart TV C3 Series', description: 'Evo OLED panel with α9 AI Processor 4K Gen6, Dolby Vision IQ, Dolby Atmos, webOS 23, and ThinQ AI.', price: 109990, originalPrice: 139990, brand: 'LG', condition: 'new', stock: 4, tags: ['lg','tv','oled','4k','smart-tv'], city: 'Bengaluru', state: 'Karnataka', catName: 'Electronics', images: [{ url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834e?w=600&q=80', isPrimary: true, order: 0 }] },
    { title: 'Nike Air Max 270 Running Shoes — Size 42', description: 'Iconic Air Max 270 with 270° Air unit for all-day comfort, engineered mesh upper, and bold colorway.', price: 11995, originalPrice: 14995, brand: 'Nike', condition: 'new', stock: 25, tags: ['nike','shoes','running','sneakers'], city: 'Jaipur', state: 'Rajasthan', catName: 'Fashion', images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', isPrimary: true, order: 0 }] },
    { title: 'Levi\'s 511 Slim Fit Jeans — Dark Wash 32x30', description: 'Classic Levi\'s 511 slim fit jeans with dark wash, stretch denim fabric for all-day comfort.', price: 2999, originalPrice: 4999, brand: "Levi's", condition: 'new', stock: 30, tags: ['levis','jeans','denim','fashion'], city: 'Mumbai', state: 'Maharashtra', catName: 'Fashion', images: [{ url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80', isPrimary: true, order: 0 }] },
    { title: 'Atomic Habits — James Clear (Paperback)', description: 'International bestseller. An Easy & Proven Way to Build Good Habits & Break Bad Ones. Over 10 million copies sold.', price: 349, originalPrice: 499, brand: 'Penguin Random House', condition: 'new', stock: 100, tags: ['book','self-help','habits','bestseller'], city: 'Ahmedabad', state: 'Gujarat', catName: 'Books', images: [{ url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80', isPrimary: true, order: 0 }] },
    { title: 'The Psychology of Money — Morgan Housel', description: 'Timeless lessons on wealth, greed, and happiness. One of the most important finance books of the decade.', price: 399, originalPrice: 599, brand: 'Jaico Publishing', condition: 'new', stock: 75, tags: ['book','finance','money','investing'], city: 'Hyderabad', state: 'Telangana', catName: 'Books', images: [{ url: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&q=80', isPrimary: true, order: 0 }] },
    { title: 'PlayStation 5 Console (Disc Edition)', description: 'Next-gen gaming with 4K output, 120fps support, ray tracing, haptic feedback DualSense controller, ultra-fast SSD.', price: 49990, originalPrice: 54990, brand: 'Sony', condition: 'new', isFeatured: true, stock: 3, tags: ['ps5','sony','gaming','console'], city: 'Mumbai', state: 'Maharashtra', catName: 'Gaming', images: [{ url: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&q=80', isPrimary: true, order: 0 }] },
    { title: 'Xbox Series X 1TB Console', description: 'Most powerful Xbox ever. 4K gaming at 60fps, up to 120fps, Game Pass Ultimate included for 1 month.', price: 49990, originalPrice: 52990, brand: 'Microsoft', condition: 'new', stock: 5, tags: ['xbox','microsoft','gaming','console'], city: 'Delhi', state: 'Delhi', catName: 'Gaming', images: [{ url: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600&q=80', isPrimary: true, order: 0 }] },
    { title: 'Dyson V15 Detect Cordless Vacuum Cleaner', description: 'Laser reveals invisible dust. LCD screen shows what you remove. Up to 60 min run time. Includes 11 accessories.', price: 57900, originalPrice: 62900, brand: 'Dyson', condition: 'new', isFeatured: true, stock: 7, tags: ['dyson','vacuum','cordless','home'], city: 'Delhi', state: 'Delhi', catName: 'Home Appliances', images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', isPrimary: true, order: 0 }] },
    { title: 'Philips Air Fryer XXL HD9650 (7.3L)', description: 'Fat Removal Technology removes and captures excess fat. Cooks up to 1.4kg of fries. Rapid Air technology.', price: 14995, originalPrice: 17995, brand: 'Philips', condition: 'new', stock: 12, tags: ['philips','air-fryer','kitchen','cooking'], city: 'Pune', state: 'Maharashtra', catName: 'Home Appliances', images: [{ url: 'https://images.unsplash.com/photo-1648501949905-49db9baae8a5?w=600&q=80', isPrimary: true, order: 0 }] },
    { title: 'IKEA LAGKAPTEN Desk 140x60cm White', description: 'Large work surface gives you room for all your work equipment. Cable management inside desk panel.', price: 8999, originalPrice: 10999, brand: 'IKEA', condition: 'new', stock: 20, tags: ['ikea','desk','furniture','office'], city: 'Hyderabad', state: 'Telangana', catName: 'Furniture', images: [{ url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&q=80', isPrimary: true, order: 0 }] },
    { title: 'Decathlon Kipsta Football Size 5', description: 'FIFA quality football with thermobonded construction. Suitable for all surfaces. Sold by 30M+ players worldwide.', price: 899, originalPrice: 1299, brand: 'Decathlon', condition: 'new', stock: 80, tags: ['football','sports','decathlon','outdoor'], city: 'Bengaluru', state: 'Karnataka', catName: 'Sports', images: [{ url: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600&q=80', isPrimary: true, order: 0 }] },
    { title: 'Whey Protein Isolate 2kg Chocolate Fudge', description: '30g protein per serving, 0g sugar, 130 calories. Instantized for easy mixing. Third-party tested for purity.', price: 4499, originalPrice: 5999, brand: 'MuscleBlaze', condition: 'new', stock: 40, tags: ['protein','whey','fitness','gym'], city: 'Mumbai', state: 'Maharashtra', catName: 'Sports', images: [{ url: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&q=80', isPrimary: true, order: 0 }] },
  ];

  const productsData = PRODUCTS.map((p) => {
    const { catName, ...rest } = p;
    return {
      ...rest,
      category: catMap[catName],
      seller: admin._id,
      averageRating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
      reviewCount: Math.floor(Math.random() * 300 + 20),
      viewsCount: Math.floor(Math.random() * 3000 + 100),
    };
  });

  await Product.create(productsData);
  console.log(`✅ Seeded ${cats.length} categories + ${productsData.length} products + 1 admin`);
}

startDevServer().catch((err) => {
  console.error('❌ Failed to start dev server:', err);
  process.exit(1);
});
