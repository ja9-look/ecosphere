import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AuthForm } from "../../../components/auth/AuthForm";
import { authOptions, validOnboardStatus } from "../../../lib/auth";

export default async function SignUpPage() {
  const session = await getServerSession(authOptions);

  if (session && (await validOnboardStatus(session))) {
    redirect("/dashboard");
  }

  if (session && !(await validOnboardStatus(session))) {
    redirect("/setup-pin");
  }

  return <AuthForm isSignIn={false} />;
}
