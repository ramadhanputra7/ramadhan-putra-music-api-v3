const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError')


class PlaylistSongsService {

    constructor() {
        this._pool = new Pool();

    }

    async addSongsToPlaylist(playlistId, songId) {
        const id = `playlistsongs-${nanoid(16)}`;
        const query = {
            text: 'insert into playlistsongs values ($1,$2,$3) returning id',
            values: [id, playlistId, songId]
        };
        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('gagal menambahkan song ke dalam playlist');
        }
        return result.rows[0].id;
    }

    async deleteSongsFromPlaylist(playlistId, songId) {

        const query = {
            text: 'delete from playlistsongs where playlist_id = $1 and song_id = $2 returning id',
            values: [playlistId, songId]
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Gagal menghapus song dalam playlist. Id tidak ditemukan');
        }

    }
}

module.exports = PlaylistSongsService;