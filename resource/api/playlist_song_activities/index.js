const PlaylistSongActivitiesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'playlistSongsActivities',
    version: '1.0.0',
    register: async (server, { service }) => {
        const playlistSongActivitiesHandler = new PlaylistSongActivitiesHandler(service);
        server.route(routes(playlistSongActivitiesHandler));
    },
};