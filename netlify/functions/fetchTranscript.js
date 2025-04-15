const { YoutubeTranscript } = require('youtube-transcript');
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent'); // Changed to destructuring import

// Proxy configuration
const PROXY_URL = 'http://170.106.158.82:13001'; // Replace with your proxy details.  Ensure this is correct and accessible.

exports.handler = async function(event, context) {
    const videoUrl = event.queryStringParameters?.url; // Use optional chaining

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

    try {
        const transcript = await fetchTranscriptFromProxy(videoId);
        return {
            statusCode: 200,
            body: JSON.stringify(transcript),
        };
    } catch (error) {
        console.error("Error fetching transcript:", error); // Log the error for debugging
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error fetching transcript: ' + error.message }), //Include original error message
        };
    }
};

// Proxy function to make the request from server-side
async function fetchTranscriptFromProxy(videoId) {
    try {
        // Create a custom axios instance with the proxy agent.  Move this *inside* the function.
        const proxyAgent = new HttpsProxyAgent(PROXY_URL); // Use new here
        const axiosInstance = axios.create({
            httpsAgent: proxyAgent, // Use the proxy agent
        });

        // Make the request to fetch the transcript through the proxy
        const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
            axiosInstance, // Pass the custom axios instance with proxy
        });
        return transcript;
    } catch (error) {
        //  Important:  Wrap the error to provide context.
        throw new Error(`Error fetching transcript with proxy: ${error.message}`);
    }
}

// Utility function to extract video ID from URL
function extractVideoIdFromUrl(url) {
    const match = url.match(/(?:youtube\.com\/(?:[^/]+\/[^/]+|(?:v|e(?:mbed)?)\/|(?:.*[?&]v=))|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}
