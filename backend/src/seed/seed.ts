import { seedDatabase } from './seedData.js';

seedDatabase()
  .then(() => {
    console.log('🎉 Seeding process completed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
