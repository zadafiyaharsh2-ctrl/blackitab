import React from 'react';
import { BookOpen } from 'lucide-react';

/**
 * Renders an array of content blocks as React components.
 * Supported types: paragraph, heading, list, numbered_list, image, link, code, table
 */
const ContentBlockRenderer = ({ contentBlocks }) => {
  if (!Array.isArray(contentBlocks)) return null;

  return (
    <>
      {contentBlocks.map((block, index) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p key={index} className="mb-4 leading-relaxed text-lg text-gray-700 dark:text-gray-300">
                {block.text}
              </p>
            );

          case "heading":
            return (
              <h2 key={index} className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
                {block.text}
              </h2>
            );

          case "list":
            return (
              <div key={index} className="mb-6">
                {block.title && (
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-200">{block.title}</h3>
                )}
                <ul className="list-disc ml-6 space-y-2 text-lg text-gray-700 dark:text-gray-300">
                  {block.items?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            );

          case "numbered_list":
            return (
              <ol key={index} className="list-decimal ml-6 mb-6 space-y-2 text-lg text-gray-700 dark:text-gray-300">
                {block.items?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            );

          case "image":
            return (
              <div key={index} className="my-8 flex flex-col items-center">
                <img
                  src={block.src}
                  alt={block.alt || "Topic illustration"}
                  className="max-w-full h-auto rounded-lg shadow-md"
                  style={{ maxHeight: block.maxHeight || '600px', maxWidth: '800px' }}
                />
                {block.caption && (
                  <p className="text-sm text-gray-600 mt-2 italic text-center">
                    {block.caption}
                  </p>
                )}
              </div>
            );

          case "link":
            return (
              <div key={index} className="my-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl flex items-center shadow-sm">
                <a 
                  href={block.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold flex items-center text-lg underline-offset-4 decoration-2 hover:underline transition-all"
                >
                  <BookOpen className="inline mr-3 h-6 w-6" />
                  {block.text || 'View External Resource'}
                </a>
              </div>
            );

          case "code":
            return (
              <div key={index} className="my-4">
                <pre className="bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm font-mono text-gray-700 dark:text-gray-300 whitespace-pre">
                    {block.code || block.text}
                  </code>
                </pre>
              </div>
            );

          case "table": {
            const shouldSplit = block.headers && block.headers.length > 5;

            if (shouldSplit) {
              const midPoint = Math.ceil(block.headers.length / 2);
              const firstHalfHeaders = block.headers.slice(0, midPoint);
              const secondHalfHeaders = block.headers.slice(midPoint);

              return (
                <div key={index} className="my-6">
                  <div className="overflow-x-auto max-w-full mb-4">
                    <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          {firstHalfHeaders.map((header, i) => (
                            <th key={i} className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-200">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {block.rows.map((row, rowIndex) => (
                          <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white dark:bg-gray-900/30" : "bg-gray-50 dark:bg-gray-800/30"}>
                            {row.slice(0, midPoint).map((cell, cellIndex) => (
                              <td key={cellIndex} className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-700 dark:text-gray-300">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="overflow-x-auto max-w-full">
                    <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          {secondHalfHeaders.map((header, i) => (
                            <th key={i} className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-200">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {block.rows?.map((row, rowIndex) => (
                          <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white dark:bg-gray-900/30" : "bg-gray-50 dark:bg-gray-800/30"}>
                            {row?.slice(midPoint).map((cell, cellIndex) => (
                              <td key={cellIndex} className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-700 dark:text-gray-300">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {block.caption && (
                    <p className="text-sm text-gray-600 mt-2 italic text-center">{block.caption}</p>
                  )}
                </div>
              );
            }

            return (
              <div key={index} className="my-6 overflow-x-auto max-w-full">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {block.headers?.map((header, i) => (
                        <th key={i} className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-200">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows?.map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white dark:bg-gray-900/30" : "bg-gray-50 dark:bg-gray-800/30"}>
                        {row?.map((cell, cellIndex) => (
                          <td key={cellIndex} className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-700 dark:text-gray-300">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {block.caption && (
                  <p className="text-sm text-gray-600 mt-2 italic text-center">{block.caption}</p>
                )}
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </>
  );
};

export default ContentBlockRenderer;
