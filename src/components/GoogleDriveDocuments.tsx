"use client";

import { useEffect, useState } from "react";
import { FileText, ExternalLink, Loader, ChevronDown } from "lucide-react";

interface DriveFile {
  id: string;
  name: string;
  type: string; // 'spreadsheet', 'document', 'other'
  size?: string;
  modified?: string;
}

interface SheetSection {
  title: string;
  data: Array<{ [key: string]: any }>;
}

interface GoogleDriveDocumentsProps {
  sellerName?: string;
  buyerName?: string;
  address?: string;
}

export default function GoogleDriveDocuments({
  sellerName,
  buyerName,
  address,
}: GoogleDriveDocumentsProps) {
  const [documents, setDocuments] = useState<DriveFile[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DriveFile | null>(null);
  const [sections, setSections] = useState<SheetSection[]>([]);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const name = sellerName || buyerName;

  useEffect(() => {
    if (name || address) {
      fetchDocuments();
    }
  }, [name, address]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (name) params.append("name", name);
      if (address) params.append("address", address);

      const response = await fetch(
        `/api/google-drive/search?${params.toString()}`
      );
      const data = await response.json();

      if (data.documents && data.documents.length > 0) {
        setDocuments(data.documents);
        // Auto-select first document
        setSelectedDoc(data.documents[0]);
        // Only fetch sections if it's a spreadsheet
        if (data.documents[0].type === "spreadsheet") {
          await fetchSections(data.documents[0].id);
        } else {
          setSections([]);
        }
      }
    } catch (err) {
      setError("Failed to fetch documents");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async (fileId: string) => {
    setLoadingSections(true);
    try {
      const response = await fetch(
        `/api/google-drive/sections?fileId=${fileId}`
      );
      const data = await response.json();

      if (data.sections) {
        setSections(data.sections);
        setActiveSectionIndex(0);
      }
    } catch (err) {
      console.error("Error fetching sections:", err);
      setSections([]);
    } finally {
      setLoadingSections(false);
    }
  };

  const handleDocumentSelect = async (doc: DriveFile) => {
    setSelectedDoc(doc);
    setActiveSectionIndex(0);
    // Only fetch sections if it's a spreadsheet
    if (doc.type === "spreadsheet") {
      await fetchSections(doc.id);
    } else {
      setSections([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-primary-300 text-sm">
        <Loader size={14} className="animate-spin" />
        Loading documents...
      </div>
    );
  }

  if (!documents.length) {
    return null;
  }

  const activeSection = sections[activeSectionIndex];

  return (
    <div className="border-t border-primary-700 pt-4 mt-4">
      <div className="mb-3">
        <h4 className="text-primary-200 font-semibold flex items-center gap-2 text-sm">
          <FileText size={16} />
          Google Drive Documents ({documents.length})
        </h4>
      </div>

      {/* Document Selector */}
      <div className="space-y-2 mb-4">
        {documents.map((doc) => (
          <div key={doc.id} className="flex gap-2">
            <button
              onClick={() => handleDocumentSelect(doc)}
              className={`flex-1 text-left rounded px-3 py-2 flex items-between justify-between gap-2 transition-colors ${
                selectedDoc?.id === doc.id
                  ? "bg-primary-700 border border-primary-600"
                  : "bg-primary-900/50 hover:bg-primary-800/50"
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-primary-200 text-sm truncate font-medium">
                  {doc.name}
                </p>
                {doc.modified && (
                  <p className="text-primary-400 text-xs">
                    Updated: {doc.modified}
                  </p>
                )}
              </div>
            </button>
            <a
              href={`https://drive.google.com/open?id=${doc.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-300 hover:text-white transition flex-shrink-0 self-center px-2"
            >
              <ExternalLink size={16} />
            </a>
          </div>
        ))}
      </div>

      {/* Sheet Sections Tabs - Only for Spreadsheets */}
      {selectedDoc && selectedDoc.type === "spreadsheet" && (
        <div className="border-t border-primary-700 pt-3">
          {loadingSections ? (
            <div className="flex items-center gap-2 text-primary-300 text-sm">
              <Loader size={14} className="animate-spin" />
              Loading spreadsheet sections...
            </div>
          ) : sections.length > 0 ? (
            <>
              <div className="flex gap-2 overflow-x-auto mb-3 pb-2">
                {sections.map((section, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSectionIndex(idx)}
                    className={`whitespace-nowrap px-3 py-1 rounded text-xs font-medium transition-colors ${
                      activeSectionIndex === idx
                        ? "bg-primary-600 text-white"
                        : "bg-primary-800/50 text-primary-300 hover:bg-primary-700"
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </div>
              {activeSection && <SectionDataDisplay section={activeSection} />}
            </>
          ) : (
            <div className="text-primary-400 text-xs p-2">
              No data found in this spreadsheet
            </div>
          )}
        </div>
      )}

      {/* Info for Document Files */}
      {selectedDoc && selectedDoc.type === "document" && (
        <div className="border-t border-primary-700 pt-3">
          <p className="text-primary-400 text-xs p-2">
            Document files don't have structured data sections. Open the document directly in Google Drive to view its contents.
          </p>
        </div>
      )}

      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}

interface SectionDataDisplayProps {
  section: SheetSection;
}

function SectionDataDisplay({ section }: SectionDataDisplayProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (index: number) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setExpandedRows(newSet);
  };

  if (!section.data || section.data.length === 0) {
    return (
      <div className="text-primary-400 text-xs p-2">
        No data in {section.title}
      </div>
    );
  }

  // Get columns from first row
  const columns = Object.keys(section.data[0] || {}).filter(
    (key) => key && section.data[0][key]
  );

  return (
    <div className="space-y-2">
      {section.data.map((row, rowIdx) => {
        const rowValues = columns.filter((col) => row[col]);
        if (rowValues.length === 0) return null;

        const isExpanded = expandedRows.has(rowIdx);
        const firstCol = columns[0];
        const firstValue = row[firstCol];

        return (
          <div
            key={rowIdx}
            className="bg-primary-900/30 border border-primary-700/30 rounded overflow-hidden"
          >
            <button
              onClick={() => toggleRow(rowIdx)}
              className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-primary-800/30 transition-colors"
            >
              <ChevronDown
                size={14}
                className={`flex-shrink-0 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
              <span className="text-sm text-primary-200 font-medium truncate">
                {firstValue}
              </span>
            </button>

            {isExpanded && (
              <div className="px-3 py-2 bg-primary-900/50 border-t border-primary-700/30 space-y-1">
                {rowValues.map((col) => (
                  <div key={col} className="text-xs">
                    <p className="text-primary-400 font-semibold">{col}</p>
                    <p className="text-primary-200 break-words">
                      {row[col]}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
