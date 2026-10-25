import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight, Clock, CheckCircle } from "lucide-react";

export const BuyerOrdersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Boutique Orders & Tracking</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track your roll breakdown requests, cutting status, and courier dispatch.
          </p>
        </div>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
        >
          <ShoppingBag className="w-4 h-4" />
          Browse Surplus Rolls
        </Link>
      </div>

      <div className="bg-card rounded-2xl border border-border p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">No Active Orders Yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Browse verified garment factory surplus rolls in the catalog, choose your custom cut length, and checkout securely.
          </p>
        </div>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-2"
        >
          Explore Catalog Now
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
