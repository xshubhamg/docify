import { SignupForm } from "@/components/signup-form";
import { isGoogleAuthEnabled } from "@/lib/env";

export default function SignupPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-(--bg-primary) p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <SignupForm googleEnabled={isGoogleAuthEnabled} />
      </div>
    </div>
  );
}
