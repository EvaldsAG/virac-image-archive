import React, { useState, useEffect, useRef } from "react";
import { supabase, supabaseURL } from './supabaseClient';
import './test.css'

import { motion } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";

export default function Greer() {

    type ImageData = {
        url: string;
        captureDate: Date;
    };
    const [images, setImages] = useState<ImageData[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const [selector, setSelector] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);



    useEffect(() => {
        const fetchImages = async () => {
            const { data, error } = await supabase
                .from("solar_images_metadata")
                .select("image_path, capture_date");

            if (error) {
                console.error(error);
            } else {
                const filteredImages = data
                    .filter((img) => img.image_path.endsWith("-w1.png"))
                    .filter((img) => {
                        const imgDate = new Date(img.capture_date).toISOString().slice(0, 10);
                        const isAfterStart = !startDate || imgDate >= startDate;
                        const isBeforeEnd = !endDate || imgDate <= endDate;
                        return isAfterStart && isBeforeEnd;
                    })
                    .map((img) => ({
                        url: `${supabaseURL}/storage/v1/object/public/solar_images/${img.image_path}`,
                        captureDate: img.capture_date,
                    }));
                setImages(filteredImages);
                console.log("hi, these are the images:", filteredImages)
                if (filteredImages.length > 0) {
                    setSelector(filteredImages[0].url); // Default to the first image
                }
            }
        };

        fetchImages();
    }, [startDate, endDate]);


    // Modal focus trap logic remains unchanged
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



    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);


    // Virtualization for performance
    const parentRef = useRef<HTMLDivElement>(null);
    const rowVirtualizer = useVirtualizer({
        count: images.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 120, // Approximate width of each image
        horizontal: true,
    });

    const imageWidth = 120; // your estimated width per image (same as in estimateSize)
    const imageSpacing = 10; // any margin/padding between images
    const totalImageWidth = imageWidth + imageSpacing;

    const totalWidth = images.length * totalImageWidth;
    const containerWidth = parentRef.current?.offsetWidth || 0;

    const dragLeft = containerWidth - totalWidth; // how far left you can drag
    const dragRight = 100;


    return (
        <div className="whole-container">
            <div className="main-image-container">

                <div>
                    <div>
                        <h1>Gallery</h1>
                        <p>This is an at a glance preview. Full Gallery available Here</p>
                    </div>

                    <div className="container">
                        <div className="button">
                            <p>&lt;</p>
                        </div>
                        <div className="image">
                            <img
                                src={selector}
                                className="modalImage"
                                alt="zoomed in solar image"
                            />
                        </div>
                        <div className="button">
                            <p>&gt;</p>
                        </div>
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

            </div>
            <div className="carousel-container" ref={parentRef}>
                <motion.div
                    className="carousel"
                    drag="x"
                    dragConstraints={{
                        left: dragLeft,
                        right: dragRight,
                    }}
                >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => (
                        <div className="carousel-item" key={virtualRow.index}>
                            <motion.img
                                key={virtualRow.index}
                                src={images[virtualRow.index].url}
                                alt={`Solar image taken on ${images[virtualRow.index].captureDate}`}
                                // className="image" 
                                className={`image ${selector === images[virtualRow.index].url ? "selected" : ""}`}

                                whileHover={{ scale: 1.1 }}
                                onClick={(e) => {
                                    const container = parentRef.current;
                                    const target = e.currentTarget; // The clicked image

                                    if (container && target) {
                                        const containerWidth = container.offsetWidth;
                                        const imageWidth = target.offsetWidth;
                                        const imageLeft = target.offsetLeft;

                                        const scrollTo = imageLeft - (containerWidth / 2) + (imageWidth / 2);

                                        container.scrollTo({
                                            left: scrollTo,
                                            behavior: "smooth",
                                        });

                                        // console.log("Scrolled to image:", images[virtualRow.index]);
                                    }
                                    setSelector(images[virtualRow.index].url);

                                }}

                            />
                            <p className="image-date">
                                {new Date(images[virtualRow.index].captureDate).toLocaleDateString('en-CA')}
                            </p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}

