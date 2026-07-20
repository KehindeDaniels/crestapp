"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, type buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSendMessage } from "@/features/messaging";
import type { VariantProps } from "class-variance-authority";
import type { ID } from "@/types/api";

/**
 * Real send — `POST /api/communication/messages/send`. `reference_id`/
 * `reference_type` are set here since this message is genuinely about a
 * specific property, unlike a plain reply in `/messages`. "Open Chat"
 * deep-links into the real inbox (`/messages?with={ownerId}`), which now
 * exists — this dialog used to be the only way to message an owner at all;
 * now it's a shortcut that also drops you into the full thread.
 */
export function MessageOwnerButton({
  ownerId,
  propertyId,
  ownerName,
  label = "Message Owner",
  variant = "outline",
  size,
  className,
}: {
  ownerId: ID;
  propertyId: ID;
  ownerName: string;
  label?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const sendMessage = useSendMessage();

  function handleSend() {
    if (!content.trim()) return;
    sendMessage.mutate(
      {
        recipient_id: ownerId,
        content: content.trim(),
        message_type: "text",
        attachments: [],
        reference_id: propertyId,
        reference_type: "property",
      },
      {
        onSuccess: () => {
          setOpen(false);
          setContent("");
        },
      },
    );
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn(className)}
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
      >
        {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message {ownerName}</DialogTitle>
            <DialogDescription>Send a message about this property.</DialogDescription>
          </DialogHeader>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="I'm interested in this property..."
            rows={4}
            className="w-full rounded-lg border bg-muted p-3 text-sm outline-none focus-visible:border-ring"
          />

          {sendMessage.isError && (
            <p className="text-sm text-destructive">
              Couldn&apos;t send that message — try again.
            </p>
          )}

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              onClick={handleSend}
              disabled={!content.trim() || sendMessage.isPending}
              className="w-full"
            >
              {sendMessage.isPending ? "Sending…" : "Send message"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/messages?with=${ownerId}`)}
            >
              Open Chat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
