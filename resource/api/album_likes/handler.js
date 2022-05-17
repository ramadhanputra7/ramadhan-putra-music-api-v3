const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError').default;

class AlbumLikesHandler {
    constructor(service) {
        const { albumLikesService, albumsService } = service;
        this._service = albumLikesService;
        this._albumsService = albumsService;
        autoBind(this);
    }

    async postAlbumLikesHandler(request, h) {
        try {
            const { id: user_id } = request.auth.credentials;
            const { id: album_id } = request.params;
            await this._albumsService.getAlbumById(album_id);
            const isDuplicate = await this._service.albumAlreadyLiked(user_id, album_id);
            const retMessage = isDuplicate ?
                await this._service.deleteAlbumLikes(user_id, album_id) :
                await this._service.addAlbumLikes(user_id, album_id);
            const response = h.response({
                status: 'success',
                message: retMessage,
                data: {
                    album_id,
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
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.log(error);
            return response;
        }
    }

    async countAlbumLikesHandler(request, h) {
        try {
            const { id: album_id } = request.params;
            const { dataSource, likes } = await this._service.getAlbumLikesByAlbum_id(album_id);
            const response = h.response({
                status: 'success',
                data: {
                    likes,
                },
            });
            response.header('X-Data-Source', dataSource);
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
                message: 'Maaf, terjadi kegagaln pada server Kami.',
            });
            response.code(500);
            console.log(error);
            return response;
        }
    }
}

module.exports = AlbumLikesHandler;