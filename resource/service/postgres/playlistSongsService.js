const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/invariantError');
const NotFoundError = require('../../exceptions/notFoundError');

class playlistSongsService {
    constructor() {
        this._pool = new Pool();
    }

    //  add song to playlist
    async addSongsPlaylist(playlistId, songId) {
        const id = `playlist-songs-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO playlist_songs VALUES ($1, $2, $3) RETURNING id',
            values: [id, playlistId, songId],
        };
        const result = await this._pool.query(query);
        if (!result.rows[0].id) {
            throw new InvariantError('Playlist Song gagal ditambahkan.');
        }
        return result.rows[0].id;
    }

    //  delete songs in playlist
    async deleteSongsPlaylist(playlistId, songId) {
        const query = {
            text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
            values: [playlistId, songId],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Playlist Song gagal dihapus.');
        }
        return result.rows[0].id;
    }
}

module.exports = playlistSongsService;