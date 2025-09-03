import { redirect } from "next/navigation";
import { getSession } from "@/server/auth/utils";

export default async function Page({ params }: PageProps<"/chat/[id]">) {
  const session = await getSession();
  if (!session) redirect("/");

  const { id } = await params;

  return <p>Hello, {id}!</p>;
}
