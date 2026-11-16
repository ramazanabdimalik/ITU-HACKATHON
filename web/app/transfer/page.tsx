import { Suspense } from "react";
import { TransferRoute } from "@/components/transfer-route";
import { pageMetadata } from "@/lib/page-metadata";
export const metadata = pageMetadata("transfer");
export default function Transfer() { return <Suspense><TransferRoute /></Suspense>; }
