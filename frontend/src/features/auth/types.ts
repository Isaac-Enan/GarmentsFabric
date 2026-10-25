export type UserRole = "FACTORY" | "BUYER" | "HUB_STAFF" | "ADMIN";

export interface CompanySummary {
  id: string;
  name: string;
  company_type: "FACTORY" | "BUYER";
  verification_status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  credit_limit: string;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  designation: string;
  avatar: string | null;
  preferred_language: "bn" | "en";
}

export interface User {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  is_verified: boolean;
  is_active: boolean;
  profile: UserProfile;
  company: CompanySummary | null;
  date_joined: string;
}

export interface AuthSuccessData {
  user: User;
  access_token: string;
}
