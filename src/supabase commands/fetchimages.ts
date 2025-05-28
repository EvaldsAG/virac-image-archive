import { supabase } from "./../functions/supabaseClient";

async function saveImageMetadata(imagePath: string) {
    // Extract the date from the image path (assuming it's in YYYY/MM/DD format)
    const pathParts = imagePath.split('/');
    if (pathParts.length < 3) return;  // Ensure the path has enough segments

    const captureDate = `${pathParts[0]}-${pathParts[1]}-${pathParts[2]}`;

    // Check if the image already exists in the database
    const { data: existing, error: selectError } = await supabase
        .from('solar_images_metadata')
        .select('image_path')
        .eq('image_path', imagePath)
        .limit(1);

    if (selectError) {
        console.error(`Error checking existing metadata for ${imagePath}:`, selectError);
        return;
    }

    if (existing && existing.length > 0) {
        console.log(`Metadata for ${imagePath} already exists. Skipping.`);
        return;
    }

    // Insert new metadata
    const { error } = await supabase
        .from('solar_images_metadata')
        .insert([{ image_path: imagePath, capture_date: captureDate }]);

    if (error) {
        console.error(`Error inserting metadata for ${imagePath}:`, error);
    } else {
        console.log(`Inserted metadata for ${imagePath}`);
    }
}

async function listAllImages() {
    const { data: yearFolders, error: yearError } = await supabase
        .storage
        .from('solar_images')
        .list('', { limit: 1000 });

    if (yearError) {
        console.error('Error listing year folders:', yearError);
        return;
    }

    for (const yearFolder of yearFolders) {
        const yearPath = yearFolder.name;
        const { data: monthFolders, error: monthError } = await supabase
            .storage
            .from('solar_images')
            .list(yearPath, { limit: 1000 });

        if (monthError) continue;

        for (const monthFolder of monthFolders) {
            const monthPath = `${yearPath}/${monthFolder.name}`;
            const { data: dayFolders, error: dayError } = await supabase
                .storage
                .from('solar_images')
                .list(monthPath, { limit: 1000 });

            if (dayError) continue;

            for (const dayFolder of dayFolders) {
                const dayPath = `${monthPath}/${dayFolder.name}`;
                const { data: images, error: imageError } = await supabase
                    .storage
                    .from('solar_images')
                    .list(dayPath, { limit: 1000 });

                if (imageError) continue;

                for (const image of images) {
                    const fullPath = `${dayPath}/${image.name}`;
                    console.log(fullPath);
                    await saveImageMetadata(fullPath);
                }
            }
        }
    }
}

listAllImages();


