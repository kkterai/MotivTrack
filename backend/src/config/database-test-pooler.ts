import { PrismaClient } from '@prisma/client';

// Test different connection methods
const connections = [
  {
    name: 'Direct Connection (Current)',
    url: process.env.DATABASE_URL,
  },
  {
    name: 'Connection Pooler (Transaction Mode)',
    url: `postgresql://postgres.mibocfyhstrhrqmadpeg:${process.env.DATABASE_URL?.match(/:([^@]+)@/)?.[1]}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  },
  {
    name: 'Connection Pooler (Session Mode)',
    url: `postgresql://postgres.mibocfyhstrhrqmadpeg:${process.env.DATABASE_URL?.match(/:([^@]+)@/)?.[1]}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
  },
];

async function testConnections() {
  console.log('🔍 Testing multiple connection methods...\n');
  
  for (const conn of connections) {
    console.log(`\n📡 Testing: ${conn.name}`);
    console.log(`   URL: ${conn.url?.replace(/:[^:@]+@/, ':****@')}`);
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: conn.url,
        },
      },
    });
    
    try {
      await prisma.$connect();
      console.log('   ✅ SUCCESS! Connection established');
      
      const userCount = await prisma.user.count();
      console.log(`   📊 Found ${userCount} users in database`);
      
      await prisma.$disconnect();
      
      console.log('\n🎉 WORKING CONNECTION FOUND!');
      console.log(`\nUpdate your .env file with:\nDATABASE_URL="${conn.url}"\n`);
      process.exit(0);
    } catch (error: any) {
      console.log(`   ❌ Failed: ${error.message.split('\n')[0]}`);
      await prisma.$disconnect();
    }
  }
  
  console.log('\n\n❌ All connection methods failed.');
  console.log('\n🔧 Next steps:');
  console.log('1. Go to Supabase Dashboard > Project Settings > Database');
  console.log('2. Click "Reset Database Password"');
  console.log('3. Copy the new password');
  console.log('4. Update your .env file with the new password');
  process.exit(1);
}

testConnections();
