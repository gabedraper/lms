"use client";

import { useRef, useState, useTransition } from "react";
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
import { Bug, ImagePlus, Send, X } from "lucide-react";

const MAX_SCREENSHOT_BYTES = 6 * 1024 * 1024;

interface Screenshot {
  dataUrl: string;
  filename: string;
}

export function BugReportWidget() {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState<Screenshot | null>(null);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setDescription("");
    setScreenshot(null);
    setStatus("idle");
    setError("");
  }

  function attachFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Only image files can be attached.");
      return;
    }
    if (file.size > MAX_SCREENSHOT_BYTES) {
      setError("Screenshot is too large (max 6MB).");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshot({ dataUrl: reader.result as string, filename: file.name || "screenshot.png" });
    };
    reader.readAsDataURL(file);
  }

  function handlePaste(e: React.ClipboardEvent) {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
    if (item) {
      const file = item.getAsFile();
      if (file) attachFile(file);
    }
  }

  function handleSend() {
    setError("");
    startTransition(async () => {
      const result = await submitBugReport(description, window.location.href, screenshot);
      if (result.success) {
        setStatus("sent");
        setTimeout(() => {
          setOpen(false);
          reset();
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
        if (!next) reset();
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
              placeholder="What went wrong? (You can also paste a screenshot here)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onPaste={handlePaste}
              rows={5}
              autoFocus
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) attachFile(file);
                e.target.value = "";
              }}
            />

            {screenshot ? (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={screenshot.dataUrl}
                  alt="Attached screenshot"
                  className="max-h-32 rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => setScreenshot(null)}
                  className="absolute -top-2 -right-2 bg-background border rounded-full p-1 shadow-sm hover:bg-accent"
                  aria-label="Remove screenshot"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="h-4 w-4" />
                Attach screenshot
              </Button>
            )}

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
