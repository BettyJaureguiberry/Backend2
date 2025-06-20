import jwt from 'jsonwebtoken';

import nodemailer from 'nodemailer';

export const generateResetToken = (email) => {
    return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

export function verifyResetToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
    },
});

export const sendRecoveryEmail = async (email, token) => {
    const resetLink = `${process.env.APP_BASE_URL}/reset-password.html?token=${token}`;
    await transporter.sendMail({
        from: "Recuperación <no-reply@example.com>",
        to: email,
        subject: "Restablece tu contraseña",
        html: `<p>Recibiste este mensaje porque solicitaste restablecer tu contraseña.</p>
                <a href="${resetLink}" style="display:inline-block;padding:12px 20px;background:#4CAF50;color:#fff;text-decoration:none;border-radius:5px;">
                    Restablecer contraseña
                </a>
                <p>Este enlace expirará en una hora.</p>
                `

    });
};