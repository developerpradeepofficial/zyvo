"use client";
import React from "react";
import { CalendarIcon, MapIcon, TicketIcon } from "lucide-react";
import { motion } from "framer-motion";

export function Weekend() {
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
  };

  return (
    <section id="weekend" className="py-16 bg-amber-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">
            Plan Your Perfect Weekend
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover curated guides, local events, and exclusive deals to make
            the most of your weekends in Coimbatore.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              img: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
              badge: "This Weekend",
              badgeColor: "bg-amber-600",
              icon: <CalendarIcon className="h-4 w-4 text-amber-600" />,
              info: "June 24-25, 2023",
              title: "Kovai Cultural Festival",
              desc: "Experience traditional dance, music, and art at this vibrant cultural celebration.",
            },
            {
              img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
              badge: "Nature Escape",
              badgeColor: "bg-green-600",
              icon: <MapIcon className="h-4 w-4 text-amber-600" />,
              info: "30 min from city center",
              title: "Western Ghats Trek",
              desc: "Explore the breathtaking landscapes and waterfalls just outside the city.",
            },
            {
              img: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
              badge: "Limited Time",
              badgeColor: "bg-red-600",
              icon: <TicketIcon className="h-4 w-4 text-amber-600" />,
              info: "20% off with app",
              title: "Taste of Kovai Food Fest",
              desc: "Sample delicious local cuisine from top restaurants and street food vendors.",
            },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition"
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <div className="relative h-48">
                <img
                  src={card.img}
                  alt={card.title}
                  className="w-full h-full object-cover"
                />
                <div
                  className={`${card.badgeColor} text-white px-3 py-1 rounded-full text-sm font-medium absolute top-4 left-4`}
                >
                  {card.badge}
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-2">
                  {card.icon}
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    {card.info}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {card.desc}
                </p>
                <motion.button
                  className="text-amber-600 dark:text-amber-400 font-medium hover:text-amber-700 dark:hover:text-amber-500 transition flex items-center"
                  whileHover={{ x: 5 }}
                >
                  View Details
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.button
            className="px-8 py-3 rounded-full bg-amber-600 dark:bg-amber-500 text-white font-medium hover:bg-amber-700 dark:hover:bg-amber-400 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore All Weekend Activities
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
