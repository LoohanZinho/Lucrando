"use client";

import Link, { LinkProps } from "next/link";
import { useLoader } from "@/contexts/loader-context";
import { forwardRef, ReactNode } from "react";

interface LoaderLinkProps extends LinkProps {
    children: ReactNode;
    className?: string;
}

export const LoaderLink = forwardRef<HTMLAnchorElement, LoaderLinkProps>(({ children, className, ...props }, ref) => {
    const { showLoader } = useLoader();

    return (
        <Link {...props} onClick={showLoader} className={className} ref={ref}>
            {children}
        </Link>
    );
});

LoaderLink.displayName = 'LoaderLink';
