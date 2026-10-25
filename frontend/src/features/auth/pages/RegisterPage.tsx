import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { Factory, ShoppingBag, AlertCircle, UserPlus, CheckCircle2 } from "lucide-react";
import { authApi } from "../api";
import { useAuthStore } from "../store";

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  phone: z
    .string()
    .min(11, "Bangladeshi phone must be at least 11 digits")
    .regex(/^(?:\+?88)?01[3-9]\d{8}$/, "Valid BD phone format required (e.g. 01711223344)"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["FACTORY", "BUYER"]),
  company_name: z.string().min(2, "Company or boutique name is required"),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  preferred_language: z.enum(["bn", "en"]).default("bn"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"FACTORY" | "BUYER">("BUYER");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "BUYER",
      preferred_language: (i18n.language === "en" ? "en" : "bn") as "bn" | "en",
    },
  });

  const handleRoleSelect = (role: "FACTORY" | "BUYER") => {
    setSelectedRole(role);
    setValue("role", role);
  };

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const data = await authApi.register(values);
      setAuth(data.user, data.access_token);
      navigate("/approval-pending", { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || "Registration failed. Please check your details.";
      setServerError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl space-y-8 bg-card p-8 rounded-2xl shadow-xl border border-border">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {t("auth.signUpTitle")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("auth.signUpSubtitle")}
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleRoleSelect("BUYER")}
            className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
              selectedRole === "BUYER"
                ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                : "border-border hover:border-muted-foreground/30 bg-background"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              {selectedRole === "BUYER" && (
                <CheckCircle2 className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">
                {t("auth.roleBuyer")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                For boutiques, independent designers, and clothing brands sourcing small cuts.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect("FACTORY")}
            className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
              selectedRole === "FACTORY"
                ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                : "border-border hover:border-muted-foreground/30 bg-background"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Factory className="w-5 h-5" />
              </div>
              {selectedRole === "FACTORY" && (
                <CheckCircle2 className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">
                {t("auth.roleFactory")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                For garment factories, knitting mills, and export houses liquidating surplus rolls.
              </p>
            </div>
          </button>
        </div>

        {serverError && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("auth.companyNameLabel")} *
            </label>
            <input
              type="text"
              {...register("company_name")}
              placeholder={
                selectedRole === "FACTORY"
                  ? "e.g. Apex Spinning Mills Ltd"
                  : "e.g. Dhaka Heritage Boutique"
              }
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm"
            />
            {errors.company_name && (
              <p className="mt-1 text-xs text-destructive">{errors.company_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t("auth.firstNameLabel")}
              </label>
              <input
                type="text"
                {...register("first_name")}
                placeholder="Mohammad"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t("auth.lastNameLabel")}
              </label>
              <input
                type="text"
                {...register("last_name")}
                placeholder="Rahman"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t("auth.emailLabel")} *
              </label>
              <input
                type="email"
                {...register("email")}
                placeholder="manager@company.com"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t("auth.phoneLabel")} *
              </label>
              <input
                type="text"
                {...register("phone")}
                placeholder="01711223344"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("auth.passwordLabel")} *
            </label>
            <input
              type="password"
              {...register("password")}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-primary-foreground bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span>{t("common.loading")}</span>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>{t("auth.submitSignUp")}</span>
              </>
            )}
          </button>

          <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border">
            <span>{t("auth.haveAccount")} </span>
            <Link to="/login" className="font-semibold text-primary hover:underline">
              {t("nav.login")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
