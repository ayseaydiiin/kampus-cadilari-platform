#!/usr/bin/env node

/**
 * Integration Test Script
 * Tests the entire user journey from form submission to admin review
 */

const BASE_URL = 'http://localhost:4321';

async function log(title, message, status = 'info') {
  const emoji = {
    info: 'ℹ️ ',
    success: '✅ ',
    error: '❌ ',
    test: '🧪'
  };
  console.log(`\n${emoji[status]} ${title}`);
  if (message) console.log(`   ${message}`);
}

async function testFormSubmission() {
  log('TEST 1', 'Başvuru Formu Gönderme', 'test');

  const applicationData = {
    full_name: 'Test Kullanıcı',
    email: 'test.user@example.com',
    phone: '+90 555 123 4567',
    province: 'İstanbul',
    organization: 'Boğaziçi Üniversitesi',
    skills: ['organizing', 'writing'],
    social_media: '@testuser',
    message: 'Feminist aktivizmde yer almak istiyorum ve Kampüs Cadıları hareketi ile kadın hakları mücadelesinde rol oynamak isterim.'
  };

  try {
    log('POST', '/api/submit-application gönderiliyor...');
    const response = await fetch(`${BASE_URL}/api/submit-application`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(applicationData)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      log('Response', `Status: ${response.status} - ${data.message}`, 'success');
      log('Application ID', data.applicationId, 'success');
      return { success: true, applicationId: data.applicationId };
    } else {
      log('API Hatası', `${data.error || 'Bilinmeyen hata'}`, 'error');
      return { success: false };
    }
  } catch (error) {
    log('Network Hatası', error.message, 'error');
    return { success: false };
  }
}

async function testEventProposal() {
  log('TEST 2', 'Etkinlik Önerisi Gönderme', 'test');

  const proposalData = {
    title: 'Feminist Film Gösterimi: Erkeklerin Ağlayamadığı',
    proposed_by: 'Ayşe Yılmaz',
    email: 'ayse@example.com',
    province: 'İzmir',
    description: 'Feminist sinema dilini tartışmak için üniversite kampüsünde film gösterimi ve diyalog oturumu.',
    category: 'kulturel'
  };

  try {
    log('POST', '/api/submit-event-proposal gönderiliyor...');
    const response = await fetch(`${BASE_URL}/api/submit-event-proposal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proposalData)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      log('Response', `Status: ${response.status} - ${data.message}`, 'success');
      log('Proposal ID', data.proposalId, 'success');
      return { success: true, proposalId: data.proposalId };
    } else {
      log('API Hatası', `${data.error || 'Bilinmeyen hata'}`, 'error');
      return { success: false };
    }
  } catch (error) {
    log('Network Hatası', error.message, 'error');
    return { success: false };
  }
}

async function testAdminLogin() {
  log('TEST 3', 'Admin Giriş', 'test');

  if (!(process.env.TEST_ADMIN_PASSWORD || process.env.ADMIN_DEFAULT_PASSWORD)) {
    log('Eksik ortam degiskeni', 'TEST_ADMIN_PASSWORD veya ADMIN_DEFAULT_PASSWORD tanimlanmali', 'error');
    return { success: false };
  }

  const loginData = {
    email: 'admin@kampuscadilari.org',
    password: (process.env.TEST_ADMIN_PASSWORD || process.env.ADMIN_DEFAULT_PASSWORD || '')
  };

  try {
    log('POST', '/api/auth/login gönderiliyor...');
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });

    console.log(`   Response Status: ${response.status}`);
    const text = await response.text();
    console.log(`   Response Text: ${text.substring(0, 200)}`);

    try {
      const data = JSON.parse(text);
      if (response.ok && data.success) {
        log('Admin Giriş', 'Başarılı!', 'success');
        log('Token', data.token?.substring(0, 30) + '...', 'success');
        return { success: true, token: data.token };
      } else {
        log('Login Hatası', data.error || 'Bilinmeyen hata', 'error');
        return { success: false };
      }
    } catch (parseError) {
      log('JSON Parse Hatası', parseError.message, 'error');
      return { success: false };
    }
  } catch (error) {
    log('Network Hatası', error.message, 'error');
    return { success: false };
  }
}

async function testAdminFetch(token) {
  log('TEST 4', 'Admin Panel - Başvuruları Getirme', 'test');

  try {
    log('GET', '/api/admin/applications gönderiliyor...');
    const response = await fetch(`${BASE_URL}/api/admin/applications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`   Response Status: ${response.status}`);
    const data = await response.json();

    if (Array.isArray(data)) {
      log('Başvurular Başarıyla Getirildi', `Toplam: ${data.length} başvuru`, 'success');
      if (data.length > 0) {
        log('Son Başvuru', `${data[0].full_name} - ${data[0].email}`, 'info');
      }
      return { success: true, applications: data };
    } else {
      log('Beklenmeyen Response', JSON.stringify(data).substring(0, 100), 'error');
      return { success: false };
    }
  } catch (error) {
    log('Hata', error.message, 'error');
    return { success: false };
  }
}

async function runAllTests() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 DİJİTAL MOR KARARGAH - İNTEGRASYON TESTİ');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Wait for server to be ready
  log('Sistem', 'Dev server hazırlanıyor (3 saniye bekleme)...', 'info');
  await new Promise(r => setTimeout(r, 3000));

  // Run tests
  const test1 = await testFormSubmission();
  const test2 = await testEventProposal();
  const test3 = await testAdminLogin();

  if (test3.success) {
    const test4 = await testAdminFetch(test3.token);
  }

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 TEST ÖZETI');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Başvuru Submission: ${test1.success ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Event Proposal: ${test2.success ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Admin Login: ${test3.success ? 'PASSED' : 'FAILED'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

runAllTests().catch(console.error);
