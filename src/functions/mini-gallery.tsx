import React, { useState, useEffect, useRef } from "react";
import { supabase, supabaseURL } from "./supabaseClient";
import { motion } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";
import "./mini-gallery.css";
import "./modal.css";

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


    useEffect(() => {
        if (isModalOpen) {
            const trapFocus = (event: KeyboardEvent) => {
                if (event.key === "Tab" && modalRef.current) {
                    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];

                    if (event.shiftKey && document.activeElement === firstElement) {
                        event.preventDefault();
                        lastElement.focus();
                    } else if (!event.shiftKey && document.activeElement === lastElement) {
                        event.preventDefault();
                        firstElement.focus();
                    }
                }

                if (event.key === "Escape") {
                    closeModal();
                }
            };

            document.addEventListener("keydown", trapFocus);
            return () => document.removeEventListener("keydown", trapFocus);
        }
    }, [isModalOpen]);

    const closeModal = () => setIsModalOpen(false);

    const selected = images[currentIndex];

    return (
        <div className="whole-container">

            <div className="main-image-container">
                <header>
                    <h1>Gallery</h1>
                    <p>
                        This is an at‑a‑glance preview. Full gallery available at a later date.
                    </p>
                </header>

                <div className="container">
                    <button
                        className="nav-btn-prev"
                        onClick={prevImage}
                        aria-label="Previous image"
                        disabled={!images.length}
                    >
                        &lt;
                    </button>

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

                    <button
                        className="nav-btn-next"
                        onClick={nextImage}
                        aria-label="Next image"
                        disabled={!images.length}
                    >
                        &gt;
                    </button>
                </div>

                <div className="date-picker">
                    <label>
                        Start Date:{" "}
                        <input
                            type="date"
                            value={startDate || ""}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </label>
                    <label>
                        End Date:{" "}
                        <input
                            type="date"
                            value={endDate || ""}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </label>
                </div>
            </div>

            <div className="carousel-container" ref={parentRef}>
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