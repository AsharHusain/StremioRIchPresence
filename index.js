const { Client } = require('discord-rpc');
const fs = require('fs');
const path = require('path');

// Replace with your actual Client ID from Discord Developer Portal
const clientId = '1317747296850542614'; 
const rpc = new Client({ transport: 'ipc' });

const playbackFilePath = path.join('C:\\Users\\ashar\\AppData\\Roaming\\stremio\\stremio-server', 'playback.json');

// Function to get playback data from Stremio
async function getPlaybackData() {
    return new Promise((resolve, reject) => {
        fs.readFile(playbackFilePath, 'utf-8', (err, data) => {
            if (err) {
                reject('Error reading playback data');
                return;
            }
            try {
                const playbackData = JSON.parse(data);
                resolve(playbackData);
            } catch (parseError) {
                reject('Error parsing playback data');
            }
        });
    });
}

rpc.on('ready', async () => {
    console.log('Rich Presence is active!');

    async function updatePresence() {
        try {
            const playbackData = await getPlaybackData();

            if (!playbackData || !playbackData.data) {
                console.warn('No playback data available');
                return;
            }

            // Update Rich Presence
            rpc.setActivity({
                details: `Watching: ${playbackData.data.title || "Unknown Title"}`,
                state: playbackData.data.episode || "Movie",
                startTimestamp: Date.now(),
                largeImageKey: 'Iconforstremio', // Ensure you have your image set correctly
                largeImageText: 'Stremio',
                smallImageKey: 'playing',  // Optional: Add a smaller image for playing status
                smallImageText: 'Playing',
            });

            console.log(`Rich Presence Updated: ${playbackData.data.title} - ${playbackData.data.episode}`);
        } catch (error) {
            console.error('Failed to update Rich Presence:', error);
        }
    }

    // Update presence every 15 seconds
    setInterval(updatePresence, 1000);
});

// Login to Discord RPC
rpc.login({ clientId }).catch(console.error);
