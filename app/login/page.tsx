import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-8">
        <div className="microlabel text-primary">Closer Clinic</div>
        <h1 className="display mt-3 text-[40px] text-ink">
          Walk
          <br />
          back in.
        </h1>
        <p className="mt-2 text-[15px] text-dim">Your patients are waiting.</p>
      </div>
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </main>
  );
}
