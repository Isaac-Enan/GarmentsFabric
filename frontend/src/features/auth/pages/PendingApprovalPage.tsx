import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Clock, CheckCircle2, FileText, ArrowRight } from "lucide-react";
import { useAuthStore } from "../store";

export const PendingApprovalPage: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg bg-card p-8 rounded-2xl shadow-xl border border-border text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 mb-2">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {t("auth.pendingTitle")}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {t("auth.pendingMessage")}
          </p>
        </div>

        {user?.company && (
          <div className="bg-muted/40 p-5 rounded-xl text-left border border-border space-y-2 text-sm">
            <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Account Status</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                {user.company.verification_status}
              </span>
            </div>
            <p className="font-semibold text-foreground">{user.company.name}</p>
            <p className="text-xs text-muted-foreground">Type: {user.company.company_type}</p>
          </div>
        )}

        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center gap-3 text-left text-xs text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>Profile and contact details saved</span>
          </div>
          <div className="flex items-center gap-3 text-left text-xs text-muted-foreground">
            <FileText className="w-4 h-4 text-primary flex-shrink-0" />
            <span>Trade license verification queue: Position #4 (Est. 2-4 hours)</span>
          </div>
        </div>

        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-primary hover:bg-primary/10 transition-all"
          >
            {t("auth.backHome")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
