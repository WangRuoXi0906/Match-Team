const mongoose = require('mongoose');
require('dotenv').config();

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-competition';

mongoose.connect(DB_URI)
  .then(async () => {
    console.log('Connected to database');
    
    // 获取所有集合
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    // 删除所有集合中的数据
    for (const collection of collections) {
      await mongoose.connection.db.collection(collection.name).deleteMany({});
      console.log(`Cleared collection: ${collection.name}`);
    }
    
    console.log('All data cleared successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
