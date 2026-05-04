const express = require('express');
const axios = require('axios');

const router = express.Router();

// @route   POST /api/newsletter/subscribe
// @desc    Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Add to Brevo (Sendinblue) contact list
    const response = await axios.post(
      'https://api.brevo.com/v3/contacts',
      {
        email: email,
        listIds: [parseInt(process.env.BREVO_LIST_ID)],
        updateEnabled: true,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    // Send welcome email
    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        to: [{ email: email }],
        subject: 'Welcome to First Class Unique Boutique! 🎉',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; text-align: center; border-radius: 10px;">
                <h1 style="color: #ffffff; margin: 0;">Welcome to FCUB! 🎉</h1>
              </div>
              <div style="padding: 30px; background: #f8f9fa; border-radius: 10px; margin-top: 20px;">
                <p>Thank you for subscribing to our newsletter!</p>
                <p>You're now part of our exclusive community and will receive:</p>
                <ul>
                  <li>Early access to new collections</li>
                  <li>Exclusive discounts and promotions</li>
                  <li>Style tips and fashion inspiration</li>
                </ul>
                <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                  <p style="color: #ffffff; font-size: 24px; letter-spacing: 2px; margin: 0; font-weight: bold;">WELCOME10</p>
                </div>
                <p>Use code <strong>WELCOME10</strong> for 10% off your first order!</p>
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${process.env.FRONTEND_URL}/shop" style="background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Shop Now →</a>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({
      success: true,
      message: 'Successfully subscribed to newsletter! Check your email for a welcome gift.',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error.response?.data || error.message);
    
    // If already subscribed, still return success
    if (error.response?.data?.code === 'duplicate_parameter') {
      return res.json({
        success: true,
        message: 'You are already subscribed to our newsletter!',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Unable to subscribe. Please try again later.',
    });
  }
});

module.exports = router;