"use client";

import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { useLoader } from "@/contexts/loader-context";
import React from "react";

type LoaderLinkProps = LinkProps & {
  children: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLAnchorElement>;
};

export const LoaderLink = React.forwardRef<HTMLAnchorElement, LoaderLinkProps>(({ children, href, className, ...props }, ref) => {
  const { showLoader } = useLoader();
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== href) {
      showLoader();
    }
  };

  return (
    <Link href={href} onClick={handleClick} className={className} {...props} ref={ref}>
      {children}
    </Link>
  );
});

LoaderLink.displayName = "LoaderLink";
