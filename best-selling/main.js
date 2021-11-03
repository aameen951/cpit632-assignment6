const express = require('express');
const cors = require('cors');
const db_client = require('mariadb');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5553;

const db_pool = db_client.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || "username",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_DATABASE || "db_name",
});

async function migrate(db){
}

app.use(async (req, res, next) => {
  req.db = await db_pool.getConnection();
  next();
  await req.db.release();
});

app.get("/api/best-selling", async (req, res, next) => {
  const result = await req.db.query("SELECT product_id, product_name, count(*) as sold FROM orders group by product_id order by sold desc;");
  res.json(result);
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