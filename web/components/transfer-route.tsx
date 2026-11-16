"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "./app-shell";
import { TransferScreen } from "./transfer-screen";
import { transferPrefill } from "@/lib/transfer-prefill";
export function TransferRoute() {
  const params = useSearchParams();
  const { customer, customers, recipients, setCustomerId } = useApp();
  const target = customers.find((c) => c.id === params.get("customerId"));
  useEffect(() => { if (target) { const frame = requestAnimationFrame(() => setCustomerId(target.id)); return () => cancelAnimationFrame(frame); } }, [target, setCustomerId]);
  return <TransferScreen key={`${customer.id}-${params.toString()}`} recipients={recipients} prefill={transferPrefill(params, customer, recipients)} />;
}
