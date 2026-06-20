import Stripe from "stripe";

export const getStripeServer = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable. Please set it in Vercel settings.");
  }
  return new Stripe(secretKey, {
    apiVersion: "2024-04-10",
  });
};
