#!/usr/bin/env node

/**
 * Integration Test Script
 * Tests the key user journey from form submission to admin review.
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';
const DEFAULT_LOGIN_EMAIL = 'admin@kampuscadilari.org';

function log(title, message, status = 'info') {
  const icon = {
    info: '[INFO]',
    success: '[OK]',
    error: '[ERR]',
    test: '[TEST]',
  };

  console.log(`\n${icon[status]} ${title}`);
  if (message) console.log(`   ${message}`);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveLoginPassword(email) {
  if (email === 'test@kampuscadilari.org') {
    return process.env.TEST_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD_TEST || process.env.ADMIN_DEFAULT_PASSWORD || null;
  }

  if (email === 'admin@kampuscadilari.org') {
    return process.env.ADMIN_PASSWORD_ADMIN || process.env.ADMIN_DEFAULT_PASSWORD || null;
  }

  return process.env.ADMIN_DEFAULT_PASSWORD || null;
}

function expectedPasswordEnvHint(email) {
  if (email === 'test@kampuscadilari.org') {
    return 'TEST_ADMIN_PASSWORD or ADMIN_PASSWORD_TEST or ADMIN_DEFAULT_PASSWORD';
  }

  if (email === 'admin@kampuscadilari.org') {
    return 'ADMIN_PASSWORD_ADMIN or ADMIN_DEFAULT_PASSWORD';
  }

  return 'ADMIN_DEFAULT_PASSWORD';
}

async function testFormSubmission() {
  log('TEST 1', 'Submit application form', 'test');

  const applicationData = {
    full_name: 'Test Kullanici',
    email: `test.user.${Date.now()}@example.com`,
    phone: '+90 555 123 4567',
    province: 'Istanbul',
    organization: 'Bogazici Universitesi',
    skills: ['organizing', 'writing'],
    social_media: '@testuser',
    message: 'Feminist aktivizmde yer almak istiyorum ve Kampus Cadilari hareketi ile kadin haklari mucadelesinde rol almak isterim.',
  };

  try {
    log('POST', '/api/submit-application');
    const response = await fetch(`${BASE_URL}/api/submit-application`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(applicationData),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      log('Response', `Status: ${response.status} - ${data.message}`, 'success');
      log('Application ID', String(data.applicationId), 'success');
      return { success: true, applicationId: data.applicationId };
    }

    log('API Error', data.error || 'Unknown error', 'error');
    return { success: false };
  } catch (error) {
    log('Network Error', error.message, 'error');
    return { success: false };
  }
}

async function testEventProposal() {
  log('TEST 2', 'Submit event proposal', 'test');

  const proposalData = {
    title: `Feminist Film Gosterimi ${Date.now()}`,
    email: `ayse.${Date.now()}@example.com`,
    description: 'Feminist sinema dili uzerine kampuste film gosterimi ve diyalog oturumu. Bu etkinlikte tartisma cemberi, paylasim ve kolektif ogrenme akisi olacak.',
    category: 'paneli',
    regionId: 35,
    provinceName: 'Izmir',
    eventDate: '2026-04-22',
    organizerName: 'Ayse Yilmaz',
    phone: '+90 555 222 3344',
  };

  try {
    log('POST', '/api/events/propose');
    const response = await fetch(`${BASE_URL}/api/events/propose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proposalData),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      log('Response', `Status: ${response.status} - ${data.message}`, 'success');
      log('Proposal ID', String(data.proposalId), 'success');
      return { success: true, proposalId: data.proposalId };
    }

    log('API Error', data.error || 'Unknown error', 'error');
    return { success: false };
  } catch (error) {
    log('Network Error', error.message, 'error');
    return { success: false };
  }
}

async function testAdminLogin() {
  log('TEST 3', 'Admin login', 'test');

  const loginEmail = process.env.TEST_LOGIN_EMAIL || DEFAULT_LOGIN_EMAIL;
  const loginPassword = resolveLoginPassword(loginEmail);

  if (!loginPassword) {
    log('Missing env var', `No password found for ${loginEmail}`, 'error');
    log('Expected env', expectedPasswordEnvHint(loginEmail), 'error');
    return { success: false };
  }

  const loginData = {
    email: loginEmail,
    password: loginPassword,
  };

  try {
    log('POST', '/api/auth/login');
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });

    const text = await response.text();
    console.log(`   Response Status: ${response.status}`);
    console.log(`   Response Text: ${text.substring(0, 200)}`);

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      log('JSON Parse Error', parseError.message, 'error');
      return { success: false };
    }

    if (response.ok && data.success) {
      log('Admin Login', 'Successful', 'success');
      log('Token', `${String(data.token || '').substring(0, 30)}...`, 'success');
      return { success: true, token: data.token };
    }

    log('Login Error', data.error || 'Unknown error', 'error');
    return { success: false };
  } catch (error) {
    log('Network Error', error.message, 'error');
    return { success: false };
  }
}

async function testAdminFetch(token) {
  log('TEST 4', 'Fetch admin applications', 'test');

  try {
    log('GET', '/api/admin/applications');
    const response = await fetch(`${BASE_URL}/api/admin/applications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`   Response Status: ${response.status}`);
    const data = await response.json();

    if (Array.isArray(data)) {
      log('Applications fetched', `Total: ${data.length}`, 'success');
      if (data.length > 0) {
        log('Latest application', `${data[0].full_name} - ${data[0].email}`, 'info');
      }
      return { success: true, applications: data };
    }

    log('Unexpected response', JSON.stringify(data).substring(0, 200), 'error');
    return { success: false };
  } catch (error) {
    log('Error', error.message, 'error');
    return { success: false };
  }
}

async function runAllTests() {
  console.log('\n==================================================');
  console.log('DIGITAL MOR KARARGAH - INTEGRATION TEST');
  console.log('==================================================\n');

  log('System', 'Waiting 3 seconds for dev server...', 'info');
  await wait(3000);

  const test1 = await testFormSubmission();
  const test2 = await testEventProposal();
  const test3 = await testAdminLogin();
  let test4 = { success: false };

  if (test3.success) {
    test4 = await testAdminFetch(test3.token);
  }

  console.log('\n==================================================');
  console.log('TEST SUMMARY');
  console.log('==================================================');
  console.log(`[OK] Form Submission: ${test1.success ? 'PASSED' : 'FAILED'}`);
  console.log(`[OK] Event Proposal: ${test2.success ? 'PASSED' : 'FAILED'}`);
  console.log(`[OK] Admin Login: ${test3.success ? 'PASSED' : 'FAILED'}`);
  console.log(`[OK] Admin Applications: ${test3.success ? (test4.success ? 'PASSED' : 'FAILED') : 'SKIPPED'}`);
  console.log('==================================================\n');

  if (!test1.success || !test2.success || !test3.success || (test3.success && !test4.success)) {
    process.exitCode = 1;
  }
}

runAllTests().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
