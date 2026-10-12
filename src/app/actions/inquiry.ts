"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendInquiryNotification, sendPreOrderNotification } from "@/lib/email";
import { emitAdminEvent } from "@/lib/events";

// ── Inquiries ──

export async function getInquiryById(id: number) {
  try {
    const data = await prisma.inquiry.findUnique({ where: { id } });
    if (!data) return null;

    // Auto-mark as 'contacted' when viewed (matching legacy logic)
    if (data.status === "new") {
      await prisma.inquiry.update({
        where: { id },
        data: { status: "contacted" },
      });
    }

    revalidatePath("/admin/inquiries");
    return data;
  } catch (error) {
    console.error("Failed to fetch inquiry:", error);
    return null;
  }
}

export async function createInquiry(data: {
  full_name: string;
  phone?: string | null;
  email?: string | null;
  interested_in?: string | null;
  message?: string | null;
  vehicle_id?: number | null;
  type?: "contact" | "booking" | "general";
}) {
  try {
    if (!data.full_name?.trim()) {
      return { success: false, error: "Full Name is required" };
    }
    if (!data.phone?.trim() && !data.email?.trim()) {
      return { success: false, error: "Please provide either a phone number or email" };
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        full_name: data.full_name.trim(),
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        interested_in: data.interested_in?.trim() || "General Fleet",
        message: data.message?.trim() || null,
        vehicle_id: data.vehicle_id || null,
        type: data.type || (data.vehicle_id ? "booking" : "contact"),
        status: "new",
      },
    });

    // Trigger outbound SMTP notification asynchronously
    sendInquiryNotification({
      id: inquiry.id,
      type: inquiry.type,
      full_name: inquiry.full_name,
      phone: inquiry.phone,
      email: inquiry.email,
      interested_in: inquiry.interested_in,
      message: inquiry.message,
      vehicle_id: inquiry.vehicle_id,
    }).catch((err) => console.error("[Inquiry Email Error]:", err));

    // Broadcast real-time live sync event to connected admin tabs
    emitAdminEvent({
      id: `inq-${inquiry.id}`,
      type: "inquiry:new",
      title: inquiry.full_name,
      subtitle: `New Inquiry: ${inquiry.interested_in || "General Fleet"}`,
      link: "/admin/inquiries?tab=inquiries",
      timestamp: inquiry.created_at.toISOString(),
      data: {
        id: inquiry.id,
        full_name: inquiry.full_name,
        phone: inquiry.phone,
        email: inquiry.email,
        interested_in: inquiry.interested_in,
      },
    });

    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");
    return { success: true, inquiryId: inquiry.id };
  } catch (error) {
    console.error("Failed to create inquiry:", error);
    return { success: false, error: "Failed to submit inquiry. Please try again." };
  }
}

export async function deleteInquiry(id: number) {
  try {
    await prisma.inquiry.delete({ where: { id } });

    emitAdminEvent({
      id: `del-inq-${id}`,
      type: "inquiry:deleted",
      title: "Inquiry Removed",
      subtitle: `Inquiry #${id} removed`,
      link: "/admin/inquiries?tab=inquiries",
      timestamp: new Date().toISOString(),
      data: { id },
    });

    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete inquiry:", error);
    return { success: false, error: "Failed to delete inquiry" };
  }
}

// ── Pre-Orders ──

export async function getPreOrderById(id: number) {
  try {
    const data = await prisma.preOrder.findUnique({ where: { id } });
    if (!data) return null;

    // Auto-mark as 'sourcing' when viewed (matching legacy logic)
    if (data.status === "new") {
      await prisma.preOrder.update({
        where: { id },
        data: { status: "sourcing" },
      });
    }

    revalidatePath("/admin/inquiries");
    return {
      ...data,
      budget_min_bdt: data.budget_min_bdt ? Number(data.budget_min_bdt) : null,
      budget_max_bdt: data.budget_max_bdt ? Number(data.budget_max_bdt) : null,
    };
  } catch (error) {
    console.error("Failed to fetch pre-order:", error);
    return null;
  }
}

export async function createPreOrder(data: {
  full_name: string;
  phone: string;
  email?: string | null;
  whatsapp?: string | null;
  make_model: string;
  region_of_origin?: string | null;
  body_style?: string | null;
  year_from?: number | null;
  year_to?: number | null;
  budget_min_bdt?: bigint | number | null;
  budget_max_bdt?: bigint | number | null;
  timeline?: string | null;
  color_preference?: string | null;
  additional_notes?: string | null;
}) {
  try {
    if (!data.full_name?.trim()) {
      return { success: false, error: "Full Name is required" };
    }
    if (!data.phone?.trim()) {
      return { success: false, error: "Phone number is required" };
    }
    if (!data.make_model?.trim()) {
      return { success: false, error: "Vehicle Make & Model is required" };
    }

    const preOrder = await prisma.preOrder.create({
      data: {
        full_name: data.full_name.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim() || null,
        whatsapp: data.whatsapp?.trim() || null,
        make_model: data.make_model.trim(),
        region_of_origin: data.region_of_origin?.trim() || null,
        body_style: data.body_style?.trim() || null,
        year_from: data.year_from || null,
        year_to: data.year_to || null,
        budget_min_bdt: data.budget_min_bdt ? BigInt(data.budget_min_bdt) : null,
        budget_max_bdt: data.budget_max_bdt ? BigInt(data.budget_max_bdt) : null,
        timeline: data.timeline?.trim() || null,
        color_preference: data.color_preference?.trim() || null,
        additional_notes: data.additional_notes?.trim() || null,
        status: "new",
      },
    });

    // Trigger outbound SMTP notification asynchronously
    sendPreOrderNotification({
      id: preOrder.id,
      full_name: preOrder.full_name,
      phone: preOrder.phone,
      email: preOrder.email,
      whatsapp: preOrder.whatsapp,
      make_model: preOrder.make_model,
      region_of_origin: preOrder.region_of_origin,
      body_style: preOrder.body_style,
      year_from: preOrder.year_from,
      year_to: preOrder.year_to,
      budget_min_bdt: preOrder.budget_min_bdt,
      budget_max_bdt: preOrder.budget_max_bdt,
      timeline: preOrder.timeline,
      color_preference: preOrder.color_preference,
      additional_notes: preOrder.additional_notes,
    }).catch((err) => console.error("[PreOrder Email Error]:", err));

    // Broadcast real-time live sync event to connected admin tabs
    emitAdminEvent({
      id: `po-${preOrder.id}`,
      type: "pre_order:new",
      title: preOrder.full_name,
      subtitle: `Pre-Order: ${preOrder.make_model}`,
      link: "/admin/inquiries?tab=pre_orders",
      timestamp: preOrder.created_at.toISOString(),
      data: {
        id: preOrder.id,
        full_name: preOrder.full_name,
        phone: preOrder.phone,
        make_model: preOrder.make_model,
      },
    });

    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");
    return { success: true, preOrderId: preOrder.id };
  } catch (error) {
    console.error("Failed to create pre-order:", error);
    return { success: false, error: "Failed to submit pre-order. Please try again." };
  }
}

export async function deletePreOrder(id: number) {
  try {
    await prisma.preOrder.delete({ where: { id } });

    emitAdminEvent({
      id: `del-po-${id}`,
      type: "pre_order:deleted",
      title: "Pre-Order Removed",
      subtitle: `Pre-Order #${id} removed`,
      link: "/admin/inquiries?tab=pre_orders",
      timestamp: new Date().toISOString(),
      data: { id },
    });

    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete pre-order:", error);
    return { success: false, error: "Failed to delete pre-order" };
  }
}
