"use client"

import { QueryClientProvider as __QueryClientProvider } from "@tanstack/react-query"
import { getQueryClient } from "@/lib/get-query-client"

type QueryClientProviderProps = {
  children: React.ReactNode
}

export function QueryClientProvider({ children }: QueryClientProviderProps) {
  const queryClient = getQueryClient()

  return (
    <__QueryClientProvider client={queryClient}>
      {children}
    </__QueryClientProvider>
  )
}
