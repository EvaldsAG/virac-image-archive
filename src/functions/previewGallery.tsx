import React, { useState, useEffect, useRef } from "react";
import "./mini-gallery.css"

export const MiniGallery: React.FC = () => {

    return (


        <div>
            <div>
                <h1>Gallery</h1>
                <p>This is an at a glance preview. Full Gallery available Here</p>
            </div>
            <div className="container">
                <div className="item">
                    <p>&lt;</p>
                </div>
                <div className="item">
                    <img
                        src={``}
                        className="modalImage"
                        alt="Main image"
                    />
                </div>
                <div className="item">
                    <p>&gt;</p>
                </div>
                <div className="item">
                    <img
                        src={``}
                        className="modalImage"
                        alt="zoomed in solar image"
                    />
                </div>
                <div className="item">
                    <img
                        src={``}
                        className="modalImage"
                        alt="zoomed in solar image"
                    />
                </div>
                <div className="item">
                    <img
                        src={``}
                        className="modalImage"
                        alt="zoomed in solar image"
                    />
                </div>
                <div className="item">
                    <img
                        src={``}
                        className="modalImage"
                        alt="zoomed in solar image"
                    />
                </div>
                <div className="item">
                    <img
                        src={``}
                        className="modalImage"
                        alt="zoomed in solar image"
                    />
                </div>
                <div className="item">
                    <img
                        src={``}
                        className="modalImage"
                        alt="zoomed in solar image"
                    />
                </div>
                <div className="item">
                    <img
                        src={``}
                        className="modalImage"
                        alt="zoomed in solar image"
                    />
                </div>
            </div>

        </div>

    );

};
