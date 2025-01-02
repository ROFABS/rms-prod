export interface User {
  company_name: string;
  country_code: string;
  createdAt: string;
  email: string;
  fname: string;
  group: number;
  groupUniqueId: string;
  id: number;
  isActive: boolean;
  is_verified: boolean;
  lname: string;
  phone: string;
  profile_pic: string;
  properties: any[];
  role: string;
  uniqueId: string;
  updatedAt: string;
  isOnboarded: boolean;
  onboardingStep: number;
  dayStarted: boolean;
  dayEnded: boolean;
  lastLoginDate: string;
  lastLogoutDate: string;
}
