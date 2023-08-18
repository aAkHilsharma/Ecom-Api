const express = require('express');
require('dotenv').config();
require('./config/dbConfig');
const app = express();

app.use(express.json());

app.use('/api/users', require('./routes/auth'));
app.use("/api/categories", require("./routes/category"));
app.use('/api/products', require('./routes/product'));
app.use('/api/cart', require('./routes/cart'));
app.use("/api/orders", require("./routes/order"));

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})