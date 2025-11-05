"use client";

import * as React from "react";
import { Card } from "../ui/card";
import { cn } from "../../lib/utils";
import { StarIcon } from "lucide-react";

export type MovingCardItem = {
  name?: string;
  text: string;
  avatar?: string;
  rating: number;
};

export interface InfiniteMovingCardsProps {
  items: MovingCardItem[];
  direction?: "left" | "right";
  speedSeconds?: number; // total time for one full cycle
  pauseOnHover?: boolean;
  className?: string;
  cardClassName?: string;
}

export function InfiniteMovingCards({
  items,
  direction = "left",
  speedSeconds = 30,
  pauseOnHover = true,
  className,
  cardClassName,
}: InfiniteMovingCardsProps) {
  const [paused, setPaused] = React.useState(false);

  // duplicate items for seamless scrolling
  const duplicated = React.useMemo(() => [...items, ...items], [items]);

  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
    >
      {/* Edge gradients */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white/90 to-transparent dark:from-background/90" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white/90 to-transparent dark:from-background/90" />

      <div
        className="flex w-max items-stretch gap-4 will-change-transform"
        style={{
          animation: `${
            direction === "right" ? "marquee-right" : "marquee-left"
          } ${speedSeconds}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {duplicated.map((item, idx) => (
          <Card
            key={idx}
            className={cn(
              "min-w-[280px] max-w-[320px] p-5 bg-white/95 dark:bg-card",
              "border border-border/60 shadow-sm hover:shadow-md transition-shadow",
              cardClassName
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              {item.avatar ? (
                <img
                  src={item.avatar}
                  alt={item.name || "avatar"}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-muted dark:bg-gray-700" />
              )}
              <div className="min-w-0">
                {item.name && (
                  <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {item.name}
                  </div>
                )}
                {typeof item.rating === "number" && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < item.rating
                            ? "text-amber-500"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                        fill={i < item.rating ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {item.text}
            </p>
          </Card>
        ))}
      </div>

      {/* CSS keyframes */}
      <style jsx global>{`
        @keyframes marquee-left {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes marquee-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0%);
          }
        }
      `}</style>
    </div>
  );
}
