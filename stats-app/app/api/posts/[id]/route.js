import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function DELETE(req, { params }) {
  const { id: rawId } = await params;          // ← await params
  const id = parseInt(rawId);

  await prisma.post.delete({ where: { id } });
  return Response.json({ success: true });
}