import { NextResponse } from "next/server";
import { saveVehicle, deleteVehicle } from "@/app/actions/vehicle";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");
    const id = idParam ? parseInt(idParam, 10) : null;

    const result = await saveVehicle(id, formData);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API save vehicle error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save vehicle" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");
    if (!idParam) {
      return NextResponse.json({ success: false, error: "Vehicle ID is required" }, { status: 400 });
    }
    const id = parseInt(idParam, 10);
    const result = await deleteVehicle(id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API delete vehicle error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete vehicle" },
      { status: 500 }
    );
  }
}
