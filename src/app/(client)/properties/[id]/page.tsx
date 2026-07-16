import { ListingDetailContent } from "./listing-detail-content";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ListingDetailContent propertyId={Number(id)} />;
}
