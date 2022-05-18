const clientError = require('../../exceptions/clientError');

class songsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;
        // For 'this' below mark on instance from notesService
        this.postSongHandler = this.postSongHandler.bind(this);
        this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
        this.getSongHandler = this.getSongHandler.bind(this);
        this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
        this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
    }

    async postSongHandler(request, h) {
        try {
            this._validator.validateSongPayload(request.payload);
            const {
                title = 'untitled',
                year,
                genre,
                performer,
                duration,
                albumId,
            } = request.payload;
            const songId = await this._service.addSong({
                title,
                year,
                genre,
                performer,
                duration,
                albumId,
            });

            const response = h.response({
                status: 'success',
                message: 'Music berhasil ditambahkan',
                data: { songId },
            });
            response.code(201);
            return response;
        } catch (error) {
            if (error instanceof clientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }
            //  Server error
            const response = h.response({
                status: 'error',
                message: 'Maaf terjadi kegagalan di server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }

    async getSongHandler(request, h) {
        try {
            const { title, performer } = request.query;
            let songs = await this._service.getSongs();
            if (title) {
                songs = songs.filter((song) => song.title
                    .toLowerCase().includes(title.toLowerCase()));
            }
            if (performer) {
                songs = songs.filter((song) => song.performer
                    .toLowerCase().includes(performer.toLowerCase()));
            }
            return {
                status: 'success',
                data: { songs },
            };
        } catch (error) {
            const response = h.response({
                status: 'error',
                message: 'Maaf terjadi kegagalan di servrr kami',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }

    async getSongByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const song = await this._service.getSongById(id);
            return {
                status: 'success',
                data: { song },
            };
        } catch (error) {
            if (error instanceof clientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }
            //  Server error
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan di server kami.',
            });
            response.code(500);
            console.error(error);
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
                message: 'Music berhasil diperbarui',
            };
        } catch (error) {
            if (error instanceof clientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }
            //  Server error
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan di server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }

    async deleteSongByIdHandler(request, h) {
        try {
            const { id } = request.params;
            await this._service.deleteSongById(id);
            return {
                status: 'success',
                message: 'Music berhasil dihapus',
            };
        } catch (error) {
            if (error instanceof clientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }
            //  Server error
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

module.exports = songsHandler;