import React from "react";
import { StoreIcon, ShoppingBagIcon, CreditCardIcon } from "lucide-react";

export function Support() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">
            Support Small Businesses
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover and book directly through the app to support Coimbatore's
            vibrant local economy.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <StoreIcon className="h-8 w-8 text-amber-600" />,
              title: "Discover Local Businesses",
              text: "Find authentic local shops and services that make Coimbatore unique, from traditional textile shops to modern boutiques.",
            },
            {
              icon: <ShoppingBagIcon className="h-8 w-8 text-amber-600" />,
              title: "Book Services Directly",
              text: "Reserve tables, book appointments, and purchase products directly through the app with no middleman fees.",
            },
            {
              icon: <CreditCardIcon className="h-8 w-8 text-amber-600" />,
              title: "Exclusive Local Deals",
              text: "Get access to app-only promotions and discounts from participating local businesses across Coimbatore.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm flex flex-col items-center text-center"
            >
              <div className="bg-amber-100 dark:bg-amber-200 rounded-full p-4 mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Testimonial / Highlight Section */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1577975882846-431adc8c2009?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Local business owner in Coimbatore"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <div className="flex items-center mb-4">
                <div className="bg-amber-100 dark:bg-amber-200 rounded-full w-10 h-10 flex items-center justify-center mr-4">
                  <span className="text-amber-600 font-bold">KS</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-50">
                    Kavitha Sundaram
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Owner, Kovai Handlooms
                  </p>
                </div>
              </div>
              <blockquote className="text-gray-600 dark:text-gray-300 italic mb-6">
                "This app has brought so many new customers to my small handloom
                shop. The direct booking feature has helped me connect with
                tourists and locals alike who are interested in traditional
                Coimbatore textiles."
              </blockquote>
              <div className="flex items-center">
                <span className="text-amber-600 font-medium mr-2">
                  Visit Kovai Handlooms
                </span>
                <svg
                  className="w-4 h-4 text-amber-600"
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
                  ></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
