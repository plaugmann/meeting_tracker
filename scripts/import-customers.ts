import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function parseCSV(filePath: string): Promise<string[]> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  // Skip header row
  const customers = lines.slice(1).map(line => line.trim()).filter(name => name);
  
  return customers;
}

async function main() {
  const csvPath = path.join(process.cwd(), 'clients.csv');
  const customers = await parseCSV(csvPath);
  
  console.log(`Found ${customers.length} customers in CSV`);
  
  let created = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const customerName of customers) {
    try {
      const existing = await prisma.customer.findUnique({
        where: { name: customerName },
      });
      
      if (existing) {
        skipped++;
        console.log(`Skipped (already exists): ${customerName}`);
      } else {
        await prisma.customer.create({
          data: { name: customerName },
        });
        created++;
        console.log(`Created: ${customerName}`);
      }
    } catch (error) {
      console.error(`Error processing ${customerName}:`, error);
      errors++;
    }
  }
  
  console.log('\n=== Import Summary ===');
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total processed: ${created + skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });