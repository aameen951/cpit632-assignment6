const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 80;

app.get("/api/product", (req, res) => {
  res.json("Product");
});

app.listen(PORT);