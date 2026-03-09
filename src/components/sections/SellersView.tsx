"use client";

import { useState, useEffect } from "react";
import { Plus, Mail, Phone, AlertCircle, ExternalLink } from "lucide-react";
import GoogleDriveDocuments from "@/components/GoogleDriveDocuments";
import SellerTaskCard from "@/components/sections/SellerTaskCard";

interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  status: string;
  googleDriveFolder?: string;
  notes?: string;
  lastContact?: string;
  listingPrice?: string;
  marketingStrategy?: string;
  tags?: string[];
}

interface SellersViewProps {
  initialSellers: Seller[];
}

export default function SellersView({ initialSellers }: SellersViewProps) {
  const [sellers] = useState<Seller[]>(initialSellers);
  const [goLiveDates, setGoLiveDates] = useState<Record<string, string>>({});
  const [agreementsStatuses, setAgreementsStatuses] = useState<Record<string, boolean>>({});

  // Load go-live dates and agreement statuses from localStorage/API
  useEffect(() => {
    const loadData = async () => {
      const dates: Record<string, string> = {};
      const agreements: Record<string, boolean> = {};
      
      for (const seller of sellers) {
        const stored = localStorage.getItem(`seller_golive_${seller.id}`);
        if (stored) {
          dates[seller.id] = stored;
        }

        // Fetch task statuses to check if "Upload signed agreements" is Complete
        try {
          const response = await fetch(`/api/sellers/${seller.id}/tasks`);
          if (response.ok) {
            const data = await response.json();
            const tasks = data.tasks || {};
            
            // Check if "Upload signed agreements to Dropbox" task is Complete
            // Task format: task_[sellerId]_[index]
            const uploadAgreementsTask = Object.entries(tasks).find(
              ([taskId, status]) => {
                return (
                  taskId.includes("Upload signed agreements") ||
                  (taskId === `task_${seller.id}_5` && status === "Complete") // Based on task index
                );
              }
            );
            
            agreements[seller.id] = uploadAgreementsTask ? uploadAgreementsTask[1] === "Complete" : false;
          }
        } catch (error) {
          console.error(`Error fetching tasks for seller ${seller.id}:`, error);
          agreements[seller.id] = false;
        }
      }
      
      setGoLiveDates(dates);
      setAgreementsStatuses(agreements);
    };
    
    loadData();
  }, [sellers]);

  // Infer status based on agreements upload > go-live date
  const getSellerStatus = (seller: Seller): string => {
    // Priority 1: Check if Upload signed agreements task is Complete
    if (agreementsStatuses[seller.id]) {
      return "Active Listing";
    }
    
    // Priority 2: Check if go-live date has passed
    const goLiveDate = goLiveDates[seller.id];
    if (goLiveDate) {
      const today = new Date();
      const gld = new Date(goLiveDate);
      if (gld <= today) {
        return "Active Listing";
      }
    }
    
    return "Pre-Listing";
  };

  // Count sellers by status - show what's actually displayed in cards
  const activeListing = sellers.filter(
    (s) => getSellerStatus(s) === "Active Listing"
  ).length;
  const preListing = sellers.filter(
    (s) => getSellerStatus(s) === "Pre-Listing"
  ).length;
  const pendingClose = 0; // Not implemented yet

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">
            Sellers
          </h1>
          <p className="text-primary-300 text-sm sm:text-base">
            Pre-listing, Listing, Post-listing, and Post-close management
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition whitespace-nowrap">
          <Plus size={20} />
          Add Seller
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatBox label="Total Sellers" value={sellers.length} />
        <StatBox label="Pre-Listing" value={preListing} />
        <StatBox label="Active Listing" value={activeListing} />
        <StatBox label="Pending Close" value={0} />
      </div>

      {/* Sellers Grid */}
      {sellers.length === 0 ? (
        <div className="bg-primary-800 border border-primary-700 rounded-lg p-8 text-center">
          <AlertCircle size={32} className="mx-auto mb-4 text-primary-400" />
          <p className="text-primary-300 mb-4">No active sellers yet</p>
          <p className="text-primary-400 text-sm">
            Sellers from Follow Up Boss (Active Client + seller tag) will appear
            here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sellers.map((seller) => (
            <SellerTaskCard key={seller.id} seller={seller} />
          ))}
        </div>
      )}
    </div>
  );
}

interface SellerCardProps {
  seller: Seller;
}

interface SellerChecklist {
  marketAnalysis: boolean;
  pricingConsultation: boolean;
  propertyInspection: boolean;
  photographyScheduled: boolean;
  listingPublished: boolean;
  openHousesScheduled: boolean;
  offersReceived: boolean;
  closingScheduled: boolean;
}

function SellerCard({ seller }: SellerCardProps) {
  const [checklist, setChecklist] = useState<SellerChecklist>({
    marketAnalysis: false,
    pricingConsultation: false,
    propertyInspection: false,
    photographyScheduled: false,
    listingPublished: false,
    openHousesScheduled: false,
    offersReceived: false,
    closingScheduled: false,
  });

  // Load checklist from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`seller_checklist_${seller.id}`);
    if (stored) {
      setChecklist(JSON.parse(stored));
    }
  }, [seller.id]);

  // Save checklist to localStorage whenever it changes
  const handleChecklistChange = (key: keyof typeof checklist) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    localStorage.setItem(`seller_checklist_${seller.id}`, JSON.stringify(updated));
  };

  const getStatusBadgeClasses = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
    switch (status.toLowerCase()) {
      case "active listing":
        return `${baseClasses} bg-green-500/20 text-green-300 border border-green-500/30`;
      case "pre-listing":
        return `${baseClasses} bg-blue-500/20 text-blue-300 border border-blue-500/30`;
      case "pending close":
        return `${baseClasses} bg-purple-500/20 text-purple-300 border border-purple-500/30`;
      default:
        return `${baseClasses} bg-primary-700 text-primary-300 border border-primary-600`;
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary-800/60 to-primary-850/40 border border-primary-700/50 rounded-lg p-6 hover:border-primary-600/50 hover:shadow-lg hover:shadow-primary-950/40 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">{seller.name}</h3>
          <p className="text-primary-400 text-sm mt-1">{seller.address}</p>
        </div>
        <div className="text-right">
          <p className={getStatusBadgeClasses(seller.status)}>
            {seller.status}
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-primary-300">
          <Mail size={16} />
          <a
            href={`mailto:${seller.email}`}
            className="text-primary-200 hover:text-white transition"
          >
            {seller.email}
          </a>
        </div>
        {seller.phone && (
          <div className="flex items-center gap-2 text-primary-300">
            <Phone size={16} />
            <a
              href={`tel:${seller.phone}`}
              className="text-primary-200 hover:text-white transition"
            >
              {seller.phone}
            </a>
          </div>
        )}
      </div>

      {seller.googleDriveFolder && (
        <div className="mb-4">
          <a
            href={seller.googleDriveFolder}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary-300 hover:text-white transition text-sm"
          >
            <ExternalLink size={14} />
            Google Drive Folder
          </a>
        </div>
      )}

      <GoogleDriveDocuments sellerName={seller.name} address={seller.address} />

      {seller.listingPrice && (
        <div className="mt-4 pt-4 border-t border-primary-700">
          <p className="text-green-400 font-semibold text-lg">{seller.listingPrice}</p>
        </div>
      )}

      {seller.lastContact && (
        <div className="mt-2 text-xs text-primary-400">
          Last contact: {seller.lastContact}
        </div>
      )}

      {seller.marketingStrategy && (
        <div className="mt-3 bg-primary-900/40 border border-primary-700/30 rounded px-3 py-2">
          <p className="text-xs text-primary-300 font-semibold mb-1">Marketing Strategy</p>
          <p className="text-sm text-primary-200">{seller.marketingStrategy}</p>
        </div>
      )}

      {seller.notes && (
        <div className="mt-3 bg-primary-900/40 border border-primary-700/30 rounded px-3 py-2">
          <p className="text-xs text-primary-300 font-semibold mb-1">Notes</p>
          <p className="text-sm text-primary-200">{seller.notes}</p>
        </div>
      )}

      {seller.tags && seller.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {seller.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block bg-primary-600/50 text-primary-100 text-xs px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="border-t border-primary-700 pt-4 mt-4">
        <details className="cursor-pointer">
          <summary className="text-primary-300 hover:text-white text-sm font-medium">
            Workflow Checklist →
          </summary>
          <div className="mt-3 space-y-3 text-sm">
            <div>
              <p className="text-primary-400 font-semibold mb-2">Pre-Listing</p>
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-primary-300 cursor-pointer hover:text-white">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4"
                    checked={checklist.marketAnalysis}
                    onChange={() => handleChecklistChange('marketAnalysis')}
                  />
                  Market analysis
                </label>
                <label className="flex items-center gap-2 text-primary-300 cursor-pointer hover:text-white">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4"
                    checked={checklist.pricingConsultation}
                    onChange={() => handleChecklistChange('pricingConsultation')}
                  />
                  Pricing consultation
                </label>
                <label className="flex items-center gap-2 text-primary-300 cursor-pointer hover:text-white">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4"
                    checked={checklist.propertyInspection}
                    onChange={() => handleChecklistChange('propertyInspection')}
                  />
                  Property inspection scheduled
                </label>
              </div>
            </div>

            <div>
              <p className="text-primary-400 font-semibold mb-2">Listing</p>
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-primary-300 cursor-pointer hover:text-white">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4"
                    checked={checklist.photographyScheduled}
                    onChange={() => handleChecklistChange('photographyScheduled')}
                  />
                  Professional photos taken
                </label>
                <label className="flex items-center gap-2 text-primary-300 cursor-pointer hover:text-white">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4"
                    checked={checklist.listingPublished}
                    onChange={() => handleChecklistChange('listingPublished')}
                  />
                  Listing published
                </label>
                <label className="flex items-center gap-2 text-primary-300 cursor-pointer hover:text-white">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4"
                    checked={checklist.openHousesScheduled}
                    onChange={() => handleChecklistChange('openHousesScheduled')}
                  />
                  Open houses scheduled
                </label>
              </div>
            </div>

            <div>
              <p className="text-primary-400 font-semibold mb-2">Closing</p>
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-primary-300 cursor-pointer hover:text-white">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4"
                    checked={checklist.offersReceived}
                    onChange={() => handleChecklistChange('offersReceived')}
                  />
                  Offers received
                </label>
                <label className="flex items-center gap-2 text-primary-300 cursor-pointer hover:text-white">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4"
                    checked={checklist.closingScheduled}
                    onChange={() => handleChecklistChange('closingScheduled')}
                  />
                  Closing scheduled
                </label>
              </div>
            </div>
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
