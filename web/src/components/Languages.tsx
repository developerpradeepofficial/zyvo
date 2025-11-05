"use client";

import React from "react";
import { GlobeIcon } from "lucide-react";

export function Languages() {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center">
          {/* Text Section */}
          <div className="lg:w-1/2 mb-10 lg:mb-0 lg:pr-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-6">
              Experience Coimbatore In Your Language
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Our app supports both English and Tamil, making it accessible to
              everyone. Switch languages anytime with just a tap.
            </p>

            <div className="flex space-x-6">
              <LanguageOption
                icon={<GlobeIcon className="h-6 w-6 text-amber-600" />}
                label="English"
              />
              <LanguageOption
                icon={
                  <span className="h-6 w-6 text-amber-600 flex items-center justify-center font-medium">
                    தமிழ்
                  </span>
                }
                label="தமிழ்"
              />
            </div>

            <div className="mt-10">
              <button className="px-8 py-3 rounded-full bg-amber-600 text-white font-medium hover:bg-amber-700 transition">
                Download Now
              </button>
            </div>
          </div>

          {/* App Preview Section */}
          <div className="lg:w-1/2 flex justify-center">
            <div className="relative w-full max-w-sm">
              <div className="absolute -top-4 -left-4 w-64 h-64 bg-amber-200 dark:bg-amber-700 rounded-full -z-10 opacity-50"></div>
              <div className="relative z-10">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border-8 border-white dark:border-gray-800">
                  <div className="p-4 bg-amber-600 text-white flex items-center justify-between">
                    <div className="flex items-center">
                      <MapPinIcon className="h-5 w-5 mr-2" />
                      <span className="font-medium">ZyVo</span>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <div className="w-2 h-2 bg-white rounded-full opacity-60"></div>
                      <div className="w-2 h-2 bg-white rounded-full opacity-60"></div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-50 mb-1">
                        Language / மொழி
                      </h4>
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm">
                          English
                        </button>
                        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm">
                          தமிழ்
                        </button>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-50 mb-2">
                        Popular in Coimbatore
                      </h4>
                      <div className="space-y-3">
                        <LocationCard
                          name="Annapoorna Restaurant"
                          image="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
                          rating={4.8}
                          type="South Indian"
                        />
                        <LocationCard
                          name="PSG Silks"
                          image="https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
                          rating={4.6}
                          type="Traditional Textiles"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Helper Components
interface LanguageOptionProps {
  icon: React.ReactNode;
  label: string;
}
function LanguageOption({ icon, label }: LanguageOptionProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-amber-100 dark:bg-amber-200 rounded-full p-4 mb-3">
        {icon}
      </div>
      <span className="font-medium text-gray-900 dark:text-gray-50">
        {label}
      </span>
    </div>
  );
}

interface LocationCardProps {
  name: string;
  image: string;
  rating: number;
  type: string;
}
function LocationCard({ name, image, rating, type }: LocationCardProps) {
  return (
    <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <img
        src={image}
        alt={name}
        className="w-12 h-12 rounded object-cover mr-3"
      />
      <div>
        <h5 className="font-medium text-gray-900 dark:text-gray-50">{name}</h5>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-300">
          <StarIcon
            className="h-3 w-3 text-amber-500 mr-1"
            fill="currentColor"
          />
          <span>{rating}</span>
          <span className="mx-1">•</span>
          <span>{type}</span>
        </div>
      </div>
    </div>
  );
}

// Icons
function MapPinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
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
  );
}

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="currentColor"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      ></path>
    </svg>
  );
}
