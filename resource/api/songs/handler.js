const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError');

class SongsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;
        autoBind(this);
    }

    async postSongHandler(request, h) {
        try {
            this._validator.validateSongPayload(request.payload);
            const {
                title,
                year,
                genre,
                performer,
                duration,
                albumId,
            } = request.payload;
            const songId = await this._service.addSongs({
                title,
                year,
                genre,
                performer,
                duration,
                albumId,
            });
            const response = h.response({
                status: 'success',
                message: 'Lagu Berhasil ditambahkan',
                data: {
                    songId,
                },
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
                status: 'Error',
                message: 'Maaf, terjadi kegagalan pada server Kami',
            });
            response.code(500);
            console.log(error);
            return response;
        }
    }

    async getSongsHandler(request, h) {
        try {
            const { query } = request;
            const songs = await this._service.getSongs(query);
            return {
                status: 'success',
                data: {
                    songs,
                },
            };
        } catch (error) {
            const response = h.response({
                status: 'Error',
                message: 'Maaf, terjadi kegagaln pada server Kami',
            });
            response.code(500);
            console.log(error);
            return response;
        }
    }

    async getSongByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const song = await this._service.getSongById(id);
            return {
                status: 'success',
                data: {
                    song,
                },
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
                status: 'Error',
                message: 'Maaf, terjadi kegagaln pada server Kami',
            });
            response.code(500);
            console.log(error);
            return response;
        }
    }

    async putSongByIdHandler(request, h) {
        try {
            this._validator.validateSongPayload(request.payload);
            const { id } = request.params;
            await this._service.editSongById(id, request.payload);
            return {
                status: 'success',
                message: 'Lagu Berhasil diperbarui',
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
                status: 'Error',
                message: 'Maaf, terjadi kegagal pada server Kami',
            });
            response.code(500);
            console.log(error);
            return response;
        }
    }

    async deleteSongByIdHandler(request, h) {
        try {
            const { id } = request.params;
            await this._service.deleteSongById(id);
            return {
                status: 'success',
                message: 'Lagu Berhasil dihapus',
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
                status: 'fail',
                message: 'Maaf, terjadi kegagalan pada server Kami',
            });
            response.code(500);
            console.log(error);
            return response;
        }
    }
}

module.exports = SongsHandler;