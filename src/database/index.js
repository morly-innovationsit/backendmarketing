const mongoose = require('mongoose');
require("dotenv").config();
// mongoose.connect(
//     "mongodb+srv://nisanthcp:Y3zb2XZZgvekWD4y@cluster0.v61kk.mongodb.net/Accurate10MongoImg?retryWrites=true&w=majority&appName=Cluster0",
//     {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//         tls: true
//     }
// );

mongoose.connect(
"mongodb+srv://" + process.env.MONGO_USER + ":" + process.env.MONGO_PASSWORD +  process.env.MONGO_URL ,
 {
  useNewUrlParser: true,
        useUnifiedTopology: true,
        tls: true
    }
);


// Handle connection events
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

module.exports = db;