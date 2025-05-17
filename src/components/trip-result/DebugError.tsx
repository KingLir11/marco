
import React from "react";
import ActionButtons from "./ActionButtons";

interface DebugErrorProps {
  parsingError: string;
  rawResponse: string | null;
}

const DebugError = ({ parsingError, rawResponse }: DebugErrorProps) => {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
      <h3 className="font-medium mb-2">Error parsing trip data</h3>
      <p className="text-sm">{parsingError}</p>
      
      {/* Debug section to show raw response */}
      {rawResponse && (
        <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200 overflow-auto max-h-60">
          <h4 className="text-xs font-semibold text-gray-500 mb-2">Raw Response Data (Debug)</h4>
          <pre className="text-xs">{rawResponse}</pre>
        </div>
      )}
      
      <div className="mt-4">
        <ActionButtons />
      </div>
    </div>
  );
};

export default DebugError;
