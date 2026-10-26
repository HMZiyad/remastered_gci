import { connection } from "next/server";
import prisma from "@/lib/prisma";
import { BodyType } from "@prisma/client";
import { InventoryView, SerializedVehicle } from "@/components/InventoryView";

export const dynamic = "force-dynamic";

// Map UI body types to exact Prisma BodyType enum values
const BODY_TYPE_MAP: Record<string, BodyType> = {
  SUV: BodyType.SUV,
  SEDAN: BodyType.Sedan,
  HATCHBACK: BodyType.Hatchback,
  MPV: BodyType.MPV,
  CROSSOVER: BodyType.Crossover,
  WAGON: BodyType.Wagon,
  COUPE: BodyType.Coupe,
  PICKUP: BodyType.Pickup,
  MICROBUS: BodyType.Microbus,
  "HIACE-VAN": BodyType.HIACE_Van,
  HIACE_VAN: BodyType.HIACE_Van,
};

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await connection();
  const resolvedParams = await searchParams;

  const search = typeof resolvedParams.search === "string" ? resolvedParams.search.trim() : "";
  const brand = typeof resolvedParams.brand === "string" ? resolvedParams.brand.trim() : "";
  const minPrice = typeof resolvedParams.min_price === "string" ? resolvedParams.min_price.trim() : "";
  const maxPrice = typeof resolvedParams.max_price === "string" ? resolvedParams.max_price.trim() : "";
  const sort = typeof resolvedParams.sort === "string" ? resolvedParams.sort : "latest";

  // Parse body types (supports array or comma-separated string)
  const rawBodyTypes: string[] = [];
  if (Array.isArray(resolvedParams.body_type)) {
    rawBodyTypes.push(...resolvedParams.body_type);
  } else if (typeof resolvedParams.body_type === "string") {
    rawBodyTypes.push(...resolvedParams.body_type.split(","));
  }
  const cleanBodyTypes = rawBodyTypes.map((s) => s.trim()).filter(Boolean);

  // Map to Prisma BodyType enums
  const matchedEnums: BodyType[] = [];
  cleanBodyTypes.forEach((t) => {
    const key = t.toUpperCase();
    if (BODY_TYPE_MAP[key]) {
      matchedEnums.push(BODY_TYPE_MAP[key]);
    }
  });

  // Parse auction grades (supports array or comma-separated string)
  const rawGrades: string[] = [];
  if (Array.isArray(resolvedParams.grade)) {
    rawGrades.push(...resolvedParams.grade);
  } else if (typeof resolvedParams.grade === "string") {
    rawGrades.push(...resolvedParams.grade.split(","));
  }
  const cleanGrades = rawGrades.map((g) => g.trim()).filter(Boolean);

  // Build Prisma WHERE clause strictly matching database schema
  const where: any = {
    // Show only active vehicles from live inventory (exclude sold vehicles)
    status: { in: ["available", "port_clearance", "vessel_transit", "pre_booked"] },
  };

  // Quick Search: searches car_name, package_trim, chassis_code, color_name, brand
  if (search) {
    where.OR = [
      { car_name: { contains: search } },
      { package_trim: { contains: search } },
      { chassis_code: { contains: search } },
      { color_name: { contains: search } },
      { brand: { contains: search } },
    ];
  }

  // Brand filter
  if (brand) {
    where.brand = brand;
  }

  // Body Type enum filter
  if (matchedEnums.length > 0) {
    where.body_type = { in: matchedEnums };
  }

  // Auction Grade filter (handles numeric variants e.g. "5" and "5.0")
  if (cleanGrades.length > 0) {
    const gradeVariants = new Set<string>();
    cleanGrades.forEach((g) => {
      gradeVariants.add(g);
      if (g.endsWith(".0")) {
        gradeVariants.add(g.replace(".0", ""));
      } else if (!g.includes(".") && !isNaN(Number(g))) {
        gradeVariants.add(`${g}.0`);
      }
    });
    where.auction_grade = { in: Array.from(gradeVariants) };
  }

  // Price filter in Lakh BDT -> database stored in paisa (1 Lakh = 100,000 BDT = 10,000,000 paisa)
  if (minPrice || maxPrice) {
    where.price_bdt = {};
    if (minPrice && !isNaN(Number(minPrice))) {
      where.price_bdt.gte = BigInt(Math.round(Number(minPrice) * 100000 * 100));
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      where.price_bdt.lte = BigInt(Math.round(Number(maxPrice) * 100000 * 100));
    }
  }

  // Sorting
  let orderBy: any = { created_at: "desc" };
  if (sort === "price_low") orderBy = { price_bdt: "asc" };
  if (sort === "price_high") orderBy = { price_bdt: "desc" };
  if (sort === "mileage") orderBy = { mileage_km: "asc" };
  if (sort === "year_desc") orderBy = { year_of_manufacture: "desc" };

  // Query MariaDB via Prisma
  const [vehicles, distinctBrands] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      orderBy,
      include: {
        photos: {
          orderBy: [{ is_cover: "desc" }, { sort_order: "asc" }],
        },
      },
    }),
    prisma.vehicle.findMany({
      distinct: ["brand"],
      select: { brand: true },
      where: { brand: { not: null } },
      orderBy: { brand: "asc" },
    }),
  ]);

  const allBrands = distinctBrands
    .map((b) => b.brand)
    .filter((b): b is string => Boolean(b));

  // Serialize vehicles directly from database
  const serializedVehicles: SerializedVehicle[] = vehicles.map((v) => {
    // Resolve cover photo: first check cover_photo column, then photos relation
    const coverPhotoPath =
      v.cover_photo ||
      v.photos.find((p) => p.is_cover)?.file_path ||
      v.photos[0]?.file_path ||
      null;

    return {
      id: v.id,
      stock_id: v.stock_id,
      car_name: v.car_name,
      package_trim: v.package_trim,
      year_of_manufacture: v.year_of_manufacture,
      color_name: v.color_name,
      auction_grade: v.auction_grade,
      mileage_km: v.mileage_km,
      engine_cc: v.engine_cc,
      transmission: v.transmission,
      price_bdt: v.price_bdt ? v.price_bdt.toString() : null,
      cover_photo: coverPhotoPath,
      body_type: v.body_type,
      brand: v.brand,
      slug: v.slug,
      badge_text: v.badge_text,
      fuel_type: v.fuel_type,
    };
  });

  return (
    <InventoryView
      initialVehicles={serializedVehicles}
      allBrands={allBrands}
      currentSearch={search}
      currentBrand={brand}
      currentBodyTypes={cleanBodyTypes}
      currentMinPrice={minPrice}
      currentMaxPrice={maxPrice}
      currentGrades={cleanGrades}
      currentSort={sort}
    />
  );
}
