import { getSession } from "@/server/auth/utils"
import { listChats } from "@/server/queries/list-chats"

export async function GET() {
  try {
    const session = await getSession()
    if (!session)
      return Response.json({ error: "Unauthorized" }, { status: 401 })

    const chats = await listChats(session.user.id)

    return Response.json(chats)
  } catch (error) {
    console.error("Error fetching chats:", error)
    return Response.json({ error: "Failed to fetch chats" }, { status: 500 })
  }
}
