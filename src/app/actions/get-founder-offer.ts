"use server";

import { createClient } from "@/lib/supabase/server";
import { unstable_noStore as noStore } from "next/cache";

export async function getStarterOfferSpotsLeft() {
    return 10;
}
