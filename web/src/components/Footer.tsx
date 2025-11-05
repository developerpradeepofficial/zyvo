"use client";

import React from "react";
import {
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
} from "lucide-react";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 dark:bg-gray-800 dark:text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center mb-4">
              <MapPinIcon className="h-8 w-8 text-amber-500" />
              <span className="ml-2 text-xl font-bold text-white dark:text-amber-400">
                ZyVo
              </span>
            </div>
            <p className="mb-4">
              Your hyperlocal lifestyle companion for exploring the best of
              Coimbatore's vibrant local culture.
            </p>
            <div className="flex space-x-4">
              {[FacebookIcon, TwitterIcon, InstagramIcon].map((Icon, idx) => (
                <motion.a
                  key={idx}
                  href="#"
                  whileHover={{ scale: 1.2 }}
                  className="text-gray-400 hover:text-white transition"
                >
                  <Icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                ["Home", "#"],
                ["Features", "#features"],
                ["Discover", "#discover"],
                ["Weekend Plans", "#weekend"],
                ["Community", "#community"],
              ].map(([label, href], idx) => (
                <motion.li
                  key={idx}
                  whileHover={{ x: 4 }}
                  className="transition"
                >
                  <a href={href} className="hover:text-amber-500 transition">
                    {label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2">
              {[
                "Help Center",
                "Privacy Policy",
                "Terms of Service",
                "FAQ",
                "Contact Us",
              ].map((item, idx) => (
                <motion.li
                  key={idx}
                  whileHover={{ x: 4 }}
                  className="transition"
                >
                  <a href="#" className="hover:text-amber-500 transition">
                    {item}
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
                <span>100 RS Puram, Coimbatore, Tamil Nadu 641002, India</span>
              </li>
              <li className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-amber-500 mr-3" />
                <span>+91 422 123 4567</span>
              </li>
              <li className="flex items-center">
                <MailIcon className="h-5 w-5 text-amber-500 mr-3" />
                <span>info@ZyVo.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; 2023 ZyVo. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-4">
            {["Privacy Policy", "Terms of Service", "Cookies Policy"].map(
              (item, idx) => (
                <motion.a
                  key={idx}
                  href="#"
                  whileHover={{ x: 4 }}
                  className="text-gray-400 hover:text-amber-500 transition"
                >
                  {item}
                </motion.a>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
