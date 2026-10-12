"use server";

import prisma from "@/lib/prisma";
import type { Inquiry, PreOrder, Vehicle, StockInward } from "@prisma/client";

export interface ActivityNotification {
  id: string;
  type: "inquiry" | "pre_order" | "vehicle_sold" | "pipeline";
  title: string;
  subtitle: string;
  timestamp: string;
  link: string;
}

export async function getRecentNotifications(): Promise<ActivityNotification[]> {
  try {
    const [inquiries, preOrders, soldVehicles, recentPipeline] = await Promise.all([
      prisma.inquiry.findMany({
        take: 5,
        orderBy: { created_at: "desc" },
      }),
      prisma.preOrder.findMany({
        take: 5,
        orderBy: { created_at: "desc" },
      }),
      prisma.vehicle.findMany({
        where: { status: "sold" },
        take: 3,
        orderBy: { updated_at: "desc" },
      }),
      prisma.stockInward.findMany({
        take: 3,
        orderBy: { updated_at: "desc" },
      }),
    ]);

    const activities: ActivityNotification[] = [];

    inquiries.forEach((inq: Inquiry) => {
      activities.push({
        id: `inq-${inq.id}`,
        type: "inquiry",
        title: inq.full_name,
        subtitle: `New Inquiry: ${inq.interested_in || "General Inquiry"}`,
        timestamp: inq.created_at.toISOString(),
        link: "/admin/inquiries?tab=inquiries",
      });
    });

    preOrders.forEach((po: PreOrder) => {
      activities.push({
        id: `po-${po.id}`,
        type: "pre_order",
        title: po.full_name,
        subtitle: `Pre-Order: ${po.make_model}`,
        timestamp: po.created_at.toISOString(),
        link: "/admin/inquiries?tab=pre_orders",
      });
    });

    soldVehicles.forEach((v: Vehicle) => {
      activities.push({
        id: `sold-${v.id}`,
        type: "vehicle_sold",
        title: v.car_name,
        subtitle: `Vehicle Sold (${v.chassis_code})`,
        timestamp: v.updated_at.toISOString(),
        link: "/admin/sales-register",
      });
    });

    recentPipeline.forEach((si: StockInward) => {
      activities.push({
        id: `pipe-${si.id}`,
        type: "pipeline",
        title: si.car_name,
        subtitle: `Pipeline: ${si.current_stage.replace(/_/g, " ")}`,
        timestamp: si.updated_at.toISOString(),
        link: `/admin/stock-inward?modal=add-stock-inward&edit_inward=${si.id}`,
      });
    });

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return activities.slice(0, 10);
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
}
