// This file contains utility functions and classes for theming

export const getThemeClasses = (isDark) => ({
    // Container classes
    container: isDark ? 'bg-transparent' : 'bg-white',
    card: isDark ? 'bg-gray-800/50 backdrop-blur-md border-gray-700' : 'bg-white border-gray-100',
    cardHover: isDark ? 'hover:border-blue-500/30' : 'hover:border-gray-200',

    // Text classes
    textPrimary: isDark ? 'text-white' : 'text-gray-800',
    textSecondary: isDark ? 'text-gray-400' : 'text-gray-600',
    textMuted: isDark ? 'text-gray-500' : 'text-gray-400',

    // Background classes
    bgPrimary: isDark ? 'bg-gray-900' : 'bg-white',
    bgSecondary: isDark ? 'bg-gray-800' : 'bg-gray-50',

    // Border classes
    border: isDark ? 'border-gray-700' : 'border-gray-200',
    borderLight: isDark ? 'border-gray-800' : 'border-gray-100',

    // Button classes
    buttonPrimary: isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700',
    buttonSecondary: isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300',
});
