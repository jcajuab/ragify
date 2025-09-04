"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { SendIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useChatMutation } from "@/hooks/use-chat-mutation"

const formSchema = z.object({
  website: z.url("Please input a valid URL"),
})

type FormValues = z.infer<typeof formSchema>

export function NewChat() {
  const router = useRouter()
  const { createChat } = useChatMutation()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { website: "" },
    mode: "onChange",
  })

  function handleSubmit({ website }: FormValues) {
    toast.promise(createChat.mutateAsync(website), {
      loading: `Creating chat...`,
      success: (chatId) => {
        router.push(`/chat/${chatId}`)
        return "Created successfully!"
      },
      error: "Uh oh, something went wrong. Try again later!",
    })
  }

  return (
    <main className="relative isolate flex h-svh flex-1 flex-col">
      <div
        className="-z-10 pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 140% 50% at 15% 60%, rgba(124, 58, 237, 0.11), transparent 48%),
            radial-gradient(ellipse 90% 80% at 85% 25%, rgba(245, 101, 101, 0.09), transparent 58%),
            radial-gradient(ellipse 120% 65% at 40% 90%, rgba(34, 197, 94, 0.13), transparent 52%),
            radial-gradient(ellipse 100% 45% at 70% 5%, rgba(251, 191, 36, 0.07), transparent 42%),
            radial-gradient(ellipse 80% 75% at 90% 80%, rgba(168, 85, 247, 0.10), transparent 55%),
            #000000
          `,
        }}
      />

      <header className="flex h-(--header-height) shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="font-medium">Ragify</h1>
      </header>

      <div className="mx-auto w-full max-w-2xl space-y-12 p-4 pt-[10vh] pb-8 md:pt-[20vh]">
        <h1 className="text-center font-bold text-4xl">
          Paste a link and let's go
        </h1>
        <Form {...form}>
          <form
            className="flex gap-2"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      placeholder="https://en.wikipedia.org/wiki/Retrieval-augmented_generation"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!form.formState.isValid}
            >
              <SendIcon />
            </Button>
          </form>
        </Form>
      </div>
    </main>
  )
}
