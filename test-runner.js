#!/usr/bin/env node

/**
 * Test Runner for Booking.com n8n Node
 * 
 * This script helps run different types of tests for the node.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Booking.com n8n Node Test Runner');
console.log('=====================================\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: Run this from the n8n-nodes-booking directory');
  process.exit(1);
}

// Get command line argument
const testType = process.argv[2] || 'unit';

function runCommand(command, description) {
  console.log(`🔄 ${description}...`);
  try {
    const output = execSync(command, { 
      stdio: 'inherit',
      encoding: 'utf8'
    });
    console.log(`✅ ${description} completed successfully\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`);
    console.error(error.message);
    return false;
  }
}

switch (testType) {
  case 'unit':
    console.log('Running unit tests (no API calls)...\n');
    runCommand('npm run test:unit', 'Unit tests');
    break;

  case 'integration':
    console.log('Running integration tests (requires credentials)...\n');
    
    if (!process.env.BOOKING_BEARER_TOKEN || !process.env.BOOKING_AFFILIATE_ID) {
      console.log('⚠️  Integration tests require credentials:');
      console.log('   export BOOKING_BEARER_TOKEN="your-sandbox-token"');
      console.log('   export BOOKING_AFFILIATE_ID="your-affiliate-id"');
      console.log('\n   Then run: node test-runner.js integration\n');
      process.exit(1);
    }
    
    runCommand('npm run test:integration', 'Integration tests');
    break;

  case 'all':
    console.log('Running all tests...\n');
    
    if (runCommand('npm run test:unit', 'Unit tests')) {
      if (process.env.BOOKING_BEARER_TOKEN && process.env.BOOKING_AFFILIATE_ID) {
        runCommand('npm run test:integration', 'Integration tests');
      } else {
        console.log('⚠️  Skipping integration tests (no credentials)');
      }
    }
    break;

  case 'build':
    console.log('Testing build and structure...\n');
    
    if (runCommand('npm run build', 'Build')) {
      if (runCommand('npm run lint', 'Linting')) {
        console.log('✅ Build and lint successful - node is ready for deployment!');
      }
    }
    break;

  default:
    console.log('Usage: node test-runner.js [type]');
    console.log('');
    console.log('Types:');
    console.log('  unit        - Unit tests only (no API calls)');
    console.log('  integration - Integration tests (requires credentials)');
    console.log('  all         - Both unit and integration tests');
    console.log('  build       - Build and lint tests');
    console.log('');
    console.log('Examples:');
    console.log('  node test-runner.js unit');
    console.log('  node test-runner.js build');
    console.log('  BOOKING_BEARER_TOKEN="token" BOOKING_AFFILIATE_ID="id" node test-runner.js integration');
    break;
}

console.log('\n🎉 Test runner completed!'); 