const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');
const http = require('http');

// Example Metadata Catalog
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

// Create the builder function correctly
const builder = addonBuilder({
    id: "org.stremio.exampleaddon",
    version: "1.0.0",
    name: "Stremio Discord Addon",
    description: "Provides metadata for Discord Rich Presence",
    resources: ["meta"],
    types: ["series"],
    idPrefixes: ["example-series"],
    catalogs: [], // Explicitly define catalogs as an empty array
});

// Function to send metadata to Discord Rich Presence
function sendToDiscordPresence(metadataId) {
    const options = {
        hostname: 'localhost',
        port: 7001, // Changed port to 7001
        path: `/update?seriesId=${metadataId}`,
        method: 'GET',
    };

    const req = http.request(options, (res) => {
        console.log(`Response from Discord Presence: ${res.statusCode}`);
    });

    req.on('error', (e) => {
        console.error(`Error sending request to Discord Presence: ${e.message}`);
    });

    req.end();
}

// Define Metadata Handler
builder.defineMetaHandler(async ({ id }) => {
    if (META[id]) {
        sendToDiscordPresence(id); // Send the metadata ID to Discord Presence
        return { meta: META[id] };
    }
    throw new Error("Not found");
});

// Serve HTTP to expose the addon
serveHTTP(builder.getInterface(), { port: 7000 });  // Changed port to 7001
