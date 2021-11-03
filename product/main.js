const express = require('express');
const cors = require('cors');
const db_client = require('mariadb');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5551;

const db_pool = db_client.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || "username",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_DATABASE || "db_name",
});

async function migrate(db){
  await db.query("create or replace table products (id BIGINT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(256));");
}

app.use(async (req, res, next) => {
  req.db = await db_pool.getConnection();
  next();
  await req.db.release();
});

app.get("/api/product", async (req, res, next) => {
  res.json(await req.db.query("SELECT * from products;"));

  next();
});

app.put("/api/product", async (req, res, next) => {
  res.json(await req.db.query("INSERT INTO products (name) values (?) returning *;", [req.body.name]));
  next();
});
app.patch("/api/product/:id", async (req, res, next) => {
  const id = req.params.id;
  const name = req.body.name;

  res.json(await req.db.query("UPDATE products SET name = ? WHERE id = ?;", [name, id]));

  next();
});
app.delete("/api/product/:id", async (req, res, next) => {
  const id = req.params.id;

  res.json(await req.db.query("DELETE FROM products where id = ?;", id));

  next();
});
app.get("/api/product/:id", async (req, res, next) => {
  const id = req.params.id;
  res.json(await req.db.query("SELECT * from products where id = ?;", id));
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