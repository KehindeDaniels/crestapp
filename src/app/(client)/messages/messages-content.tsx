"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, CheckCheck, ChevronLeft, MessageCircle, Paperclip, Search, Send, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";
import { usePropertyDetail } from "@/features/properties";
import { useProfile } from "@/features/profile";
import {
  useConversations,
  useConversationThread,
  useSendMessage,
  useMarkAsRead,
  type ConversationModel,
  type MessageModel,
} from "@/features/messaging";

const RECENT_WINDOW_MS = 48 * 60 * 60 * 1000;

/**
 * Rebuilt from real screenshots (docs/design/screenshots/messages/), not a
 * live Figma pull — Figma's per-session tool-call limit was hit before this
 * could be pulled. Conversation-list/thread response shapes are unconfirmed
 * (no saved example in the Postman collection for any of these endpoints,
 * unlike `Send Message`) — see docs/design-vs-backend-gaps.md.
 *
 * No real-time/broadcasting backend exists — polling via `refetchInterval`
 * (see hooks.ts), matching how this app already fakes "feels live"
 * elsewhere (notifications), not a new pattern.
 *
 * "All"/"Recents" tabs and the search box are client-side only — no
 * confirmed backend param distinguishes them; `Search Messages` searches
 * message *content* server-side, not contact names, so it isn't used here.
 */
export function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedUserId = searchParams.get("with") ? Number(searchParams.get("with")) : null;

  const {
    data: conversations,
    isLoading: conversationsLoading,
    isError: conversationsError,
    error: conversationsErrorDetail,
  } = useConversations();
  const { data: messages, isLoading: threadLoading } = useConversationThread(selectedUserId);
  const { data: myProfile } = useProfile();
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | "recents">("all");
  const [draft, setDraft] = useState("");
  // Lazy init (not a bare `Date.now()` call during render) — a "recent" cutoff
  // fixed at mount is precise enough for a client-side tab filter.
  const [recentCutoff] = useState(() => Date.now() - RECENT_WINDOW_MS);

  const selectedConversation = conversations?.find((c) => c.userId === selectedUserId);

  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    let list = conversations;
    if (tab === "recents") {
      list = list.filter((c) => new Date(c.lastMessageAt).getTime() > recentCutoff);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    return list;
  }, [conversations, tab, query, recentCutoff]);

  // Mark unread messages from the other participant as read once the thread loads.
  useEffect(() => {
    if (!messages) return;
    for (const m of messages) {
      if (!m.isMine && !m.isRead) markAsRead.mutate(m.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  function selectConversation(userId: number) {
    router.push(`/messages?with=${userId}`);
  }

  function handleSend() {
    if (!draft.trim() || !selectedUserId) return;
    sendMessage.mutate(
      {
        recipient_id: selectedUserId,
        content: draft.trim(),
        message_type: "text",
        attachments: [],
      },
      { onSuccess: () => setDraft("") },
    );
  }

  return (
    <div className="flex h-[calc(100vh-5.125rem)]">
      <div
        className={cn(
          "w-full shrink-0 border-r sm:flex sm:w-90 sm:flex-col",
          selectedUserId ? "hidden" : "flex flex-col",
        )}
      >
        <div className="space-y-4 border-b p-4">
          <h1 className="text-xl font-bold">All Chats</h1>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="bg-muted pl-9"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "recents"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium capitalize",
                  tab === t ? "bg-muted text-foreground" : "text-muted-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversationsLoading && (
            <p className="p-4 text-sm text-muted-foreground">Loading…</p>
          )}
          {conversationsError && !conversationsLoading && (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
              <p className="text-sm font-medium text-destructive">Couldn&apos;t load your chats</p>
              <p className="text-xs text-muted-foreground">
                {conversationsErrorDetail instanceof Error
                  ? conversationsErrorDetail.message
                  : "Something went wrong. Pull to refresh or try again shortly."}
              </p>
            </div>
          )}
          {!conversationsError && filteredConversations.length === 0 && !conversationsLoading && (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
              <MessageCircle className="size-12 text-muted-foreground/40" />
              <p className="text-base font-semibold">No messages yet</p>
              <p className="text-sm text-muted-foreground">
                Start a conversation with a property owner to see your chats here
              </p>
            </div>
          )}
          {filteredConversations.map((conversation) => (
            <ConversationRow
              key={conversation.userId}
              conversation={conversation}
              isSelected={conversation.userId === selectedUserId}
              onClick={() => selectConversation(conversation.userId)}
            />
          ))}
        </div>
      </div>

      <div
        className={cn(
          "flex-1 flex-col sm:flex",
          selectedUserId ? "flex" : "hidden",
        )}
      >
        {!selectedUserId && (
          <div className="hidden h-full flex-col items-center justify-center gap-2 text-center sm:flex">
            <MessageCircle className="size-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Select a conversation to start messaging
            </p>
          </div>
        )}

        {selectedUserId && (
          <>
            <div className="flex items-center gap-3 border-b p-4 sm:hidden">
              <button type="button" onClick={() => router.push("/messages")}>
                <ChevronLeft className="size-5" />
              </button>
              <p className="font-semibold">{selectedConversation?.name ?? "Chat"}</p>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {threadLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
              {messages?.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  senderName={message.isMine ? (myProfile?.displayName ?? "Me") : (selectedConversation?.name ?? "User")}
                  senderAvatarUrl={
                    message.isMine ? (myProfile?.avatarUrl ?? null) : (selectedConversation?.avatarUrl ?? null)
                  }
                />
              ))}
            </div>

            <div className="flex items-center gap-2 border-t p-4">
              <button type="button" disabled className="text-muted-foreground/50" title="Attachments not built yet">
                <Paperclip className="size-5" />
              </button>
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="flex-1 rounded-full bg-muted"
              />
              <Button
                type="button"
                size="icon"
                onClick={handleSend}
                disabled={!draft.trim() || sendMessage.isPending}
                aria-label="Send"
              >
                <Send className="size-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ConversationRow({
  conversation,
  isSelected,
  onClick,
}: {
  conversation: ConversationModel;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 border-b p-4 text-left",
        isSelected && "bg-muted",
      )}
    >
      <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-muted">
        {conversation.avatarUrl ? (
          <Image src={conversation.avatarUrl} alt="" fill className="object-cover" />
        ) : (
          <User className="absolute inset-0 m-auto size-5 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold">{conversation.name}</p>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatDate(conversation.lastMessageAt, { timeStyle: "short" })}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm text-muted-foreground">
            {conversation.lastMessagePreview}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-success text-[10px] font-medium text-white">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/**
 * Self on the right, other participant on the left — per explicit
 * instruction. Note: the Figma reference (node 1539-7104) actually shows its
 * own "Me" bubble on the LEFT in that specific frame, which conflicts with
 * that instruction — kept self-on-the-right here since it's both what was
 * asked for and the standard chat convention; only the bubble's visual
 * details (avatar + name/timestamp/read-check row, referenced-property
 * label) were adopted from that frame.
 */
function MessageBubble({
  message,
  senderName,
  senderAvatarUrl,
}: {
  message: MessageModel;
  senderName: string;
  senderAvatarUrl: string | null;
}) {
  const avatar = (
    <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-muted">
      {senderAvatarUrl ? (
        <Image src={senderAvatarUrl} alt="" fill className="object-cover" />
      ) : (
        <User className="absolute inset-0 m-auto size-4 text-muted-foreground" />
      )}
    </div>
  );

  return (
    <div className={cn("flex w-full gap-2", message.isMine ? "justify-end" : "justify-start")}>
      {!message.isMine && avatar}
      <div className={cn("flex max-w-md flex-col gap-1", message.isMine ? "items-end" : "items-start")}>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-medium">{senderName}</span>
          <span className="text-muted-foreground">
            {formatDate(message.createdAt, { timeStyle: "short" })}
          </span>
          {message.isMine &&
            (message.isRead ? (
              <CheckCheck className="size-3 text-primary" />
            ) : (
              <Check className="size-3 text-muted-foreground" />
            ))}
        </div>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm",
            message.isMine ? "bg-primary text-primary-foreground" : "bg-muted",
          )}
        >
          {message.content}
        </div>
        {message.referencedPropertyId && (
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">This message is related to:</p>
            <ReferencedProperty propertyId={message.referencedPropertyId} />
          </div>
        )}
      </div>
      {message.isMine && avatar}
    </div>
  );
}

function ReferencedProperty({ propertyId }: { propertyId: number }) {
  const { data: property } = usePropertyDetail(propertyId);
  if (!property) return null;

  return (
    <Link
      href={`/properties/view?id=${propertyId}`}
      className="flex max-w-sm items-center gap-3 rounded-xl border bg-background p-2"
    >
      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
        {property.imageUrl && (
          <Image src={property.imageUrl} alt="" fill className="object-cover" />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{property.address}</p>
        <p className="truncate text-xs text-muted-foreground">
          {property.ownerName} · {property.priceFormatted}
        </p>
      </div>
    </Link>
  );
}
