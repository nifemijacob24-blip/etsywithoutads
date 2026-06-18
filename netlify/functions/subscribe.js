exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { email } = JSON.parse(event.body);

    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email is required' }) };
    }

    const sequenzyEndpoint = 'https://api.sequenzy.com/v1/subscribers';
    const sequenzyApiKey = process.env.SEQUENZY_API_KEY; 

    const response = await fetch(sequenzyEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sequenzyApiKey}`
      },
      body: JSON.stringify({
        email: email,
        tags: ['etsy_roadmap_lead']
      })
    });

    if (!response.ok) {
      console.error('Sequenzy Error:', await response.text());
      return { statusCode: response.status, body: JSON.stringify({ error: 'Failed to add subscriber' }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Subscriber captured' })
    };

  } catch (error) {
    console.error('Function Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};