"use client";
import React from "react";
import { ShoppingBagIcon, UtensilsIcon, CoffeeIcon } from "lucide-react";
import { motion } from "framer-motion";

export function Discover() {
  return (
    <section id="discover" className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center">
          {/* Text Section */}
          <motion.div
            className="lg:w-1/2 mb-10 lg:mb-0 lg:pr-10"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-6">
              Browse Nearby Unique Shops & Eateries
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Discover hidden gems around Coimbatore with detailed information
              about menus, specialties, and opening hours. From traditional silk
              sarees to modern cafés, find everything that makes Coimbatore
              special.
            </p>

            <div className="space-y-4">
              {[
                {
                  icon: (
                    <ShoppingBagIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  ),
                  title: "Local Artisan Shops",
                  text: "Find handcrafted goods and unique souvenirs from local artisans.",
                },
                {
                  icon: (
                    <UtensilsIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  ),
                  title: "Authentic Eateries",
                  text: "Explore traditional South Indian cuisine and modern fusion restaurants.",
                },
                {
                  icon: (
                    <CoffeeIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  ),
                  title: "Cozy Cafés",
                  text: "Relax at Coimbatore's most charming coffee shops and bakeries.",
                },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-start"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                >
                  <div className="bg-amber-100 dark:bg-amber-900 rounded-full p-2 mr-4 mt-1">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {feature.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Image Section */}
          <motion.div
            className="lg:w-1/2 relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                {[
                  "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                ].map((src, idx) => (
                  <motion.div
                    key={idx}
                    className="rounded-lg overflow-hidden shadow-md"
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <img
                      src={src}
                      alt="Discover image"
                      className="w-full object-cover h-48 md:h-64"
                    />
                  </motion.div>
                ))}
              </div>
              <div className="space-y-4 mt-6">
                {[
                  "https://images.unsplash.com/photo-1606914501449-5a96b6ce24ca?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                  "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                ].map((src, idx) => (
                  <motion.div
                    key={idx}
                    className="rounded-lg overflow-hidden shadow-md"
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <img
                      src={src}
                      alt="Discover image"
                      className="w-full object-cover h-48 md:h-64"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
