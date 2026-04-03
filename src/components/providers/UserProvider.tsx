"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ACTIVE_PRODUCT_CHANGED_EVENT, ACTIVE_PRODUCT_STORAGE_KEY } from "@/lib/active-product";

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
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            setUser(authUser);

            if (authUser) {
                // First get the active_product_id from profile
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("active_product_id")
                    .eq("id", authUser.id)
                    .maybeSingle();

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
        } catch (err) {
            console.error("[UserProvider] Error loading user data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const handleActiveProductChange = () => {
            loadData();
        };

        const handleStorage = (event: StorageEvent) => {
            if (event.key === ACTIVE_PRODUCT_STORAGE_KEY) {
                loadData();
            }
        };

        window.addEventListener(ACTIVE_PRODUCT_CHANGED_EVENT, handleActiveProductChange);
        window.addEventListener("storage", handleStorage);

        return () => {
            window.removeEventListener(ACTIVE_PRODUCT_CHANGED_EVENT, handleActiveProductChange);
            window.removeEventListener("storage", handleStorage);
        };
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
