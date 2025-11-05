import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XIcon } from "lucide-react";
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 0.5,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.3,
            }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{
              x: "100%",
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: "100%",
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg z-50 overflow-y-auto"
          >
            <div className="p-5">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                  <svg
                    className="h-6 w-6 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                  </svg>
                  <span className="ml-2 text-lg font-bold text-gray-800">
                    ZyVo
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              <nav className="space-y-4">
                <a
                  href="#features"
                  onClick={onClose}
                  className="block py-2 px-4 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition duration-200"
                >
                  Features
                </a>
                <a
                  href="#discover"
                  onClick={onClose}
                  className="block py-2 px-4 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition duration-200"
                >
                  Discover
                </a>
                <a
                  href="#weekend"
                  onClick={onClose}
                  className="block py-2 px-4 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition duration-200"
                >
                  Weekend Plans
                </a>
                <a
                  href="#community"
                  onClick={onClose}
                  className="block py-2 px-4 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition duration-200"
                >
                  Community
                </a>
              </nav>
              <div className="mt-8 pt-8 border-t border-gray-200">
                <button className="w-full py-3 rounded-full bg-amber-600 text-white font-medium hover:bg-amber-700 transition">
                  Download App
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
