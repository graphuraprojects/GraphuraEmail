require('dotenv').config();

async function testBalance() {
  const endpoints = [
    'https://api.zeptomail.in/v1.1/accounts',
    'https://api.zeptomail.in/v1.1/credits',
    'https://api.zeptomail.in/v1.1/accounts/credits'
  ];

  for (const url of endpoints) {
    console.log(`Testing ${url}...`);
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': process.env.ZEPTOMAIL_API_KEY,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log(`Response from ${url}:`, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(`Error for ${url}:`, err.message);
    }
  }
}

testBalance();
