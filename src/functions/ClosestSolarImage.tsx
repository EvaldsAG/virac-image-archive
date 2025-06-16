// ClosestSolarImage.tsx
import { useEffect, useState } from "react";
import "./ClosestSolarImage.css";


// const apiKey = import.meta.env.CORS_PROXY_KEY


type ClosestImageResponse = {
    id: number;
    date: string;          // "YYYY-MM-DD HH:mm:ss"
    // scale: number;         // arc-seconds per pixel – needed by getTile
};

interface Props {
    // ISO-8601 date/time in UTC, "2014-01-01T23:59:59Z" 
    dateTimeUtc: string;
    // Instrument/datasource ID (see getDataSources if you need others; AIA 335 = 14).
    sourceId: number;
    // Alt text for the <img>.
    alt?: string;
}

export default function ClosestSolarImage({
    dateTimeUtc,
    sourceId,
    alt = "Closest solar frame",
}: Props) {
    const [pngUrl11, setPngUrl11] = useState<string | null>(null);
    const [pngUrl01, setPngUrl01] = useState<string | null>(null);
    const [pngUrl00, setPngUrl00] = useState<string | null>(null);
    const [pngUrl10, setPngUrl10] = useState<string | null>(null);

    useEffect(() => {
        let abort = false;

        async function fetchClosest() {

            const target = `https://api.helioviewer.org/v2/getClosestImage/?date=${encodeURIComponent(dateTimeUtc)}&sourceId=${sourceId}`;

            const proxied = `https://corsproxy.io/?url=${encodeURIComponent(target)}`;


            const metaRes = await fetch(
                proxied
            );
            if (!metaRes.ok) throw new Error("getClosestImage failed");
            const meta: ClosestImageResponse = await metaRes.json();


            const tileUrl11 = `https://api.helioviewer.org/v2/getTile/?id=${meta.id}&x=-1&y=-1&imageScale=2.3`;
            const tileUrl01 = `https://api.helioviewer.org/v2/getTile/?id=${meta.id}&x=0&y=-1&imageScale=2.3`;
            const tileUrl00 = `https://api.helioviewer.org/v2/getTile/?id=${meta.id}&x=0&y=0&imageScale=2.3`;
            const tileUrl10 = `https://api.helioviewer.org/v2/getTile/?id=${meta.id}&x=-1&y=0&imageScale=2.3`;

            if (!abort) setPngUrl11(tileUrl11), setPngUrl01(tileUrl01), setPngUrl00(tileUrl00), setPngUrl10(tileUrl10);
        }

        fetchClosest().catch(console.error);
        return () => {
            abort = true; // cancel setState if component unmounts
        };
    }, [dateTimeUtc, sourceId]);

    if (!pngUrl11 || !pngUrl01 || !pngUrl00 || !pngUrl10) return <p>Loading closest image…</p>;
    return (
        <a href='https://sdo.gsfc.nasa.gov/data/aiahmi/' target="_blank" rel="noopener noreferrer">
            <div className="sun-graft">
                <img src={pngUrl11} alt={alt} />
                <img src={pngUrl01} alt={alt} />
                <img src={pngUrl10} alt={alt} />
                <img src={pngUrl00} alt={alt} />
            </div>
        </a>
    );
}
