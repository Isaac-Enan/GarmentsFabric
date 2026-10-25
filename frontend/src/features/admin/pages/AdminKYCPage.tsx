import React, { useState, useEffect } from "react";
import { Users, ShieldCheck, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { apiClient } from "@/api/client";

interface PendingCompany {
  id: string;
  name: string;
  company_type: string;
  contact_email: string;
  contact_phone: string;
  verification_status: string;
  trade_license_number: string;
  created_at: string;
}

export const AdminKYCPage: React.FC = () => {
  const [companies, setCompanies] = useState<PendingCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/companies/admin/kyc-queue/");
      setCompanies(res.data.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleVerify = async (id: string, action: "APPROVE" | "REJECT") => {
    try {
      await apiClient.post(`/companies/admin/${id}/verify/`, {
        action,
        rejection_reason: action === "REJECT" ? "Document invalid or incomplete." : "",
      });
      setActionSuccess(`Company successfully ${action === "APPROVE" ? "approved" : "rejected"}.`);
      fetchPending();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Central Admin — KYC Approvals</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Review and approve trade licenses, TIN/BIN, and assign credit limits for garment mills and boutiques.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading KYC Queue...</div>
      ) : companies.length === 0 ? (
        <div className="bg-card p-12 rounded-2xl border border-border text-center space-y-3">
          <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-semibold text-foreground">All Verification Requests Cleared</h3>
          <p className="text-xs text-muted-foreground">There are currently no factories or buyers waiting for KYC review.</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Trade License</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {companies.map((co) => (
                  <tr key={co.id} className="hover:bg-muted/30">
                    <td className="py-3 px-4 font-semibold text-foreground">{co.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                        {co.company_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {co.contact_email} <br />
                      {co.contact_phone}
                    </td>
                    <td className="py-3 px-4 font-mono">{co.trade_license_number || "Pending upload"}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleVerify(co.id, "APPROVE")}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-all"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleVerify(co.id, "REJECT")}
                        className="px-2.5 py-1 rounded-lg bg-destructive text-white font-medium hover:bg-destructive/90 transition-all"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
