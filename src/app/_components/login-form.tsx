"use client";

import { BotIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/authClient";

export function LoginForm() {
  const handleClick = async () => {
    toast.promise(
      authClient.signIn.social({
        provider: "github",
      }),
      {
        loading: "Signing in with GitHub...",
        success: "Signed in successfully!",
        error: "Oops! Something went wrong.",
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-pretty text-center">
        <BotIcon className="size-8" />
        <span className="sr-only">Ragify</span>
        <h1 className="font-bold text-2xl">Welcome to Ragify</h1>
        <p className="text-muted-foreground">
          Your AI-powered companion for insightful conversations and knowledge
          retrieval.
        </p>
      </div>

      <Separator />

      <Button variant="outline" onClick={handleClick}>
        <Image
          src="/assets/icons/github-icon-light.svg"
          alt="Github icon"
          width={98}
          height={96}
          className="size-5"
        />
        Continue with GitHub
      </Button>
    </div>
  );
}
