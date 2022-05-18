const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/invariantError');

class AlbumsLikesService {
    constructor(cacheService) {
        this._pool = new Pool();
        this._cacheService = cacheService;
    }

    async addAlbumsLikes(userId, albumId) {
        const id = `user-albums-likes-${nanoid(16)}`;
        const result = await this._pool.query({
            text: 'INSERT INTO user_album_likes VALUES ($1, $2, $3) RETURNING id',
            values: [id, userId, albumId],
        });
        if (!result.rows[0].id) {
            throw new InvariantError('Gagal menyukai album');
        }
        await this._cacheService.delete(`musicdb:${albumId}`);
        return 'Berhasil menyukai album';
    }

    async deleteAlbumsLikes(userId, albumId) {
        const result = await this._pool.query({
            text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
            values: [userId, albumId],
        });
        if (!result.rows[0].id) {
            throw new InvariantError('Gagal untuk mengubah suka album');
        }
        await this._cacheService.delete(`musicdb:${albumId}`);
        return 'Berhasil mengubah suka album';
    }

    async albumLiked(userId, albumId) {
        const result = await this._pool.query({
            text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
            values: [userId, albumId],
        });
        return result.rows.length;
    }

    async getAlbumsLikesById(albumId) {
        try {
            const result = await this._cacheService.get(`musicdb:${albumId}`);
            return {
                sourceData: 'cache',
                likes: JSON.parse(result),
            };
        } catch (error) {
            const result = await this._pool.query({
                text: 'SELECT COUNT(id) AS total FROM user_album_likes WHERE album_id = $1',
                values: [albumId],
            });
            const total = parseInt(result.rows[0].total, 10);
            await this._cacheService.set(
                `musicdb:${albumId}`,
                JSON.stringify(total),
            );
            return {
                sourceData: 'database',
                likes: total,
            };
        }
    }
}

module.exports = AlbumsLikesService;