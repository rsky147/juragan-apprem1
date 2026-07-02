const API_TOKEN = process.env.QRISPY_API_TOKEN;
const API_URL = 'https://api.qrispy.id';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = event.queryStringParameters?.action || 'generate';
  const qrisId = event.queryStringParameters?.qrisId || '';

  try {
    // Generate QRIS
    if (event.httpMethod === 'POST' && path === 'generate') {
      const body = JSON.parse(event.body || '{}');
      const { amount, payment_reference } = body;

      if (!amount || amount <= 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ status: 'error', message: 'Amount tidak valid' }),
        };
      }

      const response = await fetch(`${API_URL}/api/payment/qris/generate`, {
        method: 'POST',
        headers: {
          'X-API-Token': API_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          payment_reference: payment_reference || `JAP-${Date.now()}`,
          return_url: 'https://storejuraganapprem.netlify.app/',
        }),
      });

      const data = await response.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    // Cek status QRIS
    if (event.httpMethod === 'GET' && path === 'status' && qrisId) {
      const response = await fetch(`${API_URL}/api/payment/qris/${qrisId}/status`, {
        headers: { 'X-API-Token': API_TOKEN },
      });
      const data = await response.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    // Cancel QRIS
    if (event.httpMethod === 'POST' && path === 'cancel' && qrisId) {
      const response = await fetch(`${API_URL}/api/payment/qris/${qrisId}/cancel`, {
        method: 'POST',
        headers: { 'X-API-Token': API_TOKEN },
      });
      const data = await response.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ status: 'error', message: 'Invalid request' }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ status: 'error', message: err.message }),
    };
  }
};
