const nodemailer = require('nodemailer');

// Configure Brevo (Sendinblue) - Free tier
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: process.env.BREVO_EMAIL,
    pass: process.env.BREVO_API_KEY,
  },
});

exports.sendWelcomeEmail = async (email, firstName) => {
  try {
    const info = await transporter.sendMail({
      from: `"First Class Unique Boutique" <${process.env.BREVO_EMAIL}>`,
      to: email,
      subject: 'Welcome to First Class Unique Boutique! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome ${firstName}!</h1>
            </div>
            <div style="padding: 30px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6;">Thank you for joining the First Class Unique Boutique family! 🎉</p>
              <p style="color: #333; font-size: 16px; line-height: 1.6;">We're excited to have you with us. Here's a special gift for your first order:</p>
              <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <p style="color: #ffffff; font-size: 32px; letter-spacing: 4px; margin: 0; font-weight: bold;">WELCOME10</p>
              </div>
              <p style="color: #333; font-size: 16px; line-height: 1.6;">Use this code at checkout to get <strong>10% off</strong> your first purchase.</p>
              <div style="margin: 30px 0; text-align: center;">
                <a href="${process.env.FRONTEND_URL}/shop" style="background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Start Shopping →</a>
              </div>
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 20px;">Happy shopping!<br>The FCUB Team</p>
            </div>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #6c757d; font-size: 12px; margin: 0;">© 2026 First Class Unique Boutique. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log(`Welcome email sent to ${email}`);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

exports.sendOrderConfirmation = async (email, orderId, items, total) => {
  try {
    const itemsHtml = items.map(item => `
      <div style="border-bottom: 1px solid #e9ecef; padding: 15px 0; display: flex; gap: 15px;">
        <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
        <div style="flex: 1;">
          <p style="margin: 0 0 5px; font-weight: bold;">${item.name}</p>
          <p style="margin: 0; color: #6c757d; font-size: 14px;">Quantity: ${item.quantity} × ₦${item.price.toLocaleString()}</p>
          ${item.size ? `<p style="margin: 0; color: #6c757d; font-size: 14px;">Size: ${item.size}</p>` : ''}
        </div>
        <p style="margin: 0; font-weight: bold;">₦${(item.price * item.quantity).toLocaleString()}</p>
      </div>
    `).join('');

    const info = await transporter.sendMail({
      from: `"First Class Unique Boutique" <${process.env.BREVO_EMAIL}>`,
      to: email,
      subject: `Order Confirmation #${orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Order Confirmed! 🎉</h1>
            </div>
            <div style="padding: 30px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6;">Thank you for your purchase!</p>
              <p style="color: #333; font-size: 16px; line-height: 1.6;">Your order <strong>#${orderId}</strong> has been confirmed and is being processed.</p>
              
              <h3 style="color: #333; margin-top: 30px;">Order Summary:</h3>
              ${itemsHtml}
              
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 5px 0; display: flex; justify-content: space-between;">
                  <span>Subtotal:</span>
                  <strong>₦${total.toLocaleString()}</strong>
                </p>
                <p style="margin: 5px 0; display: flex; justify-content: space-between;">
                  <span>Shipping:</span>
                  <strong>Free</strong>
                </p>
                <hr style="margin: 10px 0;">
                <p style="margin: 5px 0; display: flex; justify-content: space-between; font-size: 18px;">
                  <strong>Total:</strong>
                  <strong style="color: #f97316;">₦${total.toLocaleString()}</strong>
                </p>
              </div>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 30px;">We'll notify you when your order ships.</p>
              <div style="margin: 30px 0; text-align: center;">
                <a href="${process.env.FRONTEND_URL}/account/orders" style="background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Track Your Order →</a>
              </div>
            </div>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #6c757d; font-size: 12px; margin: 0;">Need help? Contact us at ${process.env.BREVO_EMAIL}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log(`Order confirmation sent to ${email}`);
    return info;
  } catch (error) {
    console.error('Order confirmation email failed:', error);
    throw error;
  }
};