"use client";

import { useRouter } from "next/navigation";

export function EditStockInwardButton({ recordId }: { recordId: number }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/admin/stock-inward?modal=add-stock-inward&edit_inward=${recordId}`);
  };

  return (
    <button
      type="button"
      className="btn-modern-outline"
      style={{ padding: "6px 14px", fontSize: "12px" }}
      onClick={handleClick}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>edit</span>
      <span>Edit</span>
    </button>
  );
}
