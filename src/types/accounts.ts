import { type Account } from "@/api/accounts";

interface AccountCardProps {
  account: Account;
  onNotice: (notice: string) => void;
}

interface AccountFormProps {
  account?: Account;
  onClose: () => void;
  onNotice: (notice: string) => void;
}

export type { AccountCardProps, AccountFormProps };
