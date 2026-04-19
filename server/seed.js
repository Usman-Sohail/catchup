require('dotenv').config();
const mongoose = require('mongoose');
const Meme = require('./models/Meme');

// All image URLs are stable imgflip meme template images
// status: 'approved' so seeded memes show immediately
const memes = [
  {
    title: 'NPC',
    imageUrl: 'https://i.imgflip.com/30b1gx.jpg',
    meaning: 'A person who seems to lack original thought and just goes through life following a script, like a non-player character in a video game.',
    example: '"He just agreed with everything his boss said — total NPC energy."',
    tags: ['gaming', 'personality', 'viral'],
    status: 'approved', createdAt: new Date('2024-09-01'),
  },
  {
    title: 'Understood the Assignment',
    imageUrl: 'https://i.imgflip.com/345v97.jpg',
    meaning: 'When someone absolutely nails what was expected of them — dressed perfectly, performed flawlessly, etc.',
    example: '"She showed up to the Halloween party in a full designer costume. She understood the assignment."',
    tags: ['compliment', 'performance', 'fashion'],
    status: 'approved', createdAt: new Date('2024-09-10'),
  },
  {
    title: "It's Giving",
    imageUrl: 'https://i.imgflip.com/1ur9b0.jpg',
    meaning: 'Slang for "it reminds me of" or "it has the energy of." Used to describe a vibe or aesthetic.',
    example: '"That outfit is giving main character energy."',
    tags: ['slang', 'fashion', 'vibe'],
    status: 'approved', createdAt: new Date('2024-09-20'),
  },
  {
    title: 'Delulu',
    imageUrl: 'https://i.imgflip.com/2kbn1e.jpg',
    meaning: 'Short for "delusional." Used humorously to describe someone with unrealistic expectations or fantasies, often self-applied ironically.',
    example: '"I think my celebrity crush will notice me one day. I\'m delulu but that\'s the solulu."',
    tags: ['slang', 'humor', 'self-aware'],
    status: 'approved', createdAt: new Date('2024-10-01'),
  },
  {
    title: 'Roman Empire',
    imageUrl: 'https://i.imgflip.com/24y43o.jpg',
    meaning: 'A trend where people reveal how often they randomly think about the Roman Empire — mocking how men are obsessed with historical empires.',
    example: '"How often do you think about the Roman Empire? Me: at least twice a week."',
    tags: ['trend', 'history', 'humor'],
    status: 'approved', createdAt: new Date('2024-10-10'),
  },
  {
    title: 'Rizz',
    imageUrl: 'https://i.imgflip.com/1g8my4.jpg',
    meaning: 'Charisma or the ability to attract others effortlessly, especially romantically. Coined by streamer Kai Cenat.',
    example: '"He walked in and everyone turned to look — the man has rizz."',
    tags: ['slang', 'dating', 'viral'],
    status: 'approved', createdAt: new Date('2024-10-20'),
  },
  {
    title: 'Quiet Quitting',
    imageUrl: 'https://i.imgflip.com/wxica.jpg',
    meaning: 'Doing the bare minimum at work — not actually quitting, but mentally checking out and refusing to go above and beyond.',
    example: '"I used to work late every day. Now I\'m quiet quitting — 5 PM and I\'m gone."',
    tags: ['work', 'culture', 'trend'],
    status: 'approved', createdAt: new Date('2024-11-01'),
  },
  {
    title: 'Slay',
    imageUrl: 'https://i.imgflip.com/1yxkcp.jpg',
    meaning: 'To excel or do something impressively. Originated in drag/LGBTQ+ communities, now mainstream.',
    example: '"She aced the interview and got the job. She slayed."',
    tags: ['slang', 'compliment', 'mainstream'],
    status: 'approved', createdAt: new Date('2024-11-15'),
  },
  {
    title: 'Caught in 4K',
    imageUrl: 'https://i.imgflip.com/4qkbmw.jpg',
    meaning: 'Being caught doing something (usually embarrassing or bad) on video with undeniable clarity.',
    example: '"He said he was home all night but got caught in 4K at the party."',
    tags: ['slang', 'viral', 'accountability'],
    status: 'approved', createdAt: new Date('2024-12-01'),
  },
  {
    title: 'Main Character Syndrome',
    imageUrl: 'https://i.imgflip.com/6nwpnr.jpg',
    meaning: "Behaving as if you're the protagonist of your own movie — dramatic, self-centered, seeing life through a narrative lens.",
    example: '"She walked through the rain with her headphones in like it was a movie montage. Total main character syndrome."',
    tags: ['personality', 'humor', 'self-aware'],
    status: 'approved', createdAt: new Date('2025-01-05'),
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/catchup');
    await Meme.deleteMany({});
    await Meme.insertMany(memes);
    console.log(`Seeded ${memes.length} memes successfully.`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
