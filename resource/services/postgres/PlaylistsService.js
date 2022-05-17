const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')



class PlaylistService {
    constructor(collaborationsService) {
        this._pool = new Pool();
        this._collaborationsService = collaborationsService;
    }


    async addPlaylists({ name, credentialId: owner }) {
        const id = `playlists-${nanoid(16)}`;
        const query = {
            text: 'insert into playlists values ($1 ,$2, $3) returning id',
            values: [id, name, owner]
        }
        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Playlist gagal ditambahkan');
        }
        return result.rows[0].id;
    }

    async getPlaylists(owner) {
        const query = {
            text: `SELECT playlists.id, playlists.name, users.username FROM playlists LEFT JOIN users ON users.id = playlists.owner LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
            values: [owner]
        };

        const result = await this._pool.query(query);
        return result.rows;

    }
    async getPlaylistsById(id) {
        const query = {
            text: `select playlists.id, playlists.name, users.username from playlists LEFT JOIN users ON users.id = playlists.owner where playlists.id = $1`,
            values: [id],
        }
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('playlist tidak ditemukan');
        }
        return result.rows[0];
    }

    async deletePlaylistsById(id) {
        //console.log(id);
        const query = {
            text: 'delete from playlists where id = $1 returning id',
            values: [id],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Gagal menghapus playlist. Id tidak ditemukan');
        }
    }


    async verifyPlaylistOwner(id, owner) {
        const query = {
            text: 'select * from playlists where id = $1',
            values: [id],

        }
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }
        const playlist = result.rows[0];
        if (playlist.owner !== owner) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
    }

    async verifyPlaylistAccess(playlistId, userId) {
        try {
            await this.verifyPlaylistOwner(playlistId, userId);

        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            try {
                await this._collaborationsService.verifyCollaborator(playlistId, userId);
            } catch {
                throw error;
            }
        }
    }
}

module.exports = PlaylistService;