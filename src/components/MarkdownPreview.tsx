import { useState } from "react";

interface Props {
  content: string;
}

export function MarkdownPreview({ content }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div>
          <h2 className="text-lg font-semibold text-gray-200">Preview</h2>
          <p className="text-xs text-gray-500">
            {wordCount} words · {charCount} chars
          </p>
        </div>
        <button
          onClick={handleCopy}
          disabled={!content}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            copied
              ? "bg-green-600 text-white"
              : content
                ? "bg-amber-500 text-black hover:bg-amber-400"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
          }`}
        >
          {copied ? "Copied!" : "Copy to Clipboard"}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {content ? (
          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300 leading-relaxed">
            {content}
          </pre>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">🥪</div>
              <p>Start building your prompt...</p>
              <p className="text-sm mt-1">Fill in the ingredients on the left</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
