const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/invariantError');
const NotFoundError = require('../../exceptions/notFoundError');
const { shortSongs, longSongs } = require('../../utils/mapDBToModel/songs');

class songsService {
    constructor() {
        this._pool = new Pool();
    }
    async addSong({
        title,
        year,
        performer,
        genre,        
        duration,
        album_id,
    }) {
        const id = `song-${nanoid(16)}`;
        const result = await this._pool.query({
            text: 'INSERT INTO songs VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            values: [id, title, year, performer, genre, duration, album_id],
        });
        if (!result.rows[0].id) {
            throw new InvariantError('Album gagal ditambahkan');
        }
        return result.rows[0].id;
    }

    async getSongs() {
        const result = await this._pool.query({
            text: 'SELECT id, title, performer FROM songs',
        });
        return result.rows.map(shortSongs);
    }

    async getSongById(id) {
        const query = {
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [id],
        };
        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }
        return result.rows.map(longSongs)[0];
    }

    async getSongsByAlbumId(album_id) {
        const result = await this._pool.query({
            text: 'SELECT * FROM songs WHERE album_id = $1',
            values: [album_id],
        });
        return result.rows.map(longSongs);
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

    async editSongById(id, {
        title,
        year,
        performer,
        genre,        
        duration,
        album_id,
    }) {
        const query = {
            text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4,  duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
            values: [title, year, performer, genre, duration, album_id, id],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
        }
    }

    async deleteSongById(id) {
        const query = {
            text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
            values: [id],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
        }
    }
}

module.exports = songsService;