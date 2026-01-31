import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function parseCSV(filePath: string): Promise<string[]> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  // Skip header row and BOM if present
  const customers = lines.slice(1)
    .map(line => line.replace(/^\uFEFF/, '').trim()) // Remove BOM
    .filter(name => name);
  
  return customers;
}

async function main() {
  console.log('=== Starting Customer Reset and Import ===\n');
  
  // Step 1: Delete all existing customers
  console.log('Step 1: Deleting all existing customers...');
  try {
    // First delete all meeting-customer relationships
    const deletedRelations = await prisma.meetingCustomer.deleteMany({});
    console.log(`Deleted ${deletedRelations.count} meeting-customer relationships`);
    
    // Then delete all customers
    const deletedCustomers = await prisma.customer.deleteMany({});
    console.log(`Deleted ${deletedCustomers.count} customers\n`);
  } catch (error) {
    console.error('Error during deletion:', error);
    throw error;
  }
  
  // Step 2: Import customers from CSV
  console.log('Step 2: Importing customers from CSV...');
  const csvPath = path.join(process.cwd(), 'clients.csv');
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at: ${csvPath}`);
  }
  
  const customers = await parseCSV(csvPath);
  console.log(`Found ${customers.length} customers in CSV\n`);
  
  let created = 0;
  let errors = 0;
  
  for (const customerName of customers) {
    try {
      await prisma.customer.create({
        data: { name: customerName },
      });
      created++;
      console.log(`✓ Created: ${customerName}`);
    } catch (error) {
      console.error(`✗ Error creating ${customerName}:`, error);
      errors++;
    }
  }
  
  console.log('\n=== Import Summary ===');
  console.log(`✓ Successfully created: ${created}`);
  console.log(`✗ Errors: ${errors}`);
  console.log(`Total in CSV: ${customers.length}`);
  console.log('=====================\n');
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });