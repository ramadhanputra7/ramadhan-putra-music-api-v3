/* eslint-disable camelcase */
exports.up = (pgm) => {
    // membuat user baru.
    pgm.sql("INSERT INTO users(id, username, password, fullname) VALUES('old_playlists', 'old_playlists', 'old_playlists', 'old_playlists')");

    // change owner value in playlists which owner = NULL
    pgm.sql("UPDATE playlists SET owner = 'old_notes' WHERE owner = NULL");

    // give constraint foreign key to owner  column id from users table
    pgm.addConstraint('playlists', 'fk_playlists.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
    // change owner value old_playlist to playlist  NULL
    pgm.sql("UPDATE playlists SET owner = NULL WHERE owner = 'old_playlists'");
    // delete new user
    pgm.sql("DELETE FROM users WHERE id = 'old_playlists'");
    // delete constraint fk_playlist.owner_users.id to notes become a table
    pgm.dropConstraint('playlists', 'fk_playlists.owner_users.id');
};