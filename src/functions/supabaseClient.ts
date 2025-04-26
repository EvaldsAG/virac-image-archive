import { createClient } from "@supabase/supabase-js";

const supabaseURL = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY


if (!supabaseURL || !supabaseKey) {
    console.error("Supabase URL or Key is missing!");
}

export const supabase = createClient(supabaseURL!, supabaseKey!);
export { supabaseURL };

