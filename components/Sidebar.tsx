'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Home, FileText, Users, Settings, Bell, Menu, BookOpen } from 'lucide-react';

interface SidebarProps {
  isDarkMode?: boolean;
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  isCollapsed: boolean;
  className: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isDarkMode = false }) => {
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(false);

  return (
    <div className="p-4 h-screen">
      <div className={`dark:bg-black bg-white transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} h-full rounded-3xl border dark:border-gray-700 border-gray-200 shadow-lg`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b dark:border-gray-700 border-gray-200`}>
          {!isCollapsed && (
            <h2 className={`text-xl font-semibold dark:text-white text-black`}>
              Dashboard
            </h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 rounded-xl dark:hover:bg-gray-800/50 dark:text-gray-300 dark:hover:text-white hover:shadow-md transition-all duration-200`}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <NavItem
            href="/dashboard"
            icon={<Home size={20} />}
            text="Home"
            isCollapsed={isCollapsed}
            className="dark:hover:bg-gray-800/50 dark:text-gray-300 dark:hover:text-white"
          />
          <NavItem
            href="/userinput"
            icon={<Users size={20} />}
            text="AI Setup"
            isCollapsed={isCollapsed}
            className="dark:hover:bg-gray-800/50 dark:text-gray-300 dark:hover:text-white"
          />
          <NavItem
            href="/tutorial"
            icon={<BookOpen size={20} />}
            text="Tutorial"
            isCollapsed={isCollapsed}
            className="dark:hover:bg-gray-800/50 dark:text-gray-300 dark:hover:text-white"
          />
          <NavItem
            href="/notifications"
            icon={<Bell size={20} />}
            text="Notifications"
            isCollapsed={isCollapsed}
            className="dark:hover:bg-gray-800/50 dark:text-gray-300 dark:hover:text-white"
          />
          <NavItem
            href="/settings"
            icon={<Settings size={20} />}
            text="Settings"
            isCollapsed={isCollapsed}
            className="dark:hover:bg-gray-800/50 dark:text-gray-300 dark:hover:text-white"
          />
        </nav>
      </div>
    </div>
  );
};

const NavItem: React.FC<NavItemProps> = ({ href, icon, text, isCollapsed, className }) => {
  return (
    <Link
      href={href}
      className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 hover:shadow-md ${className}`}
    >
      <span className="flex-shrink-0">{icon}</span>
      {!isCollapsed && <span>{text}</span>}
    </Link>
  );
};

export default Sidebar;