import { TransferScreen } from "@/components/transfer-screen";
import { mockData } from "@/lib/mock-data";
export default function Home() { return <TransferScreen recipients={mockData.recipients} />; }
