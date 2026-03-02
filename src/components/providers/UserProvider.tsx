"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface UserContextType {
    user: any | null;
    product: any | null;
    loading: boolean;
    refreshData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [product, setProduct] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const loadData = async () => {
        setLoading(true);
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setUser(authUser);

        if (authUser) {
            // First get the active_product_id from profile
            const { data: profile } = await supabase
                .from("profiles")
                .select("active_product_id")
                .eq("id", authUser.id)
                .single();

            let productId = profile?.active_product_id;

            // Fallback to most recent product if no active one set
            if (!productId) {
                const { data: latestProduct } = await supabase
                    .from("products")
                    .select("id")
                    .eq("user_id", authUser.id)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle();
                productId = latestProduct?.id;
            }

            if (productId) {
                const { data: productData } = await supabase
                    .from("products")
                    .select("*")
                    .eq("id", productId)
                    .single();
                setProduct(productData);
            } else {
                setProduct(null);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <UserContext.Provider value={{ user, product, loading, refreshData: loadData }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
