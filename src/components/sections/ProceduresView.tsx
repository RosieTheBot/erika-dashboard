"use client";

import { useEffect, useState } from "react";
import { BookOpen, ExternalLink, FileText } from "lucide-react";

interface Procedure {
  name: string;
  title: string;
  description: string;
  path: string;
}

export default function ProceduresView() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProcedures();
  }, []);

  const fetchProcedures = async () => {
    try {
      const response = await fetch("/api/procedures");
      const data = await response.json();
      setProcedures(data.procedures || []);
    } catch (error) {
      console.error("Error fetching procedures:", error);
    } finally {
      setLoading(false);
    }
  };

  // Hardcoded procedures since they're in the workspace memory
  const hardcodedProcedures: Procedure[] = [
    {
      name: "Reddit Lead Monitoring",
      title: "01 - Reddit Lead Monitoring",
      description:
        "Monitor Reddit for real estate investment leads and opportunities in Austin area",
      path: "/memory/workflows/01-reddit-lead-monitoring.md",
    },
    {
      name: "Rosie Inbox Check",
      title: "02 - Rosie Inbox Check",
      description: "Daily inbox monitoring and email processing workflow",
      path: "/memory/workflows/02-rosie-inbox-check.txt",
    },
    {
      name: "STR Investor Search",
      title: "03 - STR Investor Search",
      description:
        "Systematic search and qualification of short-term rental investment properties",
      path: "/memory/workflows/03-str-investor-search.txt",
    },
    {
      name: "Property Scraping",
      title: "04 - Property Scraping",
      description: "Web scraping and data extraction for property listings",
      path: "/memory/workflows/04-property-scraping.txt",
    },
    {
      name: "Top Picks Curation",
      title: "04 - Top Picks Curation",
      description:
        "Weekly Top Picks newsletter curation and property selection workflow",
      path: "/memory/workflows/04-top-picks-curation.txt",
    },
    {
      name: "Email Formatting",
      title: "05 - Email Formatting",
      description: "Email template creation and formatting standards",
      path: "/memory/workflows/05-email-formatting.txt",
    },
    {
      name: "File Sharing Protocol",
      title: "06 - File Sharing Protocol",
      description: "Secure file sharing and drive management procedures",
      path: "/memory/workflows/06-file-sharing-protocol.txt",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Procedures Hub</h1>
        <p className="text-primary-300">
          Internal workflow documentation and best practices
        </p>
      </div>

      {/* Procedures Grid */}
      {loading ? (
        <div className="text-primary-300 text-center py-8">
          Loading procedures...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {hardcodedProcedures.map((procedure) => (
            <ProcedureCard key={procedure.name} procedure={procedure} />
          ))}
        </div>
      )}

      {/* Note */}
      <div className="mt-8 bg-primary-800 border border-primary-700 rounded-lg p-6">
        <p className="text-primary-300 text-sm">
          These procedures are documented in the workspace memory and updated as
          workflows are refined. For the full documentation, check the memory
          directory.
        </p>
      </div>
    </div>
  );
}

interface ProcedureCardProps {
  procedure: Procedure;
}

function ProcedureCard({ procedure }: ProcedureCardProps) {
  return (
    <div className="bg-primary-800 border border-primary-700 rounded-lg p-6 hover:border-primary-600 transition">
      <div className="flex items-start gap-3 mb-3">
        <BookOpen size={20} className="text-primary-400 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">{procedure.name}</h3>
          <p className="text-primary-400 text-xs mt-1">{procedure.title}</p>
        </div>
      </div>

      <p className="text-primary-300 text-sm mb-4">{procedure.description}</p>

      <a
        href={`/api/procedure-content?path=${encodeURIComponent(procedure.path)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-primary-300 hover:text-white transition text-sm font-medium"
      >
        <FileText size={14} />
        View Full Documentation
      </a>
    </div>
  );
}
