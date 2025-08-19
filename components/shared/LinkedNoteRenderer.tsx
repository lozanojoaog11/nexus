import React from 'react';
import { Book } from '../../types';

interface LinkedNoteRendererProps {
  content: string;
  books: Book[];
  onLinkClick: (bookId: string) => void;
}

const LinkedNoteRenderer: React.FC<LinkedNoteRendererProps> = ({ content, books, onLinkClick }) => {
  const bookTitleMap = React.useMemo(() => {
    return books.reduce((acc, book) => {
      acc[book.title.toLowerCase()] = book.id;
      return acc;
    }, {} as Record<string, string>);
  }, [books]);

  // Regex to split the string by [[...]] syntax, keeping the delimiters
  const parts = content.split(/(\[\[.*?\]\])/g);

  return (
    <React.Fragment>
      {parts.map((part, index) => {
        const match = part.match(/^\[\[(.*?)\]\]$/);
        if (match) {
          const title = match[1];
          const bookId = bookTitleMap[title.toLowerCase()];
          if (bookId) {
            return (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent parent clicks if any
                  onLinkClick(bookId);
                }}
                className="text-blue-400 hover:underline bg-blue-500/10 px-1 py-0.5 rounded transition-colors"
              >
                {title}
              </button>
            );
          }
        }
        // Return the part as a text node, which could be the link syntax itself if no match was found, or regular text
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </React.Fragment>
  );
};

export default LinkedNoteRenderer;
