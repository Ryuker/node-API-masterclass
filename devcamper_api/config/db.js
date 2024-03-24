const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParse: true,
    useCreateIndex: true,
    useFindAndMody: false
  });
};

console.log(`MongoDB connected: ${conn.connection.host}`);

module.exports = connectDB;