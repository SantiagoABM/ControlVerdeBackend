const { Server } = require('socket.io');

function setupSocket(server) {
  const io = new Server(server);

  io.on('connection', async (socket) => {
    console.log('Nuevo cliente conectado');

    // Enviar mensajes antiguos
    const messages = await reporteController.buscarReporte();
    socket.emit('chat-history', messages);

    // Escuchar nuevos mensajes
    socket.on('new-message', async (data) => {
      const savedMessage = await messageService.saveMessage(data);
      io.emit('new-message', savedMessage);
    });
  });
}

module.exports = { setupSocket };