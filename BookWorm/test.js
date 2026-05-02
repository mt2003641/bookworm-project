const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const totalPosts = await prisma.post.count();
  console.log("Total Posts:", totalPosts);
}

run();