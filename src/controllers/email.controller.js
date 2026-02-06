const emailService = require("../services/email.service.js");

const enviarRecordatorio = async (req, res) => {
    try {
        const resultado = await emailService.enviarCorreo({
            para: "alvaro.meza1510@gmail.com",
            asunto: "RECORDATORIO SEMANAL BITÁCORA",
            texto: "No te olvides de ingresar a la plataforma para descargar la bitácora semanal.",
            html: `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; padding: 40px;">
                            <tr>
                                <td align="center">
                                    <h1 style="color: #333333; margin-bottom: 20px;">¡Hola ${"Santiago"}!</h1>
                                    <p style="color: #666666; font-size: 16px; line-height: 24px; margin-bottom: 30px;">
                                        Este es un recordatorio para descargar la bitácora semanal. Haz clic en el botón para acceder a la plataforma.
                                    </p>
                                    
                                    <!-- Botón Verde -->
                                    <a href="https://micontrol.netlify.app/auth" 
                                       style="display: inline-block; 
                                              background-color: #28a745; 
                                              color: #ffffff; 
                                              text-decoration: none; 
                                              padding: 15px 40px; 
                                              border-radius: 5px; 
                                              font-size: 16px; 
                                              font-weight: bold;
                                              margin: 20px 0;">
                                        Ingresa aquí
                                    </a>
                                    
                                    <p style="color: #999999; font-size: 14px; margin-top: 30px;">
                                        Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
                                        <a href="https://micontrol.netlify.app/auth" style="color: #28a745;">https://micontrol.netlify.app/auth</a>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>` // Puedes personalizar el HTML según tus necesidades
        });

        return res.status(200).json({
            success: true,
            message: 'Correo enviado exitosamente',
            messageId: resultado.messageId
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al enviar el correo',
            error: error.message
        });
    }
};

module.exports = {
    enviarRecordatorio
};