import { useState, useEffect, useRef, useMemo } from "react";
import { supabase, supabaseURL } from "./supabaseClient";
import { motion } from "framer-motion";
import { getMetadata, ImageData } from "./MetadataContext";
import "./mini-gallery.css";
import "./modal.css";


import AirDatepicker from 'air-datepicker';
import localeEn from 'air-datepicker/locale/en';
import 'air-datepicker/air-datepicker.css';





export default function MiniGallery() {

    const [filterimg, setFilterimg] = useState<ImageData[]>([])
    const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const { metadata } = getMetadata();
    const calendarRef = useRef<HTMLInputElement>(null);

    const calendarInputRef = useRef<HTMLInputElement>(null);
    const datepickerRef = useRef<AirDatepicker | null>(null);

    // allimg -> selected date(most recent img i guess)/selected wavelength(default w1)




    useEffect(() => {

        const temp = metadata
            .filter(img => img.image_path.endsWith("-w1.png"))
            .map((img) => ({
                image_path: `${supabaseURL}/storage/v1/object/public/solar_images/${img.image_path}`,
                capture_date: img.capture_date,
            }));
        setFilterimg(temp);
        setCurrentIndex(temp.length - 1);
        setSelectedImage(temp[temp.length - 1]);

    }, [metadata]);



    const imagesByDate = useMemo<Record<string, ImageData[]>>(() => {
        const map: Record<string, ImageData[]> = {};
        filterimg.forEach((img) => {
            const key = img.capture_date.slice(0, 10);
            (map[key] ??= []).push(img);
        });

        Object.values(map).forEach((arr) =>
            arr.sort((a, b) => a.capture_date.localeCompare(b.capture_date))
        );
        return map;
    }, [filterimg]);

    const availableDates = useMemo(() => Object.keys(imagesByDate).sort(), [imagesByDate]);
    const availableDatesSet = useMemo(() => new Set(availableDates), [availableDates]);

    useEffect(() => {
        if (!calendarInputRef.current || !availableDates.length) return;


        const latestDate = availableDates[availableDates.length - 1];
        setSelectedImage(imagesByDate[latestDate].slice(-1)[0]);

        datepickerRef.current?.destroy();
        datepickerRef.current = new AirDatepicker(calendarInputRef.current, {
            locale: localeEn,
            inline: true,
            selectedDates: [new Date(latestDate)],
            onRenderCell({ date, cellType }) {
                if (cellType !== 'day') return;
                const d = Array.isArray(date) ? date[0] : date;
                const key = d.toLocaleDateString('en-CA');
                const hasImage = availableDatesSet.has(key);
                return {
                    disabled: !hasImage,
                    classes: hasImage ? 'has-image' : '',
                };
            },
            onSelect({ date }) {
                if (!date) return;
                const d = Array.isArray(date) ? date[0] : date;
                const key = d.toLocaleDateString('en-CA');
                const dayImages = imagesByDate[key];
                if (dayImages?.length) {
                    setSelectedImage(dayImages.slice(-1)[0]);
                }
            },
        });

        return () => {
            datepickerRef.current?.destroy();
        };
    }, [availableDates, availableDatesSet, imagesByDate]);

    // callendar(defaults the latest date), select date(defaults latest time), display every image in that date(selected latest time)

    return (
        <div className="whole-container">

            <div className="main-image-container">
                <header>
                    <h1>Gallery</h1>
                </header>

                {/* <div className="container">

                    <button
                        onClick={() => console.log(filterimg[0].capture_date)}>
                        hi
                    </button>
                    <button
                        onClick={() => console.log(selectedImage)}>
                        hi2
                    </button>
                    <img src={selectedImage?.image_path} alt="Most‑recent image" />

                </div> */}
                <input ref={calendarInputRef} placeholder="Select date" readOnly />

                {selectedImage && (
                    <img
                        src={selectedImage.image_path}
                        alt={`Solar capture ${selectedImage.capture_date}`}
                    />
                )}
            </div>

        </div>
    );
}


// make a function that doesn't let you select dates that dont exist

