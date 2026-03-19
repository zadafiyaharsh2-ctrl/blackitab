import { useEffect } from 'react';

/**
 * Sets the browser tab title for the current page.
 * Usage: usePageTitle('Dashboard');  → "Dashboard — RANKLEN"
 */
const usePageTitle = (title) => {
    useEffect(() => {
        document.title = title ? `${title} — RANKLEN` : 'RANKLEN';
        return () => { document.title = 'RANKLEN'; };
    }, [title]);
};

export default usePageTitle;
