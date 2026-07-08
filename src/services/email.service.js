const nodemailer = require('nodemailer');

// Configurar el transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true para 465, false para otros puertos
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Error en configuración de email:', error);
    } else {
        console.log('✅ Servidor de email listo');
    }
});

async function enviarCorreo({ para, asunto, texto, html }) {
    try {
        const info = await transporter.sendMail({
            from: `Mi Control<${process.env.EMAIL_FROM}>`,
            to: para, // puede ser un string o un array
            subject: asunto,
            text: texto, // versión texto plano
            html: html // versión HTML
        });

        console.log('✅ Correo enviado:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error al enviar correo:', error);
        throw error;
    }
}

module.exports = {
    enviarCorreo
};