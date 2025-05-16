import { useState, useEffect, useRef, useMemo } from "react";
import { supabase, supabaseURL } from "./supabaseClient";
import { getMetadata, ImageMetadata } from "./MetadataContext";
import "./mini-gallery.css";
import "./modal.css";


import AirDatepicker from 'air-datepicker';
import localeEn from 'air-datepicker/locale/en';
import 'air-datepicker/air-datepicker.css';

import { ImageCarousel, CarouselItem } from "./imageCarousel";

import ClosestSolarImage from "./ClosestSolarImage.tsx";



export default function MiniGallery() {

    const [pictureDates, setPictureDates] = useState<string[]>([]) // all the date with available images
    const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(null);
    const [selectedFrequency, setSelectedFrequency] = useState<string>("w1") // keep in mind that every single day wont have every single frequency

    const [selDayCarouselIndex, setSelDayCarouselIndex] = useState(-1); // index in the list of pics for selected day, -1 means last item
    const [selFreqCarouselIndex, setSelFreqCarouselIndex] = useState(0);

    const [selectedDate, setSelectedDate] = useState<string>(""); // changes to selected date

    const { metadata } = getMetadata();

    const calendarInputRef = useRef<HTMLDivElement>(null);
    const datepickerRef = useRef<AirDatepicker<HTMLDivElement> | null>(null);

    const [nasaImageTime, setNasaImageTime] = useState(``);



    // makes keys of all dates with images in them
    const imagesByDate = useMemo<Record<string, ImageMetadata[]>>(() => {
        const map: Record<string, ImageMetadata[]> = {};
        metadata.forEach((imgMeta) => {
            if (map[imgMeta.capture_date] === undefined)
                map[imgMeta.capture_date] = [];

            map[imgMeta.capture_date].push(imgMeta);
        });

        return map;
    }, [pictureDates]);

    // Acquire all the dates with available pictures
    // unique days that contain images
    useEffect(() => {
        const allDates = metadata
            .filter(img => img.image_path.endsWith("-w1.png")) // this assumes that the "-w1" frequency always exists and that its .png
            .map((img) => img.capture_date);

        setPictureDates(allDates);
        setSelectedDate(allDates[allDates.length - 1]);
    }, [metadata]);
    // metadata context needs some sorting done potentially
    // the order that images were uploaded to the supabase metadata matters.

    // sets the default value when necessary
    useEffect(() => {
        if (Object.keys(imagesByDate).length === 0)
            return;

        const selectedDateClean = (selectedDate === "" ? pictureDates[pictureDates.length - 1] : selectedDate);
        const allDayImages = imagesByDate[selectedDateClean]
            .filter(img => img.image_path.endsWith(selectedFrequency + ".png"));
        const latestImage = allDayImages[allDayImages.length - 1]
        setSelectedImage(latestImage);
        setSelDayCarouselIndex(-1); // -1 means last
    }, [pictureDates, imagesByDate, selectedDate]);

    // Generates the datepicker, only changes if the metadata updates
    useEffect(() => {
        if (!calendarInputRef.current || !pictureDates.length) return;

        const latestDate = pictureDates[pictureDates.length - 1];

        datepickerRef.current?.destroy(); // recreates the calendar if the metadata changes
        datepickerRef.current = new AirDatepicker(calendarInputRef.current, {
            locale: localeEn,
            inline: true,
            selectedDates: [new Date(latestDate)],
            onRenderCell({ date, cellType }) {
                if (cellType !== 'day') return;
                const d = Array.isArray(date) ? date[0] : date;
                const key = d.toLocaleDateString('en-CA');
                const hasImage = Object.keys(imagesByDate).includes(key);
                return {
                    disabled: !hasImage,
                    classes: hasImage ? 'has-image' : '',
                };
            },
            onSelect({ date }) {
                if (!date) return;
                const d = Array.isArray(date) ? date[0] : date;
                const formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                if (Object.keys(imagesByDate).includes(formattedDate)) { // if the day contains any pics
                    setSelectedDate(formattedDate);
                }
            },
        });

        return () => {
            datepickerRef.current?.destroy();
        };
    }, [imagesByDate]);

    // day image entry carousel, hold all the items in it
    const selectedDayCarousel = useMemo<CarouselItem[]>(() => {
        if (Object.keys(imagesByDate).length === 0)
            return [];

        const picArray = imagesByDate[selectedDate]
            .filter(img => img.image_path.endsWith(selectedFrequency + ".png"));

        const tempArray: CarouselItem[] = [];
        for (const [i, value] of picArray.entries()) {
            tempArray.push({
                imageUrl: value.image_path,
                onImageClick: () => {
                    setSelectedImage(value);
                    setSelDayCarouselIndex(i);
                    // console.log(selectedImage?.image_path);
                },
                label: value.image_path.slice(11, 19).replace(/-/g, ":"), // replaces all instances of the character "-" regex magic i guess lol
            });
        }

        return tempArray;
    }, [selectedDate, imagesByDate, selectedFrequency]);

    // frequency carousel items
    const selFrequencyCarousel = useMemo<CarouselItem[]>(() => {
        if (Object.keys(imagesByDate).length === 0 || selectedImage == null)
            return [];

        const dateTimePathPart = selectedImage.image_path.slice(0, 19);
        const picArray = imagesByDate[selectedDate]
            .filter(img => img.image_path.startsWith(dateTimePathPart));

        const tempArray: CarouselItem[] = [];
        for (const [i, value] of picArray.entries()) {
            const frequencyStr = value.image_path.slice(20, -4);
            tempArray.push({
                imageUrl: value.image_path,
                onImageClick: () => {
                    setSelectedFrequency(frequencyStr);
                    setSelectedImage(value);
                    setSelFreqCarouselIndex(i);
                },
                label: frequencyStr,
            });
        }

        return tempArray;
    }, [imagesByDate, selectedDate, selectedImage]);

    //download button
    const downloadCurrent = async () => {

        if (!selectedImage) return;

        const selectedPath = selectedImage.image_path;
        // const fileName = path.split('/').pop();
        //we have images from w1 to w4
        //2025/02/11/17-33-21-w1.png
        //2025/02/11/17-33-21-w2.png
        //2025/02/11/17-33-21-w3.png
        //2025/02/11/17-33-21-w4.png
        const modifiedPath = selectedPath.split('/').pop() ?? 'sum ting wong';
        const startPath = selectedDate.replace(/-/g, "/");
        // console.log(startPath);
        const fileName = modifiedPath.slice(0, 8) ?? 'sum ting wong 2';

        const wav = ['w1.png', 'w2.png', 'w3.png', 'w4.png'];

        for (let i = 0; i < wav.length; i++) {

            // grab the blob from Storage
            const { data: blob, error } = await supabase
                .storage
                .from('solar_images')
                .download(`${startPath}/${fileName}-${wav[i]}`);
            // console.log(`${startPath}/${fileName}-${wav[i]}`)

            if (error || !blob) {
                console.error('Download failed:', error);
                return;
            }
            // turn the blob into an object-URL
            const url = URL.createObjectURL(blob);

            // create a temporary <a download> element and click it
            const a = document.createElement('a');
            a.href = url;
            a.download = (`${fileName}-${wav[i]}`);          // this is the name that shows up in “Save as…”
            document.body.appendChild(a);   // Firefox needs the link in the DOM
            a.click();
            a.remove();

            // tidy up
            URL.revokeObjectURL(url);

        }
    }


    // this is not ideal to download file by file
    // might consider jszip
    const downloadDay = async () => {

        const folder = selectedDate.replace(/-/g, "/");


        const { data: files, error: listErr } = await supabase
            .storage
            .from("solar_images")
            .list(folder);

        if (listErr) {
            console.error(listErr);
            return;
        }

        for (const file of files) {
            const path = `${folder}/${file.name}`;

            const { data: blob, error: dlErr } = await supabase
                .storage
                .from("solar_images")
                .download(path);

            if (dlErr || !blob) {
                console.error(dlErr);
                continue;
            }

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        }
    }


    // "2014-01-01T23:59:59Z"

    useEffect(() => {
        if (selectedImage != null)
            setNasaImageTime(`${selectedDate}T${selectedImage.image_path.slice(11, 19).replace(/-/g, ":")}Z`);


    }, [selectedImage])


    // const testmerq = async () => {
    //     const metaRes = await fetch(
    //         // `https://api.helioviewer.org/v2/getClosestImage/?date=${encodeURIComponent(
    //         //     nasaImageTime
    //         // )}&sourceId=11`

    //         `https://corsproxy.io/?https://api.helioviewer.org/v2/getClosestImage/?date=${encodeURIComponent(nasaImageTime)}&sourceId=11`
    //     );
    //     console.log(nasaImageTime);

    //     if (!metaRes.ok) throw new Error("getClosestImage failed");
    //     console.log(metaRes);
    //     const meta = await metaRes.json();
    //     console.log(meta);
    // }





    // TODO, MAKE THE CALLENDAR BLACK AND RED/ORAGNGE, LESS JARRING






    return (
        <div className="whole-container" >
            <header>
                <h1>Gallery</h1>
            </header>
            <div className="mainImage-container">
                {selectedImage && (
                    <img className="mainImage"
                        src={`${supabaseURL}/storage/v1/object/public/solar_images/${selectedImage.image_path}`}
                        alt={`Solar capture ${selectedImage.capture_date}`}
                    />
                )}
                <ClosestSolarImage
                    dateTimeUtc={nasaImageTime}
                    sourceId={11}
                />
            </div>
            <div className="callendar-wavelengths">
                <div>
                    <div ref={calendarInputRef} />
                    <button
                        onClick={downloadCurrent}
                        disabled={!selectedImage}
                    >download selected </button>
                    <button
                        onClick={downloadDay}
                        disabled={!selectedImage}
                    >download day </button>
                </div>
                <ImageCarousel
                    carouselItems={selFrequencyCarousel}
                    selected={selFreqCarouselIndex}
                />

            </div>
            <div className="dates">
                <ImageCarousel
                    carouselItems={selectedDayCarousel}
                    selected={selDayCarouselIndex}
                />
            </div>
            {/* <div>
                <button
                    onClick={testmerq}
                    disabled={!selectedImage}
                >test me</button>
            </div> */}

        </div>

    );
}
