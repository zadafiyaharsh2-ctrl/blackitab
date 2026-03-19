import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

/**
 * InstituteBreadcrumb — reusable breadcrumb for the institute hierarchy.
 * 
 * Usage:
 *   <InstituteBreadcrumb items={[
 *     { label: 'Departments', to: '/institute/departments' },
 *     { label: 'Computer Science', to: '/institute/department/Computer%20Science' },
 *     { label: 'Prof. Kumar' }  // last item = no link (current page)
 *   ]} />
 */
const InstituteBreadcrumb = ({ items = [] }) => {
    return (
        <nav className="flex items-center gap-1.5 text-sm mb-6 flex-wrap" aria-label="Breadcrumb">
            <Link
                to="/institute/dashboard"
                className="flex items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
                <HomeIcon className="w-4 h-4" />
            </Link>
            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                return (
                    <React.Fragment key={index}>
                        <ChevronRightIcon className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 shrink-0" />
                        {isLast || !item.to ? (
                            <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[200px]">
                                {item.label}
                            </span>
                        ) : (
                            <Link
                                to={item.to}
                                className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate max-w-[200px]"
                            >
                                {item.label}
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};

export default InstituteBreadcrumb;
