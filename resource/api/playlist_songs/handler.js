const ClientError = require('../../exceptions/clientError');

class PlaylistSongsHandler {
    constructor(service, validator) {
        const {
            playlistSongsService,
            playlistsService,
            songsService,
            playlistSongsActivitiesService,
        } = service;
        this._service = playlistSongsService;
        this._playlistsService = playlistsService;
        this._songsService = songsService;
        this._playlistSongActivitiesService = playlistSongsActivitiesService;
        this._validator = validator;

        this.postSongsByIdPlaylistHandler = this.postSongsByIdPlaylistHandler.bind(this);
        this.getSongsByIdPlaylistHandler = this.getSongsByIdPlaylistHandler.bind(this);
        this.deleteSongsByIdPlaylistHandler = this.deleteSongsByIdPlaylistHandler.bind(this);
    }
    async postSongsByIdPlaylistHandler(request, h) {
        try {
            this._validator.validatePlaylistSongsPayload(request.payload);
            const { songId } = request.payload;
            const { id: credentialId } = request.auth.credentials;
            const { id: playlistId } = request.params;
            await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
            await this._songsService.getSongById(songId);
            const SongId = await this._service.addSongsPlaylist(playlistId, songId);
            await this._playlistSongActivitiesService.addActivities(playlistId, songId, credentialId, 'add');
            const response = h.response({
                status: 'success',
                message: 'Playlist song berhasil ditambahkan',
                data: { SongId },
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
                message: 'Maaf, terjadi kegagalan di server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }

    async getSongsByIdPlaylistHandler(request, h) {
        try {
            const { id: credentialId } = request.auth.credentials;
            const { id: playlistId } = request.params;
            await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
            const playlist = await this._playlistsService.getPlaylistsById(playlistId);
            const songs = await this._songsService.getSongsByPlaylistId(playlistId);
            playlist.songs = songs;
            return {
                status: 'success',
                data: { playlist },
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

    async deleteSongsByIdPlaylistHandler(request, h) {
        try {
            this._validator.validatePlaylistSongsPayload(request.payload);
            const { songId } = request.payload;
            const { id: playlistId } = request.params;
            const { id: credentialId } = request.auth.credentials;
            await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
            await this._service.deleteSongsPlaylist(playlistId, songId);
            await this._playlistSongActivitiesService.addActivities(playlistId, songId, credentialId, 'delete');
            return {
                status: 'success',
                message: 'Playlist song berhasil dihapus',
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
                message: 'Maaf, terjadi kegagalan di server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }
}

module.exports = PlaylistSongsHandler;