"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 190);
}

export async function getStockInwardById(id: number) {
  try {
    const record = await prisma.stockInward.findUnique({ where: { id } });
    if (!record) return null;
    return {
      ...record,
      won_price_jpy: record.won_price_jpy ? Number(record.won_price_jpy) : null,
      bdt_equivalent: record.bdt_equivalent ? Number(record.bdt_equivalent) : null,
      duty_amount: record.duty_amount ? Number(record.duty_amount) : null,
    };
  } catch (error) {
    console.error("Failed to fetch stock inward:", error);
    return null;
  }
}

export async function saveStockInward(id: number | null, formData: FormData) {
  try {
    const chassis = (formData.get("chassis_code") as string) || "";
    const carName = (formData.get("car_name") as string) || "";
    const stage = (formData.get("current_stage") as string) || "auction_won";

    if (!chassis || !carName) {
      return { success: false, error: "Car Name and Chassis Code are required." };
    }

    const data = {
      chassis_code: chassis,
      car_name: carName,
      package_trim: (formData.get("package_trim") as string) || null,
      year_of_manufacture: formData.get("year_of_manufacture") ? parseInt(formData.get("year_of_manufacture") as string) : null,
      color_name: (formData.get("color_name") as string) || null,
      mileage_km: formData.get("mileage_km") ? parseInt(formData.get("mileage_km") as string) : null,
      auction_grade: (formData.get("auction_grade") as string) || null,
      auction_house: (formData.get("auction_house") as string) || null,
      auction_lot: (formData.get("auction_lot") as string) || null,
      won_price_jpy: formData.get("won_price_jpy") ? BigInt(formData.get("won_price_jpy") as string) : null,
      bdt_equivalent: formData.get("bdt_equivalent") ? BigInt(formData.get("bdt_equivalent") as string) : null,
      current_stage: stage as "auction_won" | "japan_yard" | "sea_transit" | "ctg_customs" | "dhaka_handover",
    };

    if (id) {
      // ── EDIT Stock Inward ──
      await prisma.stockInward.update({ where: { id }, data });

      // Auto-transfer to live inventory at ctg_customs or dhaka_handover (legacy logic)
      if (stage === "ctg_customs" || stage === "dhaka_handover") {
        const targetStatus = stage === "ctg_customs" ? "port_clearance" : "available";

        const existingVehicle = await prisma.vehicle.findFirst({
          where: { chassis_code: chassis },
        });

        if (!existingVehicle) {
          // Create new vehicle in live inventory
          const chassisLast6 = chassis.replace(/[^a-zA-Z0-9]/g, "").slice(-6);
          const slug = generateSlug(`${carName}-${chassisLast6}`);
          const brand = carName.split(" ")[0] || "Unknown";

          const newVehicle = await prisma.vehicle.create({
            data: {
              slug,
              chassis_code: chassis,
              car_name: carName,
              brand,
              package_trim: data.package_trim,
              year_of_manufacture: data.year_of_manufacture,
              color_name: data.color_name,
              mileage_km: data.mileage_km,
              auction_grade: data.auction_grade,
              status: targetStatus as "available" | "port_clearance",
            },
          });

          // Link them
          await prisma.stockInward.update({
            where: { id },
            data: { vehicle_id: newVehicle.id },
          });
        } else {
          // Update existing vehicle's status (if not already sold/reserved)
          if (!["sold", "reserved"].includes(existingVehicle.status)) {
            await prisma.vehicle.update({
              where: { id: existingVehicle.id },
              data: { status: targetStatus as "available" | "port_clearance" },
            });
          }

          // Ensure link
          const inwardRecord = await prisma.stockInward.findUnique({ where: { id } });
          if (!inwardRecord?.vehicle_id) {
            await prisma.stockInward.update({
              where: { id },
              data: { vehicle_id: existingVehicle.id },
            });
          }
        }
      }
    } else {
      // ── ADD NEW Stock Inward ──
      const wonPriceJpy = data.won_price_jpy;
      if (!wonPriceJpy || wonPriceJpy <= BigInt(0)) {
        return { success: false, error: "Won Price (JPY) is mandatory and must be positive." };
      }

      await prisma.stockInward.create({ data });
    }

    revalidatePath("/admin/stock-inward");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to save stock inward:", error);
    return { success: false, error: String(error) };
  }
}

export async function deleteStockInward(id: number) {
  try {
    await prisma.stockInward.delete({ where: { id } });
    revalidatePath("/admin/stock-inward");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete stock inward:", error);
    return { success: false, error: "Failed to delete stock inward" };
  }
}
