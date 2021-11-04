const express = require('express');
const cors = require('cors');
const db_client = require('mariadb');

const app = express();
app.use(cors({origin: "*"}));
app.use(express.json());

const PORT = process.env.PORT || 5553;

async function migrate(db){
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

app.get("/api/best-selling", async (req, res, next) => {
  const result = await req.db.query("SELECT product_id, product_name, count(*) as sold FROM orders group by product_id order by sold desc;");
  res.json(result);
  next();
});

app.use(async (req, res, next) => {
  await req.db.close();
  next();
});
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});