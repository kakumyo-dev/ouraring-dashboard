'use client';

import { useEffect, useState, ReactNode } from 'react';

type ClientOnlyWrapperProps = {
    children: ReactNode;
};

// This component ensures that its children are only rendered client-side,
// which helps prevent hydration errors for components that use random or
// browser-specific data
export default function ClientOnlyWrapper({ children }: ClientOnlyWrapperProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null; // Return nothing on the server side
    }

    return <>{children}</>;
} 