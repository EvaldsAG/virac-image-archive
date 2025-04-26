import { supabase } from './supabaseClient';

export const getRecentImage = async (): Promise<string | null> => {
    // Fetch all years
    const { data: years, error: yearError } = await supabase.storage.from("solar_images").list();
    if (yearError || !years || years.length === 0) {
        console.error("Error fetching years or no years found:", yearError);
        return null;
    }

    // Select the latest year
    const latestYear = years.sort((a, b) => b.name.localeCompare(a.name))[0];
    if (!latestYear) {
        console.error("No valid year found");
        return null;
    }

    // Fetch all months for the latest year
    const { data: months, error: monthError } = await supabase.storage.from("solar_images").list(latestYear.name);
    if (monthError || !months || months.length === 0) {
        console.error(`Error fetching months from ${latestYear.name} or no months found:`, monthError);
        return null;
    }

    // Select the latest month
    const latestMonth = months.sort((a, b) => b.name.localeCompare(a.name))[0];
    if (!latestMonth) {
        console.error("No valid month found");
        return null;
    }

    // Fetch all days for the latest month
    const { data: days, error: dayError } = await supabase.storage.from("solar_images").list(`${latestYear.name}/${latestMonth.name}`);
    if (dayError || !days || days.length === 0) {
        console.error(`Error fetching days from ${latestYear.name}/${latestMonth.name} or no days found:`, dayError);
        return null;
    }

    // Select the latest day
    const latestDay = days.sort((a, b) => b.name.localeCompare(a.name))[0];
    if (!latestDay) {
        console.error("No valid day found");
        return null;
    }

    // Fetch all images for the latest day
    const { data: images, error: imageError } = await supabase.storage.from("solar_images").list(`${latestYear.name}/${latestMonth.name}/${latestDay.name}`);
    if (imageError || !images || images.length === 0) {
        console.error(`Error fetching images from ${latestYear.name}/${latestMonth.name}/${latestDay.name} or no images found:`, imageError);
        return null;
    }

    // Parse and sort images by hours, minutes, seconds as integers
    const sortedImages = images
        .map(img => {
            const [hours, minutes, seconds, wavelength] = img.name.split('-');
            return {
                name: img.name,
                hours: parseInt(hours),
                minutes: parseInt(minutes),
                seconds: parseInt(seconds),
                baseName: `${hours}-${minutes}-${seconds}`, // Store the base name without the wavelength
            };
        })
        .sort((a, b) => {
            if (a.hours !== b.hours) return b.hours - a.hours;
            if (a.minutes !== b.minutes) return b.minutes - a.minutes;
            return b.seconds - a.seconds;
        });

    // Find the most recent image with the selected wavelength
    const latestImage = sortedImages[0];
    if (!latestImage) {
        console.error("No images found for the latest timestamp");
        return null;
    }

    // Construct and return the full path without the wavelength part
    const imagePath = `${latestYear.name}/${latestMonth.name}/${latestDay.name}/${latestImage.baseName}`;
    console.log(imagePath);
    return imagePath;
};