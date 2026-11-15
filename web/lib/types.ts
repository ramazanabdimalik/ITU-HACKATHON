export type RiskLevel = "low" | "medium" | "high";
export type RiskAction = "allow" | "confirm" | "hold";
export type SignalId =
  | "new_recipient"
  | "large_amount"
  | "unusual_hour"
  | "new_device"
  | "velocity"
  | "flagged_recipient"
  | "structuring";

export interface Customer {
  id: string;
  name: string;
  avgTransferAmount: number;
  /** Local hours in Asia/Almaty, start inclusive and end exclusive. */
  typicalHours: [number, number];
  knownDeviceIds: string[];
  knownRecipientIds: string[];
  homeCity: string;
}

export interface Recipient {
  id: string;
  name: string;
  maskedAccount: string;
  flagged: boolean;
}

export interface RiskSignal {
  id: SignalId;
  weight: number;
  params: Record<string, string | number>;
}

export interface RiskResult {
  score: number;
  level: RiskLevel;
  action: RiskAction;
  signals: RiskSignal[];
}

export interface Transaction {
  id: string;
  customerId: string;
  recipientId: string;
  /** Amount in KZT. */
  amount: number;
  timestamp: string;
  deviceId: string;
  city: string;
  status: "completed" | "held" | "blocked" | "pending_review";
  riskScore: number;
  riskLevel: RiskLevel;
  signals: RiskSignal[];
}

export type TransactionInput = Pick<
  Transaction,
  "customerId" | "recipientId" | "amount" | "timestamp" | "deviceId" | "city"
> & { id?: string };

export interface MockData {
  customers: Customer[];
  recipients: Recipient[];
  transactions: Transaction[];
}
