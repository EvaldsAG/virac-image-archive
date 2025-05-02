import { useState, useEffect, useRef } from "react";
import { supabase, supabaseURL } from "./supabaseClient";
import { motion } from "framer-motion";
import { getMetadata, ImageData } from "./MetadataContext";
import "./mini-gallery.css";
import "./modal.css";


import AirDatepicker from 'air-datepicker';
import localeEn from 'air-datepicker/locale/en';
import 'air-datepicker/air-datepicker.css';





export default function MiniGallery() {

    // const [allimg, setAllimg] = useState<ImageData[]>([])
    const [selectedImage, setSelectedImage] = useState<ImageData>()
    const [currentIndex, setCurrentIndex] = useState(0);

    const { metadata } = getMetadata();


    // allimg -> selected date(most recent img i guess)/selected wavelength(default w1)

    // date change effect
    useEffect(() => {

        const temp = metadata
            .filter(img => img.image_path.endsWith("-w1.png"))
            .map((img) => ({
                image_path: `${supabaseURL}/storage/v1/object/public/solar_images/${img.image_path}`,
                capture_date: img.capture_date,
            }));
        setCurrentIndex(temp.length - 1);
        setSelectedImage(temp[currentIndex]);

    }, [metadata])


    const calendarRef = useRef<HTMLInputElement>(null);

    // callendar(defaults the latest date), select date(defaults latest time), display every image in that date(selected latest time)





    return (
        <div className="whole-container">

            <div className="main-image-container">
                <header>
                    <h1>Gallery</h1>
                </header>

                <div className="container">

                    <button
                        onClick={() => console.log(currentIndex)}>
                        hi
                    </button>
                    <button
                        onClick={() => console.log(selectedImage)}>
                        hi2
                    </button>
                    <img src={selectedImage?.image_path} alt="Most‑recent image" />

                </div>
            </div>

        </div>
    );
}


// make a function that doesn't let you select dates that dont exist

