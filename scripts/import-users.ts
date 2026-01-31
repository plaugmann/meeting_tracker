import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface UserRow {
  ID: string;
  display_name: string;
  Email: string;
  rank_bucket: string;
  Role: string;
}

async function parseCSV(filePath: string): Promise<UserRow[]> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(';');
  
  const users: UserRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(';');
    if (values.length === headers.length) {
      users.push({
        ID: values[0].trim(),
        display_name: values[1].trim(),
        Email: values[2].trim(),
        rank_bucket: values[3].trim(),
        Role: values[4].trim(),
      });
    }
  }
  
  return users;
}

async function main() {
  const csvPath = path.join(process.cwd(), 'Users.csv');
  const users = await parseCSV(csvPath);
  
  console.log(`Found ${users.length} users in CSV`);
  
  // Default password for all users (should be changed on first login)
  const defaultPassword = 'EYWelcome2024!';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  
  let created = 0;
  let updated = 0;
  let errors = 0;
  
  for (const user of users) {
    try {
      // Check if photo exists
      const photoPath = `/photos/${user.ID}.jpg`;
      const photoExists = fs.existsSync(
        path.join(process.cwd(), 'public', 'photos', `${user.ID}.jpg`)
      );
      
      // Determine role based on CSV Role column
      const role: 'ADMIN' | 'EMPLOYEE' = user.Role === 'Admin' ? 'ADMIN' : 'EMPLOYEE';
      
      const userData = {
        email: user.Email,
        name: user.display_name,
        password: hashedPassword,
        role,
        target: 8,
        image: photoExists ? photoPath : '/photos/default.jpg',
      };
      
      const existingUser = await prisma.user.findUnique({
        where: { email: user.Email },
      });
      
      if (existingUser) {
        await prisma.user.update({
          where: { email: user.Email },
          data: userData,
        });
        updated++;
        console.log(`Updated: ${user.display_name} (${role})`);
      } else {
        await prisma.user.create({
          data: userData,
        });
        created++;
        console.log(`Created: ${user.display_name} (${role})`);
      }
    } catch (error) {
      console.error(`Error processing ${user.display_name}:`, error);
      errors++;
    }
  }
  
  console.log('\n=== Import Summary ===');
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total processed: ${created + updated}`);
  console.log('\nDefault password for all users: EYWelcome2024!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });