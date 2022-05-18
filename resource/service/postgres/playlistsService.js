const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationError = require('../../exceptions/authorizationError');
const InvariantError = require('../../exceptions/invariantError');
const NotFoundError = require('../../exceptions/notFoundError');

class playlistsService {
    constructor(collaborationsService, cacheService) {
        this._pool = new Pool();
        this._collaborationsService = collaborationsService;
        this._cacheService = cacheService;
    }

    //  add playlist to the database, and return the id
    async addPlaylists({ name, credentialId: owner }) {
        const id = `playlist-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
            values: [id, name, owner],
        };
        const result = await this._pool.query(query);
        if (!result.rows[0].id) {
            throw new InvariantError('Playlists gagal ditambahkan.');
        }
        return result.rows[0].id;
    }

    //  return playlist user owner
    async getPlaylists(owner) {
        const result = await this._pool.query({
            text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
                LEFT JOIN users ON users.id = playlists.owner 
                LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
                WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
            values: [owner],
        });
        return result.rows;
    }

    //  get playlist based on id
    async getPlaylistsById(id) {
        const result = await this._pool.query({
            text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
                    LEFT JOIN users ON users.id = playlists.owner 
                    WHERE playlists.id = $1`,
            values: [id],
        });
        if (!result.rows.length) {
            throw new NotFoundError('Playlists tidak ditemukan');
        }
        return result.rows[0];
    }

    //  delete playlist based on id
    async deletePlaylistById(id) {
        const result = await this._pool.query({
            text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
            values: [id],
        });
        if (!result.rows.length) {
            throw new NotFoundError('Playlists gagal dihapus. Id tidak ditemukan');
        }
    }

    //  verify playlist owned by owner
    async verifyPlaylistOwner(id, owner) {
        const query = {
            text: 'SELECT * FROM playlists WHERE id = $1',
            values: [id],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Playlists tidak ditemukan');
        }
        const playlist = result.rows[0];
        if (playlist.owner !== owner) {
            throw new AuthorizationError('Anda tidak berhak mengakses source ini');
        }
    }

    //  verify playlist access based on owner
    async verifyPlaylistAccess(playlist_id, user_id) {
        try {
            await this.verifyPlaylistOwner(playlist_id, user_id);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            try {
                await this._collaborationsService.verifyCollaborator(playlist_id, user_id);
            } catch {
                throw error;
            }
        }
    }
}

module.exports = playlistsService;