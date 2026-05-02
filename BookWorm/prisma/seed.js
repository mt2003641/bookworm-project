const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {

  //----- Create Users -----//
  const u1 = await prisma.user.create({
    data: { username: "ahmed", email: "a@mail.com", password: "123" }
  });

  const u2 = await prisma.user.create({
    data: { username: "sara", email: "s@mail.com", password: "123" }
  });

  const u3 = await prisma.user.create({
    data: { username: "mohamed", email: "m@mail.com", password: "123" }
  });

  //----- Create Posts -----//
  await prisma.post.createMany({
    data: [
      { text: "I love this book!", authorId: u1.id },
      { text: "Amazing quote!", authorId: u1.id },
      { text: "Not my favorite", authorId: u2.id },
      { text: "Best book ever", authorId: u3.id },
      { text: "Highly recommended", authorId: u3.id },
      { text: "Another post here", authorId: u3.id },
    ]
  });

}

main();