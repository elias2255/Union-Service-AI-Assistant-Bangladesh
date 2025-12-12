import React from 'react';

interface TextFormatterProps {
  text: string;
}

export const TextFormatter: React.FC<TextFormatterProps> = ({ text }) => {
  // Split by new lines to handle paragraphs
  const lines = text.split('\n');

  return (
    <div className="leading-relaxed text-sm md:text-base">
      {lines.map((line, index) => {
        // Simple bold parser for **text**
        const parts = line.split(/(\*\*.*?\*\*)/g);
        
        return (
          <p key={index} className={`min-h-[1em] ${line.trim().startsWith('-') ? 'ml-4' : ''}`}>
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
              }
              return <span key={i}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
};
