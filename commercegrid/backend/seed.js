require('dotenv').config();
const { sequelize, Category, Product, User } = require('./models');

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

const SAMPLE_PRODUCTS = [
  {
    title: 'Apple iPhone 15 Pro Max 256GB Natural Titanium',
    description: 'Brand new iPhone 15 Pro Max with A17 Pro chip, titanium design, and 48MP camera system.',
    price: 134900, originalPrice: 159900,
    brand: 'Apple', condition: 'new', isFeatured: true, stock: 10,
    tags: ['iphone', 'apple', 'smartphone', '5g'],
    city: 'Mumbai', state: 'Maharashtra',
    images: [{ url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600', isPrimary: true, order: 0 }],
  },
  {
    title: 'Samsung Galaxy S24 Ultra 512GB Titanium Black',
    description: 'Galaxy S24 Ultra with built-in S Pen, 200MP camera, and Snapdragon 8 Gen 3 processor.',
    price: 129999, originalPrice: 149999,
    brand: 'Samsung', condition: 'new', isFeatured: true, stock: 8,
    tags: ['samsung', 'galaxy', 'android', 's-pen'],
    city: 'Delhi', state: 'Delhi',
    images: [{ url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600', isPrimary: true, order: 0 }],
  },
  {
    title: 'MacBook Pro 14" M3 Pro 18GB/512GB Space Black',
    description: 'MacBook Pro with M3 Pro chip, Liquid Retina XDR display, 18GB unified memory.',
    price: 198900, originalPrice: 229900,
    brand: 'Apple', condition: 'new', isFeatured: true, stock: 5,
    tags: ['macbook', 'apple', 'laptop', 'm3'],
    city: 'Bengaluru', state: 'Karnataka',
    images: [{ url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600', isPrimary: true, order: 0 }],
  },
  {
    title: 'Dell XPS 15 Intel Core i7 RTX 4060 16GB/512GB',
    description: 'Dell XPS 15 with 4K OLED display, dedicated RTX 4060 GPU, perfect for creators.',
    price: 149990, originalPrice: 175990,
    brand: 'Dell', condition: 'new', stock: 6,
    tags: ['dell', 'xps', 'laptop', 'gaming'],
    city: 'Hyderabad', state: 'Telangana',
    images: [{ url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80', isPrimary: true, order: 0 }],
  },
  {
    title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    description: 'Industry-leading noise cancellation with 30-hour battery life and multipoint connection.',
    price: 24990, originalPrice: 34990,
    brand: 'Sony', condition: 'new', isFeatured: true, stock: 20,
    tags: ['sony', 'headphones', 'wireless', 'anc'],
    city: 'Pune', state: 'Maharashtra',
    images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80', isPrimary: true, order: 0 }],
  },
  {
    title: 'Apple AirPods Pro (2nd Gen) with MagSafe Case',
    description: 'AirPods Pro with up to 2x more Active Noise Cancellation, Adaptive Audio.',
    price: 24900, originalPrice: 26900,
    brand: 'Apple', condition: 'new', stock: 15,
    tags: ['airpods', 'apple', 'earbuds', 'anc'],
    city: 'Chennai', state: 'Tamil Nadu',
    images: [{ url: 'https://images.unsplash.com/photo-1606741965326-cb990ae01bb2?w=600&q=80', isPrimary: true, order: 0 }],
  },
  {
    title: 'Canon EOS R50 Mirrorless Camera with RF-S 18-45mm Lens',
    description: 'Compact mirrorless camera with 24.2MP APS-C sensor, 4K video, and Dual Pixel CMOS AF.',
    price: 72995, originalPrice: 84995,
    brand: 'Canon', condition: 'new', isFeatured: true, stock: 4,
    tags: ['canon', 'camera', 'mirrorless', '4k'],
    city: 'Kolkata', state: 'West Bengal',
    images: [{ url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80', isPrimary: true, order: 0 }],
  },
  {
    title: 'Nike Air Max 270 Running Shoes (Size 42)',
    description: 'Iconic Air Max 270 with 270° Air unit for all-day comfort and bold style.',
    price: 11995, originalPrice: 14995,
    brand: 'Nike', condition: 'new', stock: 25,
    tags: ['nike', 'shoes', 'running', 'sneakers'],
    city: 'Jaipur', state: 'Rajasthan',
    images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', isPrimary: true, order: 0 }],
  },
  {
    title: 'Atomic Habits — James Clear (Paperback)',
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones. International bestseller.',
    price: 349, originalPrice: 499,
    brand: 'Penguin', condition: 'new', stock: 50,
    tags: ['book', 'self-help', 'habits', 'bestseller'],
    city: 'Ahmedabad', state: 'Gujarat',
    images: [{ url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80', isPrimary: true, order: 0 }],
  },
  {
    title: 'PlayStation 5 Console (Disc Edition)',
    description: 'Next-gen gaming with 4K gaming, haptic feedback DualSense controller, and ultra-fast SSD.',
    price: 49990, originalPrice: 54990,
    brand: 'Sony', condition: 'new', isFeatured: true, stock: 3,
    tags: ['ps5', 'sony', 'gaming', 'console'],
    city: 'Mumbai', state: 'Maharashtra',
    images: [{ url: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&q=80', isPrimary: true, order: 0 }],
  },
  {
    title: 'LG 55" 4K OLED Smart TV (C3 Series)',
    description: 'Evo OLED panel with α9 AI Processor 4K, Dolby Vision, Dolby Atmos, webOS.',
    price: 109990, originalPrice: 139990,
    brand: 'LG', condition: 'new', stock: 4,
    tags: ['lg', 'tv', 'oled', '4k', 'smart-tv'],
    city: 'Bengaluru', state: 'Karnataka',
    images: [{ url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834e?w=600&q=80', isPrimary: true, order: 0 }],
  },
  {
    title: 'Dyson V15 Detect Cordless Vacuum Cleaner',
    description: 'Laser reveals invisible dust. Up to 60 min run time. LCD screen shows what you remove.',
    price: 57900, originalPrice: 62900,
    brand: 'Dyson', condition: 'new', isFeatured: true, stock: 7,
    tags: ['dyson', 'vacuum', 'cordless', 'home'],
    city: 'Delhi', state: 'Delhi',
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', isPrimary: true, order: 0 }],
  },
];

const CATEGORY_MAP = {
  'Apple iPhone 15 Pro Max 256GB Natural Titanium': 'Mobiles',
  'Samsung Galaxy S24 Ultra 512GB Titanium Black': 'Mobiles',
  'MacBook Pro 14" M3 Pro 18GB/512GB Space Black': 'Laptops',
  'Dell XPS 15 Intel Core i7 RTX 4060 16GB/512GB': 'Laptops',
  'Sony WH-1000XM5 Wireless Noise Cancelling Headphones': 'Accessories',
  'Apple AirPods Pro (2nd Gen) with MagSafe Case': 'Accessories',
  'Canon EOS R50 Mirrorless Camera with RF-S 18-45mm Lens': 'Electronics',
  'Nike Air Max 270 Running Shoes (Size 42)': 'Fashion',
  'Atomic Habits — James Clear (Paperback)': 'Books',
  'PlayStation 5 Console (Disc Edition)': 'Gaming',
  'LG 55" 4K OLED Smart TV (C3 Series)': 'Electronics',
  'Dyson V15 Detect Cordless Vacuum Cleaner': 'Home Appliances',
};

async function seed() {
  await sequelize.sync({ force: true });
  console.log('✅ Database synced (dropped and recreated all tables)');

  // Create categories
  await Category.bulkCreate(CATEGORIES, { validate: true, individualHooks: true });
  const allCats = await Category.findAll();
  const catMap = {};
  allCats.forEach((c) => { catMap[c.name] = c.id; });
  console.log(`✅ Seeded ${allCats.length} categories`);

  // Create admin user
  const admin = await User.create({
    email: 'admin@commercegrid.com',
    password: 'Admin@123',
    firstName: 'Admin',
    lastName: 'CommerceGrid',
    role: 'admin',
  });
  console.log('✅ Admin user: admin@commercegrid.com / Admin@123');

  // Create products
  const productsData = SAMPLE_PRODUCTS.map((p) => ({
    ...p,
    categoryId: catMap[CATEGORY_MAP[p.title]],
    sellerId: admin.id,
    averageRating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
    reviewCount: Math.floor(Math.random() * 200 + 10),
    viewsCount: Math.floor(Math.random() * 2000 + 100),
  }));

  await Product.bulkCreate(productsData, { validate: true, individualHooks: true });
  console.log(`✅ Seeded ${productsData.length} products`);

  console.log('🎉 Database seeded successfully!');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
