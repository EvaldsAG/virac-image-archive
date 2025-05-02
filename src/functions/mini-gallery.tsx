import { useState, useEffect, useRef } from "react";
import { supabase, supabaseURL } from "./supabaseClient";
import { motion } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";
import "./mini-gallery.css";
import "./modal.css";
import Datepicker from './datepicker';





export default function MiniGallery() {
    type ImageData = {
        url: string;
        captureDate: Date;
    };

    const [images, setImages] = useState<ImageData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);

    const modalRef = useRef<HTMLDivElement>(null);
    const parentRef = useRef<HTMLDivElement>(null);



    useEffect(() => {
        const fetchImages = async () => {
            const { data, error } = await supabase
                .from("solar_images_metadata")
                .select("image_path, capture_date");

            if (error) {
                console.error(error);
                return;
            }

            const filtered = data
                .filter((img) => img.image_path.endsWith("-w1.png"))
                .filter((img) => {
                    const iso = new Date(img.capture_date).toISOString().slice(0, 10);
                    const afterStart = !startDate || iso >= startDate;
                    const beforeEnd = !endDate || iso <= endDate;
                    return afterStart && beforeEnd;
                })
                .map((img) => ({
                    url: `${supabaseURL}/storage/v1/object/public/solar_images/${img.image_path}`,
                    captureDate: img.capture_date,
                }));

            setImages(filtered);
            setCurrentIndex(0); // reset to the first image whenever the dataset changes
        };

        fetchImages();
    }, [startDate, endDate]);


    const rowVirtualizer = useVirtualizer({
        count: images.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 120,
        horizontal: true,
    });


    const prevImage = () =>
        setCurrentIndex((i) => (i > 0 ? i - 1 : images.length - 1));
    const nextImage = () =>
        setCurrentIndex((i) => (i < images.length - 1 ? i + 1 : 0));

    // keep the selected thumbnail in view
    useEffect(() => {
        rowVirtualizer.scrollToIndex(currentIndex, { align: "center" });
    }, [currentIndex, rowVirtualizer]);

    const closeModal = () => setIsModalOpen(false);

    const selected = images[currentIndex];

    return (
        <div className="whole-container">

            <div className="main-image-container">
                <header>
                    <h1>Gallery</h1>
                </header>

                <div className="container">
                    {/* <button
                        className="nav-btn-prev"
                        onClick={prevImage}
                        aria-label="Previous image"
                        disabled={!images.length}
                    >
                        &lt;
                    </button> */}

                    <div
                        className="image-wrapper"
                        aria-label="Open image modal"
                    >
                        {selected && (
                            <img
                                src={selected.url}
                                onClick={() => setIsModalOpen(true)}
                                className="mainImage"
                                alt={
                                    selected.captureDate
                                        ? `Solar image taken on ${new Date(
                                            selected.captureDate
                                        ).toLocaleDateString("en-CA")}`
                                        : "Selected solar image"
                                }
                            />
                        )}
                    </div>
                    <div
                        className="image-wrapper"
                        aria-label="Open image modal"
                    >
                        {selected && (
                            <img
                                src={'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0304.jpg'}
                                onClick={() => setIsModalOpen(true)}
                                className="nasaImage"
                                alt={
                                    "Nasa image"
                                }
                            />
                        )}
                    </div>

                    {/* <button
                        className="nav-btn-next"
                        onClick={nextImage}
                        aria-label="Next image"
                        disabled={!images.length}
                    >
                        &gt;
                    </button> */}
                </div>


            </div>

            <div className="wavelength-container" ref={parentRef}>
                <motion.div
                    className="carousel"
                    drag="x"
                    dragConstraints={{ left: 0, right: 100 }}
                >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => (
                        <div className="carousel-item" key={virtualRow.index}>
                            {images[virtualRow.index] && (
                                <motion.img
                                    src={images[virtualRow.index].url}
                                    alt={`Solar image taken on ${new Date(
                                        images[virtualRow.index].captureDate
                                    ).toLocaleDateString("en-CA")}`}
                                    className={`image ${currentIndex === virtualRow.index ? "selected" : ""
                                        }`}
                                    whileHover={{ scale: 1.1 }}
                                    onClick={() => setCurrentIndex(virtualRow.index)}
                                />
                            )}
                            <p className="image-date">
                                {new Date(images[virtualRow.index].captureDate).toLocaleDateString(
                                    "en-CA"
                                )}
                            </p>
                        </div>
                    ))}
                </motion.div>
            </div>

            <div className="timestamp-container" ref={parentRef}>

                <div className="date-picker">
                    <Datepicker />
                </div>
                <motion.div
                    className="carousel"
                    drag="x"
                    dragConstraints={{ left: 0, right: 100 }}
                >



                </motion.div>
            </div>



            {isModalOpen && (
                <div className="modalOverlay" onClick={closeModal}>
                    <div className="modalContent" ref={modalRef} onClick={(e) => e.stopPropagation()}>
                        <button className="closeButton" onClick={closeModal}>×</button>
                        <img
                            src={selected.url}
                            className="modalImage"
                            alt="zoomed in solar image"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}


// make a function that doesn't let you select dates that dont exist