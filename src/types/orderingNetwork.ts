export type OrderingNetwork = {
  enabled: boolean;
  address: string | null;
  detectedAddress: string | null;
  terminalEnrolled: boolean;
  thisTerminal: boolean;
  updatedAt: string | null;
};

export type OrderingNetworkChange =
  { action: "override"; address: string } | { action: "disable" };
