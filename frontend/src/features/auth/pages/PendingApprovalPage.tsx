import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Clock,
  CheckCircle2,
  FileText,
  ArrowRight,
  Upload,
  AlertCircle,
  Building,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "../store";
import { apiClient } from "@/api/client";
import { authApi } from "../api";

export const PendingApprovalPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();

  const [tradeLicense, setTradeLicense] = useState("");
  const [tinNumber, setTinNumber] = useState("");
  const [binNumber, setBinNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // If user's company is already approved, redirect to their portal
    if (user?.company?.verification_status === "APPROVED") {
      if (user.role === "FACTORY") {
        navigate("/factory/dashboard");
      } else {
        navigate("/catalog");
      }
    }
  }, [user, navigate]);

  const handleSubmitKYC = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      await apiClient.patch("/companies/my-company/", {
        trade_license_number: tradeLicense,
        tin_number: tinNumber,
        bin_number: binNumber,
      });

      // Refresh current user data
      const updatedUser = await authApi.getMe();
      setUser(updatedUser);

      setSuccessMessage("KYC documentation submitted successfully! Admin compliance review initiated.");
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message || "Failed to submit KYC details. Please check inputs."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl bg-card p-8 rounded-3xl shadow-xl border border-border space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 mb-2">
            <Clock className="w-7 h-7 animate-pulse" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {t("auth.pendingTitle")}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
            {t("auth.pendingMessage")}
          </p>
        </div>

        {/* Company Summary Card */}
        {user?.company && (
          <div className="bg-muted/40 p-4 rounded-2xl border border-border space-y-2 text-xs">
            <div className="flex justify-between items-center font-bold">
              <span className="text-foreground text-sm flex items-center gap-1.5">
                <Building className="w-4 h-4 text-primary" />
                {user.company.name}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                {user.company.verification_status}
              </span>
            </div>
            <p className="text-muted-foreground">
              Account Role: <strong>{user.company.company_type}</strong> • Email: {user.email}
            </p>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Trade License & Compliance Form */}
        <form onSubmit={handleSubmitKYC} className="p-5 rounded-2xl bg-card border border-border space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>Submit Business Verification Details</span>
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Enter your Bangladesh Trade License & Tax Identification details for instant credit limit unlocking.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-bold text-foreground mb-1">
                Trade License Number *
              </label>
              <input
                type="text"
                required
                value={tradeLicense}
                onChange={(e) => setTradeLicense(e.target.value)}
                placeholder="e.g. TRAD/DNCC/049182/2025"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-card font-mono text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-foreground mb-1">TIN Number (Tax ID)</label>
                <input
                  type="text"
                  value={tinNumber}
                  onChange={(e) => setTinNumber(e.target.value)}
                  placeholder="e.g. 849201948214"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-card font-mono text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">BIN / VAT Registration</label>
                <input
                  type="text"
                  value={binNumber}
                  onChange={(e) => setBinNumber(e.target.value)}
                  placeholder="e.g. 001928471-0101"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-card font-mono text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? "Submitting to Compliance..." : "Submit Verification Documents"}
          </button>
        </form>

        <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
          <Link
            to="/catalog"
            className="text-primary hover:underline font-semibold"
          >
            Preview Fabric Catalog →
          </Link>

          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground font-medium"
          >
            {t("auth.backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
};
