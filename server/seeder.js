const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const colors   = require('colors');
const connectDB = require('./config/db');
const Category  = require('./models/Category');
const Product   = require('./models/Product');
const User      = require('./models/User');

dotenv.config();
connectDB();

const categories = [
  { name:'Vegetables',    slug:'vegetables',  emoji:'🥦', color:'#d8f3dc', sortOrder:1 },
  { name:'Fruits',        slug:'fruits',      emoji:'🍎', color:'#fff3e0', sortOrder:2 },
  { name:'Dairy & Eggs',  slug:'dairy-eggs',  emoji:'🥛', color:'#e0f4ff', sortOrder:3 },
  { name:'Grains',        slug:'grains',      emoji:'🌾', color:'#fef9c3', sortOrder:4 },
  { name:'Bakery',        slug:'bakery',      emoji:'🍞', color:'#fce8d8', sortOrder:5 },
  { name:'Oils & Spices', slug:'oils-spices', emoji:'🫙', color:'#f3e8ff', sortOrder:6 },
  { name:'Snacks',        slug:'snacks',      emoji:'🍿', color:'#fde8e8', sortOrder:7 },
  { name:'Beverages',     slug:'beverages',   emoji:'🧃', color:'#e0f5f4', sortOrder:8 },
];

const seedData = async () => {
  try {
    await Category.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    const cats = await Category.insertMany(categories);
    const catMap = cats.reduce((m,c) => ({ ...m, [c.slug]: c._id }), {});

    const admin = await User.create({ name:'Admin User', email:'admin@grocify.in', password:'admin123', role:'admin' });
    console.log(`✅ Admin: admin@grocify.in / admin123`.green);

    const products = [
      { name:'Organic Tomatoes',  slug:'organic-tomatoes',   emoji:'🍅', price:45,  originalPrice:60,  unit:'per kg',    category:catMap['vegetables'],  badge:'sale',   stock:82,  isFeatured:true,  sold:340, description:'Farm-picked organic tomatoes from Nasik. Rich in lycopene, no pesticides.', tags:['Organic','Fresh','Local'] },
      { name:'Alphonso Mangoes',  slug:'alphonso-mangoes',   emoji:'🥭', price:320, originalPrice:null, unit:'per kg',    category:catMap['fruits'],       badge:'best',   stock:18,  isFeatured:true,  sold:520, description:'Sun-ripened Alphonso mangoes from Ratnagiri. Intensely sweet and aromatic.', tags:['Seasonal','Premium','Sweet'] },
      { name:'Whole Wheat Bread', slug:'whole-wheat-bread',  emoji:'🍞', price:38,  originalPrice:45,  unit:'per loaf',  category:catMap['bakery'],       badge:'sale',   stock:54,  isFeatured:false, sold:210, description:'Freshly baked whole wheat bread, no preservatives.', tags:['Freshly Baked','No Preservatives'] },
      { name:'Farm Fresh Eggs',   slug:'farm-fresh-eggs',    emoji:'🥚', price:90,  originalPrice:null, unit:'per dozen', category:catMap['dairy-eggs'],   badge:'new',    stock:120, isFeatured:true,  sold:430, description:'Free-range eggs from healthy hens. Rich yolks.', tags:['Free Range','Protein-Rich'] },
      { name:'Basmati Rice',      slug:'basmati-rice',       emoji:'🌾', price:120, originalPrice:140, unit:'per kg',    category:catMap['grains'],       badge:'sale',   stock:200, isFeatured:true,  sold:680, description:'Premium long-grain Basmati from Himalayan foothills.', tags:['Premium','Aromatic','Aged'] },
      { name:'Fresh Paneer',      slug:'fresh-paneer',       emoji:'🧀', price:80,  originalPrice:null, unit:'per 200g', category:catMap['dairy-eggs'],   badge:null,     stock:45,  isFeatured:false, sold:290, description:'Soft creamy cottage cheese from full-fat cow\'s milk.', tags:['Fresh','Daily Made'] },
      { name:'Green Spinach',     slug:'green-spinach',      emoji:'🥬', price:25,  originalPrice:35,  unit:'per bunch', category:catMap['vegetables'],  badge:'sale',   stock:65,  isFeatured:false, sold:180, description:'Tender baby spinach, washed and ready to cook.', tags:['Organic','Iron-Rich'] },
      { name:'Virgin Coconut Oil',slug:'virgin-coconut-oil', emoji:'🥥', price:185, originalPrice:220, unit:'per 500ml',category:catMap['oils-spices'],  badge:'sale',   stock:30,  isFeatured:false, sold:210, description:'Cold-pressed virgin coconut oil, 100% natural.', tags:['Virgin','Cold Pressed'] },
      { name:'Strawberries',      slug:'strawberries',       emoji:'🍓', price:150, originalPrice:null, unit:'per 250g', category:catMap['fruits'],       badge:'new',    stock:40,  isFeatured:true,  sold:145, description:'Plump juicy strawberries from Mahabaleshwar.', tags:['Seasonal','Fresh','Vitamin C'] },
      { name:'Masoor Dal',        slug:'masoor-dal',         emoji:'🫘', price:95,  originalPrice:110, unit:'per kg',    category:catMap['grains'],       badge:'sale',   stock:150, isFeatured:false, sold:320, description:'Premium red lentils, quick to cook.', tags:['Protein-Rich','Quick Cook'] },
      { name:'Amul Butter',       slug:'amul-butter',        emoji:'🧈', price:58,  originalPrice:null, unit:'per 100g', category:catMap['dairy-eggs'],   badge:null,     stock:80,  isFeatured:false, sold:610, description:'India\'s most loved butter, creamy and rich.', tags:['Pasteurised','Creamy'] },
      { name:'Bananas',           slug:'bananas',            emoji:'🍌', price:40,  originalPrice:null, unit:'per dozen',category:catMap['fruits'],       badge:'best',   stock:200, isFeatured:true,  sold:780, description:'Ripe yellow bananas, naturally sweet.', tags:['Energy','Potassium'] },
    ];

    await Product.insertMany(products);
    console.log(`✅ ${products.length} products seeded`.green);
    console.log('🎉 Database seeded successfully!'.cyan.bold);
    process.exit(0);
  } catch (err) {
    console.error(`❌ Seed error: ${err.message}`.red.bold);
    process.exit(1);
  }
};

const destroyData = async () => {
  await Category.deleteMany();
  await Product.deleteMany();
  await User.deleteMany();
  console.log('🗑  Data cleared'.red.bold);
  process.exit(0);
};

process.argv[2] === '-d' ? destroyData() : seedData();
