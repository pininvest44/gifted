
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const delay = ms => new Promise(r => setTimeout(r, ms));

app.post('/api/bulk-stk', async (req, res) => {
  const { numbers, amount, reference } = req.body;
  const results = [];

  for (const phone of numbers) {
    try {
      const response = await axios.post(
        'https://mpesa.gifted.co.ke/api/payments/process',
        { phone_number: phone, amount },
        {
          headers: {
            Authorization: `Bearer ${process.env.GIFTED_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      results.push({ phone, status: 'SUCCESS', response: response.data, reference });
    } catch (e) {
      results.push({ phone, status: 'FAILED', error: e.message, reference });
    }

    await delay(2000);
  }

  fs.writeFileSync('./logs/transactions.json', JSON.stringify(results, null, 2));
  res.json(results);
});

app.listen(process.env.PORT || 3000);
