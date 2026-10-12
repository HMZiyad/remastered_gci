"use client";

import { deleteVehicle } from "@/app/actions/vehicle";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteVehicleButton({ vehicleId }: { vehicleId: number }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this vehicle? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteVehicle(vehicleId);
      if (result.success) {
        router.refresh();
      } else {
        alert("Failed to delete vehicle: " + result.error);
      }
    } catch {
      alert("An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      className="action-icon-btn danger"
      style={{ opacity: isDeleting ? 0.5 : 1 }}
      title="Delete Vehicle"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
        {isDeleting ? "hourglass_empty" : "delete"}
      </span>
    </button>
  );
}
