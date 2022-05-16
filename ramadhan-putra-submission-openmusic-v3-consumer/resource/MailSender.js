const nodemailer = require('nodemailer');

class MailSender {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: true,
      auth: {
        user: process.env.MAIL_ADDRESS,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  sendEmail(targetEmail, playlistName, content) {
    const message = {
      from: 'Open Music API V3',
      to: targetEmail,
      subject: `Ekspor Playlist ${playlistName}`,
      text: `Terlampir hasil dari ekspor playlist ${playlistName}`,
      attachments: [
        {
          filename: `playlist-${playlistName}.json`,
          content,
        },
      ],
    };

    return this.transporter.sendMail(message);
  }
}

module.exports = MailSender;