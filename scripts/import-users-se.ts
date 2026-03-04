import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface UserRow {
  ID: string;
  display_name: string;
  Email: string;
  Role: string;
}

async function parseCSV(filePath: string): Promise<UserRow[]> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.replace(/^\uFEFF/, '').split('\n').filter(line => line.trim());
  
  const users: UserRow[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const values = lines[i].split(';');
    if (values.length >= 4) {
      users.push({
        ID: values[0].trim(),
        display_name: values[1].trim(),
        Email: values[2].trim(),
        Role: values[3].trim(),
      });
    }
  }
  
  return users;
}

function findPhoto(userId: string): string {
  const photoDir = path.join(process.cwd(), 'public', 'photos', 'SE');
  
  // Try exact ID match
  if (fs.existsSync(path.join(photoDir, `${userId}.jpg`))) {
    return `/photos/SE/${userId}.jpg`;
  }
  // Try with SE prefix (for IDs starting with 2023...)
  if (fs.existsSync(path.join(photoDir, `SE${userId}.jpg`))) {
    return `/photos/SE/SE${userId}.jpg`;
  }
  
  return '/photos/default.jpg';
}

async function main() {
  const csvPath = path.join(process.cwd(), 'Users_se.csv');
  const users = await parseCSV(csvPath);
  
  console.log(`Found ${users.length} users in CSV`);
  
  const defaultPassword = process.env.DEFAULT_USER_PASSWORD || 'changeme';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  
  let created = 0;
  let updated = 0;
  let errors = 0;
  
  for (const user of users) {
    try {
      const photoPath = findPhoto(user.ID);
      const role: 'ADMIN' | 'EMPLOYEE' = user.Role === 'Admin' ? 'ADMIN' : 'EMPLOYEE';
      
      const userData = {
        email: user.Email,
        name: user.display_name,
        password: hashedPassword,
        role,
        target: 8,
        image: photoPath,
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
        console.log(`Updated: ${user.display_name} (${role}) - ${photoPath}`);
      } else {
        await prisma.user.create({
          data: userData,
        });
        created++;
        console.log(`Created: ${user.display_name} (${role}) - ${photoPath}`);
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
  console.log(`\nDefault password for all users: ${defaultPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
