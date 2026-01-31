import dotenv from 'dotenv';
dotenv.config();

async function testEmail() {
  const apiKey = process.env.AUTH_RESEND_KEY;
  const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';
  const testTo = 'soerenplaugmann@gmail.com';
  
  console.log('🧪 Testing Resend Email to Your Address...\n');
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET');
  console.log('From:', emailFrom);
  console.log('To:', testTo);
  console.log('');

  if (!apiKey) {
    console.error('❌ AUTH_RESEND_KEY not found in .env');
    process.exit(1);
  }

  try {
    console.log('📤 Sending email...\n');
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: testTo,
        subject: 'Test Email from EY Meeting Tracker',
        html: `
          <h1>🎉 Test Email Successful!</h1>
          <p>This is a test email from your EY Meeting Tracker application.</p>
          <p>If you received this, your Resend configuration is working correctly.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Sent from: ${emailFrom}<br>
            Time: ${new Date().toISOString()}
          </p>
        `,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Email sent successfully!');
      console.log('Email ID:', data.id);
      console.log('\n📧 Check your inbox: soerenplaugmann@gmail.com');
      console.log('(Also check spam/promotions folders)');
      console.log('\n🔗 View in Resend dashboard:');
      console.log('https://resend.com/emails/' + data.id);
    } else {
      console.error('❌ Failed to send email');
      console.error('Status:', response.status);
      console.error('Response:', JSON.stringify(data, null, 2));
      
      if (data.message) {
        console.log('\n💬 Error message:', data.message);
      }
      
      if (data.message?.includes('API key')) {
        console.log('\n💡 Tip: Your API key may be invalid or expired');
        console.log('Check: https://resend.com/api-keys');
      }
      if (data.message?.includes('domain')) {
        console.log('\n💡 Tip: You may need to verify your sending domain');
        console.log('Or use: onboarding@resend.dev (default test domain)');
      }
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

testEmail();
