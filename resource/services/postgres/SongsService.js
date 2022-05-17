const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { mapDBToModel } = require('../../utils')
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');


class SongsService {
    constructor() {
        this._pool = new Pool();
    }

    async addSong({ title, year, performer, genre, duration, album_id }) {
        const id = nanoid(16)
            //const albumID = nanoid(16)

        const query = {
            text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            values: [id, title, year, genre, performer, duration, album_id]
        }

        const result = await this._pool.query(query);
        if (!result.rows[0].id) {
            throw new InvariantError('musik gagal ditambahkan');
        }

        return result.rows[0].id;



    }

    async getAllSongs() {
        const result = await this._pool.query('SELECT id,title,performer from songs');

        return result.rows.map(mapDBToModel)
    }

    async getSongById(id) {
        const query = {
            text: 'select * from songs where id = $1',
            values: [id],
        }
        const result = await this._pool.query(query);
        if (!result.rows[0]) {
            throw new NotFoundError('Lagu tidak ditemukan')
        }
        return result.rows.map(mapDBToModel)[0];
    }

    async editSongById(id, { title, year, genre, performer, duration, album_id }) {
        const query = {
            text: 'UPDATE songs set title = $1,year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 where id = $7 RETURNING id',
            values: [title, year, genre, performer, duration, album_id, id],
        };
        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
        }



    }

    async deleteSongById(id) {
        const query = {
            text: 'DELETE from songs where id = $1 returning id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('gagal menghapus lagu. Id tidak ditemukan')
        }

    }
    async getSongsByPlaylistId(playlistId) {
        const query = {
            text: 'select songs.id, songs.title, songs.performer from songs left join playlistsongs ON playlistsongs.song_id = songs.id where playlistsongs.playlist_id= $1',
            values: [playlistId],
        };
        const result = await this._pool.query(query);

        return result.rows;


    }
}



module.exports = SongsService;