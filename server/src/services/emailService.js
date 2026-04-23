// server/src/services/emailService.js
const https = require('https');

const envoyerEmail = async (to, toName, subject, htmlContent, textContent) => {// subject objet de l'email
  const data = JSON.stringify({  // convertir l'objet en chaine de caractere
    sender: {
      name: 'Mon Budget+',
      email: process.env.SMTP_FROM || process.env.SMTP_USER,
    },
    to: [{ email: to, name: toName || to }],
    subject,
    htmlContent,
    textContent,
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.brevo.com',
      port: 443,
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Brevo API error ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

exports.envoyerEmailVerification = async (email, prenom, token) => {
  const lienVerif = `${process.env.CLIENT_URL}/verification-email?token=${token}`;

  await envoyerEmail(
    email,
    prenom || email,
    'Vérifiez votre adresse email — Mon Budget+',
    `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
              <tr>
                <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px;text-align:center;">
                  <h1 style="margin:0;color:#fff;font-size:24px;">💰 Mon Budget+</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:40px;">
                  <h2 style="margin:0 0 16px;color:#1f2937;">Bonjour ${prenom || ''} 👋</h2>
                  <p style="color:#4b5563;line-height:1.6;">
                    Merci de vous être inscrit sur <strong>Mon Budget+</strong>.<br>
                    Cliquez sur le bouton ci-dessous pour vérifier votre adresse email.
                  </p>
                  <div style="text-align:center;margin:32px 0;">
                    <a href="${lienVerif}" style="background:#6366f1;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">
                      ✅ Vérifier mon email
                    </a>
                  </div>
                  <p style="color:#6b7280;font-size:13px;">
                    Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.
                  </p>
                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
                  <p style="margin:0;color:#9ca3af;font-size:12px;">
                    Si le bouton ne fonctionne pas :<br>
                    <a href="${lienVerif}" style="color:#6366f1;word-break:break-all;">${lienVerif}</a>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background:#f9fafb;padding:20px 40px;text-align:center;">
                  <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} Mon Budget+</p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
    `Bonjour ${prenom || ''},\n\nVérifiez votre email :\n${lienVerif}\n\n— Mon Budget+`
  );
};

exports.envoyerEmailResetMdp = async (email, prenom, token) => {
  const lienReset = `${process.env.CLIENT_URL}/mot-de-passe-oublie?token=${token}`;

  await envoyerEmail(
    email,
    prenom || email,
    'Réinitialisation de mot de passe — Mon Budget+',
    `
      <!DOCTYPE html>
      <html lang="fr">
      <body style="margin:0;padding:40px 0;background:#f4f4f5;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
            <tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:24px;">💰 Mon Budget+</h1>
            </td></tr>
            <tr><td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#1f2937;">Réinitialisation du mot de passe</h2>
              <p style="color:#4b5563;line-height:1.6;">
                Bonjour ${prenom || ''},<br>
                Vous avez demandé la réinitialisation de votre mot de passe.<br>
                Ce lien expire dans <strong>1 heure</strong>.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${lienReset}" style="background:#6366f1;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;display:inline-block;">
                  🔑 Réinitialiser mon mot de passe
                </a>
              </div>
              <p style="color:#6b7280;font-size:13px;">
                Si vous n'avez pas fait cette demande, ignorez cet email.
              </p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                <a href="${lienReset}" style="color:#6366f1;word-break:break-all;">${lienReset}</a>
              </p>
            </td></tr>
          </table>
        </td></tr></table>
      </body>
      </html>
    `,
    `Bonjour ${prenom || ''},\n\nRéinitialisez votre mot de passe :\n${lienReset}\n\nCe lien expire dans 1 heure.\n\n— Mon Budget+`
  );
};