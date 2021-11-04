const express = require('express');
const cors = require('cors');
const db_client = require('mariadb');

const app = express();
app.use(cors({origin: "*"}));
app.use(express.json());

const PORT = process.env.PORT || 5551;

async function migrate(db){
  await db.query("create table IF NOT EXISTS products (id BIGINT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(256));");
}

async function db_connect(){
  return await db_client.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME || "username",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_DATABASE || "db_name",
  });
}

app.use(async (req, res, next) => {
  req.db = await db_connect();
  await migrate(req.db);
  next();
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

app.use(async (req, res, next) => {
  await req.db.close();
  next();
});
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
