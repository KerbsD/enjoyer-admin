import { Guard } from "@/components/auth/Guard";
import { AppShell } from "@/components/layout/AppShell";
export default function DashboardLayout({ children }: { children: React.ReactNode }) { return <Guard><AppShell>{children}</AppShell></Guard>; }
