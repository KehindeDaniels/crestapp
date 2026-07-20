import type { Metadata } from "next";
import { OfferContent } from "./offer-content";

export const metadata: Metadata = { title: "Transaction Overview" };

export default async function OfferPage({
  params,
}: {
  params: Promise<{ contractId: string }>;
}) {
  const { contractId } = await params;
  return <OfferContent contractId={Number(contractId)} />;
}
