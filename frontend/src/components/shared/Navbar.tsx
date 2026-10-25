import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Layers,
  Globe,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  ShoppingBag,
  Factory,
  Scissors,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/store";
import { authApi } from "@/features/auth/api";

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const toggleLanguage = () => {
    const nextLang = i18n.language === "bn" ? "en" : "bn";
    i18n.changeLanguage(nextLang);
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore network errors on logout
    } finally {
      clearAuth();
      navigate("/");
    }
  };

  const getDashboardPath = () => {
    if (!user) return "/";
    switch (user.role) {
      case "FACTORY":
        return "/factory/dashboard";
      case "HUB_STAFF":
        return "/hub/queue";
      case "ADMIN":
        return "/admin/kyc";
      case "BUYER":
      default:
        return "/buyer/orders";
    }
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                FabriLink
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground -mt-1">
                B2B Surplus Exchange
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              to="/catalog"
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              {t("nav.browse")}
            </Link>
            <Link
              to="/how-it-works"
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              {t("nav.howItWorks")}
            </Link>

            {/* Role specific quick link */}
            {isAuthenticated && user && (
              <Link
                to={getDashboardPath()}
                className="text-foreground/80 hover:text-primary transition-colors flex items-center gap-1.5 font-semibold text-primary"
              >
                {user.role === "FACTORY" && <Factory className="w-4 h-4" />}
                {user.role === "BUYER" && <ShoppingBag className="w-4 h-4" />}
                {user.role === "HUB_STAFF" && <Scissors className="w-4 h-4" />}
                {user.role === "ADMIN" && <ShieldCheck className="w-4 h-4" />}
                {t("nav.dashboard")}
              </Link>
            )}
          </nav>

          {/* Actions: Language Toggle & User */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-semibold text-foreground/80 transition-all"
              title="Toggle Language / ভাষা পরিবর্তন"
            >
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span>{i18n.language === "bn" ? "বাংলা" : "English"}</span>
            </button>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-medium transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px]">
                    {user.profile?.first_name?.[0] || user.email[0].toUpperCase()}
                  </div>
                  <span className="font-semibold text-foreground max-w-[120px] truncate">
                    {user.profile?.full_name || user.email}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-card border border-border shadow-xl py-1 z-50 text-sm">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="font-semibold text-foreground truncate">
                        {user.company?.name || user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Role: <span className="font-medium text-primary">{user.role}</span>
                      </p>
                    </div>
                    <Link
                      to={getDashboardPath()}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-muted text-foreground"
                    >
                      <UserIcon className="w-4 h-4" />
                      {t("nav.dashboard")}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-destructive hover:bg-destructive/10 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      {t("nav.logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-foreground/90 hover:text-primary transition-colors"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl shadow-md shadow-primary/20 transition-all"
                >
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="p-1.5 rounded-lg border border-border text-xs font-semibold"
            >
              {i18n.language === "bn" ? "বাং" : "EN"}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-foreground hover:bg-muted"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/catalog"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-foreground"
          >
            {t("nav.browse")}
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-foreground"
          >
            {t("nav.howItWorks")}
          </Link>
          {isAuthenticated && (
            <Link
              to={getDashboardPath()}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-primary font-semibold"
            >
              {t("nav.dashboard")} ({user?.role})
            </Link>
          )}
          <div className="pt-4 border-t border-border flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full py-2.5 px-4 text-center rounded-xl bg-destructive/10 text-destructive font-medium"
              >
                {t("nav.logout")}
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 text-center rounded-xl border border-border font-medium"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 text-center rounded-xl bg-primary text-primary-foreground font-semibold"
                >
                  {t("nav.register")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
