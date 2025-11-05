"use client";
import React from "react";
import { StarIcon, MessageSquareIcon } from "lucide-react";
import { InfiniteMovingCards } from "./reactbits/InfiniteMovingCards";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

export function Community() {
  const reviews = [
    {
      name: "Priya Sharma",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
      rating: 5,
      text: "This app helped me discover so many hidden gems in Coimbatore! I found the best filter coffee shop that I never knew existed despite living here for years.",
    },
    {
      name: "Karthik Rajan",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
      rating: 5,
      text: "The weekend guides are fantastic! I took my family to the craft festival recommended by the app and we had an amazing time exploring local artisans.",
    },
    {
      name: "Meena Krishnan",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
      rating: 4,
      text: "As someone new to Coimbatore, this app has been invaluable in helping me discover authentic local experiences and connect with the community.",
    },
  ];

  return (
    <section id="community" className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Infinite Moving Cards */}
        <div className="mb-10">
          <InfiniteMovingCards
            items={reviews.map((r) => ({
              name: r.name,
              avatar: r.avatar,
              rating: r.rating,
              text: r.text,
            }))}
            speedSeconds={40}
            pauseOnHover
          />
        </div>

        <div className="flex flex-col lg:flex-row items-center">
          {/* Reviews List */}
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-6">
              Get Trusted Recommendations From Fellow Locals
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Connect with Coimbatore's community, read authentic reviews from
              people who know the city best, and share your own favorite
              discoveries.
            </p>
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
                >
                  <div className="flex items-center mb-4">
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-50">
                        {review.name}
                      </h4>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "text-amber-500"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                            fill={i < review.rating ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {review.text}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Button
                variant="link"
                className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-500 p-0 h-auto"
              >
                <MessageSquareIcon className="h-5 w-5 mr-2" />
                Share Your Experience
              </Button>
            </div>
          </div>

          {/* Review Form */}
          <div className="lg:w-1/2 lg:pl-16">
            <div className="relative">
              <div className="bg-amber-100 dark:bg-amber-200 absolute -top-6 -right-6 w-64 h-64 rounded-full -z-10"></div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg z-10 relative">
                <div className="flex items-center mb-6">
                  <div className="bg-amber-100 dark:bg-amber-200 rounded-full p-3 mr-4">
                    <StarIcon className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                    Rate & Review
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Place Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Where did you visit?"
                      className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Your Rating
                    </label>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className="h-8 w-8 text-gray-300 dark:text-gray-600 cursor-pointer hover:text-amber-500 transition"
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Your Review
                    </label>
                    <Textarea
                      placeholder="Share your experience..."
                      rows={4}
                      className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50"
                    />
                  </div>
                  <Button className="w-full bg-amber-600 dark:bg-amber-500 hover:bg-amber-700 dark:hover:bg-amber-400 text-white">
                    Submit Review
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
