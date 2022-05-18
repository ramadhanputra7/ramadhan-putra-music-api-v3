const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/invariantError');

class playlistSongsActivitiesService {
    constructor() {
        this._pool = new Pool();
    }

    //  add activities to playlist-song-activities table
    async addActivities(playlistId, songId, userId, action) {
        const id = `playlist-song-activities-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO playlist_song_activities VALUES ($1, $2, $3, $4, $5) RETURNING id',
            values: [id, playlistId, songId, userId, action],
        };
        const result = await this._pool.query(query);
        if (!result.rows[0].id) {
            throw new InvariantError('Activities Playlist gagal ditambahkan.');
        }
        return result.rows[0].id;
    }

    //  get activities playlist based on id
    async getActivitiesByIdPlaylist(id, owner) {
        const result = await this._pool.query({
            text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time
                    FROM playlist_song_activities 
                    JOIN playlists ON playlists.id = playlist_song_activities.playlist_id 
                    JOIN songs ON songs.id = playlist_song_activities.song_id 
                    JOIN users ON users.id = playlist_song_activities.user_id 
                    LEFT JOIN collaborations ON collaborations.playlist_id = playlist_song_activities.id 
                    WHERE playlists.id = $1 AND playlists.owner = $2 OR collaborations.user_id = $2 
                    ORDER BY playlist_song_activities.time ASC`,
            values: [id, owner],
        });

        return result.rows;
    }
}

module.exports = playlistSongsActivitiesService;