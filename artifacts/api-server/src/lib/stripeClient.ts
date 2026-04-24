import Stripe from "stripe";

function getSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY omgevingsvariabele ontbreekt.");
  return key;
}

export function getPublishableKey(): string {
  const key = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!key) throw new Error("STRIPE_PUBLISHABLE_KEY omgevingsvariabele ontbreekt.");
  return key;
}

export function getStripeClient(): Stripe {
  return new Stripe(getSecretKey(), { apiVersion: "2025-08-27.basil" as any });
}

export async function getUncachableStripeClient(): Promise<Stripe> {
  return getStripeClient();
}

export async function getStripePublishableKey(): Promise<string> {
  return getPublishableKey();
}
