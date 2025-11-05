"use client";
import React, { useState, useEffect } from "react";
import { MapPinIcon, SearchIcon, MenuIcon, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else if (storedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDark(prefersDark);
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <div className="relative w-full bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800 h-[75vh] ">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <nav className="flex items-center justify-between py-6">
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <MapPinIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            <span className="ml-2 text-xl font-bold text-gray-800 dark:text-gray-100">
              ZyVo
            </span>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-700 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400"
            >
              Features
            </a>
            <a
              href="#discover"
              className="text-gray-700 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400"
            >
              Discover
            </a>
            <a
              href="#weekend"
              className="text-gray-700 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400"
            >
              Weekend Plans
            </a>
            <a
              href="#community"
              className="text-gray-700 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400"
            >
              Community
            </a>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsDark(!isDark)}
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
            </Button>

            <Button
              asChild
              rounded="full"
              className="hidden md:block bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Download App
              </motion.button>
            </Button>

            <button
              className="md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <MenuIcon className="h-6 w-6 text-gray-800 dark:text-gray-200" />
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="py-16 md:py-24 flex flex-col md:flex-row items-center">
          <motion.div
            className="md:w-1/2 mb-10 md:mb-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-50 leading-tight">
              Discover Coimbatore Like Never Before
            </h1>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-lg">
              Your hyperlocal lifestyle companion that helps you explore the
              best of Coimbatore's vibrant local shops, eateries, cultural
              events, and weekend experiences — all in one place.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                asChild
                rounded="full"
                className="px-8 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              </Button>
              <Button
                asChild
                rounded="full"
                variant="outline"
                className="px-8 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </motion.button>
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="md:w-1/2 relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="relative z-10 rounded-2xl shadow-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1596422846543-75c6fc197f07?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                alt="Coimbatore city view with app interface"
                className="w-full h-auto"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-amber-200 rounded-full -z-10 dark:bg-amber-500"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-amber-100 rounded-full -z-10 dark:bg-amber-400"></div>
          </motion.div>
        </div>

        {/* Search Bar */}
        <motion.div
          className="relative -mt-8 mb-16 mx-auto max-w-3xl px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 flex items-center">
            <div className="flex-grow flex items-center px-4">
              <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-300 mr-3" />
              <Input
                type="text"
                placeholder="Search for shops, restaurants, events..."
                className="w-full h-12 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-700 dark:text-gray-200 bg-transparent"
              />
            </div>
            <Button
              asChild
              className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 px-6 rounded-lg"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Search
              </motion.button>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Sidebar for mobile */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </div>
  );
}
