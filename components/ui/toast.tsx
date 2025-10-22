"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import * as React from "react";
import type { Toast } from "./use-toast";
import { Button } from "./button";

export type ToastProps = Toast & {
  onDismiss: () => void;
};

export const ToastView = ({ title, description, variant = "default", action, onDismiss }: ToastProps) => {
  return (
    <div
      className={cn(
        "flex w-full min-w-[280px] max-w-sm items-start gap-3 rounded-lg border bg-background p-4 shadow-lg",
        variant === "destructive" && "border-destructive/40 bg-destructive/10"
      )}
    >
      <div className="flex flex-1 flex-col gap-1">
        {title ? <p className="text-sm font-semibold">{title}</p> : null}
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        {action ? <div className="mt-1">{action}</div> : null}
      </div>
      <Button variant="ghost" size="icon" onClick={onDismiss} className="h-8 w-8">
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss</span>
      </Button>
    </div>
  );
};
