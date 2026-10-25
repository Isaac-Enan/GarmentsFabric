import React from "react";
import { Scissors, CheckCircle, Barcode, AlertCircle } from "lucide-react";

export const HubQueuePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Hub Cutting & Inspection Queue</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Tejgaon Central Hub — Operator Workbench & Precision Cutting Slips
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Incoming Rolls Today</p>
          <p className="text-2xl font-bold text-foreground mt-1">12</p>
          <p className="text-xs text-muted-foreground">From Gazipur & Savar mills</p>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Cutting In Progress</p>
          <p className="text-2xl font-bold text-primary mt-1">4</p>
          <p className="text-xs text-muted-foreground">Station 1 & Station 2 active</p>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Cuts Ready for Courier</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">18</p>
          <p className="text-xs text-muted-foreground">Barcode tags attached & packed</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Barcode className="w-4 h-4 text-primary" />
          Quick Barcode Scanner & Precision Cut Workflow (Phase 5)
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Hub receiving barcode scanners, step-by-step cutter guidance, wastage recording, and automated PDF label generation will be fully activated in Phase 5.
        </p>
      </div>
    </div>
  );
};
