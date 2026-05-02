import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req, { params }) {
  const { target } = await req.json();
  const { username: currentUsername } = await params;

  const currentUser = await prisma.user.findUnique({ where: { username: currentUsername } });
  const targetUser = await prisma.user.findUnique({ where: { username: target } });

  if (!currentUser || !targetUser) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const currentFollowing = JSON.parse(currentUser.following || "[]");
  const targetFollowers  = JSON.parse(targetUser.followers || "[]");

  const isFollowing = currentFollowing.includes(target);

  const newFollowing = isFollowing
    ? currentFollowing.filter((u) => u !== target)
    : [...currentFollowing, target];

  const newFollowers = isFollowing
    ? targetFollowers.filter((u) => u !== currentUsername)
    : [...targetFollowers, currentUsername];

  await prisma.user.update({
    where: { username: currentUsername },
    data: { following: JSON.stringify(newFollowing) },
  });

  await prisma.user.update({
    where: { username: target },
    data: { followers: JSON.stringify(newFollowers) },
  });

  return Response.json({ success: true, following: newFollowing });
}