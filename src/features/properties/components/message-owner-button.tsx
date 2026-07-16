"use client";

import { useState } from "react";
import { Button, type buttonVariants } from "@/components/ui/button";
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
 * Real send, per explicit decision — POST /api/communication/messages/send
 * actually fires, even though no inbox/thread UI exists yet to view the
 * reply (see docs/design-vs-backend-gaps.md). Kept as a simple compose
 * dialog rather than a canned one-click message, since there's no thread to
 * continue the conversation in afterward — the message needs to say
 * something on its own.
 */
export function MessageOwnerButton({
  ownerId,
  propertyId,
  ownerName,
  label = "Message Owner",
  variant = "outline",
}: {
  ownerId: ID;
  propertyId: ID;
  ownerName: string;
  label?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
}) {
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
            <DialogDescription>
              Send a message about this property. There&apos;s no inbox yet
              to view replies — this just sends the message.
            </DialogDescription>
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
          {sendMessage.isSuccess && (
            <p className="text-sm text-success">Message sent.</p>
          )}

          <Button
            type="button"
            onClick={handleSend}
            disabled={!content.trim() || sendMessage.isPending}
            className="w-full"
          >
            {sendMessage.isPending ? "Sending…" : "Send"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
