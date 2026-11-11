import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Factory,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Sparkles,
  Layers,
  Search,
  SlidersHorizontal,
  Scissors,
  CheckCircle2,
  ArrowRight,
  Clock,
  Building,
  Tag,
  ArrowLeft,
  X,
  MessageSquare,
  FileText,
  BadgeCheck,
} from "lucide-react";
import { apiClient } from "@/api/client";
import { useAuthStore } from "@/features/auth/store";
import { formatBDT } from "@/lib/utils";

interface CompanyAddress {
  id: string;
  address_type: string;
  division: string;
  district: string;
  upazila_thana: string;
  street_address: string;
  postal_code: string;
  landmark?: string;
  is_default: boolean;
}

interface FactoryStoreData {
  id: string;
  name: string;
  company_type: string;
  verification_status: string;
  contact_email: string;
  contact_phone: string;
  trade_license_number: string;
  tin_number: string;
  bin_number: string;
  addresses: CompanyAddress[];
  stats: {
    total_active_rolls: number;
    total_available_yards: number;
    fabric_types_count: number;
    compositions: string[];
    custom_profiles_count_for_you: number;
  };
  created_at: string;
}

interface FabricRollItem {
  id: string;
  roll_code: string;
  title: string;
  fabric_type_name: string;
  mill_name: string;
  factory_id: string;
  mill_location: string;
  composition: string;
  gsm: number;
  width_inches: number | string;
  color_name: string;
  color_hex: string;
  pattern: string;
  finish: string;
  available_yards: number | string;
  min_cut_length_yards: number | string;
  price_per_yard: number | string;
  quality_grade: string;
  status: string;
  is_sample_available: boolean;
  sample_price: number | string;
  primary_image?: string;
  is_custom_profile?: boolean;
  target_buyer_name?: string;
  target_buyer_id?: string;
  buyer_spec_notes?: string;
}

export const FactoryStorePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [factory, setFactory] = useState<FactoryStoreData | null>(null);
  const [rolls, setRolls] = useState<FabricRollItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "PUBLIC" | "EXCLUSIVE">("ALL");
  const [gsmRange, setGsmRange] = useState<string>("all");
  const [selectedComposition, setSelectedComposition] = useState<string>("all");

  // Inquire Modal
  const [inquireModalOpen, setInquireModalOpen] = useState(false);
  const [inquireNotes, setInquireNotes] = useState("");
  const [inquireSubmitted, setInquireSubmitted] = useState(false);

  const fetchStoreData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [factoryRes, rollsRes] = await Promise.all([
        apiClient.get(`/companies/factories/${id}/`),
        apiClient.get("/catalog/rolls/", { params: { factory_id: id } }),
      ]);
      setFactory(factoryRes.data.data);
      setRolls(rollsRes.data.data || []);
    } catch (err: any) {
      console.error("Error loading factory store", err);
      setError(
        err.response?.data?.error?.message ||
          "Garment mill storefront could not be found or is not currently active."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, [id]);

  const defaultAddress =
    factory?.addresses.find((a) => a.is_default) || factory?.addresses[0];

  const isMyOwnStore =
    isAuthenticated && user?.company?.id && user.company.id === factory?.id;

  // Custom profiles for the logged-in buyer
  const exclusiveRolls = rolls.filter((r) => r.is_custom_profile);
  const publicRolls = rolls.filter((r) => !r.is_custom_profile);

  // Filtered rolls
  const filteredRolls = rolls.filter((r) => {
    if (filterType === "EXCLUSIVE" && !r.is_custom_profile) return false;
    if (filterType === "PUBLIC" && r.is_custom_profile) return false;

    if (gsmRange === "light" && r.gsm > 200) return false;
    if (gsmRange === "mid" && (r.gsm <= 200 || r.gsm > 300)) return false;
    if (gsmRange === "heavy" && r.gsm <= 300) return false;

    if (
      selectedComposition !== "all" &&
      !r.composition.toLowerCase().includes(selectedComposition.toLowerCase())
    ) {
      return false;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchComp = r.composition.toLowerCase().includes(q);
      const matchCode = r.roll_code.toLowerCase().includes(q);
      const matchColor = r.color_name.toLowerCase().includes(q);
      const matchNotes = (r.buyer_spec_notes || "").toLowerCase().includes(q);
      if (!matchTitle && !matchComp && !matchCode && !matchColor && !matchNotes) {
        return false;
      }
    }

    return true;
  });

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setInquireSubmitted(true);
    setTimeout(() => {
      setInquireSubmitted(false);
      setInquireModalOpen(false);
      setInquireNotes("");
    }, 2500);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-foreground">
          Connecting to Garment Mill Storefront...
        </p>
        <p className="text-xs text-muted-foreground">
          Retrieving certified mill audit records, surplus stock, and exclusive profiles.
        </p>
      </div>
    );
  }

  if (error || !factory) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <Factory className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-foreground">
          Garment Factory Store Unavailable
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">{error}</p>
        <div className="pt-4 flex items-center justify-center gap-3">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Surplus Fabric Catalog</span>
        </Link>

        {isMyOwnStore && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
            <Factory className="w-3.5 h-3.5" />
            <span>You are previewing your Mill Storefront as seen by boutique buyers</span>
            <Link
              to="/factory/dashboard"
              className="ml-2 text-primary underline hover:opacity-80"
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>

      {/* Storefront Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold">
                <BadgeCheck className="w-3.5 h-3.5" />
                <span>Verified Export Garment Mill</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Trade License & BIN Certified</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>Tejgaon Hub SLA &lt; 24h</span>
              </span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                {factory.name}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>
                  {defaultAddress
                    ? `${defaultAddress.street_address}, ${defaultAddress.upazila_thana}, ${defaultAddress.district}`
                    : "Tejgaon / Gazipur Industrial Zone, Bangladesh"}
                </span>
              </p>
            </div>

            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed max-w-2xl">
              Export-oriented readymade garment manufacturer offering authentic surplus export rolls,
              custom small-batch buyer formulations, and certified knit/woven deadstock yardage with machine precision cuts.
            </p>

            {/* Certifications & Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground border-t border-border/60">
              {factory.trade_license_number && (
                <div>
                  <span className="text-muted-foreground/70 font-sans">Trade License: </span>
                  <span className="font-bold text-foreground">{factory.trade_license_number}</span>
                </div>
              )}
              {factory.bin_number && (
                <div>
                  <span className="text-muted-foreground/70 font-sans">BIN: </span>
                  <span className="font-bold text-foreground">{factory.bin_number}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Contact & Action Card */}
          <div className="bg-card/80 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-sm space-y-4 shrink-0 lg:w-80">
            <div>
              <h3 className="text-sm font-bold text-foreground">Mill Inquiries & Custom Orders</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Reach out to factory merchandising desk for exclusive custom fabric profiles.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              {factory.contact_phone && (
                <a
                  href={`tel:${factory.contact_phone}`}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/50 hover:bg-muted text-foreground transition-colors font-mono"
                >
                  <Phone className="w-4 h-4 text-primary" />
                  <span>{factory.contact_phone}</span>
                </a>
              )}
              {factory.contact_email && (
                <a
                  href={`mailto:${factory.contact_email}`}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/50 hover:bg-muted text-foreground transition-colors font-mono truncate"
                >
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate">{factory.contact_email}</span>
                </a>
              )}
            </div>

            <button
              onClick={() => setInquireModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Inquire / Request Custom Profile</span>
            </button>
          </div>
        </div>

        {/* Store Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-border/80">
          <div className="p-4 rounded-2xl bg-card border border-border">
            <p className="text-xs text-muted-foreground font-medium">Available Surplus</p>
            <p className="text-xl sm:text-2xl font-extrabold text-primary mt-1">
              {factory.stats.total_available_yards.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">Yds</span>
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border">
            <p className="text-xs text-muted-foreground font-medium">Active Rolls</p>
            <p className="text-xl sm:text-2xl font-extrabold text-foreground mt-1">
              {factory.stats.total_active_rolls} <span className="text-xs font-normal text-muted-foreground">Rolls</span>
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border">
            <p className="text-xs text-muted-foreground font-medium">Fabric Categories</p>
            <p className="text-xl sm:text-2xl font-extrabold text-foreground mt-1">
              {factory.stats.fabric_types_count} <span className="text-xs font-normal text-muted-foreground">Types</span>
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
            <p className="text-xs text-purple-700 dark:text-purple-300 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Exclusive for You</span>
            </p>
            <p className="text-xl sm:text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
              {factory.stats.custom_profiles_count_for_you} <span className="text-xs font-normal text-purple-500/80">Profiles</span>
            </p>
          </div>
        </div>
      </div>

      {/* Exclusive Fabric Profiles Section for Logged-In Buyer */}
      {exclusiveRolls.length > 0 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-500/10 via-purple-600/5 to-indigo-500/10 border-2 border-purple-500/30 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-600 text-white text-[11px] font-bold">
                <Sparkles className="w-3 h-3" />
                <span>Dedicated Formulations</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
                Exclusive Fabric Profiles Crafted for {user?.company?.name || "Your Boutique"}
              </h2>
              <p className="text-xs text-muted-foreground">
                These fabric formulations were built specifically for your boutique by {factory.name} merchandisers.
              </p>
            </div>

            <button
              onClick={() => setFilterType("EXCLUSIVE")}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-sm self-start"
            >
              Filter Only Exclusive Profiles
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exclusiveRolls.map((roll) => (
              <div
                key={roll.id}
                className="bg-card rounded-2xl border border-purple-500/30 p-5 shadow-sm space-y-4 hover:border-purple-500/60 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {roll.roll_code}
                    </span>
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Custom Profile</span>
                    </span>
                  </div>

                  <h3 className="font-extrabold text-foreground text-sm line-clamp-1">
                    {roll.title}
                  </h3>

                  <p className="text-xs text-muted-foreground">
                    {roll.composition} • {roll.gsm} GSM • {roll.width_inches}" Width
                  </p>

                  {roll.buyer_spec_notes && (
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-foreground/90 font-mono">
                      <span className="font-bold text-purple-600 dark:text-purple-400">Merchandiser Notes: </span>
                      {roll.buyer_spec_notes}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-base font-extrabold text-primary">
                      {formatBDT(roll.price_per_yard)}
                    </span>
                    <span className="text-[10px] text-muted-foreground"> / yard</span>
                    <p className="text-[10px] text-muted-foreground">
                      Available: <strong>{Number(roll.available_yards)} Yds</strong>
                    </p>
                  </div>

                  <Link
                    to={`/catalog/${roll.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Order Breakdown</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rolls Catalog Header & Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h2 className="text-xl font-extrabold text-foreground">
              {factory.name} Fabric Inventory & Rolls
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Browse export surplus rolls, choose yardage, and request machine precision cutting.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search store inventory..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterType === "ALL"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            All Inventory ({rolls.length})
          </button>

          <button
            onClick={() => setFilterType("PUBLIC")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterType === "PUBLIC"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            Public Surplus ({publicRolls.length})
          </button>

          {exclusiveRolls.length > 0 && (
            <button
              onClick={() => setFilterType("EXCLUSIVE")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                filterType === "EXCLUSIVE"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Exclusive for You ({exclusiveRolls.length})</span>
            </button>
          )}

          <div className="h-4 w-px bg-border mx-1" />

          {/* GSM Filters */}
          <span className="text-[11px] font-semibold text-muted-foreground">Weight:</span>
          {(["all", "light", "mid", "heavy"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGsmRange(g)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                gsmRange === g
                  ? "bg-secondary text-secondary-foreground font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {g === "all"
                ? "All GSM"
                : g === "light"
                ? "< 200 GSM"
                : g === "mid"
                ? "200-300 GSM"
                : "> 300 GSM"}
            </button>
          ))}
        </div>
      </div>

      {/* Rolls Grid */}
      {filteredRolls.length === 0 ? (
        <div className="bg-card rounded-3xl border border-border p-16 text-center space-y-4 shadow-sm">
          <Layers className="w-12 h-12 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-foreground text-base">No Matching Fabric Rolls</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search criteria or filter options to discover other rolls in this factory's store.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterType("ALL");
              setGsmRange("all");
              setSelectedComposition("all");
            }}
            className="text-xs font-bold text-primary hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRolls.map((roll) => (
            <div
              key={roll.id}
              className={`group bg-card rounded-2xl border transition-all duration-300 hover:shadow-lg flex flex-col justify-between overflow-hidden ${
                roll.is_custom_profile
                  ? "border-purple-500/50 hover:border-purple-500 ring-1 ring-purple-500/20"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div>
                {/* Image / Color Preview */}
                <div className="relative aspect-[4/3] bg-muted overflow-hidden flex items-center justify-center">
                  {roll.primary_image ? (
                    <img
                      src={roll.primary_image}
                      alt={roll.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex flex-col items-center justify-center p-4 text-center transition-transform group-hover:scale-105 duration-500"
                      style={{ backgroundColor: `${roll.color_hex}15` }}
                    >
                      <div
                        className="w-14 h-14 rounded-2xl shadow-inner border border-black/10 flex items-center justify-center mb-2"
                        style={{ backgroundColor: roll.color_hex }}
                      />
                      <span className="text-xs font-bold text-foreground">{roll.color_name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{roll.color_hex}</span>
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-background/90 backdrop-blur-sm text-foreground shadow-sm">
                      {roll.fabric_type_name}
                    </span>
                    {roll.is_custom_profile && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-600 text-white shadow-sm flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Exclusive</span>
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-2.5 right-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/60 text-white backdrop-blur-sm">
                      {roll.roll_code}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2.5">
                  <div>
                    <h3 className="font-bold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
                      {roll.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {roll.composition}
                    </p>
                  </div>

                  {/* Specs Pill */}
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
                    <span className="px-2 py-0.5 rounded bg-muted font-mono">{roll.gsm} GSM</span>
                    <span>•</span>
                    <span>{roll.width_inches}" Width</span>
                    <span>•</span>
                    <span className="capitalize">{roll.pattern}</span>
                  </div>

                  {roll.buyer_spec_notes && (
                    <p className="text-[11px] text-purple-700 dark:text-purple-300 font-mono bg-purple-500/10 p-2 rounded-lg line-clamp-2">
                      {roll.buyer_spec_notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer / CTA */}
              <div className="p-4 pt-0 border-t border-border/60 mt-3 flex items-center justify-between">
                <div>
                  <span className="text-base font-extrabold text-primary">
                    {formatBDT(roll.price_per_yard)}
                  </span>
                  <span className="text-[10px] text-muted-foreground"> / yd</span>
                  <p className="text-[10px] text-muted-foreground">
                    Available: <strong>{Number(roll.available_yards)} Yds</strong>
                  </p>
                </div>

                <Link
                  to={`/catalog/${roll.id}`}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    roll.is_custom_profile
                      ? "bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  <Scissors className="w-3 h-3" />
                  <span>Breakdown</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inquire Modal */}
      {inquireModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-lg rounded-3xl border border-border p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Factory className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-foreground text-base">
                    Contact {factory.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Request a custom fabric profile formulation or roll inquiry
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInquireModalOpen(false)}
                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inquireSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-foreground text-base">Inquiry Dispatched!</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Your message was sent directly to {factory.name} merchandisers. They will create a
                  dedicated fabric profile for your review in your Buyer Portal.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Your Boutique / Brand Name
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.company?.name || "Boutique Buyer"}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-muted text-muted-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Desired Fabric Profile Specifications *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={inquireNotes}
                    onChange={(e) => setInquireNotes(e.target.value)}
                    placeholder="e.g. Need 150 yards of 100% combed cotton jersey in Navy Blue (180 GSM, 60-inch width). Please build a custom profile for our Eid collection."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setInquireModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Submit Inquiry</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
