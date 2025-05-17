
import React from "react";

interface TripContentProps {
  tripTextContent: string | null;
}

const TripContent: React.FC<TripContentProps> = ({ tripTextContent }) => {
  // Function to convert plain text with markdown-style formatting to HTML
  const formatTripText = (text: string | null) => {
    if (!text) return [];
    
    // Split text into paragraphs
    return text.split('\n').map((line, index) => {
      // Handle headers (###)
      if (line.startsWith('###')) {
        return <h3 key={index} className="text-xl font-bold mt-4 mb-2">{line.replace('###', '').trim()}</h3>;
      }
      // Handle subheaders (**)
      else if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
        return <h4 key={index} className="font-semibold mt-3 mb-1">{line.replace(/\*\*/g, '').trim()}</h4>;
      }
      // Handle list items (-)
      else if (line.trim().startsWith('-')) {
        return <li key={index} className="ml-4">{line.replace('-', '').trim()}</li>;
      }
      // Regular paragraph, but only if not empty
      else if (line.trim()) {
        return <p key={index} className="mb-2">{line}</p>;
      }
      // Empty line
      return <br key={index} />;
    });
  };

  return (
    <div className="mb-10 prose prose-sm max-w-none">
      {tripTextContent ? (
        <div className="bg-white/80 p-6 rounded-lg shadow-sm">
          {formatTripText(tripTextContent)}
        </div>
      ) : (
        <p className="text-center text-gray-500">Your personalized trip plan is being created...</p>
      )}
    </div>
  );
};

export default TripContent;
