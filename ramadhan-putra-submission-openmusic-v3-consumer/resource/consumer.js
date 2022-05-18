require('dotenv').config();
const amqp = require('amqplib');
const PlaylistsSongService = require('./playlistsSongService');
const MailSender = require('./MailSender');
const Listener = require('./listener');

const init = async () => {
    const playlistsSongService = new PlaylistsSongService();
    const mailSender = new MailSender();
    const listener = new Listener(playlistsSongService, mailSender);

    const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
    const channel = await connection.createChannel();

    await channel.assertQueue('export:playlistsSong', {
        durable: true,
    });

    channel.consume('export:playlistsSong', listener.listen, { noAck: true });
};

init();