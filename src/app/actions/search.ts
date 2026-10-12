"use server";

import prisma from "@/lib/prisma";

export interface SearchResult {
  type: "Inventory" | "Pipeline" | "Sale";
  title: string;
  subtitle: string;
  badge: string;
  link: string;
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  const term = query.trim();
  const results: SearchResult[] = [];

  try {
    // Search Live Inventory
    const inventory = await prisma.vehicle.findMany({
      where: {
        OR: [
          { chassis_code: { contains: term } },
          { car_name: { contains: term } },
          { brand: { contains: term } },
        ],
      },
      select: { id: true, car_name: true, chassis_code: true, status: true },
      take: 5,
    });

    for (const v of inventory) {
      results.push({
        type: "Inventory",
        title: v.car_name,
        subtitle: v.chassis_code,
        badge: v.status.replace(/_/g, " "),
        link: `/admin/inventory?modal=add-vehicle&id=${v.id}`,
      });
    }

    // Search Stock Inward (Pipeline)
    const inward = await prisma.stockInward.findMany({
      where: {
        OR: [
          { chassis_code: { contains: term } },
          { car_name: { contains: term } },
        ],
      },
      select: { id: true, car_name: true, chassis_code: true, current_stage: true },
      take: 5,
    });

    for (const v of inward) {
      results.push({
        type: "Pipeline",
        title: v.car_name,
        subtitle: v.chassis_code,
        badge: v.current_stage.replace(/_/g, " "),
        link: `/admin/stock-inward?edit_inward=${v.id}`,
      });
    }

    // Search Sales
    const sales = await prisma.sale.findMany({
      where: {
        OR: [
          { chassis_code: { contains: term } },
          { car_name: { contains: term } },
        ],
      },
      select: { id: true, car_name: true, chassis_code: true, payment_status: true },
      take: 5,
    });

    for (const v of sales) {
      results.push({
        type: "Sale",
        title: v.car_name,
        subtitle: v.chassis_code || "",
        badge: v.payment_status.replace(/_/g, " "),
        link: `/admin/sales-register`,
      });
    }
  } catch (error) {
    console.error("Global search error:", error);
  }

  return results;
}
