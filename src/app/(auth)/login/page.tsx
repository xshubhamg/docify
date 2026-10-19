import { LoginForm } from "@/components/login-form";
import { isGoogleAuthEnabled } from "@/lib/env";

export default function LoginPage() {
  return (
    <main
      id="main-content"
      className="flex min-h-svh flex-col items-center justify-center bg-(--bg-primary) p-6 md:p-10"
    >
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm googleEnabled={isGoogleAuthEnabled} />
      </div>
    </main>
  );
}
