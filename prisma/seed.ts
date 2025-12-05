import 'dotenv/config';
import { PrismaClient, PaintBrand, PaintType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Citadel Base Paints - Common colors used in Warhammer painting
const citadelBasePaints = [
  // Reds
  { name: 'Mephiston Red', colorHex: '#9A1115' },
  { name: 'Khorne Red', colorHex: '#6A0001' },

  // Blues
  { name: 'Macragge Blue', colorHex: '#0D407F' },
  { name: 'Kantor Blue', colorHex: '#02134E' },
  { name: 'Caledor Sky', colorHex: '#366699' },
  { name: 'Thousand Sons Blue', colorHex: '#00506F' },

  // Greens
  { name: 'Caliban Green', colorHex: '#00401A' },
  { name: 'Warpstone Glow', colorHex: '#1E7331' },
  { name: 'Death Guard Green', colorHex: '#6D7C3E' },
  { name: 'Castellan Green', colorHex: '#264715' },

  // Yellows & Oranges
  { name: 'Averland Sunset', colorHex: '#FDB825' },
  { name: 'Jokaero Orange', colorHex: '#EE3823' },

  // Browns & Tans
  { name: 'Mournfang Brown', colorHex: '#640909' },
  { name: 'Rhinox Hide', colorHex: '#462F30' },
  { name: 'XV-88', colorHex: '#6C4811' },
  { name: 'Zandri Dust', colorHex: '#9E915C' },

  // Blacks & Grays
  { name: 'Abaddon Black', colorHex: '#231F20' },
  { name: 'Mechanicus Standard Grey', colorHex: '#3D4B4D' },
  { name: 'Corvus Black', colorHex: '#171314' },

  // Whites & Bone
  { name: 'Corax White', colorHex: '#FFFFFF' },
  { name: 'Celestra Grey', colorHex: '#90A8A8' },
  { name: 'Rakarth Flesh', colorHex: '#A29E91' },

  // Metallics
  { name: 'Leadbelcher', colorHex: '#888D8F' },
  { name: 'Retributor Armour', colorHex: '#B39B1E' },
  { name: 'Balthasar Gold', colorHex: '#A47552' },
  { name: 'Iron Warriors', colorHex: '#5E5E5E' },

  // Purples & Pinks
  { name: 'Naggaroth Night', colorHex: '#3D3354' },
  { name: 'Phoenician Purple', colorHex: '#440052' },
  { name: 'Screamer Pink', colorHex: '#7C1645' },

  // Flesh Tones
  { name: 'Bugmans Glow', colorHex: '#834F44' },
  { name: 'Ratskin Flesh', colorHex: '#AD6B4C' },
];

// Achievements for gamification
const achievements = [
  // Painting milestones
  {
    emoji: '🎨',
    name: 'First Stroke',
    description: 'Paint your first model',
    requirementType: 'models_painted',
    requirementValue: 1,
  },
  {
    emoji: '⭐',
    name: 'Getting Started',
    description: 'Complete 5 models',
    requirementType: 'models_painted',
    requirementValue: 5,
  },
  {
    emoji: '🏆',
    name: 'Dedicated Hobbyist',
    description: 'Complete 25 models',
    requirementType: 'models_painted',
    requirementValue: 25,
  },
  {
    emoji: '👑',
    name: 'Painting Master',
    description: 'Complete 50 models',
    requirementType: 'models_painted',
    requirementValue: 50,
  },
  {
    emoji: '💯',
    name: 'Century',
    description: 'Complete 100 models',
    requirementType: 'models_painted',
    requirementValue: 100,
  },

  // Streak achievements
  {
    emoji: '🔥',
    name: 'Week Warrior',
    description: 'Maintain a 7-day painting streak',
    requirementType: 'streak_days',
    requirementValue: 7,
  },
  {
    emoji: '💪',
    name: 'Two Week Titan',
    description: 'Maintain a 14-day painting streak',
    requirementType: 'streak_days',
    requirementValue: 14,
  },
  {
    emoji: '🌟',
    name: 'Monthly Master',
    description: 'Maintain a 30-day painting streak',
    requirementType: 'streak_days',
    requirementValue: 30,
  },

  // Recipe achievements
  {
    emoji: '📝',
    name: 'Recipe Creator',
    description: 'Create your first recipe',
    requirementType: 'recipes_created',
    requirementValue: 1,
  },
  {
    emoji: '📚',
    name: 'Recipe Master',
    description: 'Create 5 recipes',
    requirementType: 'recipes_created',
    requirementValue: 5,
  },
  {
    emoji: '🎓',
    name: 'Recipe Guru',
    description: 'Create 10 recipes',
    requirementType: 'recipes_created',
    requirementValue: 10,
  },

  // Army achievements
  {
    emoji: '⚔️',
    name: 'Army Builder',
    description: 'Create your first army',
    requirementType: 'armies_created',
    requirementValue: 1,
  },
  {
    emoji: '🎖️',
    name: 'Battle Ready',
    description: 'Complete a 500 point army',
    requirementType: 'army_points_completed',
    requirementValue: 500,
  },
  {
    emoji: '🏅',
    name: 'Combat Patrol',
    description: 'Complete a 1000 point army',
    requirementType: 'army_points_completed',
    requirementValue: 1000,
  },
  {
    emoji: '🎯',
    name: 'Strike Force',
    description: 'Complete a 2000 point army',
    requirementType: 'army_points_completed',
    requirementValue: 2000,
  },

  // Paint collection achievements
  {
    emoji: '🎨',
    name: 'Paint Collector',
    description: 'Own 10 paints',
    requirementType: 'paints_owned',
    requirementValue: 10,
  },
  {
    emoji: '🌈',
    name: 'Color Enthusiast',
    description: 'Own 25 paints',
    requirementType: 'paints_owned',
    requirementValue: 25,
  },
  {
    emoji: '🖌️',
    name: 'Paint Hoarder',
    description: 'Own 50 paints',
    requirementType: 'paints_owned',
    requirementValue: 50,
  },

  // Hours painted
  {
    emoji: '⏱️',
    name: 'Time Invested',
    description: 'Paint for 10 hours total',
    requirementType: 'hours_painted',
    requirementValue: 10,
  },
  {
    emoji: '⌛',
    name: 'Dedicated Painter',
    description: 'Paint for 50 hours total',
    requirementType: 'hours_painted',
    requirementValue: 50,
  },
  {
    emoji: '🕐',
    name: 'Time Master',
    description: 'Paint for 100 hours total',
    requirementType: 'hours_painted',
    requirementValue: 100,
  },
];

async function main() {
  console.log('🌱 Seeding database...\n');

  // Seed Citadel Base Paints
  console.log('🎨 Seeding Citadel Base paints...');
  for (const paint of citadelBasePaints) {
    await prisma.paint.upsert({
      where: {
        name_brand: {
          name: paint.name,
          brand: PaintBrand.CITADEL,
        },
      },
      update: {},
      create: {
        name: paint.name,
        brand: PaintBrand.CITADEL,
        type: PaintType.BASE,
        colorHex: paint.colorHex,
        isOfficial: true,
      },
    });
  }
  console.log(`   ✓ Created ${citadelBasePaints.length} Citadel Base paints\n`);

  // Seed Achievements
  console.log('🏆 Seeding achievements...');
  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {},
      create: achievement,
    });
  }
  console.log(`   ✓ Created ${achievements.length} achievements\n`);

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
