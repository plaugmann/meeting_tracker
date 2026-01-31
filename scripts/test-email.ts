import dotenv from 'dotenv';
dotenv.config();

async function testEmail() {
  const apiKey = process.env.AUTH_RESEND_KEY;
  const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';
  
  console.log('🧪 Testing Resend Email Configuration...\n');
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET');
  console.log('From:', emailFrom);
  console.log('');

  if (!apiKey) {
    console.error('❌ AUTH_RESEND_KEY not found in .env');
    process.exit(1);
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: 'delivered@resend.dev',
        subject: 'Test Email from EY Meeting Tracker',
        html: '<h1>Test Email</h1><p>This is a test email from your EY Meeting Tracker app.</p>',
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Email sent successfully!');
      console.log('Email ID:', data.id);
      console.log('\n📧 Check the Resend dashboard to see the email:');
      console.log('https://resend.com/emails/' + data.id);
    } else {
      console.error('❌ Failed to send email');
      console.error('Status:', response.status);
      console.error('Error:', JSON.stringify(data, null, 2));
      
      if (data.message?.includes('API key')) {
        console.log('\n💡 Tip: Check your API key at https://resend.com/api-keys');
      }
      if (data.message?.includes('domain')) {
        console.log('\n💡 Tip: Verify your domain or use onboarding@resend.dev');
      }
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

testEmail();
