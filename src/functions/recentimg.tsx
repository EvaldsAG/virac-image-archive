import React, { useState, useRef, useEffect } from "react";
import { supabaseURL } from './supabaseClient'; //supabase,
// import { getRecentImage } from "./getRecentImage";
import { getMetadata } from "./MetadataContext";
import "./recentimg.css"
import "./modal.css";

export const RecentIMG: React.FC = () => {
    const [selectwavelength, setWavelength] = useState("-w1.png");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const { metadata } = getMetadata();



    const [imagePath, setImagePath] = useState(
        metadata
            .filter(img => img.image_path.endsWith("-w1.png"))
            .map(img => img.image_path));



    const recentimg = imagePath[imagePath.length - 1]

    useEffect(() => {

        setImagePath(metadata
            .filter(img => img.image_path.endsWith(selectwavelength))
            .map(img => img.image_path));

    }, [metadata, selectwavelength]);






    const handleWavelengthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {

        setWavelength(event.target.value);

    };


    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div className="recentContainer">
            <div className="recentImageCNTR">
                <img
                    src={`${supabaseURL}/storage/v1/object/public/solar_images/${recentimg}`}
                    className="recentImage"
                    alt="most recently captured image"
                    onClick={openModal}
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
                    <option value="-w1.png">Wavelength 1</option>
                    <option value="-w2.png">Wavelength 2</option>
                    <option value="-w3.png">Wavelength 3</option>
                    <option value="-w4.png">Wavelength 4</option>
                </select>
            </div>

            {isModalOpen && (
                <div className="modalOverlay" onClick={closeModal}>
                    <div className="modalContent" ref={modalRef} onClick={(e) => e.stopPropagation()}>
                        <button className="closeButton" onClick={closeModal}>×</button>
                        <img
                            src={`${supabaseURL}/storage/v1/object/public/solar_images/${recentimg}`}
                            className="modalImage"
                            alt="zoomed in solar image"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};




