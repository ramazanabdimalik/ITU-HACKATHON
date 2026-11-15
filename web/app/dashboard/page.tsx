import { BankDashboard } from "@/components/bank/dashboard";
import { mockData } from "@/lib/mock-data";
import { pageMetadata } from "@/lib/page-metadata";
export const metadata = pageMetadata("bank");
export default function Dashboard() { return <BankDashboard customers={mockData.customers} recipients={mockData.recipients} />; }
