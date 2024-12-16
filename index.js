const { Client } = require('discord-rpc');
const http = require('http');
const url = require('url');

// Replace with your actual Client ID from Discord Developer Portal
const clientId = '1317747296850542614'; 
const rpc = new Client({ transport: 'ipc' });

// Example Metadata Catalog (you should use the actual metadata from your Stremio addon)
const META = {
    "example-series-1": {
        id: "example-series-1",
        type: "series",
        name: "Example Series",
        description: "An example series for demonstration",
        poster: "https://example.com/poster.jpg",
        videos: [
            {
                id: "example-series-1-s1e1",
                title: "Episode 1",
                season: 1,
                episode: 1,
                released: "2023-01-01",
            },
            {
                id: "example-series-1-s1e2",
                title: "Episode 2",
                season: 1,
                episode: 2,
                released: "2023-01-02",
            },
        ],
    },
};

rpc.on('ready', async () => {
    console.log('Discord Rich Presence is active!');

    async function updatePresence(id) {
        try {
            const seriesMeta = META[id];

            if (!seriesMeta) {
                console.warn('No metadata available');
                return;
            }

            // Extract title, episode, season from the metadata
            const currentEpisode = seriesMeta.videos[0]; // Use the first episode for simplicity
            const title = seriesMeta.name;
            const episode = currentEpisode.title;
            const season = currentEpisode.season;
            const episodeNumber = currentEpisode.episode;

            // Update Rich Presence
            rpc.setActivity({
                details: `Watching: ${title}`,
                state: `S${season} E${episodeNumber}: ${episode}`,
                startTimestamp: Date.now(),
                largeImageKey: 'Iconforstremio',  // Ensure you have your image set correctly
                largeImageText: 'Stremio',
                smallImageKey: 'playing',  // Optional: Add a smaller image for playing status
                smallImageText: 'Playing',
            });

            console.log(`Rich Presence Updated: ${title} - ${episode}`);
        } catch (error) {
            console.error('Failed to update Rich Presence:', error);
        }
    }

    // HTTP server to handle updates from the Stremio addon
    http.createServer((req, res) => {
        const query = url.parse(req.url, true).query;

        if (query.seriesId) {
            const seriesId = query.seriesId;
            updatePresence(seriesId);
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(`Rich Presence updated for ${seriesId}`);
        } else {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('No seriesId provided');
        }
    }).listen(7001, () => {  // Changed port to 7001
        console.log('Listening for updates on port 7001...');
    });
});

// Login to Discord RPC
rpc.login({ clientId }).catch(console.error);
