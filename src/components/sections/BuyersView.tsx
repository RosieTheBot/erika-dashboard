"use client";

import { useState, useEffect } from "react";
import { Plus, Mail, Phone, AlertCircle } from "lucide-react";
import GoogleDriveDocuments from "@/components/GoogleDriveDocuments";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";

interface ChecklistState {
  consultation: boolean;
  preApproval: boolean;
  propertySearch: boolean;
  showingScheduled: boolean;
  offerSubmitted: boolean;
}

interface Buyer {
  id: string;
  name: string;
  email: string;
  phone: string;
  stage: string;
  budget?: string;
  propertyType?: string;
  area?: string;
  notes?: string;
  lastContact?: string;
  timeline?: string;
  investmentType?: string;
  tags?: string[];
  background?: string;
  propertyCriteria?: string;
  bedroomCount?: string;
  priceRange?: string;
}

interface BuyersViewProps {
  initialBuyers: Buyer[];
}

export default function BuyersView({ initialBuyers }: BuyersViewProps) {
  const [buyers] = useState<Buyer[]>(initialBuyers);

  return (
    <div className="container-page space-section">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1>Buyers (A-Hot 1-3 Months)</h1>
          <p className="text-primary-300 mt-2">Active buyers ready to purchase in the next 1-3 months</p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />}>Add Buyer</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox label="Total Active" value={buyers.length} />
        <StatBox
          label="High Priority"
          value={buyers.filter((b) => b.budget && parseInt(b.budget) > 500000)
            .length}
        />
        <StatBox label="Ready to View" value={Math.floor(buyers.length * 0.4)} />
        <StatBox label="Pending Offer" value={Math.floor(buyers.length * 0.2)} />
      </div>

      {/* Buyers Grid */}
      {buyers.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="No Hot Buyers Yet"
          description="Buyers from Follow Up Boss (stage: A-Hot 1-3 Months) will appear here"
          action={{
            label: "Add Buyer",
            onClick: () => console.log("Add buyer clicked")
          }}
          variant="info"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {buyers.map((buyer) => (
            <BuyerCard key={buyer.id} buyer={buyer} />
          ))}
        </div>
      )}
    </div>
  );
}

interface BuyerCardProps {
  buyer: Buyer;
}

function BuyerCard({ buyer }: BuyerCardProps) {
  const [checklist, setChecklist] = useState({
    consultation: false,
    preApproval: false,
    propertySearch: false,
    showingScheduled: false,
    offerSubmitted: false,
  });

  // Load checklist from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`buyer_checklist_${buyer.id}`);
    if (stored) {
      setChecklist(JSON.parse(stored));
    }
  }, [buyer.id]);

  // Save checklist to localStorage whenever it changes
  const handleChecklistChange = (key: keyof typeof checklist) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    localStorage.setItem(`buyer_checklist_${buyer.id}`, JSON.stringify(updated));
  };

  return (
    <div className="bg-gradient-to-br from-primary-800/60 to-primary-850/40 border border-primary-700/50 rounded-lg p-6 hover:border-primary-600/50 hover:shadow-lg hover:shadow-primary-950/40 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">{buyer.name}</h3>
          <p className="text-primary-400 text-sm mt-1">{buyer.stage}</p>
        </div>
        <div className="text-right">
          {buyer.budget && (
            <p className="text-green-400 font-semibold">{buyer.budget}</p>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-primary-300">
          <Mail size={16} />
          <a
            href={`mailto:${buyer.email}`}
            className="text-primary-200 hover:text-white transition"
          >
            {buyer.email}
          </a>
        </div>
        {buyer.phone && (
          <div className="flex items-center gap-2 text-primary-300">
            <Phone size={16} />
            <a
              href={`tel:${buyer.phone}`}
              className="text-primary-200 hover:text-white transition"
            >
              {buyer.phone}
            </a>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {buyer.propertyType && (
          <div className="bg-primary-700 rounded px-2 py-1">
            <p className="text-xs text-primary-300">Property Type</p>
            <p className="text-sm font-medium text-white">{buyer.propertyType}</p>
          </div>
        )}
        {buyer.area && (
          <div className="bg-primary-700 rounded px-2 py-1">
            <p className="text-xs text-primary-300">Area</p>
            <p className="text-sm font-medium text-white">{buyer.area}</p>
          </div>
        )}
        {buyer.bedroomCount && (
          <div className="bg-primary-700 rounded px-2 py-1">
            <p className="text-xs text-primary-300">Bedrooms</p>
            <p className="text-sm font-medium text-white">{buyer.bedroomCount}</p>
          </div>
        )}
        {buyer.priceRange && (
          <div className="bg-primary-700 rounded px-2 py-1">
            <p className="text-xs text-primary-300">Price Range</p>
            <p className="text-sm font-medium text-white">{buyer.priceRange}</p>
          </div>
        )}
        {buyer.timeline && (
          <div className="bg-primary-700 rounded px-2 py-1">
            <p className="text-xs text-primary-300">Timeline</p>
            <p className="text-sm font-medium text-white">{buyer.timeline}</p>
          </div>
        )}
        {buyer.investmentType && (
          <div className="bg-primary-700 rounded px-2 py-1">
            <p className="text-xs text-primary-300">Investment Type</p>
            <p className="text-sm font-medium text-white">{buyer.investmentType}</p>
          </div>
        )}
      </div>

      {buyer.background && (
        <div className="bg-primary-900/40 border border-primary-700/30 rounded px-3 py-2 mb-4">
          <p className="text-xs text-primary-300 font-semibold mb-1">Background</p>
          <p className="text-sm text-primary-200">{buyer.background}</p>
        </div>
      )}

      {buyer.propertyCriteria && (
        <div className="bg-primary-900/40 border border-primary-700/30 rounded px-3 py-2 mb-4">
          <p className="text-xs text-primary-300 font-semibold mb-1">Property Criteria</p>
          <p className="text-sm text-primary-200">{buyer.propertyCriteria}</p>
        </div>
      )}

      {buyer.lastContact && (
        <div className="mb-3 text-xs text-primary-400">
          Last contact: {buyer.lastContact}
        </div>
      )}

      {buyer.notes && (
        <div className="bg-primary-900/40 border border-primary-700/30 rounded px-3 py-2 mb-4">
          <p className="text-xs text-primary-300 font-semibold mb-1">Notes</p>
          <p className="text-sm text-primary-200">{buyer.notes}</p>
        </div>
      )}

      {buyer.tags && buyer.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1">
          {buyer.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block bg-primary-600/50 text-primary-100 text-xs px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <GoogleDriveDocuments buyerName={buyer.name} address={buyer.area} />

      <div className="border-t border-primary-700 pt-4">
        <details className="cursor-pointer">
          <summary className="text-primary-300 hover:text-white text-sm font-medium">
            Workflow Checklist →
          </summary>
          <div className="mt-3 space-y-2 text-sm">
            <label className="flex items-center gap-2 text-primary-300 cursor-pointer hover:text-white">
              <input 
                type="checkbox" 
                className="w-4 h-4" 
                checked={checklist.consultation}
                onChange={() => handleChecklistChange('consultation')}
              />
              Initial consultation completed
            </label>
            <label className="flex items-center gap-2 text-primary-300 cursor-pointer hover:text-white">
              <input 
                type="checkbox" 
                className="w-4 h-4"
                checked={checklist.preApproval}
                onChange={() => handleChecklistChange('preApproval')}
              />
              Pre-approval obtained
            </label>
            <label className="flex items-center gap-2 text-primary-300 cursor-pointer hover:text-white">
              <input 
                type="checkbox" 
                className="w-4 h-4"
                checked={checklist.propertySearch}
                onChange={() => handleChecklistChange('propertySearch')}
              />
              Property search started
            </label>
            <label className="flex items-center gap-2 text-primary-300 cursor-pointer hover:text-white">
              <input 
                type="checkbox" 
                className="w-4 h-4"
                checked={checklist.showingScheduled}
                onChange={() => handleChecklistChange('showingScheduled')}
              />
              Showing scheduled
            </label>
            <label className="flex items-center gap-2 text-primary-300 cursor-pointer hover:text-white">
              <input 
                type="checkbox" 
                className="w-4 h-4"
                checked={checklist.offerSubmitted}
                onChange={() => handleChecklistChange('offerSubmitted')}
              />
              Offer submitted
            </label>
          </div>
        </details>
      </div>
    </div>
  );
}

interface StatBoxProps {
  label: string;
  value: number;
}

function StatBox({ label, value }: StatBoxProps) {
  return (
    <div className="bg-gradient-to-br from-primary-800/60 to-primary-850/40 border border-primary-700/50 rounded-lg p-4 text-center hover:border-primary-600/50 transition-all duration-300">
      <p className="text-primary-300 text-xs sm:text-sm font-semibold uppercase tracking-tight line-clamp-2">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold text-white mt-2">{value}</p>
    </div>
  );
}
