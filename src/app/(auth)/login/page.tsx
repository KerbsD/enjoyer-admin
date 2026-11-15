import { Suspense } from "react";
import Login from "@/modules/Auth/Login";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="screen-center">Loading sign in…</div>}>
      <Login />
    </Suspense>
  );
}
