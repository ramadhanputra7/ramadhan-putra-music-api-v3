const routes = (handler) => [{
  method: 'POST',
  path: '/export/playlists/{id}',
  handler: handler.postExportPlaylistsSongHandler,
  options: {
      auth: 'openmusicapp_jwt',
  },
},
];

module.exports = routes;