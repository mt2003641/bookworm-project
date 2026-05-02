const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {

  //----- Total Posts -----//
  const totalPosts = await prisma.post.count();

  //----- Total Users -----//
  const totalUsers = await prisma.user.count();

  //----- Average Posts per User -----//
  const avgPosts = totalPosts / totalUsers;

  //----- Most active User -----//
  const mostActive = await prisma.post.groupBy({
    by: ['authorId'],
    _count: { authorId: true },
    orderBy: { _count: { authorId: 'desc' } },
    take: 1
  });

  //----- Posts per User -----//
  const postsPerUser = await prisma.post.groupBy({
    by: ['authorId'],
    _count: true
  });

  //----- Latest Post -----//
  const latestPost = await prisma.post.findFirst({
    orderBy: { createdAt: 'desc' }
  });

  console.log("Total Posts:", totalPosts);
  console.log("Total Users:", totalUsers);
  console.log("Average Posts:", avgPosts);
  console.log("Most Active User:", mostActive);
  console.log("Posts Per User:", postsPerUser);
  console.log("Latest Post:", latestPost);

}

run();