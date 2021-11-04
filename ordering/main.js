const express = require('express');
const cors = require('cors');
const db_client = require('mariadb');

const app = express();
app.use(cors({origin: "*"}));
app.use(express.json());

const PORT = process.env.PORT || 5552;

async function migrate(db){
  await db.query("CREATE TABLE IF NOT EXISTS orders (id BIGINT PRIMARY KEY AUTO_INCREMENT, product_id BIGINT, product_name VARCHAR(256), delivered BOOLEAN);");
}

async function db_connect(){
  const result = await db_client.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME || "username",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_DATABASE || "db_name",
  });
  return result;
}

app.use(async (req, res, next) => {
  req.db = await db_connect();
  await migrate(req.db);
  next();
});

app.post("/api/order", async (req, res, next) => {
  const product_id = req.body.product_id;

  const product = await req.db.query("SELECT name from products WHERE id = ?;", [product_id]);
  if(!product.length){
    res.status(404);
  } else {
    const product_name = product[0].name;
    res.json(await req.db.query("INSERT INTO orders (product_id, product_name, delivered) values (?, ?, false) returning *;", [product_id, product_name]));
  }

  next();
});
app.get("/api/order", async (req, res, next) => {
  res.json(await req.db.query("SELECT * FROM orders;"));
  next();
});
app.post("/api/order/deliver/:id", async (req, res, next) => {
  const order_id = req.params.id;
  await req.db.query("UPDATE orders SET delivered = TRUE WHERE id = ?;", [order_id]);
  res.json("");
  next();
});

app.use(async (req, res, next) => {
  await req.db.close();
  next();
});
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});