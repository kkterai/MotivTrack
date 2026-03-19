import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log('📍 Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
  
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    const userCount = await prisma.user.count();
    console.log(`📊 Found ${userCount} users in database`);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Database connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.message.includes("Can't reach database server")) {
      console.log('\n🔧 DIAGNOSIS: Database server is unreachable');
      console.log('   Most likely cause: Supabase project is PAUSED');
      console.log('   Solution: Go to https://supabase.com/dashboard and resume your project');
    } else if (error.message.includes('authentication failed')) {
      console.log('\n🔧 DIAGNOSIS: Authentication failed');
      console.log('   Most likely cause: Database credentials are invalid or expired');
      console.log('   Solution: Get new credentials from Supabase dashboard');
    }
    
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();
