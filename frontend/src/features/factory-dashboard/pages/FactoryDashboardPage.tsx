import React from "react";
import { Link } from "react-router-dom";
import { Factory, Layers, Truck, DollarSign, PlusCircle } from "lucide-react";
import { useAuthStore } from "@/features/auth/store";

export const FactoryDashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Factory Mill Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Managing surplus rolls for <span className="font-semibold text-foreground">{user?.company?.name || "Your Mill"}</span>
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-all">
          <PlusCircle className="w-4 h-4" />
          List New Fabric Roll
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-2">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-medium">Active Rolls</span>
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">18 Rolls</p>
          <p className="text-[11px] text-muted-foreground">3,240 Total Yards Listed</p>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-2">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-medium">Pending Pickups</span>
            <Truck className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">3 Orders</p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400">Scheduled for today 2:00 PM</p>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-2">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-medium">Completed Cuts</span>
            <Factory className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">46</p>
          <p className="text-[11px] text-emerald-600">Delivered without disputes</p>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-2">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-medium">Total Payouts</span>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">৳ 482,500</p>
          <p className="text-[11px] text-muted-foreground">Settled directly to bank account</p>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="p-6 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Catalog & Inventory Management (Phase 2)</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Bulk CSV/XLSX roll upload and high-resolution photo gallery will be active in Phase 2.
          </p>
        </div>
        <Link to="/catalog" className="text-xs font-semibold text-primary hover:underline">
          Preview Catalog →
        </Link>
      </div>
    </div>
  );
};
