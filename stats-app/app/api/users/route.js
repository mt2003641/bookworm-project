import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ── helpers ──────────────────────────────────────────────
// SQLite can't store arrays, so we serialize them as JSON strings
function serialize(user) {
  return {
    ...user,
    followers: JSON.parse(user.followers || "[]"),
    following: JSON.parse(user.following || "[]"),
  };
}

// GET all users
export async function GET() {
  const users = await prisma.user.findMany();
  return Response.json(users.map(serialize));
}

// POST create new user
export async function POST(req) {
  const { username, email, password, name, bio, photo, followers, following } =
    await req.json();

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return Response.json({ error: "Username already exists." }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password,
      name:      name  || username,
      bio:       bio   || "",
      photo:     photo || "",
      followers: JSON.stringify(followers || []),
      following: JSON.stringify(following || []),
    },
  });

  return Response.json(serialize(user), { status: 201 });
}

// PUT update profile
export async function PUT(req) {
  const body = await req.json();
  const { currentUsername, name, username: newUsername, bio, photo } = body;

  const user = await prisma.user.update({
    where: { username: currentUsername },
    data:  { name, username: newUsername, bio, photo },
  });

  return Response.json(serialize(user));
}