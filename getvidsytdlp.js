import { writeFileSync } from "fs"
import { spawn } from "child_process"
import { createInterface } from "readline"
import { loadEnvFile, env } from 'process';
loadEnvFile(".env")

const { PLAYLIST_ID } = env
const playlist = "https://www.youtube.com/playlist?list=" + PLAYLIST_ID

async function getVideos() {
    const allVids = []

    const ytdlp = spawn("yt-dlp", [
        "--flat-playlist",
        "--lazy-playlist",
        "--dump-json",
        "--no-warnings",
        "--no-progress",
        "--ignore-errors",
        "--no-check-formats",
        // "--playlist-end", "1",
        playlist
    ])

    const rl = createInterface({ input: ytdlp.stdout, crlfDelay: Infinity })
    for await (const line of rl) {
        if (!line.trim()) continue;

        const vid = JSON.parse(line);

        let thumb = vid.thumbnail ?? vid.thumbnails?.at(-1)?.url ?? null;
        if (thumb) thumb = thumb.split("?")[0];

        allVids.push({
            id: vid.id,
            title: vid.title,
            tn: thumb,
            channel: vid.channel,
            views: vid.view_count,
            length: vid.duration_string
        })
    }

    writeFileSync("vids.json", JSON.stringify(allVids, null, 2));
    console.log("done");
}

getVideos()