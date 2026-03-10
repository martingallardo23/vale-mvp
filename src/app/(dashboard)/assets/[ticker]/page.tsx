import { AssetDetail } from "@/components/AssetDetail";

export default async function AssetPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  return <AssetDetail ticker={decodeURIComponent(ticker)} />;
}
