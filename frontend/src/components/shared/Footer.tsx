import React from "react";
import { Link } from "react-router-dom";
import { Layers, MapPin, Phone, Mail, ShieldCheck } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                <Layers className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-foreground">
                FabriLink
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Bangladesh's trusted B2B circular fabric exchange. Monetizing export factory dead-stock and empowering local boutiques with accessible roll breakdowns.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Verified BGMEA / BKMEA Mill Listings</span>
            </div>
          </div>

          {/* Hub Locations */}
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              Cutting & Logistics Hubs
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>• Tejgaon Central Hub, Dhaka</li>
              <li>• Konabari Hub, Gazipur</li>
              <li>• Fatullah Hub, Narayanganj</li>
              <li>• Baizid Hub, Chattogram</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3">Quick Links</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link to="/catalog" className="hover:text-primary transition-colors">
                  Surplus Fabric Catalog
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-primary transition-colors">
                  Precision Roll Cutting Flow
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary transition-colors">
                  List Factory Surplus
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary transition-colors">
                  B2B Net-Term Credit Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3">Contact Support</h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-primary" />
                +880 9612-FABRI (32274)
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-primary" />
                support@fabrilink.com.bd
              </p>
              <p className="pt-2 text-[11px] text-muted-foreground/80">
                Operating Hours: Sat - Thu (09:00 AM - 07:00 PM)
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} FabriLink Technologies Ltd. Built for Bangladesh's Textile Ecosystem.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <span className="hover:text-primary cursor-pointer">Privacy Policy</span>
            <span className="hover:text-primary cursor-pointer">Terms of Trading</span>
            <span className="hover:text-primary cursor-pointer">Security Audit</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
