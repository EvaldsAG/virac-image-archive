import React, { createContext, useContext, useState, useEffect } from "react";
import { getRecentImage } from "./getRecentImage"; // Your function from earlier

// Define the context type
interface RecentImageContextType {
    recentImagePath: string | null;
    refreshImage: () => Promise<void>;
}

// Create the context with default values
const RecentImageContext = createContext<RecentImageContextType | undefined>(undefined);

// Context provider component
export const RecentImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [recentImagePath, setRecentImagePath] = useState<string | null>(null);

    // Function to fetch the latest image
    const refreshImage = async () => {
        const path = await getRecentImage();
        console.log("hi, if you're reading this, that means i refreshed, loser.")
        setRecentImagePath(path);
    };

    useEffect(() => {
        // Fetch image on mount
        refreshImage();

        // Set up the interval to refresh every 24 hours
        const interval = setInterval(() => {
            refreshImage();
        }, 86400000); // 24 hours

        return () => clearInterval(interval);
    }, []);

    return (
        <RecentImageContext.Provider value={{ recentImagePath, refreshImage }}>
            {children}
        </RecentImageContext.Provider>
    );
};

// Custom hook to use the context
export const useImage = () => {
    const context = useContext(RecentImageContext);
    if (!context) {
        throw new Error("useImage must be used within an RecentImageProvider");
    }
    return context;
};
