const express = require('express');
require('dotenv').config();
require('./config/dbConfig');
const app = express();

app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/category', require('./routes/category'));
app.use('/api/products', require('./routes/product'));
app.use('/api/cart', require('./routes/cart'));

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})