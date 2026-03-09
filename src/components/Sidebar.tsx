"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  Users,
  UserCheck,
  CheckSquare,
  BarChart3,
  BookOpen,
  Settings,
  Plus,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = [
    { name: "Overview", href: "/", icon: Home },
    { name: "Key Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Rosie Tasks", href: "/rosie-tasks", icon: BookOpen },
    { name: "Buyers", href: "/buyers", icon: Users },
    { name: "Sellers", href: "/sellers", icon: UserCheck },
    { name: "Task Tracker", href: "/tracker", icon: BarChart3 },
    { name: "Top Picks Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Procedures Hub", href: "/procedures", icon: BookOpen },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed md:hidden top-0 left-0 right-0 bg-primary-800 border-b border-primary-700 h-16 z-50 flex items-center justify-between px-4 pointer-events-auto">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white p-3 -m-3 w-12 h-12 flex items-center justify-center rounded-lg hover:bg-primary-700 active:bg-primary-600 transition pointer-events-auto"
          type="button"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1 className="text-xl font-bold text-white">Erika</h1>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative w-64 bg-primary-800 border-r border-primary-700 flex flex-col h-screen md:h-screen transition-transform duration-300 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      } z-40 md:z-0`}>
      {/* Logo/Header */}
      <div className="p-6 border-b border-primary-700">
        <h1 className="text-2xl font-bold text-white">Erika</h1>
        <p className="text-xs text-primary-300 mt-1">Home Base Dashboard</p>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-primary-700">
        <div className="grid grid-cols-2 gap-2">
          <Link 
            href="/tasks"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-1 bg-primary-600 hover:bg-primary-500 text-white px-3 py-2 rounded text-sm font-medium transition"
          >
            <Plus size={16} />
            Task
          </Link>
          <Link 
            href="/buyers"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-1 bg-primary-600 hover:bg-primary-500 text-white px-3 py-2 rounded text-sm font-medium transition"
          >
            <Plus size={16} />
            Buyer
          </Link>
          <Link 
            href="/sellers"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-1 bg-primary-600 hover:bg-primary-500 text-white px-3 py-2 rounded text-sm font-medium transition"
          >
            <Plus size={16} />
            Seller
          </Link>
          <a 
            href="https://calendar.google.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-1 bg-primary-600 hover:bg-primary-500 text-white px-3 py-2 rounded text-sm font-medium transition"
          >
            📅 Calendar
          </a>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition ${
                active
                  ? "bg-primary-600 text-white"
                  : "text-primary-200 hover:bg-primary-700 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-primary-700">
        <button className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-sm font-medium text-primary-200 hover:bg-primary-700 hover:text-white transition">
          <Settings size={18} />
          Settings
        </button>
      </div>
    </aside>
    </>
  );
}
