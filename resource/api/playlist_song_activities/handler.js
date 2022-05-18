const ClientError = require('../../exceptions/clientError');

class playlistSongActivitiesHandler {
    constructor(service) {
        const { playlistSongsActivitiesService, playlistsService } = service;
        this._service = playlistSongsActivitiesService;
        this._playlistsService = playlistsService;

        this.getActivitiesByIdPlaylistHandler = this.getActivitiesByIdPlaylistHandler.bind(this);
    }

    //  get activities based on id
    async getActivitiesByIdPlaylistHandler(request, h) {
        try {
            const { id: credentialId } = request.auth.credentials;
            const { id: playlistId } = request.params;
            await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
            let activities = null;
            activities = await this._service.getActivitiesByIdPlaylist(playlistId, credentialId);
            return {
                status: 'success',
                data: { playlistId, activities },
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
            //  Server error
            const response = h.response({
                status: 'fail',
                message: 'Maaf, terjadi kegagalan di server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }
}

module.exports = playlistSongActivitiesHandler;