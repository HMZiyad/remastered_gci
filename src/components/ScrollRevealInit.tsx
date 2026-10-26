"use client";

import { useEffect } from "react";

/**
 * Initializes IntersectionObserver for scroll-reveal animations.
 * Elements with class `.gci-reveal` will get class `.revealed` added
 * when they enter the viewport (once per element).
 */
export function ScrollRevealInit() {
  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      // Immediately reveal all elements
      document.querySelectorAll(".gci-reveal").forEach((el) => {
        el.classList.add("revealed");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = el.dataset.revealDelay;
            if (delay) {
              el.style.animationDelay = delay;
            }
            el.classList.add("revealed");
            observer.unobserve(el);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    // Observe all .gci-reveal elements
    const elements = document.querySelectorAll(".gci-reveal");
    elements.forEach((el) => observer.observe(el));

    // MutationObserver to catch dynamically added elements
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.classList.contains("gci-reveal") && !node.classList.contains("revealed")) {
              observer.observe(node);
            }
            node.querySelectorAll?.(".gci-reveal:not(.revealed)")?.forEach((child) => {
              observer.observe(child);
            });
          }
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
