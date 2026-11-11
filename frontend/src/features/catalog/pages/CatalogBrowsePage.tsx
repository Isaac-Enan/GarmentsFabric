import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  ArrowRight,
  Tag,
  AlertCircle,
  SlidersHorizontal,
  Layers,
  Sparkles,
  CheckCircle2,
  MapPin,
  Scissors,
  X,
  Building,
  Factory,
} from "lucide-react";
import { apiClient } from "@/api/client";
import { useAuthStore } from "@/features/auth/store";
import { formatBDT } from "@/lib/utils";

interface FabricTypeItem {
  id: string;
  name: string;
  slug: string;
  category_name: string;
  default_gsm_range: string;
}

interface FabricCategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  fabric_types: FabricTypeItem[];
}

interface FabricRollItem {
  id: string;
  roll_code: string;
  title: string;
  fabric_type_name: string;
  mill_name: string;
  factory_id?: string;
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

export const CatalogBrowsePage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [categories, setCategories] = useState<FabricCategoryItem[]>([]);
  const [rolls, setRolls] = useState<FabricRollItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [gsmRange, setGsmRange] = useState<string>("all"); // 'all', 'light', 'mid', 'heavy'
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [showOnlyExclusive, setShowOnlyExclusive] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // 1. Fetch Categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get("/catalog/categories/");
        setCategories(res.data.data || []);
      } catch (err) {
        console.error("Error fetching categories", err);
      }
    };
    fetchCategories();
  }, []);

  // 2. Fetch Rolls on filter changes
  useEffect(() => {
    const fetchRolls = async () => {
      try {
        setLoading(true);
        const params: Record<string, string> = {};
        if (searchTerm.trim()) params.search = searchTerm.trim();
        if (selectedCategory !== "all") params.category = selectedCategory;
        if (selectedType !== "all") params.fabric_type = selectedType;

        if (gsmRange === "light") {
          params.max_gsm = "200";
        } else if (gsmRange === "mid") {
          params.min_gsm = "201";
          params.max_gsm = "300";
        } else if (gsmRange === "heavy") {
          params.min_gsm = "301";
        }

        if (showOnlyExclusive) {
          params.custom_only = "true";
        }

        if (maxPrice) params.max_price = maxPrice;

        const res = await apiClient.get("/catalog/rolls/", { params });
        let rollData: FabricRollItem[] = res.data.data || [];

        // Client sorting
        if (sortBy === "price_asc") {
          rollData.sort((a, b) => Number(a.price_per_yard) - Number(b.price_per_yard));
        } else if (sortBy === "price_desc") {
          rollData.sort((a, b) => Number(b.price_per_yard) - Number(a.price_per_yard));
        } else if (sortBy === "yards_desc") {
          rollData.sort((a, b) => Number(b.available_yards) - Number(a.available_yards));
        }

        setRolls(rollData);
      } catch (err) {
        console.error("Error fetching rolls", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchRolls, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, selectedType, gsmRange, maxPrice, sortBy, showOnlyExclusive]);

  // Derived available fabric types for selected category
  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);
  const availableTypes = activeCategoryObj
    ? activeCategoryObj.fabric_types
    : categories.flatMap((c) => c.fabric_types);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedType("all");
    setGsmRange("all");
    setMaxPrice("");
    setSortBy("newest");
    setShowOnlyExclusive(false);
  };

  const hasActiveFilters =
    searchTerm ||
    selectedCategory !== "all" ||
    selectedType !== "all" ||
    gsmRange !== "all" ||
    maxPrice ||
    showOnlyExclusive;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Certified Export Deadstock Exchange</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Export Surplus Fabric Catalog
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Sourced directly from export-oriented RMG garment factories in Gazipur, Savar, and Narayanganj. Request small-batch custom yardage with precision machine cutting.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by composition, color, mill, GSM..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden p-2.5 rounded-xl border border-border bg-card text-foreground"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Buyer Exclusive Profiles Alert Banner */}
      {isAuthenticated && user?.role === "BUYER" && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/15 via-purple-600/10 to-indigo-500/15 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600 text-white shrink-0 shadow-sm shadow-purple-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-foreground">
                Dedicated Fabric Profiles Available for {user?.company?.name || "Your Boutique"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Garment mills formulated exclusive fabric profiles tailored to your small-batch production needs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                setShowOnlyExclusive(!showOnlyExclusive);
                setSelectedCategory("all");
                setSelectedType("all");
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                showOnlyExclusive
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-500/30"
                  : "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{showOnlyExclusive ? "Showing Exclusive" : "Filter Exclusive Formulations"}</span>
            </button>
            <Link
              to="/buyer/profiles"
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline px-2"
            >
              Buyer Portal →
            </Link>
          </div>
        </div>
      )}

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => {
            setSelectedCategory("all");
            setSelectedType("all");
            setShowOnlyExclusive(false);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            selectedCategory === "all" && !showOnlyExclusive
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
              : "bg-card border border-border text-foreground hover:bg-muted"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Surplus Fabrics</span>
        </button>

        {isAuthenticated && user?.role === "BUYER" && (
          <button
            onClick={() => {
              setShowOnlyExclusive(!showOnlyExclusive);
              setSelectedCategory("all");
              setSelectedType("all");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              showOnlyExclusive
                ? "bg-purple-600 text-white shadow-md shadow-purple-500/20 scale-[1.02]"
                : "bg-purple-500/10 border border-purple-500/20 text-purple-600 hover:bg-purple-500/20"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Exclusive for You</span>
          </button>
        )}

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.slug);
              setSelectedType("all");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedCategory === cat.slug
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                : "bg-card border border-border text-foreground hover:bg-muted"
            }`}
          >
            <span>{cat.name}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                selectedCategory === cat.slug ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {cat.fabric_types.length}
            </span>
          </button>
        ))}
      </div>

      {/* Filter Row: Fabric Types, GSM, Price, Sort */}
      <div
        className={`bg-card rounded-2xl border border-border p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
          showMobileFilters ? "block" : "hidden md:flex"
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          {/* Fabric Type Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-muted-foreground">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="py-1.5 px-3 rounded-lg border border-input bg-background text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="all">All Fabric Weaves</option>
              {availableTypes.map((ft) => (
                <option key={ft.id} value={ft.slug}>
                  {ft.name}
                </option>
              ))}
            </select>
          </div>

          {/* GSM Weight Chips */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-muted-foreground">Weight:</span>
            <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/40 text-xs font-medium">
              <button
                onClick={() => setGsmRange("all")}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-all ${
                  gsmRange === "all" ? "bg-card text-foreground font-bold shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All GSM
              </button>
              <button
                onClick={() => setGsmRange("light")}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-all ${
                  gsmRange === "light" ? "bg-card text-foreground font-bold shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                &lt;200 Light
              </button>
              <button
                onClick={() => setGsmRange("mid")}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-all ${
                  gsmRange === "mid" ? "bg-card text-foreground font-bold shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                200-300 Mid
              </button>
              <button
                onClick={() => setGsmRange("heavy")}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-all ${
                  gsmRange === "heavy" ? "bg-card text-foreground font-bold shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                &gt;300 Heavy
              </button>
            </div>
          </div>

          {/* Max Price */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-muted-foreground">Max Price:</span>
            <input
              type="number"
              placeholder="৳ /yd"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-20 py-1.5 px-2.5 rounded-lg border border-input bg-background text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-destructive hover:underline ml-1"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 self-end md:self-center">
          <span className="text-xs font-bold text-muted-foreground">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="py-1.5 px-3 rounded-lg border border-input bg-background text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="newest">Newest Listed</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="yards_desc">Available Yards: High to Low</option>
          </select>
        </div>
      </div>

      {/* Grid of Fabric Rolls */}
      {loading ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-muted-foreground">
            Querying verified surplus rolls from RMG mills...
          </p>
        </div>
      ) : rolls.length === 0 ? (
        <div className="bg-card rounded-3xl border border-border p-16 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">No Surplus Fabric Rolls Match Your Criteria</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Try broadening your GSM range, clearing search terms, or explore other fabric categories.
            </p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rolls.map((roll) => {
            const availYards = Number(roll.available_yards);
            const minCut = Number(roll.min_cut_length_yards);
            const unitPrice = Number(roll.price_per_yard);

            const displayImage =
              roll.primary_image ||
              "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80";

            return (
              <div
                key={roll.id}
                className="group bg-card rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Photo Banner with Badges */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                    <img
                      src={displayImage}
                      alt={roll.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md border border-white/10">
                        {roll.quality_grade.replace("_", " ")}
                      </span>
                      {roll.is_custom_profile && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-600 text-white shadow-sm flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Custom for You</span>
                        </span>
                      )}
                      {roll.is_sample_available && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary text-primary-foreground shadow-sm">
                          Sample Swatch ৳{Number(roll.sample_price)}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3 font-mono text-[10px] text-white font-bold bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
                      {roll.roll_code}
                    </div>

                    {/* Bottom Image Info */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-white/60 shadow-sm"
                          style={{ backgroundColor: roll.color_hex }}
                          title={`Color: ${roll.color_name}`}
                        />
                        <span className="text-xs font-semibold truncate drop-shadow-sm">
                          {roll.color_name}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold bg-primary/90 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        {roll.fabric_type_name}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-extrabold text-foreground text-base group-hover:text-primary transition-colors leading-snug line-clamp-1">
                        {roll.title}
                      </h3>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 truncate">
                        <Building className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        {roll.factory_id ? (
                          <Link
                            to={`/stores/${roll.factory_id}`}
                            className="font-bold text-foreground hover:text-primary hover:underline transition-colors truncate"
                            onClick={(e) => e.stopPropagation()}
                            title="Visit Garment Mill Store"
                          >
                            {roll.mill_name}
                          </Link>
                        ) : (
                          <span className="font-medium text-foreground">{roll.mill_name}</span>
                        )}
                        <span>•</span>
                        <span className="truncate">{roll.mill_location}</span>
                      </div>
                    </div>

                    {roll.buyer_spec_notes && (
                      <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-foreground/90 font-mono">
                        <span className="font-bold text-purple-600 dark:text-purple-400">Spec Note: </span>
                        <span className="line-clamp-2">{roll.buyer_spec_notes}</span>
                      </div>
                    )}

                    <div className="p-2.5 rounded-xl bg-muted/30 border border-border/60 text-xs text-muted-foreground space-y-1">
                      <p className="truncate">
                        <strong className="text-foreground">Comp:</strong> {roll.composition}
                      </p>
                      <p className="truncate">
                        <strong className="text-foreground">Finish:</strong> {roll.finish}
                      </p>
                    </div>

                    {/* Specs Pills */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-xl bg-muted/40 border border-border/50">
                        <p className="text-[10px] text-muted-foreground font-semibold">GSM</p>
                        <p className="font-extrabold text-foreground text-sm">{roll.gsm}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-muted/40 border border-border/50">
                        <p className="text-[10px] text-muted-foreground font-semibold">Width</p>
                        <p className="font-extrabold text-foreground text-sm">{roll.width_inches}"</p>
                      </div>
                      <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                        <p className="text-[10px] text-primary font-semibold">Available</p>
                        <p className="font-extrabold text-primary text-sm">{availYards} yd</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-3 border-t border-border/60">
                      <span className="text-muted-foreground">
                        Min Machine Cut: <strong className="text-foreground">{minCut} yd</strong>
                      </span>
                      <div className="text-right">
                        <span className="font-extrabold text-lg text-foreground">
                          {formatBDT(unitPrice)}
                        </span>
                        <span className="text-[10px] text-muted-foreground"> /yd</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0">
                  <Link
                    to={`/catalog/${roll.id}`}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs text-center flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 transition-all group-hover:scale-[1.01]"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Request Custom Roll Breakdown</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
