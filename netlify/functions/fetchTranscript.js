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

    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        return {
            statusCode: 200,
            body: JSON.stringify(transcript),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error fetching transcript: ' + error.message }),
        };
    }
};

// Utility function to extract video ID from URL
function extractVideoIdFromUrl(url) {
    const match = url.match(/(?:youtube\.com\/(?:[^/]+\/[^/]+|(?:v|e(?:mbed)?)\/|(?:.*[?&]v=))|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}
