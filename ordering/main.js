const express = require('express');
const cors = require('cors');
const db_client = require('mariadb');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5552;

const db_pool = db_client.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || "username",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_DATABASE || "db_name",
});

async function migrate(db){
  await db.query("create or replace table orders (id BIGINT PRIMARY KEY AUTO_INCREMENT, product_id BIGINT, product_name VARCHAR(256), delivered BOOLEAN);");
}

app.use(async (req, res, next) => {
  req.db = await db_pool.getConnection();
  next();
  await req.db.release();
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

async function main() {
  const db = await db_pool.getConnection();
  try {
    await migrate(db);
  } catch {}
  db.release();
  app.listen(PORT);
}
main();