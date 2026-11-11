import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  X,
  Trash2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Truck,
} from "lucide-react";
import { apiClient } from "@/api/client";
import { formatBDT } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store";

interface CartItemData {
  id: string;
  fabric_roll: string;
  roll_code: string;
  roll_title: string;
  roll_color_name: string;
  roll_color_hex: string;
  roll_gsm: number;
  roll_width: string | number;
  roll_available_yards: string | number;
  roll_min_cut: string | number;
  requested_yards: string | number;
  unit_price: string | number;
  item_subtotal: string | number;
}

interface CartFees {
  items_subtotal: string;
  platform_commission_fee: string;
  cutting_fee: string;
  delivery_fee: string;
  vat_tax_amount: string;
  total_amount: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCartUpdated?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onCartUpdated }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [items, setItems] = useState<CartItemData[]>([]);
  const [fees, setFees] = useState<CartFees | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("BKASH");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchCart = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await apiClient.get("/orders/cart/");
      const data = res.data.data;
      setItems(data.items || []);
      setFees(data.fees || null);
    } catch (err: any) {
      console.error("Failed to load cart", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCart();
      setErrorMessage(null);
      setCheckoutSuccess(false);
    }
  }, [isOpen, isAuthenticated]);

  const handleDeleteItem = async (itemId: string) => {
    try {
      setIsDeleting(itemId);
      await apiClient.delete(`/orders/cart/items/${itemId}/`);
      await fetchCart();
      if (onCartUpdated) onCartUpdated();
    } catch (err: any) {
      alert("Failed to remove item.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    try {
      setIsCheckingOut(true);
      setErrorMessage(null);
      const res = await apiClient.post("/orders/checkout/", {
        payment_method: paymentMethod,
        delivery_notes: deliveryNotes || "Deliver to boutique workshop.",
      });

      setCheckoutSuccess(true);
      if (onCartUpdated) onCartUpdated();
      setTimeout(() => {
        onClose();
        navigate("/buyer/orders", { state: { newOrder: res.data.data } });
      }, 1200);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || "Checkout failed. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-foreground">Boutique Yardage Cart</h2>
                <p className="text-xs text-muted-foreground">{items.length} cut pieces requested</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {checkoutSuccess ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Order Placed Successfully!</h3>
                <p className="text-xs text-muted-foreground">
                  Stock hold confirmed. Redirecting to live tracking...
                </p>
              </div>
            ) : loading ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-muted-foreground font-medium">Fetching active breakdown cart...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 text-muted-foreground flex items-center justify-center mx-auto">
                  <Scissors className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Your Yardage Cart is Empty</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                    Browse surplus fabric rolls in the catalog, choose your custom length, and request precision cuts.
                  </p>
                </div>
                <Link
                  to="/catalog"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  Explore Surplus Rolls
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-muted/30 border border-border/80 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-xl border border-border shadow-sm flex-shrink-0"
                          style={{ backgroundColor: item.roll_color_hex }}
                        />
                        <div className="space-y-1">
                          <p className="font-bold text-xs text-foreground leading-snug">
                            {item.roll_title}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {item.roll_code} • {item.roll_color_name}
                          </p>
                          <div className="flex items-center gap-2 text-xs pt-1">
                            <span className="font-extrabold text-primary">
                              {item.requested_yards} yds
                            </span>
                            <span className="text-muted-foreground">@ {formatBDT(Number(item.unit_price))}/yd</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex flex-col justify-between items-end h-full">
                        <span className="font-extrabold text-xs text-foreground">
                          {formatBDT(Number(item.item_subtotal))}
                        </span>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          disabled={isDeleting === item.id}
                          className="mt-3 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Fee Breakdown */}
                {fees && (
                  <div className="p-4 rounded-2xl bg-card border border-border space-y-2.5 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Fabric Yardage Subtotal</span>
                      <span className="font-semibold text-foreground">{formatBDT(Number(fees.items_subtotal))}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Platform Commission (6%)</span>
                      <span>{formatBDT(Number(fees.platform_commission_fee))}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Precision Machine Cutting Fee</span>
                      <span>{formatBDT(Number(fees.cutting_fee))}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Courier Delivery (Flat Dhaka)</span>
                      <span>{formatBDT(Number(fees.delivery_fee))}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Govt VAT (15% on services)</span>
                      <span>{formatBDT(Number(fees.vat_tax_amount))}</span>
                    </div>
                    <div className="pt-2 border-t border-border flex justify-between text-sm font-extrabold text-foreground">
                      <span>Total Amount Payable</span>
                      <span className="text-primary text-base">{formatBDT(Number(fees.total_amount))}</span>
                    </div>
                  </div>
                )}

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                    Authorized B2B Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("BKASH")}
                      className={`p-3 rounded-xl border text-center font-bold transition-all ${
                        paymentMethod === "BKASH"
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-border hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      bKash Merchant
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("NAGAD")}
                      className={`p-3 rounded-xl border text-center font-bold transition-all ${
                        paymentMethod === "NAGAD"
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-border hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      Nagad Commercial
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("B2B_CREDIT")}
                      className={`p-3 rounded-xl border text-center font-bold transition-all ${
                        paymentMethod === "B2B_CREDIT"
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-border hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      B2B 30-Day Credit Line
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("SSLCOMMERZ")}
                      className={`p-3 rounded-xl border text-center font-bold transition-all ${
                        paymentMethod === "SSLCOMMERZ"
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-border hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      Cards / Corporate Bank
                    </button>
                  </div>
                </div>

                {/* Delivery Notes */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-muted-foreground">
                    Workshop Delivery Instructions
                  </label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="e.g. Deliver to Dhanmondi boutique workshop (4th floor)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-card text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Checkout Button */}
          {items.length > 0 && !checkoutSuccess && (
            <div className="p-6 border-t border-border bg-card/80 backdrop-blur-md space-y-3">
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-xs text-center flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
              >
                {isCheckingOut ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Confirm Order & Authorize Cut</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>FabriLink Escrow: Mill only receives payment after precision cut inspection.</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
