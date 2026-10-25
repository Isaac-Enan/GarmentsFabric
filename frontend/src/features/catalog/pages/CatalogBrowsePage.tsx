import React from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Layers, ArrowRight, Tag } from "lucide-react";
import { formatBDT } from "@/lib/utils";

// Demo sample rolls preview for Phase 1
const SAMPLE_ROLLS = [
  {
    id: "1",
    code: "ROL-2026-CT492",
    title: "100% Combed Cotton Single Jersey",
    type: "Single Jersey",
    gsm: 180,
    width: 60,
    color: "Navy Blue",
    colorHex: "#1E3A8A",
    availableYards: 120,
    minCut: 10,
    pricePerYard: 240,
    mill: "Square Fashions Ltd, Gazipur",
    grade: "Grade A Export Surplus",
  },
  {
    id: "2",
    code: "ROL-2026-DN819",
    title: "Stretch Denim 11.5oz Indigo Warp",
    type: "Denim Twill",
    gsm: 390,
    width: 58,
    color: "Dark Indigo",
    colorHex: "#1E1B4B",
    availableYards: 85,
    minCut: 15,
    pricePerYard: 380,
    mill: "Ha-Meem Denim Mill, Savar",
    grade: "Fresh Surplus",
  },
  {
    id: "3",
    code: "ROL-2026-LN301",
    title: "Pure Washed Linen Plain Weave",
    type: "Linen",
    gsm: 160,
    width: 54,
    color: "Natural Oatmeal",
    colorHex: "#E5E0D8",
    availableYards: 60,
    minCut: 5,
    pricePerYard: 520,
    mill: "Beximco Textiles, Gazipur",
    grade: "Grade A Export Surplus",
  },
];

export const CatalogBrowsePage: React.FC = () => {
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
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by GSM, composition, mill..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground">
            <Filter className="w-3.5 h-3.5 text-primary" />
            Filters
          </button>
        </div>
      </div>

      {/* Grid of Fabric Rolls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SAMPLE_ROLLS.map((roll) => (
          <div
            key={roll.id}
            className="group bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Color swatch top banner */}
              <div
                className="h-28 w-full relative flex items-end p-3"
                style={{ backgroundColor: roll.colorHex }}
              >
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
                  {roll.grade}
                </span>
                <span className="ml-auto font-mono text-[10px] text-white/80 font-bold bg-black/40 px-2 py-0.5 rounded">
                  {roll.code}
                </span>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                    {roll.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{roll.mill}</p>
                </div>

                {/* Specs pill badges */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-muted/50 border border-border/50">
                    <p className="text-[10px] text-muted-foreground">GSM</p>
                    <p className="font-bold text-foreground">{roll.gsm}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50 border border-border/50">
                    <p className="text-[10px] text-muted-foreground">Width</p>
                    <p className="font-bold text-foreground">{roll.width}"</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50 border border-border/50">
                    <p className="text-[10px] text-muted-foreground">Available</p>
                    <p className="font-bold text-primary">{roll.availableYards} yd</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-muted-foreground">
                    Min Cut: <strong className="text-foreground">{roll.minCut} yd</strong>
                  </span>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">Price: </span>
                    <span className="font-extrabold text-base text-foreground">
                      {formatBDT(roll.pricePerYard)}
                    </span>
                    <span className="text-[10px] text-muted-foreground"> /yd</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <Link
                to={`/catalog/${roll.id}`}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-center flex items-center justify-center gap-1.5 bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary transition-all"
              >
                <span>Request Roll Breakdown</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
