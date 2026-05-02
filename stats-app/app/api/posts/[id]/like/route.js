import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function serialize(post) {
  return {
    ...post,
    timestamp: Number(post.timestamp),
    likedBy: JSON.parse(post.likedBy  || "[]"),
    comments: JSON.parse(post.comments || "[]"),
  };
}

export async function POST(req, { params }) {
  const { username } = await req.json();
  const { id: rawId } = await params;
  const id = parseInt(rawId);

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

  const likedBy = JSON.parse(post.likedBy || "[]");
  const updated = likedBy.includes(username)
    ? likedBy.filter((u) => u !== username)
    : [...likedBy, username];

  const saved = await prisma.post.update({
    where: { id },
    data: { likedBy: JSON.stringify(updated) },
  });

  return Response.json(serialize(saved));
}
