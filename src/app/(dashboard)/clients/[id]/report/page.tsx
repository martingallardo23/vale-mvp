import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getClient } from "@/lib/clientData";
import { ClientReport } from "@/components/clients/ClientReport";

async function Loader({ id }: { id: string }) {
  const client = getClient(id);
  if (!client) notFound();
  return <ClientReport client={client} />;
}

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <Loader id={id} />
    </Suspense>
  );
}
