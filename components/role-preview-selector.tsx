"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setPreviewRole, clearPreviewRole } from "@/actions/preview";
import { ROLES, LEARNER_ROLES, getRoleLabel } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, X } from "lucide-react";

interface Props {
  currentPreviewRole: string | null;
}

export function RolePreviewSelector({ currentPreviewRole }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSelect(role: string) {
    startTransition(async () => {
      await setPreviewRole(role);
      router.push("/learner");
      router.refresh();
    });
  }

  function handleExit() {
    startTransition(async () => {
      await clearPreviewRole();
      router.push("/admin");
      router.refresh();
    });
  }

  if (currentPreviewRole) {
    return (
      <div className="px-3 pb-3">
        <div className="flex items-center justify-between p-2 rounded-md bg-amber-50 border border-amber-200 text-xs">
          <div className="flex items-center gap-1.5 text-amber-800 font-medium min-w-0">
            <Eye className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Previewing: {getRoleLabel(currentPreviewRole)}</span>
          </div>
          <button
            onClick={handleExit}
            disabled={pending}
            className="ml-2 shrink-0 text-amber-700 hover:text-amber-900"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 pb-3">
      <Select onValueChange={handleSelect} disabled={pending}>
        <SelectTrigger className="h-8 text-xs">
          <div className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            <SelectValue placeholder="Preview as role..." />
          </div>
        </SelectTrigger>
        <SelectContent>
          {LEARNER_ROLES.map((r) => (
            <SelectItem key={r} value={r} className="text-xs">
              {getRoleLabel(r)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
