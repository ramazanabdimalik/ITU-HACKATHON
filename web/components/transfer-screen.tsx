"use client";
import { useState } from "react";
import type { Recipient } from "@/lib/types";
import { emptyForm } from "@/lib/transfer-form";
import { TransferForm } from "./transfer-form";
import { AccountCard } from "./account-card";
import { useApp } from "./app-shell";

export function TransferScreen({ recipients }: { recipients: Recipient[] }) {
  const [values, setValues] = useState(emptyForm);
  const { copy } = useApp();
  return <><div className="mb-8"><p className="mb-3 text-xs font-semibold tracking-[.16em] text-accent">{copy.eyebrow}</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{copy.title}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted">{copy.subtitle}</p></div><AccountCard /><TransferForm values={values} recipients={recipients} onChange={(patch) => setValues({ ...values, ...patch })} onSubmit={() => {}} /></>;
}
