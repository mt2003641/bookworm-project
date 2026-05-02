import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//----- USERS -----//
export async function getUsers() {
  return prisma.user.findMany();
}

export async function getUserByUsername(username) {
  return prisma.user.findUnique({ where: { username } });
}

export async function createUser(data) {
  return prisma.user.create({ data });
}

export async function updateUser(username, data) {
  return prisma.user.update({ where: { username }, data });
}


//----- POSTS -----//
export async function getPosts() {
  return prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getPostsByAuthor(author) {
  return prisma.post.findMany({
    where: { author },
    orderBy: { createdAt: "desc" },
  });
}

export async function createPost(data) {
  return prisma.post.create({ data });
}

export async function getPostById(id) {
  return prisma.post.findUnique({ where: { id } });
}
 
export async function updatePost(id, data) {
  return prisma.post.update({ where: { id }, data });
}
 
export async function deletePost(id) {
  return prisma.post.delete({ where: { id } });
}


//----- STATS -----//

//----- Total number of Posts -----//
export async function getTotalPosts() {
  return prisma.post.count();
}

//----- Total number of Users -----//
export async function getTotalUsers() {
  return prisma.user.count();
}

//----- Most active users (top 5) -----//
export async function getMostActiveUsers() {
  const result = await prisma.post.groupBy({
    by: ["author"],
    _count: { author: true },
  });

  return result.map((u) => ({
    ...u, _count: {
        author: Number(u._count.author),
    },
  })).sort((a, b) => b._count.author - a._count.author).slice(0, 5);
}

//----- Posts per User -----//
export async function getPostsPerUser() {
  const result = await prisma.post.groupBy({
    by: ["author"],
    _count: { author: true },
  });
  return result.map((u) => ({
    ...u, _count:{
        author: Number(u._count.author),
    },
  })).sort((a, b) => b._count.author - a._count.author);
}

//----- latest Posts -----//
export async function getLatestPost() {
  return prisma.post.findFirst({
    orderBy: { createdAt: "desc" },
  });
}

//----- Users with no Posts -----//
export async function getInactiveUsers() {
  const activeAuthors = await prisma.post.findMany({
    select: { author: true },
    distinct: ["author"],
  });
  const activeSet = activeAuthors.map(p => p.author);
 
  return prisma.user.findMany({
    where: {
      username: { notIn: activeSet },
    },
    select: { username: true, name: true },
  });
}
 
//------ Newest registered User -----//
export async function getNewestUser() {
  return prisma.user.findFirst({
    orderBy: { id: "desc" },
    select: { username: true, name: true },
  });
}