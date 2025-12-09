const mongoose = require('mongoose');
const dotenv = require('dotenv');
const RFP = require('../models/RFP');

// Load environment variables
dotenv.config();

const sampleRfps = [
  {
    title: 'Website Redesign Project',
    description: 'Complete redesign of company website with modern UI/UX',
    status: 'draft',
    deadline: new Date('2025-02-15'),
    budget: 10000,
    requirements: [
      'Responsive design',
      'Content Management System',
      'SEO optimization',
      'Contact form integration'
    ]
  },
  {
    title: 'E-commerce Platform Development',
    description: 'Build a full-featured e-commerce platform with payment integration',
    status: 'open',
    deadline: new Date('2025-03-01'),
    budget: 25000,
    requirements: [
      'Product catalog',
      'Shopping cart',
      'Payment gateway integration',
      'User accounts',
      'Order management'
    ]
  },
  {
    title: 'Mobile App Development',
    description: 'Cross-platform mobile application for iOS and Android',
    status: 'in_progress',
    deadline: new Date('2025-04-15'),
    budget: 35000,
    requirements: [
      'React Native',
      'Offline functionality',
      'Push notifications',
      'Social media integration'
    ]
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    // Clear existing data
    await RFP.deleteMany({});
    console.log('Cleared existing RFPs');

    // Insert sample data
    const createdRfps = await RFP.insertMany(sampleRfps);
    console.log(`Added ${createdRfps.length} sample RFPs`);

    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();
