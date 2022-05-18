class Listener {
  constructor(playlistsSongService, mailSender) {
      this._playlistsSongService = playlistsSongService;
      this._mailSender = mailSender;

      this.listen = this.listen.bind(this);
  }

  async listen(message) {
      try {
          const {
              playlistId,
              targetEmail,
          } = JSON.parse(message.content.toString());

          const {
              id,
              name,
          } = await this._playlistsSongService.getPlaylistsSong(
              playlistId,
          );
          const songs = await this._playlistsSongService.getSongsByPlaylistId(
              playlistId,
          );

          const playlist = {
              id,
              name,
              songs,
          };

          const result = await this._mailSender.sendEmail(
              targetEmail,
              JSON.stringify(playlist),
          );
          console.log(result);
          }
          catch (error) {
              console.error(error);
      }
  }
}
module.exports = Listener;