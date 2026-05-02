import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ── helpers ──────────────────────────────────────────────
function serialize(post) {
  return {
    ...post,
    timestamp: Number(post.timestamp), // BigInt → number for JSON
    likedBy:   JSON.parse(post.likedBy   || "[]"),
    comments:  JSON.parse(post.comments  || "[]"),
  };
}

// GET all posts
export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });
  return Response.json(posts.map(serialize));
}

// POST create new post
export async function POST(req) {
  const { text, author, authorInput, bookInput, likedBy, comments, timestamp } =
    await req.json();

  const post = await prisma.post.create({
    data: {
      text,
      author:      author      || "",
      authorInput: authorInput || "",
      bookInput:   bookInput   || "",
      likedBy:     JSON.stringify(likedBy  || []),
      comments:    JSON.stringify(comments || []),
      timestamp:   BigInt(timestamp || Date.now()),
    },
  });

  return Response.json(serialize(post), { status: 201 });
}
