const { YoutubeTranscript } = require('youtube-transcript');
const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent');

// Proxy configuration
const PROXY_URL = 'http://170.106.158.82:13001';  // Replace with your proxy details
const proxyAgent = new HttpsProxyAgent(PROXY_URL);

exports.handler = async function(event, context) {
    const videoUrl = event.queryStringParameters.url;

    if (!videoUrl) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Video URL is required!' }),
        };
    }

    const videoId = extractVideoIdFromUrl(videoUrl);
    if (!videoId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid YouTube URL!' }),
        };
    }

    // Proxy server logic
    try {
        const transcript = await fetchTranscriptFromProxy(videoId);
        return {
            statusCode: 200,
            body: JSON.stringify(transcript),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error fetching transcript via proxy: ' + error.message }),
        };
    }
};

// Proxy function to make the request from server-side
async function fetchTranscriptFromProxy(videoId) {
    // Create a custom axios instance with the proxy agent
    const axiosInstance = axios.create({
        httpsAgent: proxyAgent,  // Use the proxy agent
    });

    try {
        // Make the request to fetch the transcript through the proxy
        const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
            axiosInstance,  // Pass the custom axios instance with proxy
        });
        return transcript;
    } catch (error) {
        throw new Error('Error fetching transcript from proxy: ' + error.message);
    }
}

// Utility function to extract video ID from URL
function extractVideoIdFromUrl(url) {
    const match = url.match(/(?:youtube\.com\/(?:[^/]+\/[^/]+|(?:v|e(?:mbed)?)\/|(?:.*[?&]v=))|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}
