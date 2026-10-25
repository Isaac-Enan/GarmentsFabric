import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, ArrowRight, Clock, CheckCircle2, Scissors, Truck, Package, ShieldCheck } from "lucide-react";
import { apiClient } from "@/api/client";
import { formatBDT } from "@/lib/utils";

interface OrderItem {
  id: string;
  roll_code: string;
  roll_title: string;
  color_name: string;
  requested_yards: string | number;
  unit_price: string | number;
  subtotal: string | number;
  status: string;
}

interface TrackingEvent {
  id: string;
  to_status: string;
  title: string;
  description: string;
  location: string;
  created_at: string;
}

interface OrderData {
  id: string;
  order_number: string;
  status: string;
  items_subtotal: string | number;
  platform_commission_fee: string | number;
  cutting_fee: string | number;
  delivery_fee: string | number;
  vat_tax_amount: string | number;
  total_amount: string | number;
  currency: string;
  payment_method: string;
  items: OrderItem[];
  tracking_events: TrackingEvent[];
  created_at: string;
}

export const BuyerOrdersPage: React.FC = () => {
  const location = useLocation();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/orders/");
      setOrders(res.data.data || []);
    } catch (err) {
      console.error("Error fetching orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [location.state]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID_CREDIT_APPROVED":
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">PAID • HOLD CONFIRMED</span>;
      case "AT_HUB":
      case "CUTTING":
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">IN CUTTING HUB</span>;
      case "DELIVERED":
      case "COMPLETED":
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">DELIVERED</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">{status.replace("_", " ")}</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Boutique Orders & Tracking</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track your roll breakdown requests, hub machine cutting, and courier dispatch.
          </p>
        </div>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-all self-start"
        >
          <ShoppingBag className="w-4 h-4" />
          Browse Surplus Rolls
        </Link>
      </div>

      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center space-y-4">
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
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-sm space-y-6"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-base text-foreground">
                      {order.order_number}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Placed on {new Date(order.created_at).toLocaleDateString()} • Paid via{" "}
                    <span className="font-semibold text-foreground">{order.payment_method}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-muted-foreground">Total Paid: </span>
                  <span className="text-xl font-extrabold text-foreground">
                    {formatBDT(order.total_amount)}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Purchased Cut Pieces
                </p>
                <div className="divide-y divide-border/60">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <p className="font-bold text-foreground text-sm">{item.roll_title}</p>
                        <p className="text-muted-foreground font-mono">
                          Roll: {item.roll_code} • Color: {item.color_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-foreground text-sm">
                          {item.requested_yards} Yards
                        </p>
                        <p className="text-muted-foreground">
                          {formatBDT(item.unit_price)} /yd = {formatBDT(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lifecycle Progress Bar */}
              <div className="bg-muted/30 p-5 rounded-2xl border border-border/80 space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-primary" />
                  Live Order Fulfillment Timeline
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      1. Payment Verified
                    </div>
                    <p className="text-[11px] text-muted-foreground">Stock yardage hold locked</p>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-2 text-primary font-bold mb-1">
                      <Truck className="w-4 h-4" />
                      2. Mill Pickup
                    </div>
                    <p className="text-[11px] text-muted-foreground">En route to Tejgaon Hub</p>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground font-bold mb-1">
                      <Scissors className="w-4 h-4" />
                      3. Precision Cut
                    </div>
                    <p className="text-[11px] text-muted-foreground">Machine cut & barcode tag</p>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground font-bold mb-1">
                      <Package className="w-4 h-4" />
                      4. Courier Handover
                    </div>
                    <p className="text-[11px] text-muted-foreground">Direct boutique delivery</p>
                  </div>
                </div>

                {order.tracking_events && order.tracking_events.length > 0 && (
                  <div className="pt-2 text-xs text-muted-foreground space-y-1">
                    <p className="font-semibold text-foreground">Latest Event:</p>
                    <p>
                      • {order.tracking_events[order.tracking_events.length - 1].title} —{" "}
                      {order.tracking_events[order.tracking_events.length - 1].description} (
                      {order.tracking_events[order.tracking_events.length - 1].location})
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
