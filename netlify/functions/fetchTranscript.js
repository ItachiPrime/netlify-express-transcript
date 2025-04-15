const { YoutubeTranscript } = require('youtube-transcript');

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
    // This would be where you can make the request to the `youtube-transcript` API
    // or handle the proxying logic.
    // Since you are using Netlify functions, this will make the request server-side.
    try {
        // Fetch the transcript from the youtube-transcript library
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
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
