
"use client";

import { Loader2 } from "lucide-react"

export const Loader = () => {
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
        </div>
    )
}
