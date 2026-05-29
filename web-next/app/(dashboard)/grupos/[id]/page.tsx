import { notFound } from "next/navigation";

import { GroupDetailClient } from "./_components/group-detail-client";

const OBJECT_ID = /^[0-9a-f]{24}$/;

export default async function GrupoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!OBJECT_ID.test(id)) notFound();
  return <GroupDetailClient id={id} />;
}
