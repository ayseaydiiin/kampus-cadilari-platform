#!/usr/bin/env node
/**
 * Test Event Proposal Submission
 * Simulates form submission to /api/events/propose
 * Uses Node.js 18+ built-in fetch
 */

const BASE_URL = 'http://localhost:4321';

async function testEventProposal() {
  console.log('🧪 Testing Event Proposal Submission...\n');

  const testData = {
    title: `Test Event ${Date.now()}`,
    category: 'Workshop',
    regionId: '34', // İstanbul
    description: 'This is a comprehensive test event description with more than fifty characters to pass validation requirements.',
    email: 'organizer@example.com',
    phone: '5551234567',
    organizerName: 'Test Organizer',
  };

  try {
    console.log('📤 Sending POST request to /api/events/propose');
    console.log('📋 Payload:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('\n');

    const response = await fetch(`${BASE_URL}/api/events/propose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    console.log(`📊 Response Status: ${response.status}`);
    console.log('📊 Response Body:');
    console.log(JSON.stringify(result, null, 2));

    if (response.ok && result.success) {
      console.log('\n✅ Submission successful!');
      return true;
    } else if (response.status === 400) {
      console.log('\n❌ Validation error - form data rejected');
      console.log('   Error:', result.error);
      return false;
    } else if (response.status === 409) {
      console.log('\n⚠️ Conflict - event already exists');
      console.log('   Error:', result.error);
      return false;
    } else {
      console.log('\n❌ Unexpected error');
      return false;
    }
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(
      '\n⚠️ Make sure dev server is running at http://localhost:4321'
    );
    return false;
  }
}

// Run test
const success = await testEventProposal();
process.exit(success ? 0 : 1);
