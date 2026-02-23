import { useEffect } from 'react';

/**
 * Sets the browser tab title for the current page.
 * Usage: usePageTitle('Dashboard');  → "Dashboard — Blackitab"
 */
const usePageTitle = (title) => {
    useEffect(() => {
        document.title = title ? `${title} — Blackitab` : 'Blackitab';
        return () => { document.title = 'Blackitab'; };
    }, [title]);
};

export default usePageTitle;
