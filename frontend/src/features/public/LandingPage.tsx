import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  ShieldCheck,
  Scissors,
  Truck,
  Sparkles,
  CheckCircle,
  Factory,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        {/* Ambient Gradient Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-primary/15 via-accent/15 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("hero.badge")}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.15]">
            {t("hero.title")}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("hero.subtitle")}
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/catalog"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all text-sm group"
            >
              <span>{t("hero.ctaBuyer")}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-foreground bg-card border border-border hover:bg-muted shadow-sm transition-all text-sm"
            >
              <Factory className="w-4 h-4 text-primary" />
              <span>{t("hero.ctaFactory")}</span>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="bg-card/70 backdrop-blur-md p-6 rounded-2xl border border-border/60 shadow-sm text-left">
              <p className="text-3xl font-extrabold text-foreground">1,240+</p>
              <p className="text-xs font-medium text-muted-foreground mt-1">
                {t("hero.statsRolls")}
              </p>
            </div>
            <div className="bg-card/70 backdrop-blur-md p-6 rounded-2xl border border-border/60 shadow-sm text-left">
              <p className="text-3xl font-extrabold text-primary">185,000</p>
              <p className="text-xs font-medium text-muted-foreground mt-1">
                {t("hero.statsYards")}
              </p>
            </div>
            <div className="bg-card/70 backdrop-blur-md p-6 rounded-2xl border border-border/60 shadow-sm text-left">
              <p className="text-3xl font-extrabold text-foreground">42</p>
              <p className="text-xs font-medium text-muted-foreground mt-1">
                {t("hero.statsFactories")}
              </p>
            </div>
            <div className="bg-card/70 backdrop-blur-md p-6 rounded-2xl border border-border/60 shadow-sm text-left">
              <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                40% - 60%
              </p>
              <p className="text-xs font-medium text-muted-foreground mt-1">
                {t("hero.statsSaving")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works: Precision Roll Breakdown Flow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            How Roll Breakdown Works
          </h2>
          <p className="text-sm text-muted-foreground">
            A reliable 4-step verified logistics flow from factory warehouse to boutique doorstep.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Step 1 */}
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4 hover:border-primary/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="font-semibold text-foreground text-base">Factory Lists Roll</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Export garment mills list surplus rolls with certified GSM, composition, width, and quality grade.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4 hover:border-primary/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="font-semibold text-foreground text-base">Boutique Cuts Yardage</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Buyers request fractional yardage (e.g. 20 yd from a 100 yd roll). Concurrency hold locks available stock.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4 hover:border-primary/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="font-semibold text-foreground text-base">Hub Cuts & Labels</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              FabriLink Hub staff receives roll, executes precision machine cut, records waste, and prints unique barcode.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4 hover:border-primary/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-lg">
              4
            </div>
            <h3 className="font-semibold text-foreground text-base">Doorstep Delivery</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Courier partners dispatch cut packages directly to your boutique with live tracking and payout settlement.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 rounded-3xl p-8 sm:p-12 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <ShieldCheck className="w-4 h-4" />
              Verified RMG Quality Assurance
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
              Never buy blind fabric remnants again.
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every surplus roll listed on FabriLink comes from export orders with verified Trade License, documented GSM lab tests, and sample swatch test cuts on demand.
            </p>
          </div>
          <Link
            to="/register"
            className="flex-shrink-0 px-8 py-3.5 rounded-xl font-semibold text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all text-sm"
          >
            Join FabriLink Today
          </Link>
        </div>
      </section>
    </div>
  );
};
