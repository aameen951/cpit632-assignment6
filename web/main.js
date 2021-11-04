const express = require('express');
const dns = require('dns');

const app = express();

const PORT = process.env.PORT || 5550;
const PRODUCT_HOST = process.env.PRODUCT_HOST;
const SHIPPING_HOST = process.env.SHIPPING_HOST;
const BEST_SELLING_HOST = process.env.BEST_SELLING_HOST;
const PRODUCT_PORT = process.env.PRODUCT_PORT;
const SHIPPING_PORT = process.env.SHIPPING_PORT;
const BEST_SELLING_PORT = process.env.BEST_SELLING_PORT;

const PRODUCT_DOMAIN = `${PRODUCT_HOST}:${PRODUCT_PORT}`;
const SHIPPING_DOMAIN = `${SHIPPING_HOST}:${SHIPPING_PORT}`;
const BEST_SELLING_DOMAIN = `${BEST_SELLING_HOST}:${BEST_SELLING_PORT}`;

const lib = `
  async function rq(method, path, data) {
    const headers = {};
    if(method !== 'GET' && data)headers['Content-Type'] = 'application/json';
    const response = await fetch(path, {method, headers, body: data ? JSON.stringify(data) : undefined});
    return response.json();
  }
`;

app.get("/", async (req, res, next) => {
  // const crap = await dns.promises.lookup('product-vm', {family: 0});
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
    </head>
    <body>
      <h2>Home</h2>
      <div><a href="/products">Products</a></div>
      <div><a href="/ordering">Ordering</a></div>
      <div><a href="/best-selling">Best Selling</a></div>
    </body>
    </html>
  `);
  next();
});
app.get("/products", async (req, res, next) => {
  // const crap = await dns.promises.lookup('product-vm', {family: 0});
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <script>
        ${lib}
        async function push_product(p) {
          const el = document.createElement('tr');
          const td1 = document.createElement('td');
          const td2 = document.createElement('td');
          const td3 = document.createElement('td');
          const td4 = document.createElement('td');

          td2.innerText = p.id;
          td3.innerText = p.name;
          const btn = document.createElement('button');
          btn.innerText = "x";
          td1.appendChild(btn);

          const btn2 = document.createElement('button');
          btn2.innerText = "+";
          td4.appendChild(btn2);

          el.appendChild(td1);
          el.appendChild(td2);
          el.appendChild(td3);
          el.appendChild(td4);
          btn.onclick= async () => {
            rq('DELETE', "http://${PRODUCT_DOMAIN}/api/product/"+p.id);
            el.parentElement.removeChild(el);
          }
          btn2.onclick= async () => {
            rq('POST', "http://${SHIPPING_DOMAIN}/api/order", {product_id: p.id});
          }
          products_el.appendChild(el);
        }
        async function new_product() {
          const products = await rq('PUT', "http://${PRODUCT_DOMAIN}/api/product", {"name":product_name_el.value});
          for(let p of products) push_product(p);
          product_name_el.value = "";
        }
      </script>
    </head>
    <body>
      <h2>Products</h2>
      <div><a href="/">< Back</a></div>
      <div>Product name: <input id="product_name_el"><button onclick="new_product()">+</button></div>
      <table id="products_el">
        <tr><th></th><th>#</th><th>Name</th><th>Order</th></tr>
      </table>
      <script>
        rq('GET', 'http://${PRODUCT_DOMAIN}/api/product').then(res => {
          for(let p of res) push_product(p);
        });
      </script>
    </body>
    </html>
  `);
  next();
});
app.get("/ordering", async (req, res, next) => {
  // const crap = await dns.promises.lookup('product-vm', {family: 0});
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <script>
        ${lib}

        function update_delivered(o, el){
          if(o.delivered) {
            el.children[2].children[0].style.display = "none";
            el.children[2].children[1].style.display = "block";
          } else {
            el.children[2].children[0].style.display = "block";
            el.children[2].children[1].style.display = "none";
          }
        }
        async function push_order(o) {
          const el = document.createElement('tr');
          const td1 = document.createElement('td');
          const td2 = document.createElement('td');
          const td3 = document.createElement('td');
          const td4 = document.createElement('td');

          td1.innerText = o.id;
          td2.innerText = o.product_name;

          const btn = document.createElement('button');
          btn.onclick= async () => {
            await rq('POST', 'http://${SHIPPING_DOMAIN}/api/order/deliver/'+o.id);
            o.delivered = true;
            update_delivered(o, el);
          }
          btn.innerText = "Deliver";
          td3.appendChild(btn);
          const spn = document.createElement('span');
          spn.innerText = "Delivered";
          td3.appendChild(spn);

          el.appendChild(td1);
          el.appendChild(td2);
          el.appendChild(td3);

          update_delivered(o, el);

          orders_el.appendChild(el);
        }
      </script>
    </head>
    <body>
      <h2>Orders</h2>
      <div><a href="/">< Back</a></div>
      <table id="orders_el">
        <tr><th>#</th><th>Product Name</th><th>Delivered</th></tr>
      </table>
      <script>
        rq('GET', 'http://${SHIPPING_DOMAIN}/api/order').then(res => {
          for(let o of res) push_order(o);
        });
      </script>
    </body>
    </html>
  `);
  next();
});
app.get("/best-selling", async (req, res, next) => {
  // const crap = await dns.promises.lookup('product-vm', {family: 0});
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
    <script>
      ${lib}
      function push_row(r){
        const el = document.createElement('tr');
        const td1 = document.createElement('td');
        const td2 = document.createElement('td');
        const td3 = document.createElement('td');
        td1.innerText = r.product_id;
        td2.innerText = r.product_name;
        td3.innerText = r.sold;
        el.appendChild(td1);
        el.appendChild(td2);
        el.appendChild(td3);
        records_el.appendChild(el);
      }
    </script>
    </head>
    <body>
      <h2>Best Selling</h2>
      <div><a href="/">< Back</a></div>
      <table id="records_el">
        <tr><th>#</th><th>Product Name</th><th>Sold</th></tr>
      </table>
      <script>
      rq('GET', 'http://${BEST_SELLING_DOMAIN}/api/best-selling').then(res => {
        for(let o of res) push_row(o);
      });
      </script>
  </body>
    </html>
  `);
  next();
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});