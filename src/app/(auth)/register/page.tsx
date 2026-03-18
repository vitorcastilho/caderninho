import { Suspense } from "react";

import { RegisterForm } from "@/client/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
