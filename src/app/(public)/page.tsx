import { connection } from "next/server";
import prisma from "@/lib/prisma";
import { CarScrollHero } from "@/components/CarScrollHero";
import { FeaturedCarousel, FeaturedVehicleItem } from "@/components/FeaturedCarousel";

export const dynamic = "force-dynamic";

export default async function Home() {
  await connection();

  const rawFeaturedVehicles = await prisma.vehicle.findMany({
    where: {
      is_featured: true,
      status: { not: "sold" },
    },
    include: {
      photos: {
        orderBy: [{ is_cover: "desc" }, { sort_order: "asc" }],
      },
    },
    orderBy: { created_at: "desc" },
    take: 24,
  });

  const featuredVehicles: FeaturedVehicleItem[] = rawFeaturedVehicles.map((v) => {
    const coverPhotoPath =
      v.cover_photo ||
      v.photos.find((p) => p.is_cover)?.file_path ||
      v.photos[0]?.file_path ||
      null;

    return {
      id: v.id,
      slug: v.slug,
      car_name: v.car_name,
      package_trim: v.package_trim,
      year_of_manufacture: v.year_of_manufacture,
      price_bdt: v.price_bdt ? v.price_bdt.toString() : null,
      cover_photo: coverPhotoPath,
      badge_text: v.badge_text,
      auction_grade: v.auction_grade,
      engine_cc: v.engine_cc,
      fuel_type: v.fuel_type,
      mileage_km: v.mileage_km,
    };
  });

  return (
    <div style={{ backgroundColor: "var(--stock-card-bg, #0b0c0f)", color: "#ffffff", minHeight: "100vh" }}>
      {/* ===== APPLE-STYLE SCROLL-SCRUB HERO ===== */}
      <div style={{ marginTop: "-80px" }}>
        <CarScrollHero backgroundColor="#ea081c" />
      </div>

      {/* ===== FEATURED INVENTORY (Seamless Linear Gradient Scroll) ===== */}
      <section
        style={{
          position: "relative",
          marginTop: "-2px",
          padding: "110px 0 130px 0",
          background:
            "linear-gradient(180deg, rgba(0, 0, 0, 0.94) 0%, #120204 7%, #3d0508 17%, #840b10 30%, #be0e16 44%, #d92023 52%, #be0e16 62%, #7a090e 76%, #3a0407 87%, #150204 94%, var(--stock-card-bg, #0b0c0f) 100%)",
          color: "#ffffff",
          overflow: "hidden",
        }}
      >
        {/* Ambient Top Blend Overlay: seamlessly absorbs bottom of Act 3 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "220px",
            background:
              "linear-gradient(180deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.35) 45%, transparent 100%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Ambient Bottom Blend Overlay: seamlessly transitions into Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "220px",
            background:
              "linear-gradient(0deg, var(--stock-card-bg, #0b0c0f) 0%, rgba(11, 12, 15, 0.7) 45%, transparent 100%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <FeaturedCarousel vehicles={featuredVehicles} />
        </div>
      </section>
    </div>
  );
}
