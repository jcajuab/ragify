import { redirect } from "next/navigation";
import { getSession } from "@/server/auth/utils";

export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/");

  return <p>Hello, World!</p>;
}
