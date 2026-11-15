import { BankDashboard } from "@/components/bank/dashboard";
import { mockData } from "@/lib/mock-data";
export default function Dashboard() { return <BankDashboard customers={mockData.customers} recipients={mockData.recipients} />; }
