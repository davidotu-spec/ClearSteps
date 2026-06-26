import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import fs from "fs";
import * as admin from "firebase-admin";
import sgMail from "@sendgrid/mail";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Lazy initialize Firebase Admin
let adminDb: admin.firestore.Firestore | null = null;

function getAdminDb() {
  if (adminDb) return adminDb;
  
  try {
    const configPath = path.join(__dirname, "firebase-applet-config.json");
    if (!fs.existsSync(configPath)) {
      console.warn("firebase-applet-config.json not found.");
      return null;
    }
    
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
    
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: firebaseConfig.projectId,
      });
    }
    adminDb = admin.firestore(firebaseConfig.firestoreDatabaseId);
    return adminDb;
  } catch (err) {
    console.error("Firebase Admin Init Error:", err);
    return null;
  }
}

const stripe = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'MY_STRIPE_SECRET_KEY'
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-01-27.acacia" as any,
    }) 
  : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/create-checkout-session", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }

    try {
      const { userId, userEmail } = req.body;
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: {
                name: "ExactPath Elite Access",
                description: "Unlimited protocol generation and advanced features.",
              },
              unit_amount: 1200, // £12.00
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${process.env.APP_URL || 'http://localhost:3000'}?session_id={CHECKOUT_SESSION_ID}&upgrade=success`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}?upgrade=cancel`,
        customer_email: userEmail,
        metadata: {
          userId: userId,
        },
      });

      res.json({ id: session.id, url: session.url });
    } catch (err: any) {
      console.error("Stripe Session Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/verify-session", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }

    const { session_id } = req.query;
    if (!session_id || typeof session_id !== 'string') {
      return res.status(400).json({ error: "Session ID is required" });
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      
      if (session.payment_status === 'paid') {
        const userId = session.metadata?.userId;
        const db = getAdminDb();
        if (userId && db) {
          // Update user to Pro in Firestore and save Customer ID
          await db.collection('users').doc(userId).update({
            isPro: true,
            stripeCustomerId: session.customer
          });
          return res.json({ status: 'success', isPro: true });
        }
      }
      
      res.json({ status: 'pending', isPro: false });
    } catch (err: any) {
      console.error("Verify Session Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/create-portal-session", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }

    try {
      const { stripeCustomerId } = req.body;
      
      if (!stripeCustomerId) {
        return res.status(400).json({ error: "Stripe Customer ID is required" });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: process.env.APP_URL || 'http://localhost:3000',
      });

      res.json({ url: session.url });
    } catch (err: any) {
      console.error("Portal Session Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/contact", async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!process.env.SENDGRID_API_KEY) {
      console.warn("SendGrid API Key missing. Simulating email success.");
      return res.json({ status: "success", simulated: true });
    }

    try {
      const msg = {
        to: "info@mixxd.org",
        from: "info@mixxd.org", // Use the verified sender address
        replyTo: email,
        subject: `[ExactPath Contact] ${subject}: from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `
          <h3>New Contact Inquiry</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <br/>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br/>')}</p>
        `,
      };

      await sgMail.send(msg);
      res.json({ status: "success" });
    } catch (err: any) {
      console.error("SendGrid Error:", err);
      res.status(500).json({ error: "Failed to send email. Please try again later." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
