import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, ArrowRight, Tag, AlertCircle } from "lucide-react";
import { apiClient } from "@/api/client";
import { formatBDT } from "@/lib/utils";

interface FabricRollItem {
  id: string;
  roll_code: string;
  title: string;
  fabric_type_name: string;
  mill_name: string;
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
  primary_image?: string;
}

export const CatalogBrowsePage: React.FC = () => {
  const [rolls, setRolls] = useState<FabricRollItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");

  useEffect(() => {
    const fetchRolls = async () => {
      try {
        setLoading(true);
        const params: Record<string, string> = {};
        if (searchTerm) params.search = searchTerm;
        if (selectedType) params.fabric_type = selectedType;

        const res = await apiClient.get("/catalog/rolls/", { params });
        setRolls(res.data.data || []);
      } catch (err) {
        console.error("Error fetching rolls", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchRolls, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedType]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Export Surplus Fabric Catalog
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Certified dead-stock fabric rolls from export RMG factories across Dhaka, Gazipur, and Narayanganj.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by GSM, composition, mill..."
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Grid of Fabric Rolls */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground font-medium">Fetching surplus rolls from factory inventories...</p>
        </div>
      ) : rolls.length === 0 ? (
        <div className="bg-card rounded-3xl border border-border p-12 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-bold text-foreground">No Fabric Rolls Found</h3>
          <p className="text-xs text-muted-foreground">Try clearing your search query or check back soon for new mill listings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rolls.map((roll) => {
            const availYards = Number(roll.available_yards);
            const minCut = Number(roll.min_cut_length_yards);
            const unitPrice = Number(roll.price_per_yard);

            return (
              <div
                key={roll.id}
                className="group bg-card rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Color swatch top banner with gradient image */}
                  <div
                    className="h-32 w-full relative flex items-end p-4 transition-all"
                    style={{ backgroundColor: roll.color_hex }}
                  >
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
                      {roll.quality_grade.replace("_", " ")}
                    </span>
                    <span className="ml-auto font-mono text-[10px] text-white/90 font-bold bg-black/50 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                      {roll.roll_code}
                    </span>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors leading-snug">
                        {roll.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <span>{roll.mill_name}</span>
                        <span>•</span>
                        <span>{roll.mill_location}</span>
                      </p>
                    </div>

                    {/* Specs pill badges */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
                        <p className="text-[10px] text-muted-foreground font-medium">GSM</p>
                        <p className="font-extrabold text-foreground">{roll.gsm}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
                        <p className="text-[10px] text-muted-foreground font-medium">Width</p>
                        <p className="font-extrabold text-foreground">{roll.width_inches}"</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
                        <p className="text-[10px] text-muted-foreground font-medium">Available</p>
                        <p className="font-extrabold text-primary">{availYards} yd</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
                      <span className="text-muted-foreground">
                        Min Cut: <strong className="text-foreground">{minCut} yd</strong>
                      </span>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">Price: </span>
                        <span className="font-extrabold text-lg text-foreground">
                          {formatBDT(unitPrice)}
                        </span>
                        <span className="text-[10px] text-muted-foreground"> /yd</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    to={`/catalog/${roll.id}`}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs text-center flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 transition-all group-hover:scale-[1.01]"
                  >
                    <span>Request Roll Breakdown</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
