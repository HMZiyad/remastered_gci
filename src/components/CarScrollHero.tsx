"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";

export interface CarBrandItem {
  name: string;
  logo: string;
  country: string;
  tagline: string;
  popularModels: string;
}

export interface CommitmentItem {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface CarScrollHeroProps {
  /** Total number of frames extracted (defaults to 481) */
  totalFrames?: number;
  /** Public folder path containing frames */
  frameFolder?: string;
  /** Frame filename prefix */
  framePrefix?: string;
  /** Frame image extension ('jpg' or 'webp') */
  frameExtension?: "jpg" | "webp" | string;
  /** Number of digits for zero-padding (e.g. 4 for frame_0001) */
  digits?: number;
  /** Background color matching assets exactly */
  backgroundColor?: string;
  /** Scroll distance for Act 1 drift phase */
  act1Distance?: string;
  /** Scroll distance for Act 2 horizontal carousel phase */
  act2Distance?: string;
  /** Scroll distance for Act 3 exploded phase */
  act3Distance?: string;
  /** Damping momentum factor for canvas scrub & carousel glide */
  dampingFactor?: number;
  /** Primary CTA target */
  ctaInventoryHref?: string;
  /** Secondary CTA target */
  ctaContactHref?: string;
  /** Tertiary CTA target */
  ctaPreOrderHref?: string;
}

const CAR_BRANDS: CarBrandItem[] = [
  {
    name: "Toyota",
    logo: "/car_brand_logo/toyota-logo.png",
    country: "Japan",
    tagline: "Hybrid Benchmark & Resale King",
    popularModels: "Prado • Land Cruiser • Harrier • Premio",
  },
  {
    name: "Lexus",
    logo: "/car_brand_logo/lexus-logo.png",
    country: "Japan",
    tagline: "Bespoke Luxury & Executive Craft",
    popularModels: "LX600 • RX500h • NX350h • ES300h",
  },
  {
    name: "BMW",
    logo: "/car_brand_logo/bmw-logo.png",
    country: "Germany",
    tagline: "The Ultimate Driving Machine",
    popularModels: "5-Series • X5 • 3-Series • X7",
  },
  {
    name: "Honda",
    logo: "/car_brand_logo/honda-logo.png",
    country: "Japan",
    tagline: "VTEC Precision & Earth Dreams",
    popularModels: "Civic • Vezel e:HEV • CR-V • Accord",
  },
  {
    name: "Hyundai",
    logo: "/car_brand_logo/hyundai-logo.png",
    country: "South Korea",
    tagline: "Futuristic Design & EV Platforms",
    popularModels: "Tucson • Santa Fe • Ioniq 5 • Palisade",
  },
  {
    name: "Jaguar",
    logo: "/car_brand_logo/jaguar-logo.png",
    country: "UK",
    tagline: "Grace, Pace & British Distinction",
    popularModels: "F-Pace • XF • E-Pace • I-Pace",
  },
  {
    name: "Mitsubishi",
    logo: "/car_brand_logo/mitsubishi-logo.png",
    country: "Japan",
    tagline: "Rally-Bred Super All-Wheel Control",
    popularModels: "Pajero • Outlander PHEV • Eclipse Cross",
  },
  {
    name: "Renault",
    logo: "/car_brand_logo/renault-logo.png",
    country: "France",
    tagline: "Continental Comfort & Efficiency",
    popularModels: "Koleos • Megane • Arkana",
  },
  {
    name: "Tesla",
    logo: "/car_brand_logo/tesla-logo.png",
    country: "USA",
    tagline: "Autonomous EV Intelligence",
    popularModels: "Model 3 • Model Y • Model X • Model S",
  },
  {
    name: "Fiat",
    logo: "/car_brand_logo/fiat-logo.png",
    country: "Italy",
    tagline: "Iconic Urban European Character",
    popularModels: "Fiat 500 • 500X • Tipo",
  },
];

const COMMITMENTS: CommitmentItem[] = [
  {
    icon: "verified",
    title: "100% Verified Auction Sheets",
    subtitle: "USS • TAA • CAA • JU Certified",
    description: "Direct inspection reports translated from Japanese auction houses. Guaranteed zero odometer tampering.",
  },
  {
    icon: "account_balance",
    title: "Bank Loan Assistance",
    subtitle: "Up to 70–80% Financing",
    description: "Full partnership with premier local banks in Bangladesh for fast-track auto financing approval with minimal paperwork.",
  },
  {
    icon: "assignment",
    title: "Comprehensive BRTA Support",
    subtitle: "Hassle-Free Formalities",
    description: "We manage all bureaucratic paperwork: registration number, fitness certificates, tax tokens, and official smart cards.",
  },
  {
    icon: "local_shipping",
    title: "Port-to-Door Delivery",
    subtitle: "Chittagong Port to Dhaka",
    description: "Insured customs clearance at Chittagong port and dedicated covered carrier delivery straight to your driveway in Dhaka.",
  },
];

export interface PreOrderProcessStep {
  step: string;
  pill: string;
  title: string;
  desc: string;
  start: number;
  end: number;
}

const PRE_ORDER_PROCESS_STEPS: PreOrderProcessStep[] = [
  {
    step: "01",
    pill: "Our Seamless Pre-Order Process // Step 01",
    title: "Choose Car",
    desc: "Select from over 150,000 live Japanese auction listings weekly with verified translation reports.",
    start: 0.02,
    end: 0.18,
  },
  {
    step: "02",
    pill: "Our Seamless Pre-Order Process // Step 02",
    title: "Auction/Bidding",
    desc: "We secure your car at genuine wholesale auction prices on USS, TAA, CAA and JU auction halls.",
    start: 0.19,
    end: 0.35,
  },
  {
    step: "03",
    pill: "Our Seamless Pre-Order Process // Step 03",
    title: "Shipping",
    desc: "Full maritime insurance with end-to-end containerized vessel tracking straight to Chittagong port.",
    start: 0.36,
    end: 0.52,
  },
  {
    step: "04",
    pill: "Our Seamless Pre-Order Process // Step 04",
    title: "Delivery",
    desc: "Fast-track customs clearance, BRTA smart card registration, and covered carrier delivery to Dhaka.",
    start: 0.53,
    end: 0.69,
  },
];

export function CarScrollHero({
  totalFrames = 481,
  frameFolder = "/frames",
  framePrefix = "frame_",
  frameExtension = "jpg",
  digits = 4,
  backgroundColor = "#ea081c",
  act1Distance = "200vh",
  act2Distance = "250vh",
  act3Distance = "320vh",
  dampingFactor = 0.09,
  ctaInventoryHref = "/inventory",
  ctaContactHref = "/contact",
  ctaPreOrderHref = "/pre-order",
}: CarScrollHeroProps) {
  // Act 1: Initial Drift Scrub (Frames 1 -> 241)
  const act1ContainerRef = useRef<HTMLDivElement>(null);
  const act1PinnedRef = useRef<HTMLDivElement>(null);
  const act1CanvasRef = useRef<HTMLCanvasElement>(null);

  // Act 2: Horizontal Moving Carousel (No car frame here!)
  const act2ContainerRef = useRef<HTMLDivElement>(null);
  const act2PinnedRef = useRef<HTMLDivElement>(null);
  const act2Rail1Ref = useRef<HTMLDivElement>(null);
  const act2Rail2Ref = useRef<HTMLDivElement>(null);

  // Act 3: Resumed Exploded View Scrub (Frames 242 -> 481)
  const act3ContainerRef = useRef<HTMLDivElement>(null);
  const act3PinnedRef = useRef<HTMLDivElement>(null);
  const act3CanvasRef = useRef<HTMLCanvasElement>(null);

  // Global Image Cache across acts 1 & 3
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const loadedSetRef = useRef<Set<number>>(new Set());

  // Scrub targets & momentum values
  const targetFrameAct1Ref = useRef<number>(0);
  const currentFrameAct1Ref = useRef<number>(0);
  const lastDrawnAct1Ref = useRef<number>(-1);

  const targetAct2ProgressRef = useRef<number>(0);
  const currentAct2ProgressRef = useRef<number>(0);

  const targetFrameAct3Ref = useRef<number>(241);
  const currentFrameAct3Ref = useRef<number>(241);
  const lastDrawnAct3Ref = useRef<number>(-1);

  const rafIdRef = useRef<number | null>(null);

  // UI state
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [isCriticalLoaded, setIsCriticalLoaded] = useState<boolean>(false);
  const [act1Progress, setAct1Progress] = useState<number>(0);
  const [act2Progress, setAct2Progress] = useState<number>(0);
  const [act3Progress, setAct3Progress] = useState<number>(0);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState<number>(1400);

  // Format frame URL (1-indexed)
  const getFrameUrl = useCallback(
    (index: number) => {
      const frameNum = String(index).padStart(digits, "0");
      return `${frameFolder}/${framePrefix}${frameNum}.${frameExtension}`;
    },
    [digits, frameFolder, framePrefix, frameExtension]
  );

  // Canvas drawing with edge-to-edge "cover" mode to eliminate all borders
  const drawImageToCanvas = useCallback(
    (canvas: HTMLCanvasElement | null, img: HTMLImageElement | null): boolean => {
      if (!canvas) return false;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return false;

      const width = canvas.width;
      const height = canvas.height;

      if (width === 0 || height === 0) return false;

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      if (!img || !img.complete || img.naturalWidth === 0) return false;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const canvasAspect = width / height;
      const imgAspect = img.naturalWidth / img.naturalHeight;

      let drawWidth = width;
      let drawHeight = height;
      let offsetX = 0;
      let offsetY = 0;

      // "Cover" behavior with slight over-bleed to eliminate all pillarbox and letterbox borders
      if (canvasAspect > imgAspect) {
        // Canvas is wider than image (16:9) -> match width with 4px bleed, expand height and center vertically
        drawWidth = width + 4;
        drawHeight = Math.ceil(drawWidth / imgAspect);
        offsetX = -2;
        offsetY = Math.floor((height - drawHeight) / 2);
      } else {
        // Canvas is taller than image (16:9) -> match height with 4px bleed, expand width and center horizontally
        drawHeight = height + 4;
        drawWidth = Math.ceil(drawHeight * imgAspect);
        offsetX = Math.floor((width - drawWidth) / 2);
        offsetY = -2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      return true;
    },
    [backgroundColor]
  );

  // Find nearest loaded frame to prevent blank flashes
  const getNearestLoadedImage = useCallback(
    (desiredIndex: number): HTMLImageElement | null => {
      const images = imagesRef.current;
      const loaded = loadedSetRef.current;

      if (loaded.has(desiredIndex) && images[desiredIndex]) {
        return images[desiredIndex];
      }

      for (let offset = 1; offset < totalFrames; offset++) {
        const prev = desiredIndex - offset;
        if (prev >= 0 && loaded.has(prev) && images[prev]) {
          return images[prev];
        }
        const next = desiredIndex + offset;
        if (next < totalFrames && loaded.has(next) && images[next]) {
          return images[next];
        }
      }

      return images[0] || null;
    },
    [totalFrames]
  );

  // Resize canvas element buffer based on devicePixelRatio
  const resizeCanvasElement = useCallback(
    (canvas: HTMLCanvasElement | null, parent: HTMLElement | null): boolean => {
      if (!canvas || !parent) return false;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);

      const width = rect.width > 0 ? rect.width : (typeof window !== "undefined" ? window.innerWidth : 1440);
      const height = rect.height > 0 ? rect.height : (typeof window !== "undefined" ? window.innerHeight : 900);

      const bufferWidth = Math.round(width * dpr);
      const bufferHeight = Math.round(height * dpr);

      // Only re-allocate buffer if difference exceeds 8px (prevents mobile URL-bar jitter from clearing canvas)
      if (Math.abs(canvas.width - bufferWidth) > 8 || Math.abs(canvas.height - bufferHeight) > 8) {
        canvas.width = bufferWidth;
        canvas.height = bufferHeight;
        return true;
      }
      return false;
    },
    []
  );

  const handleResize = useCallback(() => {
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
    }

    // Act 1
    const resized1 = resizeCanvasElement(act1CanvasRef.current, act1PinnedRef.current);
    if (resized1) {
      lastDrawnAct1Ref.current = -1;
      const img1 = getNearestLoadedImage(Math.round(currentFrameAct1Ref.current));
      if (img1) drawImageToCanvas(act1CanvasRef.current, img1);
    }

    // Act 3
    const resized3 = resizeCanvasElement(act3CanvasRef.current, act3PinnedRef.current);
    if (resized3) {
      lastDrawnAct3Ref.current = -1;
      const img3 = getNearestLoadedImage(Math.round(currentFrameAct3Ref.current));
      if (img3) drawImageToCanvas(act3CanvasRef.current, img3);
    }
  }, [resizeCanvasElement, getNearestLoadedImage, drawImageToCanvas]);

  // Handle window scroll across all 3 acts
  const handleScroll = useCallback(() => {
    // 1. Act 1 Scroll Calculation (Frames 0 -> 240 / frame_0001 -> frame_0241)
    const act1Container = act1ContainerRef.current;
    if (act1Container) {
      const rect = act1Container.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable > 0) {
        const scrolled = -rect.top;
        const progress = Math.min(Math.max(scrolled / scrollable, 0), 1);
        targetFrameAct1Ref.current = progress * 240;
      }
    }

    // 2. Act 2 Scroll Calculation (Progress 0 -> 1 drives Horizontal Moving Carousel)
    const act2Container = act2ContainerRef.current;
    if (act2Container) {
      const rect = act2Container.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable > 0) {
        const scrolled = -rect.top;
        const progress = Math.min(Math.max(scrolled / scrollable, 0), 1);
        targetAct2ProgressRef.current = progress;
      }
    }

    // 3. Act 3 Scroll Calculation (Frames 241 -> 480 / frame_0242 -> frame_0481)
    const act3Container = act3ContainerRef.current;
    if (act3Container) {
      const rect = act3Container.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable > 0) {
        const scrolled = -rect.top;
        const progress = Math.min(Math.max(scrolled / scrollable, 0), 1);
        targetFrameAct3Ref.current = 241 + progress * (totalFrames - 1 - 241);
      }
    }
  }, [totalFrames]);

  // Progressive Frame Preloader
  useEffect(() => {
    let isCancelled = false;
    const images: HTMLImageElement[] = new Array(totalFrames);
    imagesRef.current = images;
    loadedSetRef.current.clear();

    let loadedCount = 0;

    const onFrameLoaded = (index: number, img: HTMLImageElement) => {
      if (isCancelled) return;
      loadedSetRef.current.add(index);
      loadedCount++;

      const pct = Math.round((loadedCount / totalFrames) * 100);
      setLoadProgress(pct);

      if (index === 0 && (lastDrawnAct1Ref.current === -1 || lastDrawnAct1Ref.current === 0)) {
        if (drawImageToCanvas(act1CanvasRef.current, img)) {
          lastDrawnAct1Ref.current = 0;
        }
      }

      if (index === 241 && (lastDrawnAct3Ref.current === -1 || lastDrawnAct3Ref.current === 241)) {
        if (drawImageToCanvas(act3CanvasRef.current, img)) {
          lastDrawnAct3Ref.current = 241;
        }
      }

      if (loadedCount >= Math.min(25, Math.floor(totalFrames * 0.08))) {
        setIsCriticalLoaded(true);
      }
    };

    // Priority 1: Key milestones
    const firstImg = new Image();
    images[0] = firstImg;
    firstImg.onload = () => onFrameLoaded(0, firstImg);
    firstImg.src = getFrameUrl(1);

    const midImg = new Image();
    images[241] = midImg;
    midImg.onload = () => onFrameLoaded(241, midImg);
    midImg.src = getFrameUrl(242);

    // Progressive loading remainder with stride
    const remainingIndices: number[] = [];
    const stride = 8;
    for (let i = 1; i < totalFrames; i += stride) {
      if (i !== 241) remainingIndices.push(i);
    }
    for (let i = 1; i < totalFrames; i++) {
      if (i % stride !== 0 && i !== 241) remainingIndices.push(i);
    }

    const CONCURRENCY = 6;
    let nextQueueIdx = 0;

    const loadNext = () => {
      if (isCancelled || nextQueueIdx >= remainingIndices.length) return;

      const idx = remainingIndices[nextQueueIdx++];
      const img = new Image();
      images[idx] = img;

      img.onload = () => {
        onFrameLoaded(idx, img);
        loadNext();
      };
      img.onerror = () => {
        loadNext();
      };

      img.src = getFrameUrl(idx + 1);
    };

    for (let c = 0; c < CONCURRENCY; c++) {
      loadNext();
    }

    return () => {
      isCancelled = true;
      for (let i = 0; i < images.length; i++) {
        if (images[i]) {
          images[i].onload = null;
          images[i].onerror = null;
          images[i].src = "";
        }
      }
      imagesRef.current = [];
      loadedSetRef.current.clear();
    };
  }, [totalFrames, getFrameUrl, drawImageToCanvas]);

  // Main RAF Animation Loop: Drives Act 1 Canvas, Act 2 Horizontal Carousel, Act 3 Canvas
  useEffect(() => {
    setIsClient(true);
    let isCancelled = false;

    handleResize();
    handleScroll();

    let lastTime = performance.now();
    let lastUiUpdate = 0;

    const tick = (now: number) => {
      if (isCancelled) return;

      // Continuously sample scroll position on every frame
      // This ensures mobile finger drags immediately advance the animation without waiting for throttled scroll events
      handleScroll();

      const delta = Math.min((now - lastTime) / 16.667, 2);
      lastTime = now;

      // Dynamic mobile damping: on mobile screens, respond more briskly to thumb flicks
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      const effectiveDamping = isMobile ? 0.22 : dampingFactor;

      // 1. Act 1 Scrub Lerp (Frames 0 -> 240)
      const target1 = targetFrameAct1Ref.current;
      const current1 = currentFrameAct1Ref.current;
      const diff1 = target1 - current1;

      if (Math.abs(diff1) > 0.001) {
        currentFrameAct1Ref.current += diff1 * (effectiveDamping * delta);
      } else {
        currentFrameAct1Ref.current = target1;
      }

      const frameIndex1 = Math.min(240, Math.max(0, Math.round(currentFrameAct1Ref.current)));
      if (frameIndex1 !== lastDrawnAct1Ref.current) {
        const img = getNearestLoadedImage(frameIndex1);
        if (img) {
          const ok = drawImageToCanvas(act1CanvasRef.current, img);
          if (ok) {
            lastDrawnAct1Ref.current = frameIndex1;
          }
        }
      }

      // 2. Act 2 Horizontal Carousel Lerp (Progress 0 -> 1)
      const target2 = targetAct2ProgressRef.current;
      const current2 = currentAct2ProgressRef.current;
      const diff2 = target2 - current2;

      if (Math.abs(diff2) > 0.0005) {
        currentAct2ProgressRef.current += diff2 * (effectiveDamping * delta);
      } else {
        currentAct2ProgressRef.current = target2;
      }

      // 3. Act 3 Scrub Lerp (Frames 241 -> 480)
      const target3 = targetFrameAct3Ref.current;
      const current3 = currentFrameAct3Ref.current;
      const diff3 = target3 - current3;

      if (Math.abs(diff3) > 0.001) {
        currentFrameAct3Ref.current += diff3 * (effectiveDamping * delta);
      } else {
        currentFrameAct3Ref.current = target3;
      }

      const frameIndex3 = Math.min(totalFrames - 1, Math.max(241, Math.round(currentFrameAct3Ref.current)));
      if (frameIndex3 !== lastDrawnAct3Ref.current) {
        const img = getNearestLoadedImage(frameIndex3);
        if (img) {
          const ok = drawImageToCanvas(act3CanvasRef.current, img);
          if (ok) {
            lastDrawnAct3Ref.current = frameIndex3;
          }
        }
      }

      // Throttle React state updates to ~30fps for smooth UI transforms
      if (now - lastUiUpdate > 30) {
        setAct1Progress(currentFrameAct1Ref.current / 240);
        setAct2Progress(currentAct2ProgressRef.current);
        setAct3Progress((currentFrameAct3Ref.current - 241) / (totalFrames - 1 - 241));
        lastUiUpdate = now;
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("touchstart", handleScroll, { passive: true });
    window.addEventListener("touchmove", handleScroll, { passive: true });
    window.addEventListener("touchend", handleScroll, { passive: true });

    return () => {
      isCancelled = true;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("touchstart", handleScroll);
      window.removeEventListener("touchmove", handleScroll);
      window.removeEventListener("touchend", handleScroll);
    };
  }, [dampingFactor, totalFrames, handleResize, handleScroll, getNearestLoadedImage, drawImageToCanvas]);

  // Act 1 text style calculation
  const act1TextStyle = useMemo(() => {
    let opacity = 1;
    let translateY = 0;

    if (act1Progress > 0.7) {
      const t = (act1Progress - 0.7) / 0.3;
      opacity = 1 - t;
      translateY = -24 * t;
    }

    return {
      opacity: Math.max(0, Math.min(1, opacity)),
      transform: `translate3d(0, ${translateY.toFixed(1)}px, 0)`,
      pointerEvents: "none" as const,
    };
  }, [act1Progress]);

  // Act 2 Horizontal Carousel Slide Calculations
  const { translateXRail1, translateXRail2 } = useMemo(() => {
    // Rail 1: 10 square brand cards (clamp 140px - 190px, avg ~180px + 20px gap) = ~1980px
    const cardWidth1 = Math.min(190, Math.max(140, windowWidth * 0.13));
    const gap1 = 20;
    const totalRail1Width = CAR_BRANDS.length * cardWidth1 + (CAR_BRANDS.length - 1) * gap1;
    const paddingLeft = Math.min(80, Math.max(24, windowWidth * 0.05));
    const maxTravel1 = Math.max(0, totalRail1Width + paddingLeft * 2 - windowWidth);

    // Rail 2: 4 commitment cards (340px width + 20px gap) = ~1420px
    const cardWidth2 = Math.min(360, Math.max(280, windowWidth * 0.24));
    const gap2 = 20;
    const totalRail2Width = COMMITMENTS.length * cardWidth2 + (COMMITMENTS.length - 1) * gap2;
    const maxTravel2 = Math.max(0, totalRail2Width + paddingLeft * 2 - windowWidth);

    const x1 = -act2Progress * maxTravel1;
    const x2 = -act2Progress * maxTravel2;

    return {
      translateXRail1: x1,
      translateXRail2: x2,
    };
  }, [act2Progress, windowWidth]);

  // Step style calculator for text coming 1 by 1 in place of Modular Architecture
  const getStepTextStyle = useCallback((p: number, start: number, end: number) => {
    if (p < start || p > end) {
      return {
        opacity: 0,
        transform: "translate3d(0, 20px, 0)",
        pointerEvents: "none" as const,
        visibility: "hidden" as const,
      };
    }

    const fadeInEnd = start + 0.035;
    const fadeOutStart = end - 0.035;

    let opacity = 1;
    let translateY = 0;

    if (p < fadeInEnd) {
      const t = (p - start) / 0.035;
      opacity = t;
      translateY = 20 * (1 - t);
    } else if (p > fadeOutStart) {
      const t = (p - fadeOutStart) / 0.035;
      opacity = 1 - t;
      translateY = -20 * t;
    }

    return {
      opacity: Math.max(0, Math.min(1, opacity)),
      transform: `translate3d(0, ${translateY.toFixed(1)}px, 0)`,
      pointerEvents: "none" as const,
      visibility: opacity > 0.01 ? ("visible" as const) : ("hidden" as const),
    };
  }, []);

  // Act 3 Finale: Big Company Name throughout the body + Square Buttons in different shades
  const act3FinaleStyle = useMemo(() => {
    let opacity = 0;
    let translateY = 28;

    if (act3Progress >= 0.72) {
      if (act3Progress < 0.80) {
        const t = (act3Progress - 0.72) / 0.08;
        opacity = t;
        translateY = 28 * (1 - t);
      } else {
        opacity = 1;
        translateY = 0;
      }
    }

    return {
      opacity: Math.max(0, Math.min(1, opacity)),
      transform: `translate3d(0, ${translateY.toFixed(1)}px, 0)`,
      pointerEvents: opacity > 0.4 ? ("auto" as const) : ("none" as const),
      visibility: opacity > 0.01 ? ("visible" as const) : ("hidden" as const),
    };
  }, [act3Progress]);

  return (
    <div id="car-scrollytelling-master" style={{ backgroundColor, color: "#ffffff", width: "100%", touchAction: "pan-y" }}>
      {/* =========================================================================
          ACT 1: THE DRIFT PHASE (Frames 1 -> 241)
          Pinned canvas scrubs smoothly until reaching frame 241
          ========================================================================= */}
      <section
        ref={act1ContainerRef}
        id="act1-drift-section"
        style={{
          position: "relative",
          width: "100%",
          minHeight: act1Distance,
          backgroundColor,
          touchAction: "pan-y",
        }}
      >
        <div
          ref={act1PinnedRef}
          style={{
            position: "sticky",
            top: 0,
            left: 0,
            width: "100%",
            height: "100vh",
            minHeight: "100dvh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            touchAction: "pan-y",
            backgroundColor,
            zIndex: 10,
          }}
        >
          <canvas
            ref={act1CanvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "block",
              pointerEvents: "none",
              backgroundColor,
              border: "none",
              outline: "none",
            }}
          />

          {/* Left-to-Right Black Gradient Overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to right, rgba(0, 0, 0, 0.88) 0%, rgba(0, 0, 0, 0.65) 25%, rgba(0, 0, 0, 0.2) 52%, rgba(0, 0, 0, 0) 78%)",
              pointerEvents: "none",
              zIndex: 5,
            }}
          />

          {/* Bottom Gradient Fade on Act 1: Seamless connection to Act 2 with no hard partition */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "45vh",
              background:
                "linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.2) 30%, rgba(0, 0, 0, 0.6) 65%, rgba(0, 0, 0, 0.94) 100%)",
              pointerEvents: "none",
              zIndex: 6,
            }}
          />

          {/* Act 1 Loading Pill */}
          {isClient && (
            <div
              style={{
                position: "absolute",
                bottom: "32px",
                right: "32px",
                zIndex: 30,
                backgroundColor: "rgba(0, 0, 0, 0.45)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "9999px",
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                opacity: isCriticalLoaded && loadProgress === 100 ? 0 : 1,
                pointerEvents: "none",
                transition: "opacity 0.8s ease",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#ffffff",
                  animation: "pulse 1.5s infinite",
                }}
              />
              <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.04em", color: "#000000" }}>
                {loadProgress < 100 ? `BUFFERING ${loadProgress}%` : "READY"}
              </span>
            </div>
          )}

          {/* Scroll Indicator Prompt */}
          <div
            style={{
              position: "absolute",
              bottom: "36px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 25,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              opacity: act1Progress < 0.15 ? 1 - act1Progress / 0.15 : 0,
              transition: "opacity 0.4s ease",
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-body, sans-serif)",
                fontSize: "11px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 600,
                color: "rgba(0, 0, 0, 0.85)",
              }}
            >
              Scroll to Explore
            </span>
            <div
              style={{
                width: "20px",
                height: "32px",
                borderRadius: "16px",
                border: "2px solid rgba(255, 255, 255, 0.6)",
                display: "flex",
                justifyContent: "center",
                paddingTop: "6px",
              }}
            >
              <div
                style={{
                  width: "3px",
                  height: "6px",
                  backgroundColor: "#ffffff",
                  borderRadius: "2px",
                  animation: "scrollMouse 1.8s infinite ease-in-out",
                }}
              />
            </div>
          </div>

          {/* Phase 1 Text Overlay */}
          <div
            style={{
              position: "absolute",
              left: "clamp(24px, 6vw, 96px)",
              top: "clamp(20%, 30vh, 40%)",
              maxWidth: "min(90vw, 560px)",
              zIndex: 20,
              userSelect: "none",
              WebkitUserSelect: "none",
              transition: "transform 0.15s ease-out, opacity 0.15s ease-out",
              ...act1TextStyle,
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: "4px",
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#ffffff",
                marginBottom: "12px",
              }}
            >
              Phase 01 // Dynamic Handling
            </div>
            <h2
              style={{
                fontFamily: "var(--font-headline, 'Hanken Grotesk', sans-serif)",
                fontSize: "clamp(36px, 5.5vw, 68px)",
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                color: "#ffffff",
                margin: "0 0 16px 0",
                textShadow: "0 4px 24px rgba(0, 0, 0, 0.5)",
              }}
            >
              All-Terrain Authority
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body, 'Inter', sans-serif)",
                fontSize: "clamp(16px, 1.8vw, 22px)",
                lineHeight: 1.45,
                color: "rgba(255, 255, 255, 0.92)",
                margin: 0,
                maxWidth: "460px",
                textShadow: "0 2px 14px rgba(0, 0, 0, 0.4)",
              }}
            >
              Engineered for uncompromised control. Direct from Japan & European auctions.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          ACT 2: HORIZONTAL MOVING CAROUSEL & COMMITMENTS (NO CAR FRAME HERE!)
          As the user scrolls vertically down, the brand cards & commitments slide
          horizontally with fluid, momentum-driven animation across the viewport.
          ========================================================================= */}
      <section
        ref={act2ContainerRef}
        id="act2-carousel-section"
        style={{
          position: "relative",
          width: "100%",
          minHeight: act2Distance,
          touchAction: "pan-y",
          background:
            "linear-gradient(180deg, #050505 0%, #150204 12%, #550a0d 28%, #a01518 48%, #d92a28 65%, #600b0e 85%, #050505 100%)",
        }}
      >
        <div
          ref={act2PinnedRef}
          style={{
            position: "sticky",
            top: 0,
            left: 0,
            width: "100%",
            height: "100vh",
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            touchAction: "pan-y",
            background:
              "linear-gradient(180deg, rgba(0, 0, 0, 0.94) 0%, rgba(0, 0, 0, 0.55) 18%, rgba(0, 0, 0, 0.12) 36%, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.2) 75%, rgba(0, 0, 0, 0.94) 100%), #d92a28",
            boxShadow: "0 -40px 100px rgba(0, 0, 0, 0.95), 0 40px 100px rgba(0, 0, 0, 0.95)",
            zIndex: 10,
            padding: "24px 0",
            gap: "clamp(18px, 2.5vh, 28px)",
          }}
        >
          {/* Header & Section Title */}
          <div
            style={{
              padding: "0 clamp(24px, 5vw, 80px)",
              maxWidth: "1100px",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "9999px",
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#ffffff",
                marginBottom: "10px",
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#25D366" }} />
              <span>GLOBAL AUCTION NETWORK • 10 PREMIER MARQUES</span>
            </div>
            <h2
              style={{
                fontFamily: "var(--font-headline, 'Hanken Grotesk', sans-serif)",
                fontSize: "clamp(28px, 3.6vw, 46px)",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                margin: "0 0 6px 0",
                color: "#ffffff",
              }}
            >
              All Available Brands & Our Commitments
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body, 'Inter', sans-serif)",
                fontSize: "clamp(13px, 1.3vw, 16px)",
                lineHeight: 1.45,
                color: "rgba(255, 255, 255, 0.88)",
                margin: 0,
                maxWidth: "720px",
              }}
            >
              Scroll down to slide through all verified Japanese & European marques and our 4 core buyer guarantees.
            </p>
          </div>

          {/* RAIL 1: HORIZONTAL MOVING CAROUSEL OF CAR BRAND LOGOS */}
          <div style={{ width: "100%", overflow: "hidden" }}>
            <div
              ref={act2Rail1Ref}
              style={{
                display: "flex",
                gap: "20px",
                paddingLeft: "clamp(24px, 5vw, 80px)",
                transform: `translate3d(${translateXRail1.toFixed(1)}px, 0, 0)`,
                willChange: "transform",
                transition: "transform 0.05s linear",
              }}
            >
              {CAR_BRANDS.map((b) => (
                <div
                  key={b.name}
                  className="brand-logo-card"
                  style={{
                    flexShrink: 0,
                    width: "clamp(150px, 13vw, 190px)",
                    height: "clamp(150px, 13vw, 190px)",
                    aspectRatio: "1 / 1",
                    backgroundColor: "rgba(255, 255, 255, 0.96)",
                    borderRadius: "24px",
                    padding: "clamp(18px, 2vw, 26px)",
                    boxShadow: "0 14px 36px rgba(0, 0, 0, 0.22)",
                    border: "1px solid rgba(255, 255, 255, 0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={b.logo}
                    alt={`${b.name} Logo`}
                    style={{
                      maxWidth: "85%",
                      maxHeight: "85%",
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                    }}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* RAIL 2: HORIZONTAL MOVING CAROUSEL OF OUR COMMITMENTS */}
          <div style={{ width: "100%", overflow: "hidden" }}>
            <div
              ref={act2Rail2Ref}
              style={{
                display: "flex",
                gap: "20px",
                paddingLeft: "clamp(24px, 5vw, 80px)",
                transform: `translate3d(${translateXRail2.toFixed(1)}px, 0, 0)`,
                willChange: "transform",
                transition: "transform 0.05s linear",
              }}
            >
              {COMMITMENTS.map((c) => (
                <div
                  key={c.title}
                  className="commitment-slide-card"
                  style={{
                    flexShrink: 0,
                    width: "clamp(300px, 25vw, 370px)",
                    backgroundColor: "rgba(18, 18, 18, 0.78)",
                    backdropFilter: "blur(18px)",
                    WebkitBackdropFilter: "blur(18px)",
                    borderRadius: "20px",
                    padding: "20px 24px",
                    border: "1px solid rgba(255, 255, 255, 0.22)",
                    boxShadow: "0 14px 40px rgba(0, 0, 0, 0.35)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "12px",
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                        flexShrink: 0,
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
                        {c.icon}
                      </span>
                    </div>
                    <div>
                      <h4
                        style={{
                          fontFamily: "var(--font-headline, sans-serif)",
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "#ffffff",
                          margin: "0 0 2px 0",
                        }}
                      >
                        {c.title}
                      </h4>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#ffb3ae",
                          fontWeight: 600,
                          letterSpacing: "0.02em",
                        }}
                      >
                        {c.subtitle}
                      </span>
                    </div>
                  </div>

                  <p
                    style={{
                      fontFamily: "var(--font-body, sans-serif)",
                      fontSize: "12px",
                      lineHeight: 1.45,
                      color: "rgba(255, 255, 255, 0.85)",
                      margin: 0,
                    }}
                  >
                    {c.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Interactive Progress Bar & Scroll Cue */}
          <div
            style={{
              padding: "0 clamp(24px, 5vw, 80px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, maxWidth: "340px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255, 255, 255, 0.8)" }}>
                Marques Slide
              </span>
              <div
                style={{
                  flex: 1,
                  height: "3px",
                  borderRadius: "2px",
                  backgroundColor: "rgba(255, 255, 255, 0.25)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.round(act2Progress * 100)}%`,
                    backgroundColor: "#ffffff",
                    borderRadius: "2px",
                    transition: "width 0.1s linear",
                  }}
                />
              </div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#ffffff" }}>
                {Math.round(act2Progress * 100)}%
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgba(255, 255, 255, 0.75)", fontSize: "11px", fontWeight: 600 }}>
              <span>Keep scrolling down to continue car animation</span>
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                arrow_downward
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          ACT 3: THE RESUMED EXPLODED VIEW & CLIMAX (Frames 242 -> 481)
          Scroll downwards to continue the animation to the last frame,
          finishing with fade-in text and Visit Inventory / Contact Us buttons.
          ========================================================================= */}
      <section
        ref={act3ContainerRef}
        id="act3-exploded-section"
        style={{
          position: "relative",
          width: "100%",
          minHeight: act3Distance,
          backgroundColor,
          touchAction: "pan-y",
        }}
      >
        <div
          ref={act3PinnedRef}
          style={{
            position: "sticky",
            top: 0,
            left: 0,
            width: "100%",
            height: "100vh",
            minHeight: "100dvh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            touchAction: "pan-y",
            backgroundColor,
            boxShadow: "0 -40px 100px rgba(0, 0, 0, 0.95)",
            zIndex: 10,
          }}
        >
          <canvas
            ref={act3CanvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "block",
              pointerEvents: "none",
              backgroundColor,
              border: "none",
              outline: "none",
            }}
          />

          {/* Right-to-Left Black Gradient Overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to left, rgba(0, 0, 0, 0.88) 0%, rgba(0, 0, 0, 0.65) 25%, rgba(0, 0, 0, 0.2) 52%, rgba(0, 0, 0, 0) 78%)",
              pointerEvents: "none",
              zIndex: 5,
            }}
          />

          {/* Top Gradient Fade on Act 3: Seamless connection from Act 2 */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "45vh",
              background:
                "linear-gradient(to bottom, rgba(0, 0, 0, 0.94) 0%, rgba(0, 0, 0, 0.6) 30%, rgba(0, 0, 0, 0.2) 65%, transparent 100%)",
              pointerEvents: "none",
              zIndex: 5,
            }}
          />

          {/* Act 3: Pre-Order Process Text Coming 1 by 1 (In place of Modular Architecture) */}
          <div
            className="preorder-step-text-container"
            style={{
              position: "absolute",
              right: "clamp(24px, 5vw, 80px)",
              top: "clamp(18%, 24vh, 32%)",
              width: "clamp(340px, 42vw, 560px)",
              maxWidth: "calc(100vw - 48px)",
              height: "280px",
              zIndex: 20,
              pointerEvents: "none",
              userSelect: "none",
              WebkitUserSelect: "none",
              touchAction: "pan-y",
              boxSizing: "border-box",
            }}
          >
            {PRE_ORDER_PROCESS_STEPS.map((item) => {
              const style = getStepTextStyle(act3Progress, item.start, item.end);
              return (
                <div
                  key={item.step}
                  className="preorder-step-text-item"
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "100%",
                    boxSizing: "border-box",
                    textAlign: "right",
                    transition: "transform 0.18s ease-out, opacity 0.18s ease-out",
                    ...style,
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      padding: "6px 14px",
                      borderRadius: "4px",
                      backgroundColor: "rgba(0, 0, 0, 0.45)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.25)",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "rgba(255, 255, 255, 0.95)",
                      marginBottom: "12px",
                      whiteSpace: "nowrap",
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    {item.pill}
                  </div>
                  <h2
                    style={{
                      fontFamily: "var(--font-headline, 'Hanken Grotesk', sans-serif)",
                      fontSize: "clamp(34px, 4.8vw, 62px)",
                      fontWeight: 800,
                      lineHeight: 1.08,
                      letterSpacing: "-0.02em",
                      color: "#ffffff",
                      margin: "0 0 14px 0",
                      whiteSpace: "nowrap",
                      textShadow: "0 4px 28px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    {item.title}
                  </h2>
                  <p
                    style={{
                      fontFamily: "var(--font-body, 'Inter', sans-serif)",
                      fontSize: "clamp(15px, 1.5vw, 19px)",
                      lineHeight: 1.5,
                      color: "rgba(255, 255, 255, 0.95)",
                      margin: "0 0 0 auto",
                      maxWidth: "480px",
                      textShadow: "0 2px 14px rgba(0, 0, 0, 0.45)",
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Act 3 Climax: Big Company Name throughout the body + Square Action Buttons in different shades */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "clamp(24px, 4vw, 48px)",
              zIndex: 25,
              userSelect: "none",
              WebkitUserSelect: "none",
              touchAction: "pan-y",
              transition: "transform 0.22s ease-out, opacity 0.22s ease-out",
              ...act3FinaleStyle,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 16px",
                borderRadius: "4px",
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255, 255, 255, 0.95)",
                marginBottom: "20px",
              }}
            >
              <span>PREMIUM JAPANESE IMPORTS • BANGLADESH</span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-headline, 'Hanken Grotesk', sans-serif)",
                fontSize: "clamp(44px, 8.5vw, 112px)",
                fontWeight: 900,
                lineHeight: 0.92,
                letterSpacing: "-0.04em",
                color: "#ffffff",
                textTransform: "uppercase",
                margin: "0 0 20px 0",
                textShadow: "0 12px 48px rgba(0, 0, 0, 0.6)",
                maxWidth: "1200px",
              }}
            >
              GOOD CAR IMPORTS
            </h1>

            <p
              style={{
                fontFamily: "var(--font-body, 'Inter', sans-serif)",
                fontSize: "clamp(16px, 1.8vw, 22px)",
                color: "rgba(255, 255, 255, 0.92)",
                maxWidth: "640px",
                margin: "0 0 36px 0",
                lineHeight: 1.5,
                textShadow: "0 2px 14px rgba(0, 0, 0, 0.4)",
              }}
            >
              Direct Japanese auction access. Verified inspection grading. Delivered straight to Dhaka.
            </p>

            {/* Square Buttons in different shades */}
            <div
              style={{
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
                pointerEvents: "auto",
              }}
            >
              {/* Button 1: View Stocks (Crisp White Shade) */}
              <Link
                href={ctaInventoryHref}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "18px 40px",
                  backgroundColor: "#ffffff",
                  color: "#bc001f",
                  borderRadius: "4px", // Square button
                  fontWeight: 800,
                  fontSize: "15px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  border: "2px solid #ffffff",
                  boxShadow: "0 12px 36px rgba(0, 0, 0, 0.4)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 18px 44px rgba(0, 0, 0, 0.55)";
                  e.currentTarget.style.backgroundColor = "#f0f0f0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 12px 36px rgba(0, 0, 0, 0.4)";
                  e.currentTarget.style.backgroundColor = "#ffffff";
                }}
              >
                <span>View Stocks</span>
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                  arrow_forward
                </span>
              </Link>

              {/* Button 2: Contact Us (Deep Carbon Black Shade) */}
              <Link
                href={ctaContactHref}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "18px 40px",
                  backgroundColor: "#111418", // Different shade: Deep Carbon / Black
                  color: "#ffffff",
                  borderRadius: "4px", // Square button
                  fontWeight: 800,
                  fontSize: "15px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  border: "2px solid rgba(255, 255, 255, 0.7)",
                  boxShadow: "0 12px 36px rgba(0, 0, 0, 0.5)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 18px 44px rgba(0, 0, 0, 0.65)";
                  e.currentTarget.style.borderColor = "#ffffff";
                  e.currentTarget.style.backgroundColor = "#20252c";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 12px 36px rgba(0, 0, 0, 0.5)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.7)";
                  e.currentTarget.style.backgroundColor = "#111418";
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                  call
                </span>
                <span>Contact Us</span>
              </Link>

              {/* Button 3: Pre-Order (Deep Crimson Shade) */}
              <Link
                href={ctaPreOrderHref}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "18px 36px",
                  backgroundColor: "#7f1214", // Different shade: Deep Crimson
                  color: "#ffffff",
                  borderRadius: "4px", // Square button
                  fontWeight: 800,
                  fontSize: "15px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  border: "2px solid rgba(255, 255, 255, 0.35)",
                  boxShadow: "0 12px 36px rgba(0, 0, 0, 0.4)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.backgroundColor = "#98171a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.backgroundColor = "#7f1214";
                }}
              >
                <span>Pre-Order</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes scrollMouse {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          60% {
            transform: translateY(12px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 0;
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(0.85);
          }
        }
        .brand-logo-card:hover {
          transform: translateY(-6px) scale(1.05);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.3);
        }
        .commitment-slide-card:hover {
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
        }
        @media (max-width: 768px) {
          .preorder-step-text-container {
            right: 20px !important;
            left: 20px !important;
            width: auto !important;
            max-width: calc(100vw - 40px) !important;
            text-align: center !important;
            top: 18% !important;
          }
          .preorder-step-text-item {
            text-align: center !important;
          }
          .preorder-step-text-item p {
            margin: 0 auto !important;
          }
        }
      `}</style>
    </div>
  );
}
