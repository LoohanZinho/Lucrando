"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLoader } from "@/contexts/loader-context";

export default function RootPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { showLoader, hideLoader } = useLoader();

    useEffect(() => {
        if (!loading) {
            if (user) {
                router.replace('/dashboard');
            } else {
                router.replace('/login');
            }
        } else {
            showLoader();
        }

        return () => {
            if(!loading) {
                hideLoader();
            }
        }
    }, [user, loading, router, showLoader, hideLoader]);

    return null;
}
