import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getClient } from "@/lib/clientData";
import { ClientDetail } from "@/components/clients/ClientDetail";

async function ClientDetailLoader({ id }: { id: string }) {
  const client = getClient(id);
  if (!client) notFound();
  return <ClientDetail client={client} />;
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense>
      <ClientDetailLoader id={id} />
    </Suspense>
  );
}
