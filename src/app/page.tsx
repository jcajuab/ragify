import { redirect } from "next/navigation";
import { LoginForm } from "@/app/_components/login-form";
import { getSession } from "@/server/auth/utils";

export default async function Page() {
  const session = await getSession();
  if (session) redirect("/chat/new");

  return (
    <main className="relative isolate flex min-h-svh flex-col items-center justify-center p-4">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 20%, rgba(0, 0, 0, 0.0) 60%)",
        }}
      />
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </main>
  );
}
