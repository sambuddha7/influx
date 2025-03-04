'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Home, FileText, Users, Settings, Archive, Menu, BookOpen, LogOut, ChartNoAxesCombined, ArrowUpRight} from 'lucide-react';

import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
interface SidebarProps {
  isDarkMode?: boolean;
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  isCollapsed: boolean;
  className: string;
  onClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isDarkMode = false }) => {
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      document.cookie = 'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <div className="sticky p-4 h-screen top-0">
      <div className={`dark:bg-black bg-white transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} h-full rounded-3xl border dark:border-gray-700 border-gray-200 shadow-lg flex flex-col`}>
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
        <nav className="p-4 space-y-2 flex-grow">
        <NavItem
            href="/community"
            icon={<Users size={20} />}
            text="Community"
            isCollapsed={isCollapsed}
            className="dark:hover:bg-gray-800/50 dark:text-gray-300 dark:hover:text-white"
          />
          <NavItem
            href="/dashboard"
            icon={<ArrowUpRight size={20} />}
            text="Leads"
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
            href="/roi"
            icon={<ChartNoAxesCombined size={20} />}
            text="Analytics"
            isCollapsed={isCollapsed}
            className="dark:hover:bg-gray-800/50 dark:text-gray-300 dark:hover:text-white"
          />
          {/* <NavItem
            href="/tutorial"
            icon={<BookOpen size={20} />}
            text="Tutorial"
            isCollapsed={isCollapsed}
            className="dark:hover:bg-gray-800/50 dark:text-gray-300 dark:hover:text-white"
          /> */}
          <NavItem
            href="/archive"
            icon={<Archive size={20} />}
            text="Archive"
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
          <NavItem
            href="#"
            icon={<LogOut size={20} />}
            text="Logout"
            isCollapsed={isCollapsed}
            className="dark:hover:bg-gray-800/50 dark:text-gray-300 dark:hover:text-white hover:text-red-500 dark:hover:text-red-400"
            onClick={handleLogout}
          />
        </nav>
      </div>
    </div>
  );
};

const NavItem: React.FC<NavItemProps> = ({ href, icon, text, isCollapsed, className, onClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Link
      href={href}
      className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 hover:shadow-md ${className}`}
      onClick={handleClick}
    >
      <span className="flex-shrink-0">{icon}</span>
      {!isCollapsed && <span>{text}</span>}
    </Link>
  );
};

export default Sidebar;