import React, { useState, useEffect, useRef } from "react";
import { supabase, supabaseURL } from './supabaseClient';
import { useImage } from "./RecentImageContext";
import "./mini-gallery.css"
import { Links } from "react-router-dom";

export const MiniGallery: React.FC = () => {

    const { recentImagePath } = useImage();
    const [imageLinks, setImageLinks] = useState<string[]>([]); // State for image links

    useEffect(() => {
        async function fetchImageLinks() {
            const { data, error } = await supabase
                .from("solar_images_metadata")
                .select("image_path");

            if (error) {
                console.error("Error fetching image links:", error);
                return;
            }

            // Extract image paths into an array
            const links = data.map(item => item.image_path).filter(path => path.endsWith("-w1.png"));;

            setImageLinks(links); // Update state

        }

        fetchImageLinks();


    }, []); // Empty dependency array ensures it runs once on mount
    console.log(imageLinks);






    return (


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
                        src={`${supabaseURL}/storage/v1/object/public/solar_images/${imageLinks[0]}`}
                        className="modalImage"
                        alt="zoomed in solar image"
                    />
                </div>
                <div className="button">
                    <p>&gt;</p>
                </div>
                <div className="scroller">infinite scroller</div>

            </div>



        </div>

    );

};




// return (


//     <div>
//         <div>
//             <h1>Gallery</h1>
//             <p>This is an at a glance preview. Full Gallery available Here</p>
//         </div>
//         <div className="container">
//             <div className="item">
//                 <p>&lt;</p>
//             </div>
//             <div className="item">
//                 <img
//                     src={`${supabaseURL}/storage/v1/object/public/solar_images/${imageLinks[0]}`}
//                     className="modalImage"
//                     alt="zoomed in solar image"
//                 />
//             </div>
//             <div className="item">
//                 <p>&gt;</p>
//             </div>
//             <div className="item">
//                 <img
//                     src={`${supabaseURL}/storage/v1/object/public/solar_images/${imageLinks[1]}`}
//                     className="modalImage"
//                     alt="zoomed in solar image"
//                 />
//             </div>
//             <div className="item">
//                 <img
//                     src={`${supabaseURL}/storage/v1/object/public/solar_images/${imageLinks[2]}`}
//                     className="modalImage"
//                     alt="zoomed in solar image"
//                 />
//             </div>
//             <div className="item">
//                 <img
//                     src={`${supabaseURL}/storage/v1/object/public/solar_images/${imageLinks[3]}`}
//                     className="modalImage"
//                     alt="zoomed in solar image"
//                 />
//             </div>
//             <div className="item">
//                 <img
//                     src={`${supabaseURL}/storage/v1/object/public/solar_images/${imageLinks[3]}`}
//                     className="modalImage"
//                     alt="zoomed in solar image"
//                 />
//             </div>
//             <div className="item">
//                 <img
//                     src={`${supabaseURL}/storage/v1/object/public/solar_images/${imageLinks[4]}`}
//                     className="modalImage"
//                     alt="zoomed in solar image"
//                 />
//             </div>
//             <div className="item">
//                 <img
//                     src={`${supabaseURL}/storage/v1/object/public/solar_images/${imageLinks[5]}`}
//                     className="modalImage"
//                     alt="zoomed in solar image"
//                 />
//             </div>
//             <div className="item">
//                 <img
//                     src={`${supabaseURL}/storage/v1/object/public/solar_images/${imageLinks[6]}`}
//                     className="modalImage"
//                     alt="zoomed in solar image"
//                 />
//             </div>
//         </div>

//     </div>

// );
