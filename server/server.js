require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Load routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/contact', require('./routes/contact'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Seed data function
async function seedDatabase() {
  try {
    // 1. Seed Users (if empty)
    const userCount = db.users.find().length;
    if (userCount === 0) {
      console.log('Seeding initial users...');
      const salt = await bcrypt.genSalt(10);
      const adminPasswordHash = await bcrypt.hash('admin123', salt);
      const userPasswordHash = await bcrypt.hash('user123', salt);

      // Create admin
      db.users.create({
        name: 'Admin User',
        email: 'admin@infinityjewls.com',
        password: adminPasswordHash,
        role: 'admin'
      });

      // Create regular user
      db.users.create({
        name: 'Jane Doe',
        email: 'user@infinityjewls.com',
        password: userPasswordHash,
        role: 'user'
      });
      console.log('Users seeded: admin@infinityjewls.com (admin123), user@infinityjewls.com (user123)');
    }

    // 2. Seed Products (if empty)
    const productCount = db.products.find().length;
    if (productCount === 0) {
      console.log('Seeding initial products...');
      const seedProducts = [
        {
          name: 'Classic Diamond Engagement Ring',
          description: 'A stunning 1.5 carat round brilliant-cut solitaire diamond set in an elegant 18k white gold band. A timeless declaration of eternal love.',
          price: 2499.00,
          image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600',
          category: 'rings',
          stock: 5
        },
        {
          name: 'Infinity Gold Pendant Necklace',
          description: 'Crafted in 14k yellow gold, this necklace features a fluid infinity loop pendant set with micro-pave diamonds. Hanging from a matching 18-inch box chain.',
          price: 899.00,
          image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600',
          category: 'necklaces',
          stock: 8
        },
        {
          name: 'Royal Sapphire Tennis Bracelet',
          description: 'An exquisite arrangement of deep blue oval-cut royal sapphires alternated with shimmering round diamonds, linked by a polished platinum setting.',
          price: 3499.00,
          image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600',
          category: 'bracelets',
          stock: 3
        },
        {
          name: 'Emerald Cut Diamond Studs',
          description: 'Simple yet captivating stud earrings featuring matching emerald-cut conflict-free diamonds totaling 1.0 carat, secure in 4-prong white gold backings.',
          price: 1599.00,
          image: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=600',
          category: 'earrings',
          stock: 10
        },
        {
          name: 'Luxury Rose Gold Bangle',
          description: 'A solid 18k rose gold bangle with a modern wrap design, studded at the tips with exquisite channel-set baguette diamonds. Perfect for layering.',
          price: 1299.00,
          image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=600',
          category: 'bracelets',
          stock: 7
        },
        {
          name: 'Pearl Drop Earrings',
          description: 'Lustrous white freshwater cultured pearls suspended from delicate 18k yellow gold hooks encrusted with tiny brilliant-cut accent diamonds.',
          price: 499.00,
          image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600',
          category: 'earrings',
          stock: 12
        }
      ];

      for (const prod of seedProducts) {
        db.products.create(prod);
      }
      console.log('Seeded 6 luxury products.');
    }
  } catch (err) {
    console.error('Database seeding error:', err);
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await seedDatabase();
});
