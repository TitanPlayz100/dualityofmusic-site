import { writeFileSync } from "fs"
import { clearLine, cursorTo } from "readline";
import { loadEnvFile, env } from 'process';
loadEnvFile(".env")

const baseUrl = 'https://www.googleapis.com/youtube/v3';
const { YT_API_KEY, PLAYLIST_ID } = env

async function fetchVids(nextPage) {
    let link = `${baseUrl}/playlistItems?part=contentDetails,snippet&maxResults=50&key=${YT_API_KEY}&playlistId=${PLAYLIST_ID}`
    if (nextPage) link += `&pageToken=${nextPage}`;

    const res = await fetch(link)
    const data = await res.json()
    return data
}

async function formatData(nextPage, pageIndex) {
    const data = await fetchVids(nextPage)
    const formatted = data.items.map(vid => {
        return {
            id: vid.contentDetails.videoId,
            title: vid.snippet.title,
            tn: vid.snippet.thumbnails?.default?.url ?? null
        }
    })
    const next = data.nextPageToken

    clearLine(process.stdout, 0);
    cursorTo(process.stdout, 0);
    process.stdout.write(`Page: ${pageIndex}`);

    return [formatted, next]
}


async function getVideos() {
    let allVids = []

    let pages = 1
    const [formatted, next] = await formatData(undefined, pages);
    allVids = allVids.concat(formatted);
    pages++;
    let nextPage = next;

    while (nextPage) {
        const [formatted, next] = await formatData(nextPage, pages);
        allVids = allVids.concat(formatted);
        writeFileSync("vids.json", JSON.stringify(allVids, null, 2));
        pages++;
        nextPage = next
    }

    writeFileSync("vids.json", JSON.stringify(allVids, null, 2));
}

getVideos()