"use client";

import React, { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  PlusCircleIcon, 
  HeartIcon, 
  UserCircleIcon, 
  MoonIcon, 
  SunIcon,
  ChatBubbleLeftIcon 
} from '@heroicons/react/24/outline';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase-init";
import PageTransition from "@/components/PageTransition";
import { AuthProvider, useAuth } from "@/lib/AuthContext";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const publicRoutes = ['/auth/login', '/auth/register'];

interface RootLayoutProps {
  children: React.ReactNode;
}

function RootLayoutContent({ children }: RootLayoutProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    // Redirect to login if not authenticated and trying to access protected route
    if (!user && !publicRoutes.includes(pathname)) {
      router.push('/auth/login');
      return;
    }

    // If authenticated and trying to access auth pages, redirect to home
    if (user && publicRoutes.includes(pathname)) {
      router.push('/');
      return;
    }
  }, [user, pathname]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to unread notifications
    const notificationsRef = collection(db, "notifications");
    const notificationsQuery = query(
      notificationsRef,
      where("userId", "==", user.uid),
      where("read", "==", false)
    );

    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      setUnreadNotifications(snapshot.size);
    });

    // Subscribe to unread messages
    const chatsRef = collection(db, "chats");
    const chatsQuery = query(
      chatsRef,
      where("participants", "array-contains", user.uid)
    );

    const unsubscribeMessages = onSnapshot(chatsQuery, (snapshot) => {
      let totalUnread = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.unreadCount && data.lastMessageSender !== user.uid) {
          totalUnread += data.unreadCount;
        }
      });
      setUnreadMessages(totalUnread);
    });

    return () => {
      unsubscribeNotifications();
      unsubscribeMessages();
    };
  }, [user]);

  useEffect(() => {
    // Load dark mode preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(savedTheme === 'dark' || (!savedTheme && prefersDark));
  }, []);

  useEffect(() => {
    // Update dark mode class and save preference
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Don't show navigation for auth pages
  const showNavigation = !publicRoutes.includes(pathname);

  const TopNavbar = () => (
    <header className="border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-3xl font-extrabold tracking-wide cursor-pointer select-none dark:text-white">
          Unio
        </Link>
        <div className="hidden sm:flex flex-1 mx-4 max-w-xs">
          <input
            type="text"
            placeholder="Pesquisar"
            className="w-full px-3 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
          />
        </div>
        <nav className="flex items-center space-x-6">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
            <HomeIcon className="h-6 w-6" />
          </Link>
          <Link href="/search" className="hover:text-blue-600 dark:hover:text-blue-400">
            <MagnifyingGlassIcon className="h-6 w-6" />
          </Link>
          <Link href="/create" className="hover:text-blue-600 dark:hover:text-blue-400">
            <PlusCircleIcon className="h-6 w-6" />
          </Link>
          <Link href="/notifications" className="relative hover:text-blue-600 dark:hover:text-blue-400">
            <HeartIcon className="h-6 w-6" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </Link>
          <Link href="/chat" className="relative hover:text-blue-600 dark:hover:text-blue-400">
            <ChatBubbleLeftIcon className="h-6 w-6" />
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {unreadMessages}
              </span>
            )}
          </Link>
          <Link href="/profile" className="hover:text-blue-600 dark:hover:text-blue-400">
            <UserCircleIcon className="h-6 w-6" />
          </Link>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {darkMode ? (
              <SunIcon className="h-6 w-6" />
            ) : (
              <MoonIcon className="h-6 w-6" />
            )}
          </button>
        </nav>
      </div>
    </header>
  );

  const BottomNavbar = () => (
    <footer className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700 z-50">
      <nav className="flex justify-around p-2">
        <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
          <HomeIcon className="h-6 w-6" />
        </Link>
        <Link href="/search" className="hover:text-blue-600 dark:hover:text-blue-400">
          <MagnifyingGlassIcon className="h-6 w-6" />
        </Link>
        <Link href="/create" className="hover:text-blue-600 dark:hover:text-blue-400">
          <PlusCircleIcon className="h-6 w-6" />
        </Link>
        <Link href="/notifications" className="relative hover:text-blue-600 dark:hover:text-blue-400">
          <HeartIcon className="h-6 w-6" />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {unreadNotifications}
            </span>
          )}
        </Link>
        <Link href="/profile" className="hover:text-blue-600 dark:hover:text-blue-400">
          <UserCircleIcon className="h-6 w-6" />
        </Link>
      </nav>
    </footer>
  );

  return (
    <html lang="pt-BR" className={darkMode ? 'dark' : ''}>
      <body className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen flex flex-col transition-colors duration-200`}>
        {showNavigation && <TopNavbar />}
        <main className={`flex-grow max-w-6xl mx-auto ${showNavigation ? 'p-4 pb-16 sm:pb-4' : ''}`}>
          <PageTransition>
            {children}
          </PageTransition>
        </main>
        {showNavigation && <BottomNavbar />}
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-full shadow-lg ${
              darkMode 
                ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
          >
            {darkMode ? (
              <SunIcon className="h-6 w-6" />
            ) : (
              <MoonIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </body>
    </html>
  );
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <AuthProvider>
      <RootLayoutContent>{children}</RootLayoutContent>
    </AuthProvider>
  );
}
