const { Pool } = require('pg');

class PlaylistsSongService {
    constructor() {
        this._pool = new Pool();
    }

    async getPlaylistsSong(playlistId) {
        const playlist = await this.getPlaylistById(playlistId);
        const songs = await this.getSongsByPlaylistId(playlistId);
        playlist.songs = songs;
        return playlist;
    }

    async getPlaylistById(id) {
        const result = await this._pool.query({
            text: 'SELECT id, name FROM playlists WHERE id = $1',
            values: [id],
        });
        return result.rows[0];
    }

    async getSongsByPlaylistId(playlistId) {
        const result = await this._pool.query({
            text: `SELECT songs.id, songs.title, songs.performer FROM songs 
                    LEFT JOIN playlist_songs ON playlist_songs.song_id = songs.id 
                    WHERE playlist_songs.playlist_id = $1`,
            values: [playlistId],
        });
        return result.rows;
    }
}

module.exports = PlaylistsSongService;