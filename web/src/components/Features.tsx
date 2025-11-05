"use client";
import React from "react";
import {
  MapPinIcon,
  UtensilsIcon,
  CalendarIcon,
  StarIcon,
  HeartIcon,
  GlobeIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

export function Features() {
  const features = [
    {
      icon: (
        <MapPinIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
      ),
      title: "Map-Based Discovery",
      description:
        "Easily find nearby shops, eateries, and events with our intuitive map interface.",
    },
    {
      icon: (
        <UtensilsIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
      ),
      title: "Local Dining",
      description:
        "Discover budget-friendly dining options with detailed menus and specialties.",
    },
    {
      icon: (
        <CalendarIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
      ),
      title: "Weekend Guides",
      description:
        "Plan your perfect weekend with curated guides and exclusive local deals.",
    },
    {
      icon: <StarIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
      title: "Community Reviews",
      description:
        "Get trusted recommendations from fellow locals and share your favorites.",
    },
    {
      icon: (
        <HeartIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
      ),
      title: "Support Local",
      description:
        "Book directly through the app to support Coimbatore's small businesses.",
    },
    {
      icon: (
        <GlobeIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
      ),
      title: "Bilingual Support",
      description:
        "Experience Coimbatore in your language — English and Tamil supported.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <section id="features" className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">
            All You Need To Explore Coimbatore
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Our app brings the best of Coimbatore to your fingertips with these
            amazing features.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <Card className="p-6 rounded-xl shadow-sm hover:shadow-md transition bg-white dark:bg-gray-800">
                <div className="bg-amber-100 dark:bg-amber-900 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                    {feature.title}
                  </h3>
                  <Badge variant="secondary">
                    {/* Badge also can be themed */}Feature
                  </Badge>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
