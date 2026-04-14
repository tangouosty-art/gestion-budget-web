// server/src/services/emailService.js
const nodemailer = require('nodemailer');

// Créer le transporteur SMTP à partir des variables d'environnement
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true pour le port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Envoie l'email de vérification à l'utilisateur.
 * @param {string} email - Adresse email du destinataire
 * @param {string} prenom - Prénom de l'utilisateur
 * @param {string} token - Token de vérification
 */
exports.envoyerEmailVerification = async (email, prenom, token) => {
  const lienVerif = `${process.env.CLIENT_URL}/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"Mon Budget+" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: 'Vérifiez votre adresse email — Mon Budget+',
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="margin:0;padding:0;background:#f4f4f5;font-family:Inter,Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
              <!-- En-tête -->
              <tr>
                <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px;text-align:center;">
                  <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">💰 Mon Budget+</h1>
                </td>
              </tr>
              <!-- Corps -->
              <tr>
                <td style="padding:40px;">
                  <h2 style="margin:0 0 16px;color:#1f2937;font-size:20px;">Bonjour ${prenom || 'là'} 👋</h2>
                  <p style="margin:0 0 24px;color:#4b5563;line-height:1.6;">
                    Merci de vous être inscrit sur <strong>Mon Budget+</strong>.<br>
                    Cliquez sur le bouton ci-dessous pour vérifier votre adresse email et activer votre compte.
                  </p>
                  <div style="text-align:center;margin:32px 0;">
                    <a href="${lienVerif}"
                       style="background:#6366f1;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">
                      ✅ Vérifier mon email
                    </a>
                  </div>
                  <p style="margin:24px 0 0;color:#6b7280;font-size:13px;line-height:1.5;">
                    Ce lien expire dans <strong>24 heures</strong>.<br>
                    Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.
                  </p>
                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
                  <p style="margin:0;color:#9ca3af;font-size:12px;">
                    Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
                    <a href="${lienVerif}" style="color:#6366f1;word-break:break-all;">${lienVerif}</a>
                  </p>
                </td>
              </tr>
              <!-- Pied -->
              <tr>
                <td style="background:#f9fafb;padding:20px 40px;text-align:center;">
                  <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} Mon Budget+ · Tous droits réservés</p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
    text: `Bonjour ${prenom || ''},\n\nVérifiez votre email en cliquant sur ce lien :\n${lienVerif}\n\nCe lien expire dans 24 heures.\n\n— Mon Budget+`,
  });
};

/**
 * Envoie l'email de réinitialisation de mot de passe.
 * @param {string} email
 * @param {string} prenom
 * @param {string} token
 */
exports.envoyerEmailResetMdp = async (email, prenom, token) => {
  const lienReset = `${process.env.CLIENT_URL}/auth/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"Mon Budget+" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: 'Réinitialisation de mot de passe — Mon Budget+',
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <body style="margin:0;padding:40px 0;background:#f4f4f5;font-family:Inter,Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
            <tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:24px;">💰 Mon Budget+</h1>
            </td></tr>
            <tr><td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#1f2937;">Réinitialisation du mot de passe</h2>
              <p style="color:#4b5563;line-height:1.6;">
                Bonjour ${prenom || ''},<br>
                Vous avez demandé la réinitialisation de votre mot de passe.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${lienReset}"
                   style="background:#6366f1;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;display:inline-block;">
                  🔑 Réinitialiser mon mot de passe
                </a>
              </div>
              <p style="color:#6b7280;font-size:13px;">
                Ce lien expire dans <strong>1 heure</strong>.<br>
                Si vous n'avez pas fait cette demande, ignorez cet email.
              </p>
            </td></tr>
          </table>
        </td></tr></table>
      </body>
      </html>
    `,
    text: `Bonjour ${prenom || ''},\n\nRéinitialisez votre mot de passe :\n${lienReset}\n\nCe lien expire dans 1 heure.\n\n— Mon Budget+`,
  });
};
