"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  ChevronRight,
  CreditCard,
  FileText,
  Heart,
  HelpCircle,
  History as HistoryIcon,
  IdCard,
  Info,
  List,
  Lock,
  Scale,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFullProfile } from "@/features/profile";
import { useMyKycStatus } from "@/features/kyc";
import { EditProfileDialog } from "./edit-profile-dialog";
import { PaymentMethodDialog } from "./payment-method-dialog";
import { NotificationsDialog } from "./notifications-dialog";
import { ChangePasswordDialog } from "./change-password-dialog";

/**
 * Built from real screenshots (docs/design/screenshots/profile/), not a live
 * Figma pull. See docs/design-vs-backend-gaps.md, Phase 12 for what's real
 * vs. simplified vs. omitted — the short version: Profile view/edit, Payment
 * Method (bank account), Notifications, Change password, and My listing are
 * all real; "Uploaded document" and the Legal section's 3 links have no
 * confirmed backend support and are shown disabled rather than faked.
 */
export function ProfileContent() {
  const { data: profile, isPending } = useFullProfile();
  const { data: kycStatus } = useMyKycStatus();
  const isVerified = kycStatus === "approved";
  const [editOpen, setEditOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  // Bumped only when a dialog opens (never on close) and passed as its
  // `key` below — forces a fresh remount so pre-filled form state
  // (name/bank details/preferences) always starts from the latest server
  // data instead of stale edits left over from a previous open. Avoids
  // resetting state in a `useEffect`, which this repo's lint config
  // disallows (react-hooks/set-state-in-effect).
  const [editRevision, setEditRevision] = useState(0);
  const [paymentRevision, setPaymentRevision] = useState(0);
  const [notificationsRevision, setNotificationsRevision] = useState(0);

  if (isPending) {
    return <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (!profile) {
    return (
      <div className="p-10 text-center text-sm text-destructive">Couldn&apos;t load your profile.</div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-10">
      <div className="flex flex-col items-start justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-muted">
            {profile.avatarUrl ? (
              <Image src={profile.avatarUrl} alt="" fill className="object-cover" />
            ) : (
              <User className="absolute inset-0 m-auto size-7 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-lg font-bold">
              {profile.displayName}
              {isVerified && (
                <span className="flex items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Verified
                </span>
              )}
            </p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setEditRevision((r) => r + 1);
            setEditOpen(true);
          }}
        >
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProfileSection title="Account">
          <ProfileRow icon={List} label="My listing" href="/profile/listings" />
          <ProfileRow icon={Heart} label="Favourites" href="/saved" />
          <ProfileRow icon={HistoryIcon} label="History" href="/history" />
        </ProfileSection>

        <ProfileSection title="Legal">
          <ProfileRow icon={HelpCircle} label="Help & Support" disabled />
          <ProfileRow icon={Scale} label="Terms & Conditions" disabled />
          <ProfileRow icon={Info} label="About Crest" disabled />
        </ProfileSection>

        <ProfileSection title="Security">
          <ProfileRow icon={IdCard} label="Identity verification (KYC)" href="/kyc" />
          <ProfileRow icon={Lock} label="Change password" onClick={() => setPasswordOpen(true)} />
        </ProfileSection>

        <ProfileSection title="Settings">
          <ProfileRow
            icon={Bell}
            label="Notifications"
            onClick={() => {
              setNotificationsRevision((r) => r + 1);
              setNotificationsOpen(true);
            }}
          />
          <ProfileRow
            icon={CreditCard}
            label="Payment method"
            onClick={() => {
              setPaymentRevision((r) => r + 1);
              setPaymentOpen(true);
            }}
          />
          <ProfileRow
            icon={FileText}
            label="Uploaded document"
            disabled
            title="No confirmed way to list documents you've uploaded — see docs/design-vs-backend-gaps.md, Phase 12"
          />
        </ProfileSection>
      </div>

      <EditProfileDialog
        key={editRevision}
        open={editOpen}
        onOpenChange={setEditOpen}
        profile={profile}
      />
      <PaymentMethodDialog
        key={paymentRevision}
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        profile={profile}
      />
      <NotificationsDialog key={notificationsRevision} open={notificationsOpen} onOpenChange={setNotificationsOpen} />
      <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
    </div>
  );
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-5">
      <h2 className="mb-2 text-base font-semibold">{title}</h2>
      <div className="divide-y">{children}</div>
    </div>
  );
}

function ProfileRow({
  icon: Icon,
  label,
  href,
  onClick,
  disabled,
  title,
}: {
  icon: typeof User;
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  const content = (
    <span className="flex flex-1 items-center gap-3 text-sm font-medium">
      <Icon className="size-4.5 text-muted-foreground" />
      {label}
    </span>
  );

  if (disabled) {
    return (
      <div
        className="flex items-center justify-between py-3 text-muted-foreground/50"
        title={title ?? "Coming soon"}
      >
        {content}
        <ChevronRight className="size-4" />
      </div>
    );
  }

  if (href) {
    return (
      <Link href={href} className="flex items-center justify-between py-3">
        {content}
        <ChevronRight className="size-4 text-muted-foreground" />
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className="flex w-full items-center justify-between py-3">
      {content}
      <ChevronRight className="size-4 text-muted-foreground" />
    </button>
  );
}
