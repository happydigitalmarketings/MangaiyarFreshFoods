// // pages/api/orders/create.js
// import connectDB from '../../../lib/db';
// import Order from '../../../models/Order';
// import Product from '../../../models/Product';
// import nodemailer from 'nodemailer';

// export default async function handler(req, res) {
//   try {
//     await connectDB();

//     if (req.method !== 'POST') {
//       return res.status(405).json({ message: 'Method not allowed' });
//     }


//     // Accept both 'shippingAddress' and 'customer' for compatibility
//     let { items, shippingAddress, customer, total, paymentMethod } = req.body;
//     if (!items?.length) {
//       return res.status(400).json({ message: 'Items are required' });
//     }
//     // Use customer as shippingAddress if shippingAddress is not provided
//     if (!shippingAddress && customer) {
//       shippingAddress = customer;
//     }
//     if (!shippingAddress) {
//       return res.status(400).json({ message: 'Shipping address is required' });
//     }
//     if (!total) {
//       return res.status(400).json({ message: 'Total is required' });
//     }
//     if (!paymentMethod) {
//       return res.status(400).json({ message: 'Payment method is required' });
//     }

//     // Ensure Order model is properly imported
//     if (!Order || !Order.create) {
//       throw new Error('Order model not properly initialized');
//     }

//     // Create the order
//     const order = await Order.create({
//       items,
//       shippingAddress,
//       total,
//       paymentMethod,
//       status: 'pending'
//     });

//     // Send order confirmation email to customer (best-effort)
//     (async () => {
//       try {
//         const toEmail = shippingAddress.email || shippingAddress.emailAddress || null;
//         if (!toEmail) return;

//         // Create transporter using SMTP env vars if available, otherwise use Ethereal (test SMTP)
//         let transporter;
//         let usingTestAccount = false;
//         console.log('process.env.SMTP_HOST', process.env.SMTP_HOST);
//         if (process.env.SMTP_HOST) {
//           transporter = nodemailer.createTransport({
//             host: process.env.SMTP_HOST,
//             port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
//             secure: process.env.SMTP_SECURE === 'true',
//             auth: process.env.SMTP_USER ? {
//               user: process.env.SMTP_USER,
//               pass: process.env.SMTP_PASS,
//             } : undefined,
//           });
//         } else {
//           // No SMTP configured — create an Ethereal test account and transporter
//           const testAccount = await nodemailer.createTestAccount();
//           transporter = nodemailer.createTransport({
//             host: 'smtp.ethereal.email',
//             port: 587,
//             secure: false,
//             auth: { user: testAccount.user, pass: testAccount.pass }
//           });
//           usingTestAccount = true;
//           console.log('No SMTP configured — using Ethereal test account for email preview');
//         }

//         const itemsHtml = (items || []).map(i => `
//           <tr>
//             <td style="padding:8px;border:1px solid #eee">${i.product?.name || i.name || ''}</td>
//             <td style="padding:8px;border:1px solid #eee;text-align:center">${i.qty}</td>
//             <td style="padding:8px;border:1px solid #eee;text-align:right">₹${(i.price||0).toLocaleString('en-IN')}</td>
//           </tr>`).join('');

//         const html = `
//           <h2>Thank you for your order</h2>
//           <p>Hi ${shippingAddress.name || shippingAddress.firstName || ''},</p>
//           <p>We have received your order. Order ID: <strong>#${String(order._id).slice(-6).toUpperCase()}</strong></p>
//           <table style="border-collapse:collapse;width:100%;margin-top:12px"> 
//             <thead>
//               <tr>
//                 <th style="padding:8px;border:1px solid #eee;text-align:left">Product</th>
//                 <th style="padding:8px;border:1px solid #eee;text-align:center">Qty</th>
//                 <th style="padding:8px;border:1px solid #eee;text-align:right">Price</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${itemsHtml}
//             </tbody>
//           </table>
//           <p style="text-align:right;font-weight:700">Total: ₹${(order.total||0).toLocaleString('en-IN')}</p>
//           <p>Shipping Address:</p>
//           <p>${shippingAddress.address || ''} ${shippingAddress.city || ''} ${shippingAddress.state || ''} ${shippingAddress.pin || ''}</p>
//           <p>If you have any questions, reply to this email.</p>
//         `;

//         const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER || `no-reply@${req.headers.host}`;
//         const mailOptions = {
//           from: fromEmail,
//           to: toEmail,
//           subject: `Order confirmation — ${process.env.SITE_NAME || 'Your Store'}`,
//           html,
//         };
//         // Verify transporter connection before sending — this surfaces DNS/auth errors early
//         try {
//           await transporter.verify();
//           console.log('SMTP transporter verified');
//         } catch (verifyErr) {
//           console.error('SMTP transporter verification failed:', verifyErr && verifyErr.message ? verifyErr.message : verifyErr);
//           // still attempt to send — sendMail will likely fail and be caught below
//         }
//         if (process.env.ADMIN_EMAIL) mailOptions.bcc = process.env.ADMIN_EMAIL;
//         const info = await transporter.sendMail(mailOptions);
//         if (usingTestAccount) {
//           const previewUrl = nodemailer.getTestMessageUrl(info);
//           console.log('Order confirmation preview URL:', previewUrl);
//         }
//       } catch (err) {
//         console.error('Failed to send order confirmation email:', err && err.message ? err.message : err);
//       }
//     })();

//   // Return the order ID and success flag
//   res.status(201).json({ success: true, orderId: order._id });
//   } catch (error) {
//     console.error('Order creation error:', error);
//     res.status(500).json({ message: 'Error creating order' });
//   }
// }


// pages/api/orders/create.js
import connectDB from '../../../lib/db';
import Order from '../../../models/Order';
import Product from '../../../models/Product';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  try {
    await connectDB();

    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    // Accept both 'shippingAddress' and 'customer' for compatibility
    let { items, shippingAddress, customer, total, paymentMethod } = req.body;
    
    if (!items?.length) {
      return res.status(400).json({ message: 'Items are required' });
    }
    
    // Use customer as shippingAddress if shippingAddress is not provided
    if (!shippingAddress && customer) {
      shippingAddress = customer;
    }
    
    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }
    
    if (!total) {
      return res.status(400).json({ message: 'Total is required' });
    }
    
    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }

    // Ensure Order model is properly imported
    if (!Order || !Order.create) {
      throw new Error('Order model not properly initialized');
    }

    // Enrich items with product details (title, image) for permanent storage
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const enrichedItem = { ...item };
        
        // Use provided values first, then fetch from database if not provided
        if (!enrichedItem.productTitle || !enrichedItem.productImage) {
          if (item.product) {
            try {
              const product = await Product.findById(item.product).select('title images');
              if (product) {
                enrichedItem.productTitle = enrichedItem.productTitle || product.title;
                enrichedItem.productImage = enrichedItem.productImage || product.images?.[0] || null;
                console.log(`✓ Enriched item with product: ${product.title}, image: ${enrichedItem.productImage ? 'yes' : 'no'}`);
              }
            } catch (err) {
              console.warn('Could not fetch product details for order item:', err.message);
            }
          }
        }
        
        return enrichedItem;
      })
    );

    console.log('Enriched items:', enrichedItems);

    // Create the order
    const order = await Order.create({
      items: enrichedItems,
      shippingAddress,
      total,
      paymentMethod,
      status: 'pending'
    });

    console.log('Order created:', order);

    // Send email BEFORE responding (critical for Vercel)
    await sendOrderConfirmationEmail(order, shippingAddress, items, req);

    // Send WhatsApp notification
    await sendWhatsAppNotification(order, shippingAddress, items);

    // Return the order ID and success flag
    res.status(201).json({ success: true, orderId: order._id });
    
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
}

// Separate function to send email
async function sendOrderConfirmationEmail(order, shippingAddress, items, req) {
  try {
    const toEmail = shippingAddress.email || shippingAddress.emailAddress || null;
    if (!toEmail) {
      console.log('No email address provided, skipping email');
      return;
    }

    // Create transporter
    let transporter;
    let usingTestAccount = false;
    
    console.log('SMTP_HOST configured:', !!process.env.SMTP_HOST);
    
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        // Add these for better reliability
        pool: false, // Disable connection pooling
        maxConnections: 1,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
      });
    } else {
      console.warn('SMTP not fully configured, using Ethereal test account');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
      usingTestAccount = true;
    }

    // Verify transporter connection
    try {
      await transporter.verify();
      console.log('SMTP transporter verified successfully');
    } catch (verifyErr) {
      console.error('SMTP verification failed:', verifyErr.message);
      throw verifyErr; // Don't proceed if verification fails
    }

    // Build email HTML
    const itemsHtml = (items || []).map(i => `
      <tr>
        <td style="padding:8px;border:1px solid #eee">${i.product?.name || i.name || ''}</td>
        <td style="padding:8px;border:1px solid #eee;text-align:center">${i.qty}</td>
        <td style="padding:8px;border:1px solid #eee;text-align:right">₹${(i.price||0).toLocaleString('en-IN')}</td>
      </tr>`).join('');

    const html = `
      <h2>Thank you for your order</h2>
      <p>Hi ${shippingAddress.name || shippingAddress.firstName || ''},</p>
      <p>We have received your order. Order ID: <strong>#${String(order._id).slice(-6).toUpperCase()}</strong></p>
      <table style="border-collapse:collapse;width:100%;margin-top:12px"> 
        <thead>
          <tr>
            <th style="padding:8px;border:1px solid #eee;text-align:left">Product</th>
            <th style="padding:8px;border:1px solid #eee;text-align:center">Qty</th>
            <th style="padding:8px;border:1px solid #eee;text-align:right">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <p style="text-align:right;font-weight:700">Total: ₹${(order.total||0).toLocaleString('en-IN')}</p>
      <p>Shipping Address:</p>
      <p>${shippingAddress.address || ''} ${shippingAddress.city || ''} ${shippingAddress.state || ''} ${shippingAddress.pin || ''}</p>
      <p>If you have any questions, reply to this email.</p>
    `;

    const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER || 'no-reply@yourstore.com';
    const mailOptions = {
      from: fromEmail,
      to: toEmail,
      subject: `Order confirmation — ${process.env.SITE_NAME || 'Your Store'}`,
      html,
    };

    if (process.env.ADMIN_EMAIL) {
      mailOptions.bcc = process.env.ADMIN_EMAIL;
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);

    if (usingTestAccount) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('Order confirmation preview URL:', previewUrl);
    }

    // Close transporter
    transporter.close();

  } catch (err) {
    console.error('Failed to send order confirmation email:', err.message);
    console.error('Full error:', err);
    // Don't throw - we don't want email failure to break order creation
  }
}

// Function to send WhatsApp notification
async function sendWhatsAppNotification(order, shippingAddress, items) {
  try {
    const customerPhone = shippingAddress?.phone;
    const adminPhone = process.env.WHATSAPP_ADMIN_NUMBER;

    if (!customerPhone && !adminPhone) {
      console.log('No WhatsApp numbers configured, skipping WhatsApp notification');
      return;
    }

    // Format items list
    const itemsList = (items || [])
      .map((i, idx) => `${idx + 1}. ${i.productTitle || i.name || 'Product'} - Qty: ${i.qty} @ ₹${i.price}`)
      .join('\n');

    // Create message
    const orderID = String(order._id).slice(-6).toUpperCase();
    const message = `🎉 *New Order Received!*\n\n*Order ID:* #${orderID}\n*Customer:* ${shippingAddress?.name || 'N/A'}\n*Phone:* ${customerPhone || 'N/A'}\n*Total:* ₹${(order.total || 0).toLocaleString('en-IN')}\n\n*Items:*\n${itemsList}\n\n*Address:*\n${shippingAddress?.address || ''}\n${shippingAddress?.city || ''} - ${shippingAddress?.pin || ''}`;

    // Send to admin if configured
    if (adminPhone) {
      await sendWhatsAppMessage(adminPhone, message);
      console.log('✓ WhatsApp notification sent to admin');
    }

    // Send confirmation to customer if configured
    if (customerPhone && process.env.WHATSAPP_SEND_TO_CUSTOMER === 'true') {
      const customerMessage = `👋 Hi ${shippingAddress?.name || 'there'}!\n\nYour order #${orderID} has been placed successfully! 🎉\n\nTotal: ₹${(order.total || 0).toLocaleString('en-IN')}\n\nWe'll notify you once it's dispatched. Thank you for your order! 😊`;
      await sendWhatsAppMessage(customerPhone, customerMessage);
      console.log('✓ WhatsApp confirmation sent to customer');
    }

  } catch (err) {
    console.error('Failed to send WhatsApp notification:', err.message);
    // Don't throw - we don't want WhatsApp failure to break order creation
  }
}

// Helper function to send WhatsApp message via Twilio
async function sendWhatsAppMessage(phoneNumber, message) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.warn('Twilio credentials not configured for WhatsApp');
      return;
    }

    // Ensure phone number is in E.164 format
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+91' + formattedPhone.slice(-10); // For Indian numbers
    } else if (!formattedPhone.startsWith('+91') && formattedPhone.length === 10) {
      formattedPhone = '+91' + formattedPhone;
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'From': `whatsapp:${fromNumber}`,
        'To': `whatsapp:${formattedPhone}`,
        'Body': message,
      }).toString(),
    });

    if (!response.ok) {
      throw new Error(`Twilio API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('WhatsApp message sent:', data.sid);

  } catch (err) {
    console.error('WhatsApp send error:', err.message);
    // Don't throw - graceful failure
  }