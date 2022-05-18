const routes = (handler) => [
    {
        method: 'POST',
        path: '/playlists/{id}/songs',
        handler: handler.postSongsByIdPlaylistHandler,
        options: {
            auth: 'openmusicapp_jwt',
        },
    },
    {
        method: 'GET',
        path: '/playlists/{id}/songs',
        handler: handler.getSongsByIdPlaylistHandler,
        options: {
            auth: 'openmusicapp_jwt',
        },
    },
    {
        method: 'DELETE',
        path: '/playlists/{id}/songs',
        handler: handler.deleteSongsByIdPlaylistHandler,
        options: {
            auth: 'openmusicapp_jwt',
        },
    },
];

module.exports = routes;