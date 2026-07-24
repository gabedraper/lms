"use client";

import { useState, useTransition } from "react";
import { submitBugReport } from "@/actions/bug-report";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Bug, Send } from "lucide-react";

export function BugReportWidget() {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSend() {
    setError("");
    startTransition(async () => {
      const result = await submitBugReport(description, window.location.href);
      if (result.success) {
        setStatus("sent");
        setDescription("");
        setTimeout(() => {
          setOpen(false);
          setStatus("idle");
        }, 1500);
      } else {
        setStatus("error");
        setError(result.error || "Something went wrong. Please try again.");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setStatus("idle");
          setError("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground"
          size="sm"
        >
          <Bug className="h-4 w-4" />
          Report a Bug
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Report a Bug
          </DialogTitle>
        </DialogHeader>
        {status === "sent" ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Thanks! Your report has been sent.
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ran into something broken? Describe what happened and we&apos;ll take a look.
            </p>
            <Textarea
              placeholder="What went wrong?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              className="w-full gap-2"
              onClick={handleSend}
              disabled={pending || !description.trim()}
            >
              <Send className="h-4 w-4" />
              {pending ? "Sending..." : "Send Report"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
