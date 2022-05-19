const ClientError = require('../../exceptions/clientError');

class albumsHandler {
    constructor(service, validator) {
        const { albumsService, songsService } = service;
        this._service = albumsService;
        this._songsService = songsService;
        this._validator = validator;
        this.postAlbumHandler = this.postAlbumHandler.bind(this);
        this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
        this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
        this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    }

    async postAlbumHandler({ payload }, h) {
        try {
            this._validator.validateAlbumPayload(payload);
            const albumId = await this._service.addAlbums(payload);
            const response = h.response({
                status: 'success',
                message: 'Album berhasil ditambahkan',
                data: { albumId },
            });
            response.code(201);
            return response;
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }
            const response = h.response({
                status: 'error',
                message: 'Maaf terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        } 
    }

    async getAlbumByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const songs = await this._songsService.getSongsByAlbumId(id);
            const album = await this._service.getAlbumById(id);
            album.songs = songs;
            return {
                status: 'success',
                data: { album },
            };
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }

    async putAlbumByIdHandler(request, h) {
        try {
            this._validator.validateAlbumPayload(request.payload);
            const { id } = request.params;
            await this._service.editAlbumById(id, request.payload);
            return {
                status: 'success',
                message: 'Album berhasil diperbarui',
            };
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan di server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }

    async deleteAlbumByIdHandler(request, h) {
        try {
            const { id } = request.params;
            await this._service.deleteAlbumById(id);
            return {
                status: 'success',
                message: 'Album berhasil dihapus',
            };
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }
            const response = h.response({
                status: 'error',
                message: 'Maaf terjadi kegagalan di server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }
}

module.exports = albumsHandler;