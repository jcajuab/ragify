import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { Chat } from "@/server/db/types"

export function useChatMutation() {
  const queryClient = useQueryClient()

  const createChat = useMutation({
    mutationFn: async (title: string) => {
      const chatId = await import("@/server/actions/create-chat").then(
        ({ createChat }) => createChat(title),
      )
      return chatId
    },
    onSuccess: (chatId, title) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] })
      queryClient.setQueryData(["chats"], (oldChats: Chat[]) => {
        if (!oldChats) return oldChats
        return [{ id: chatId, title, createdAt: new Date() }, ...oldChats]
      })
    },
  })

  const deleteChat = useMutation({
    mutationFn: async (chatId: string) => {
      const deletedChatId = await import("@/server/actions/delete-chat").then(
        ({ deleteChat: deleteChatAction }) => deleteChatAction(chatId),
      )
      return deletedChatId
    },
    onSuccess: (deletedChatId) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] })
      queryClient.setQueryData(["chats"], (oldChats: Chat[]) => {
        if (!oldChats) return oldChats
        return oldChats.filter((chat) => chat.id !== deletedChatId)
      })
    },
  })

  return { createChat, deleteChat }
}
