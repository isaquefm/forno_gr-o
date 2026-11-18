export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
  provider: "google";
  firstVisitAt: string;
  lastLoginAt: string;
  loginCount: number;
}

export interface RegisterEntryPayload {
  name: string;
  email: string;
  picture?: string;
}
