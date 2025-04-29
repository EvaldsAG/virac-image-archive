import React, { useState, useEffect, useRef } from "react";
import { supabaseURL } from './supabaseClient'; //supabase,
// import { getRecentImage } from "./getRecentImage";
import { useImage } from "./RecentImageContext";
import "./recentimg.css"
import "./modal.css";

export const RecentIMG: React.FC = () => {
    const [selectwavelength, setWavelength] = useState("-w1");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const { recentImagePath } = useImage();



    const handleWavelengthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setWavelength(event.target.value);

    };

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

    return (
        <div className="recentContainer">
            <div className="recentImageCNTR">
                <img
                    src={`${supabaseURL}/storage/v1/object/public/solar_images/${recentImagePath}${selectwavelength}.png`}
                    className="recentImage"
                    alt="most recently captured image"
                    onClick={openModal}
                    tabIndex={0}
                />
            </div>
            <div className="recentSelect">
                <h1>Most Recent Image</h1>
                <p className="recentText">
                    RT-32 is regularly monitoring the sun's surface and any changes it develops or displays.
                    <br />
                    Here is the most recently uploaded image from the radio telescope.
                </p>
                <select onChange={handleWavelengthChange} value={selectwavelength}>
                    <option value="-w1">Wavelength 1</option>
                    <option value="-w2">Wavelength 2</option>
                    <option value="-w3">Wavelength 3</option>
                    <option value="-w4">Wavelength 4</option>
                </select>
            </div>

            {isModalOpen && (
                <div className="modalOverlay" onClick={closeModal}>
                    <div className="modalContent" ref={modalRef} onClick={(e) => e.stopPropagation()}>
                        <button className="closeButton" onClick={closeModal}>×</button>
                        <img
                            src={`${supabaseURL}/storage/v1/object/public/solar_images/${recentImagePath}${selectwavelength}.png`}
                            className="modalImage"
                            alt="zoomed in solar image"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};




