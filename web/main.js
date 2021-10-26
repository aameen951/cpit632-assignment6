const express = require('express');

const app = express();

const PORT = 80;
const PRODUCT_PORT = process.env.PRODUCT_PORT;
const SHIPPING_PORT = process.env.SHIPPING_PORT;

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
    </head>
    <body>
      WOW ${PRODUCT_PORT} ${SHIPPING_PORT}
      <script>
        const PRODUCT_PORT = ${PRODUCT_PORT};
        const SHIPPING_PORT = ${SHIPPING_PORT};

        (async function(){
          const res1 = await fetch(\`http://localhost:\${PRODUCT_PORT}/api/product\`);
          console.log(await res1.json());
        })();
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT);