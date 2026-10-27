"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink } from "fs/promises";
import fs from "fs";
import path from "path";

/**
 * Safely removes a file from disk if it's located inside the public/uploads directory.
 * Ignores remote URLs (http/https) and static stock images (/images/...).
 */
async function safeDeleteUploadedFile(filePath: string | null | undefined) {
  if (!filePath) return;
  // Ignore remote URLs or static /images/ assets
  if (filePath.startsWith("http://") || filePath.startsWith("https://") || filePath.startsWith("/images/")) {
    return;
  }

  try {
    const uploadBaseDir = path.resolve(
      process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads")
    );

    // Strip leading /uploads/ or / if present
    let cleanRelPath = filePath;
    if (cleanRelPath.startsWith("/uploads/")) {
      cleanRelPath = cleanRelPath.replace(/^\/uploads\//, "");
    } else if (cleanRelPath.startsWith("/")) {
      cleanRelPath = cleanRelPath.slice(1);
    }

    const fullPath = path.resolve(uploadBaseDir, cleanRelPath);

    // Security check: ensure path is strictly within uploadBaseDir
    if (!fullPath.startsWith(uploadBaseDir)) {
      console.warn("Attempted file deletion outside upload directory:", fullPath);
      return;
    }

    if (fs.existsSync(fullPath)) {
      await unlink(fullPath);
      console.log(`Deleted media file from disk: ${fullPath}`);
    }
  } catch (err) {
    console.warn(`Could not delete media file ${filePath}:`, err);
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 190);
}

export async function getVehicleById(id: number) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        photos: { orderBy: { sort_order: "asc" } },
      },
    });
    if (!vehicle) return null;
    // Convert BigInt to number for JSON serialization, and price_bdt from paisa to BDT
    return {
      ...vehicle,
      price_bdt: vehicle.price_bdt ? Number(vehicle.price_bdt) / 100 : null,
      landed_cost: vehicle.landed_cost ? Number(vehicle.landed_cost) : null,
    };
  } catch (error) {
    console.error("Failed to fetch vehicle:", error);
    return null;
  }
}

export async function saveVehicle(id: number | null, formData: FormData) {
  try {
    const carName = (formData.get("car_name") as string || "").trim();
    const chassis = (formData.get("chassis_code") as string || "").trim();

    if (!carName) {
      return { success: false, error: "Car Brand and Specs is mandatory." };
    }
    if (!chassis) {
      return { success: false, error: "Chassis Code is mandatory." };
    }

    // Check unique chassis code if creating new
    if (!id) {
      const existingChassis = await prisma.vehicle.findUnique({
        where: { chassis_code: chassis },
      });
      if (existingChassis) {
        return { success: false, error: `Vehicle with Chassis Code "${chassis}" already exists in inventory (ID #${existingChassis.id}).` };
      }
    }

    // Parse numeric & bigInt fields safely
    const rawPrice = formData.get("price_bdt");
    let priceBdt: bigint | null = null;
    if (rawPrice) {
      const digitsOnly = String(rawPrice).replace(/[^0-9]/g, "");
      if (digitsOnly) {
        priceBdt = BigInt(digitsOnly) * BigInt(100);
      }
    }

    const rawYom = formData.get("year_of_manufacture");
    const yearOfManufacture = rawYom ? parseInt(String(rawYom).replace(/[^0-9]/g, ""), 10) : null;

    const rawMileage = formData.get("mileage_km");
    const mileageKm = rawMileage ? parseInt(String(rawMileage).replace(/[^0-9]/g, ""), 10) : null;

    const rawEngineCc = formData.get("engine_cc");
    const engineCc = rawEngineCc ? parseInt(String(rawEngineCc).replace(/[^0-9]/g, ""), 10) : null;

    let bodyType = (formData.get("body_type") as string || "").trim();
    if (bodyType === "HIACE-Van") bodyType = "HIACE_Van";

    let fuelType = (formData.get("fuel_type") as string || "").trim();
    if (fuelType === "Petrol-Hybrid") fuelType = "Hybrid";

    const status = (formData.get("status") as string || "available").trim();
    const isFeatured = formData.get("is_featured") === "1";
    const description = (formData.get("description") as string || "").trim() || null;
    const packageTrim = (formData.get("package_trim") as string || "").trim() || null;
    const colorName = (formData.get("color_name") as string || "").trim() || null;
    const auctionGrade = (formData.get("auction_grade") as string || "").trim() || null;
    const transmission = (formData.get("transmission") as string || "").trim() || null;

    // Handle photo uploads
    const photoFiles = formData.getAll("photos[]") as File[];
    const validPhotos = photoFiles.filter(f => f instanceof File && f.size > 0);
    const uploadedPaths: string[] = [];

    if (validPhotos.length > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "vehicles", new Date().toISOString().slice(0, 7));
      await mkdir(uploadDir, { recursive: true });

      for (const file of validPhotos) {
        const ext = path.extname(file.name) || ".jpg";
        const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
        const filePath = path.join(uploadDir, safeName);
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, buffer);
        uploadedPaths.push(`vehicles/${new Date().toISOString().slice(0, 7)}/${safeName}`);
      }
    }

    if (id) {
      // ── EDIT VEHICLE ──
      const updateData: Record<string, unknown> = {
        car_name: carName,
        package_trim: packageTrim,
        year_of_manufacture: yearOfManufacture,
        color_name: colorName,
        chassis_code: chassis,
        mileage_km: mileageKm,
        auction_grade: auctionGrade,
        transmission: transmission,
        engine_cc: engineCc,
        body_type: (bodyType as any) || null,
        fuel_type: (fuelType as any) || null,
        status: status as any,
        price_bdt: priceBdt,
        description: description,
        is_featured: isFeatured,
      };

      if (uploadedPaths.length > 0) {
        // Clean up old uploaded files from disk
        const oldPhotos = await prisma.vehiclePhoto.findMany({ where: { vehicle_id: id } });
        const existingVehicle = await prisma.vehicle.findUnique({ where: { id }, select: { cover_photo: true } });

        const oldFilesToDelete = new Set<string>();
        if (existingVehicle?.cover_photo && !uploadedPaths.includes(existingVehicle.cover_photo)) {
          oldFilesToDelete.add(existingVehicle.cover_photo);
        }
        for (const p of oldPhotos) {
          if (p.file_path && !uploadedPaths.includes(p.file_path)) {
            oldFilesToDelete.add(p.file_path);
          }
        }
        for (const f of oldFilesToDelete) {
          await safeDeleteUploadedFile(f);
        }

        updateData.cover_photo = uploadedPaths[0];
        await prisma.vehiclePhoto.deleteMany({ where: { vehicle_id: id } });
        await prisma.$transaction(
          uploadedPaths.map((p, idx) =>
            prisma.vehiclePhoto.create({
              data: {
                vehicle_id: id,
                file_path: p,
                is_cover: idx === 0,
                sort_order: idx,
              },
            })
          )
        );
      }

      await prisma.vehicle.update({
        where: { id },
        data: updateData as Parameters<typeof prisma.vehicle.update>[0]["data"],
      });

      // Auto-manage sales record when status changes
      if (status === "sold") {
        const existingSale = await prisma.sale.findFirst({ where: { vehicle_id: id } });
        if (!existingSale) {
          await prisma.sale.create({
            data: {
              vehicle_id: id,
              car_name: carName,
              chassis_code: chassis,
              sale_price_bdt: priceBdt,
              client_area: "Direct Sale",
              payment_status: "cleared",
              delivery_status: "delivered",
              sale_date: new Date(),
            },
          });
        }
      } else {
        await prisma.sale.deleteMany({ where: { vehicle_id: id } });
      }
    } else {
      // ── ADD NEW VEHICLE ──
      const chassisLast6 = chassis.replace(/[^a-zA-Z0-9]/g, "").slice(-6) || "000000";
      const baseSlug = generateSlug(`${carName}-${chassisLast6}`);
      let uniqueSlug = baseSlug;
      let counter = 1;
      while (await prisma.vehicle.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${baseSlug}-${counter++}`;
      }

      const brand = carName.split(" ")[0] || "Unknown";

      const vehicle = await prisma.vehicle.create({
        data: {
          car_name: carName,
          package_trim: packageTrim,
          year_of_manufacture: yearOfManufacture,
          color_name: colorName,
          chassis_code: chassis,
          mileage_km: mileageKm,
          auction_grade: auctionGrade,
          transmission: transmission,
          engine_cc: engineCc,
          body_type: (bodyType as any) || null,
          fuel_type: (fuelType as any) || null,
          status: status as any,
          price_bdt: priceBdt,
          description: description,
          is_featured: isFeatured,
          slug: uniqueSlug,
          brand,
          cover_photo: uploadedPaths[0] || null,
        },
      });

      // Insert gallery photos
      if (uploadedPaths.length > 0) {
        await prisma.$transaction(
          uploadedPaths.map((p, idx) =>
            prisma.vehiclePhoto.create({
              data: {
                vehicle_id: vehicle.id,
                file_path: p,
                is_cover: idx === 0,
                sort_order: idx,
              },
            })
          )
        );
      }
    }

    try {
      revalidatePath("/admin/inventory");
      revalidatePath("/admin");
      revalidatePath("/admin/sales-register");
      revalidatePath("/inventory");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to save vehicle:", error);
    const msg = error?.message || String(error);
    return { success: false, error: msg };
  }
}

export async function deleteVehicle(id: number) {
  try {
    // 1. Fetch vehicle and all associated photos before deleting from database
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: { photos: true },
    });

    if (!vehicle) {
      return { success: false, error: "Vehicle not found." };
    }

    // 2. Collect all uploaded media files associated with this vehicle
    const filesToDelete = new Set<string>();
    if (vehicle.cover_photo) {
      filesToDelete.add(vehicle.cover_photo);
    }
    if (vehicle.photos && vehicle.photos.length > 0) {
      for (const p of vehicle.photos) {
        if (p.file_path) {
          filesToDelete.add(p.file_path);
        }
      }
    }

    // 3. Delete physical files from disk
    for (const f of filesToDelete) {
      await safeDeleteUploadedFile(f);
    }

    // 4. Delete vehicle from database (Prisma onDelete: Cascade handles photos, SetNull handles sales/pipeline)
    await prisma.vehicle.delete({ where: { id } });

    revalidatePath("/admin/inventory");
    revalidatePath("/admin");
    revalidatePath("/admin/sales-register");
    revalidatePath("/inventory");
    revalidatePath("/stock");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete vehicle:", error);
    const msg = error?.message || String(error);
    return { success: false, error: msg };
  }
}
