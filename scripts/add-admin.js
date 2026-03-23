#!/usr/bin/env node
// Script to add an admin user to the database
// Usage: node scripts/add-admin.js email@example.com

import { createUser, addAdminUser } from '../src/utils/db.js';
import bcrypt from 'bcrypt';

const email = process.argv[2];
const password = process.argv[3];
const fullName = process.argv[4] || 'Admin';

if (!email || !password) {
  console.error('Usage: node scripts/add-admin.js <email> <password> [fullName]');
  process.exit(1);
}

async function addAdmin() {
  try {
    console.log(`Adding admin user: ${email}`);
    
    // Create user
    const userResult = await createUser(email, password, fullName, email.split('@')[0]);
    
    if (!userResult.success) {
      console.error('Error creating user:', userResult.error);
      process.exit(1);
    }
    
    // Add to admin whitelist
    const adminResult = addAdminUser(email, fullName);
    
    if (!adminResult.success) {
      console.error('Error adding to admin list:', adminResult.error);
      process.exit(1);
    }
    
    console.log('✓ Admin user added successfully!');
    console.log(`  Email: ${email}`);
    console.log(`  Name: ${fullName}`);
    console.log('\nYou can now login at: http://localhost:4323/admin/login-email');
    
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

addAdmin();
