import { Suspense } from "react";
import { SignupForm } from "../_components/signup-form";

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
