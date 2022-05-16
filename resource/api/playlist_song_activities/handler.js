const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError').default;

class PlaylistSongActivitiesHandler {
    constructor(service) {
        const { playlistSongActivitiesService, playlistsService } = service;
        this._service = playlistSongActivitiesService;
        this._playlistsService = playlistsService;
        autoBind(this);
    }

    async getActivitiesByIdPlaylistHandler(request, h) {
        try {
            const { id: credentialId } = request.auth.credentials;
            const { id: playlistId } = request.params;
            await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
            let activities = null;
            activities = await this._service.getActivitiesByIdPlaylist(playlistId, credentialId);
            return {
                status: 'success',
                data: {
                    playlistId,
                    activities,
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
                status: 'error',
                message: 'Maaf, terjadi kegagaln pada server Kami.',
            });
            response.code(500);
            console.log(error);
            return response;
        }
    }
}

module.exports = PlaylistSongActivitiesHandler;