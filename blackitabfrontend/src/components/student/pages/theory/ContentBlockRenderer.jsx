import React from 'react';
import { BookOpen } from 'lucide-react';

import { useTheme } from '../../../../context/ThemeContext';

/**
 * Renders an array of content blocks as React components.
 * Dark/light gaming theme matching the gamified Theory page.
 * Supported types: paragraph, heading, list, numbered_list, image, link, code, table
 */
const ContentBlockRenderer = ({ contentBlocks }) => {
  const { isDark } = useTheme();

  if (!Array.isArray(contentBlocks)) return null;

  return (
    <>
      {contentBlocks.map((block, index) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p key={index} className="mb-4 leading-relaxed text-lg" style={{ color: isDark ? '#94a3b8' : '#334155' }}>
                {block.text}
              </p>
            );

          case 'heading':
            return (
              <h2 key={index} className="text-2xl font-black mt-8 mb-4"
                style={{
                  color: isDark ? 'white' : '#0f172a',
                  textShadow: isDark ? '0 0 20px rgba(59,130,246,0.3)' : '0 1px 4px rgba(59,130,246,0.2)'
                }}>
                {block.text}
              </h2>
            );

          case 'list':
            return (
              <div key={index} className="mb-6">
                {block.title && (
                  <h3 className="font-bold text-base mb-3 text-blue-400">{block.title}</h3>
                )}
                <ul className="space-y-2">
                  {block.items?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-base" style={{ color: isDark ? '#94a3b8' : '#334155' }}>
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"
                        style={{ boxShadow: isDark ? '0 0 6px rgba(96,165,250,0.8)' : '0 0 4px rgba(96,165,250,0.5)' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );

          case 'numbered_list':
            return (
              <ol key={index} className="mb-6 space-y-2">
                {block.items?.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-base" style={{ color: isDark ? '#94a3b8' : '#334155' }}>
                    <span className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-black"
                      style={{
                        color: isDark ? '#60a5fa' : '#2563eb',
                        background: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)',
                        border: `1px solid ${isDark ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.2)'}`
                      }}>
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            );

          case 'image':
            return (
              <div key={index} className="my-8 flex flex-col items-center">
                <img
                  src={block.src}
                  alt={block.alt || 'Topic illustration'}
                  className="max-w-full h-auto rounded-xl shadow-lg"
                  style={{
                    maxHeight: block.maxHeight || '600px',
                    maxWidth: '800px',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
                  }}
                />
                {block.caption && (
                  <p className="text-xs text-gray-500 mt-2 italic text-center">{block.caption}</p>
                )}
              </div>
            );

          case 'link':
            return (
              <div key={index} className="my-6 p-4 rounded-xl flex items-center"
                style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)' }}>
                <a
                  href={block.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-bold flex items-center text-base transition-colors"
                >
                  <BookOpen className="inline mr-3 h-5 w-5" />
                  {block.text || 'View External Resource'}
                </a>
              </div>
            );

          case 'code':
            return (
              <div key={index} className="my-5 rounded-xl overflow-hidden"
                style={{ border: '1px solid rgba(59,130,246,0.2)' }}>
                {block.language && (
                  <div className="px-4 py-2 text-xs font-mono text-blue-400"
                    style={{ background: 'rgba(59,130,246,0.1)', borderBottom: '1px solid rgba(59,130,246,0.15)' }}>
                    {block.language}
                  </div>
                )}
                <pre style={{ background: 'rgba(5,8,20,0.8)', margin: 0 }} className="p-4 overflow-x-auto">
                  <code className="text-sm font-mono text-green-300 whitespace-pre">
                    {block.code || block.text}
                  </code>
                </pre>
              </div>
            );

          case 'table': {
            const shouldSplit = block.headers && block.headers.length > 5;

            const renderTable = (headers, rows, sliceStart = 0, sliceEnd = undefined) => (
              <div className="overflow-x-auto max-w-full">
                <table className="w-full border-collapse" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                  <thead>
                    <tr style={{ background: 'rgba(59,130,246,0.1)' }}>
                      {headers.map((header, i) => (
                        <th key={i} className="px-4 py-3 text-left text-sm font-bold text-blue-300"
                          style={{ borderBottom: '1px solid rgba(59,130,246,0.2)' }}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rowIndex) => (
                      <tr key={rowIndex}
                        style={{ background: rowIndex % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                        {(sliceEnd ? row.slice(sliceStart, sliceEnd) : row.slice(sliceStart)).map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-3 text-sm"
                            style={{ color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

            if (shouldSplit) {
              const midPoint = Math.ceil(block.headers.length / 2);
              return (
                <div key={index} className="my-6 space-y-4">
                  {renderTable(block.headers.slice(0, midPoint), block.rows, 0, midPoint)}
                  {renderTable(block.headers.slice(midPoint), block.rows, midPoint)}
                  {block.caption && <p className="text-xs text-gray-500 italic text-center">{block.caption}</p>}
                </div>
              );
            }

            return (
              <div key={index} className="my-6">
                {renderTable(block.headers || [], block.rows || [])}
                {block.caption && <p className="text-xs text-gray-500 italic text-center mt-2">{block.caption}</p>}
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
