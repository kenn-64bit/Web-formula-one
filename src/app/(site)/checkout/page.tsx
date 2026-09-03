import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { PLANS, isTierId } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Checkout — Basic FX",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { tier } = await searchParams;
  if (typeof tier !== "string" || !isTierId(tier)) {
    redirect("/#pricing");
  }

  const plan = PLANS[tier];
  return (
    <CheckoutForm
      tier={plan.id}
      name={plan.name}
      tagline={plan.tagline}
      price={plan.price}
      accent={plan.accent}
    />
  );
}
