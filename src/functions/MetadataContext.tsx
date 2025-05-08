import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

// Define the context type
interface MetadataContextType {
    metadata: ImageMetadata[];
    refreshMetadata: () => void;
}


export type ImageMetadata = {
    image_path: string;
    capture_date: string;
};

// Create the context with default values
const MetadataContext = createContext<MetadataContextType | undefined>(undefined);

// Context provider component
export const MetadataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [metadata, setMetadata] = useState<ImageMetadata[]>([]);


    const refreshMetadata = async () => {
        const { data, error } = await supabase
            .from("solar_images_metadata")
            .select("image_path, capture_date");

        if (error) {
            console.error(error);
            return;
        }

        setMetadata(data);
    }

    useEffect(() => {
        refreshMetadata();
    }, []);


    return (
        <MetadataContext.Provider value={{ metadata, refreshMetadata }}>
            {children}
        </MetadataContext.Provider>
    );
};



// Custom hook to use the context
export const getMetadata = () => {
    const context = useContext(MetadataContext);
    if (!context) {
        throw new Error("useImage must be used within an RecentImageProvider");
    }
    return context;
};
