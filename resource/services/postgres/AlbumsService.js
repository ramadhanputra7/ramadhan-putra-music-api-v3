const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const { mapDBToAlbumsModel } = require('../../utils');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor() {
      this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
      const id = `album-${nanoid(16)}`;

      const query = {
          text: 'insert into albums values($1, $2, $3)returning id',
          values: [id, name, year],
      }
      const result = await this._pool.query(query);

      if (!result.rows[0].id) {
          throw new InvariantError('Gagal menambahkan album')
      }
      return result.rows[0].id;
  }

  async getAlbums() {
      const result = await this._pool.query('select * from albums');
      return result.rows[0].id;
  }

  async getAlbumById(id) {
      const query = {
          text: 'SELECT * from albums where id= $1',
          values: [id]
      };

      const result = await this._pool.query(query);

      if (!result.rows.length) {
          throw new NotFoundError('Album tidak ditemukan');
      }
      return result.rows.map(mapDBToAlbumsModel)[0];
  }

  async editAlbumById(id, { name, year }) {
      const query = {
          text: 'update albums set name = $1, year = $2 where id = $3 returning id',
          values: [name, year, id]
      }

      const result = await this._pool.query(query);

      if (!result.rows.length) {
          throw new NotFoundError('Gagal memberbarui album. Id tidak ditemukan');
      }

  }

  async deleteAlbumById(id) {
      const query = {
          text: 'delete from albums where id = $1 returning id',
          values: [id],
      }

      const result = await this._pool.query(query);
      if (!result.rows.length) {
          throw new NotFoundError('Gagal menghapus Catatan. Id tidak ditemukan');
      }
  }

  async addCoverAlbum(id, coverUrl) {
      console.log(coverUrl, id)
      const query = {
          text: 'update albums set "coverUrl" = $1 WHERE id = $2 returning id',
          values: [coverUrl, id],
      };
      const result = await this._pool.query(query);

      if (!result.rows.length) {
          throw new InvariantError('Cover gagal ditambahkan');
      }
  }
}

module.exports = AlbumsService;