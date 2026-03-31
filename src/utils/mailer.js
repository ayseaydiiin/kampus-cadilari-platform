const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS: smtpPassPrimary,
  SMTP_PASSWORD: smtpPassFallback,
  SMTP_FROM: smtpFromPrimary,
} = process.env;

const SMTP_PASS = smtpPassPrimary || smtpPassFallback || '';
const SMTP_FROM = smtpFromPrimary || SMTP_USER || '';

function isConfigured() {
  return SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && SMTP_FROM;
}

let transporterPromise = null;

async function getTransporter() {
  if (!isConfigured()) return null;
  if (transporterPromise) return transporterPromise;
  transporterPromise = (async () => {
    try {
      const nodemailer = await import('nodemailer');
      return nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });
    } catch (err) {
      console.error('Mailer init error:', err?.message);
      return null;
    }
  })();
  return transporterPromise;
}

export async function sendEmail({ to, subject, text, html }) {
  const transporter = await getTransporter();
  if (!transporter) {
    return { success: false, error: 'SMTP not configured or nodemailer missing' };
  }
  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
