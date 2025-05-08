import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import "./imageCarousel.css";
import { supabaseURL } from "./supabaseClient";

export interface CarouselItem {
    imageUrl: string;
    onImageClick: () => void; // might add more params idk
    label: string;
};

interface CarouselProps {
    carouselItems: CarouselItem[],
    selected: number, // -1 means max index
}

// This should stay purely UI logic, none of these backend requests or context data modification
export function ImageCarousel({carouselItems, selected} : CarouselProps) {

    const carouselRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);

    const x = useMotionValue(0);
    const xTransform = useTransform(x, [0, -width], [0, -width]);

    const [isDragging, setIsDragging] = useState(false);

    selected = selected === -1 ? carouselItems.length - 1 : selected; // should work?

    // Calculate the total width for dragging constraints
    useEffect(() => {
        if (!carouselRef.current) return;

        const resizeObserver = new ResizeObserver(() => {
            if (carouselRef.current) {
            const scrollWidth = carouselRef.current.scrollWidth;
            const clientWidth = carouselRef.current.clientWidth;

            const carouselRefStyle = window.getComputedStyle(carouselRef.current);

            const marginLeft = parseFloat(carouselRefStyle.marginLeft);
            const marginRight = parseFloat(carouselRefStyle.marginRight);

            setWidth(scrollWidth - clientWidth - marginLeft - marginRight);
            }
        });

        resizeObserver.observe(carouselRef.current);
        return () => resizeObserver.disconnect();
    }, [carouselRef]);

    return (
        <div className="carousel-container">
            <motion.div /** theres an issue where when i stop dragging without momentum the scollbar jumps to the scroll 0 aka to the beggining */
                ref={carouselRef}
                className="carousel"
                style={{ x: xTransform }}
                drag="x"
                dragConstraints={{ right: 0, left: -width }}
                dragElastic={0.2}
                // Smooth transition when dragging ends
                transition={{ stiffness: 300, damping: 50, mass: 100000 }}

                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setTimeout(() => setIsDragging(false), 50)} // 50ms wait to make sure that onClick doesn't work off of old info
            >
                {carouselItems.map((item, index) => (
                    <div>
                        <img
                            src={`${supabaseURL}/storage/v1/object/public/solar_images/${item.imageUrl}`}
                            onClick={() => isDragging ? {} : item.onImageClick()}
                            draggable="false"
                            className={"carousel-item" + ((selected === index) ? " selected": "")}
                            alt={`Slide ${index + 1}`} />
                            <h4>{item.label}</h4>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}