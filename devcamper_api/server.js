const express = require('express');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({path: './config/config.env'});

// declaring the app
const app = express();

// Routes
app.get('/', (req, res) => {
  // res.json( {name: 'Brad'} );
  res.status(200).json( { success: true, data: { id: 1 } });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on PORT ${PORT}`));