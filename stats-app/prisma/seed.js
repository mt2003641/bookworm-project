const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {

  // =====================
  // CREATE USERS
  // =====================

  const u1 = await prisma.user.create({ data: {
    username: "ahmed",    email: "ahmed@mail.com",   password: "ahmed123",
    name: "Ahmed Al-Rashid", bio: "Avid reader 📚 | Fantasy & Sci-Fi lover",
    photo: "", followers: JSON.stringify(["sara", "lena", "omar"]),
    following: JSON.stringify(["sara", "mohamed", "lena"]),
  }});

  const u2 = await prisma.user.create({ data: {
    username: "sara",     email: "sara@mail.com",    password: "sara1234",
    name: "Sara Hassan",  bio: "Books are my escape 🌙 | Classic literature",
    photo: "", followers: JSON.stringify(["ahmed", "mohamed", "farah"]),
    following: JSON.stringify(["ahmed", "lena", "farah"]),
  }});

  const u3 = await prisma.user.create({ data: {
    username: "mohamed",  email: "mohamed@mail.com", password: "moh12345",
    name: "Mohamed Saeed", bio: "Reading one page at a time ☕",
    photo: "", followers: JSON.stringify(["sara", "farah"]),
    following: JSON.stringify(["ahmed", "omar"]),
  }});

  const u4 = await prisma.user.create({ data: {
    username: "lena",     email: "lena@mail.com",    password: "lena1234",
    name: "Lena Khoury",  bio: "Philosophy & poetry enthusiast 🌿",
    photo: "", followers: JSON.stringify(["ahmed", "sara"]),
    following: JSON.stringify(["ahmed", "sara", "farah"]),
  }});

  const u5 = await prisma.user.create({ data: {
    username: "farah",    email: "farah@mail.com",   password: "farah123",
    name: "Farah Nasser", bio: "Romance & thriller reader 💫",
    photo: "", followers: JSON.stringify(["lena", "mohamed", "sara"]),
    following: JSON.stringify(["sara", "lena", "omar"]),
  }});

  const u6 = await prisma.user.create({ data: {
    username: "omar",     email: "omar@mail.com",    password: "omar1234",
    name: "Omar Ziad",    bio: "History buff 📜 | Non-fiction only",
    photo: "", followers: JSON.stringify(["ahmed", "farah", "karim"]),
    following: JSON.stringify(["ahmed", "karim", "nour"]),
  }});

  const u7 = await prisma.user.create({ data: {
    username: "karim",    email: "karim@mail.com",   password: "karim123",
    name: "Karim Adel",   bio: "Sci-fi & dystopian fiction 🚀",
    photo: "", followers: JSON.stringify(["omar", "nour"]),
    following: JSON.stringify(["omar", "ahmed", "nour"]),
  }});

  const u8 = await prisma.user.create({ data: {
    username: "nour",     email: "nour@mail.com",    password: "nour1234",
    name: "Nour Salim",   bio: "Just here for the book quotes ✨",
    photo: "", followers: JSON.stringify(["karim", "omar", "rania"]),
    following: JSON.stringify(["karim", "rania"]),
  }});

  const u9 = await prisma.user.create({ data: {
    username: "rania",    email: "rania@mail.com",   password: "rania123",
    name: "Rania Malik",  bio: "YA fiction & graphic novels 🎨",
    photo: "", followers: JSON.stringify(["nour"]),
    following: JSON.stringify(["nour", "sara"]),
  }});

  const u10 = await prisma.user.create({ data: {
    username: "tariq",    email: "tariq@mail.com",   password: "tariq123",
    name: "Tariq Fouad",  bio: "New here! Excited to discover books 📖",
    photo: "", followers: JSON.stringify([]),
    following: JSON.stringify(["ahmed", "sara"]),
  }});


  // =====================
  // CREATE POSTS
  // =====================

  await prisma.post.createMany({ data: [

    //----- u1 -----//
    {
      text: "Not all those who wander are lost.",
      author: "ahmed", authorInput: "J.R.R. Tolkien", bookInput: "The Fellowship of the Ring",
      likedBy: JSON.stringify(["sara", "lena", "farah", "omar"]),
      comments: JSON.stringify([
        { author: "sara",  text: "One of my all-time favorite quotes!", likedBy: ["ahmed"] },
        { author: "lena",  text: "Tolkien was truly a genius.", likedBy: [] },
      ]),
      timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      text: "It does not do to dwell on dreams and forget to live.",
      author: "ahmed", authorInput: "J.K. Rowling", bookInput: "Harry Potter and the Sorcerer's Stone",
      likedBy: JSON.stringify(["sara", "mohamed", "karim"]),
      comments: JSON.stringify([
        { author: "karim", text: "This hit different after a long week.", likedBy: ["ahmed", "sara"] },
      ]),
      timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 5),
    },
    {
      text: "There is no friend as loyal as a book.",
      author: "ahmed", authorInput: "Ernest Hemingway", bookInput: "",
      likedBy: JSON.stringify(["farah", "nour", "tariq"]),
      comments: JSON.stringify([]),
      timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 24),
    },

    //----- u2 -----//
    {
      text: "So it goes.",
      author: "sara", authorInput: "Kurt Vonnegut", bookInput: "Slaughterhouse-Five",
      likedBy: JSON.stringify(["ahmed", "lena"]),
      comments: JSON.stringify([
        { author: "lena",  text: "Simple yet so powerful.", likedBy: ["sara"] },
        { author: "farah", text: "This book changed me.", likedBy: [] },
      ]),
      timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 8),
    },
    {
      text: "It was the best of times, it was the worst of times.",
      author: "sara", authorInput: "Charles Dickens", bookInput: "A Tale of Two Cities",
      likedBy: JSON.stringify(["ahmed", "mohamed", "omar", "rania"]),
      comments: JSON.stringify([
        { author: "omar",  text: "Dickens really captured an entire era.", likedBy: ["sara"] },
      ]),
      timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 30),
    },
    {
      text: "I am not afraid of storms, for I am learning how to sail my ship.",
      author: "sara", authorInput: "Louisa May Alcott", bookInput: "Little Women",
      likedBy: JSON.stringify(["lena", "farah", "nour", "rania", "tariq"]),
      comments: JSON.stringify([]),
      timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 48),
    },

    //----- u3 -----//
    {
      text: "The world is a book, and those who do not travel read only one page.",
      author: "mohamed", authorInput: "Saint Augustine", bookInput: "",
      likedBy: JSON.stringify(["ahmed", "sara", "farah"]),
      comments: JSON.stringify([
        { author: "farah", text: "This quote lives in my head rent free.", likedBy: ["mohamed", "sara"] },
      ]),
      timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 12),
    },
    {
      text: "A reader lives a thousand lives before he dies. The man who never reads lives only one.",
      author: "mohamed", authorInput: "George R.R. Martin", bookInput: "",
      likedBy: JSON.stringify(["ahmed", "karim", "nour", "tariq"]),
      comments: JSON.stringify([
        { author: "karim", text: "GRRM when he's not writing takes 10 years on.", likedBy: ["mohamed"] },
        { author: "nour",  text: "This is literally why I read.", likedBy: [] },
      ]),
      timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 36),
    },

    //----- u4 -----//
    {
      text: "The more that you read, the more things you will know.",
      author: "lena", authorInput: "Dr. Seuss", bookInput: "I Can Read With My Eyes Shut",
      likedBy: JSON.stringify(["sara", "farah", "rania"]),
      comments: JSON.stringify([
        { author: "rania", text: "Dr. Seuss for the win!", likedBy: ["lena"] },
      ]),
      timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 6),
    },
    {
      text: "One must always be careful of books, and what is inside them, for words have the power to change us.",
      author: "lena", authorInput: "Cassandra Clare", bookInput: "Clockwork Angel",
      likedBy: JSON.stringify(["ahmed", "sara", "nour"]),
      comments: JSON.stringify([]),
      timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 20),
    },

    //----- u5 -----//
    {
      text: "You have to write the book that wants to be written.",
      author: "farah", authorInput: "Madeleine L'Engle", bookInput: "",
      likedBy: JSON.stringify(["lena", "rania"]),
      comments: JSON.stringify([
        { author: "lena", text: "Every writer needs to hear this.", likedBy: [] },
      ]),
      timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 14),
    },
    {
      text: "She is too fond of books, and it has turned her brain.",
      author: "farah", authorInput: "Louisa May Alcott", bookInput: "",
      likedBy: JSON.stringify(["sara", "nour", "rania", "lena", "ahmed"]),
      comments: JSON.stringify([
        { author: "nour",  text: "My family describing me exactly 😂", likedBy: ["farah", "sara"] },
        { author: "rania", text: "Honestly a compliment.", likedBy: ["farah"] },
      ]),
      timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 40),
    },

    //----- u6 -----//
    {
      text: "History is written by the victors.",
      author: "omar", authorInput: "Winston Churchill", bookInput: "",
      likedBy: JSON.stringify(["ahmed", "karim", "tariq"]),
      comments: JSON.stringify([
        { author: "karim", text: "Always makes me question what I read.", likedBy: ["omar"] },
      ]),
      timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 10),
    },
    {
      text: "The reading of all good books is like a conversation with the finest minds of past centuries.",
      author: "omar", authorInput: "René Descartes", bookInput: "",
      likedBy: JSON.stringify(["ahmed", "lena", "nour"]),
      comments: JSON.stringify([]),
      timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 55),
    },

    //----- u7 -----//
    {
      text: "We accept the love we think we deserve.",
      author: "karim", authorInput: "Stephen Chbosky", bookInput: "The Perks of Being a Wallflower",
      likedBy: JSON.stringify(["nour", "farah", "rania", "sara"]),
      comments: JSON.stringify([
        { author: "nour",  text: "This one hurt.", likedBy: ["karim", "farah"] },
        { author: "farah", text: "Cried reading this the first time.", likedBy: ["karim"] },
        { author: "rania", text: "Still one of my favorite books ever.", likedBy: [] },
      ]),
      timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 18),
    },
    {
      text: "It's a strange thing, to never be satisfied.",
      author: "karim", authorInput: "Brandon Sanderson", bookInput: "The Way of Kings",
      likedBy: JSON.stringify(["omar", "ahmed"]),
      comments: JSON.stringify([]),
      timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 72),
    },

    //----- u8 -----//
    {
      text: "Sometimes the right path is not the easiest one.",
      author: "nour", authorInput: "Grandmother Willow", bookInput: "Pocahontas",
      likedBy: JSON.stringify(["rania", "farah"]),
      comments: JSON.stringify([
        { author: "rania", text: "A classic 🍃", likedBy: ["nour"] },
      ]),
      timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 25),
    },
    {
      text: "To the stars who listen — and the dreams that are answered.",
      author: "nour", authorInput: "Sarah J. Maas", bookInput: "A Court of Mist and Fury",
      likedBy: JSON.stringify(["rania", "farah", "lena", "sara"]),
      comments: JSON.stringify([
        { author: "farah", text: "ACOMAF supremacy forever.", likedBy: ["nour", "rania"] },
      ]),
      timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 44),
    },

    //----- u9 -----//
    {
      text: "Even the darkest night will end and the sun will rise.",
      author: "rania", authorInput: "Victor Hugo", bookInput: "Les Misérables",
      likedBy: JSON.stringify(["nour", "sara", "lena", "tariq"]),
      comments: JSON.stringify([
        { author: "nour", text: "Needed this today, thank you 💙", likedBy: ["rania"] },
      ]),
      timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 16),
    },
    {
      text: "I took a deep breath and listened to the old brag of my heart: I am, I am, I am.",
      author: "rania", authorInput: "Sylvia Plath", bookInput: "The Bell Jar",
      likedBy: JSON.stringify(["nour", "lena"]),
      comments: JSON.stringify([
        { author: "lena", text: "Plath's writing is unlike anything else.", likedBy: ["rania"] },
      ]),
      timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 60),
    },

    //----- u10 -----//
    {
      text: "A book is a dream that you hold in your hands.",
      author: "tariq", authorInput: "Neil Gaiman", bookInput: "",
      likedBy: JSON.stringify(["ahmed", "sara", "nour"]),
      comments: JSON.stringify([
        { author: "ahmed", text: "Welcome to Bookworms! Great first post 📚", likedBy: ["tariq"] },
        { author: "sara",  text: "Neil Gaiman always delivers.", likedBy: ["tariq"] },
      ]),
      timestamp: BigInt(Date.now() - 1000 * 60 * 30),
    },

  ]});
}

main().catch(console.error).finally(() => prisma.$disconnect());