export interface OwnerProfile {
  id: string; // The user UID
  email: string;
  name: string;
  phone?: string;
  address?: string;
  gender?: "male" | "female";
  dateOfBirth?: string;
  userLocation?: string;
  avatar?: string;
  
  companyName?: string;
  taxId?: string;
  commercialRegister?: string;
  establishmentDate?: string;
  companyLocation?: string;
  companyPhone?: string;
  companyEmail?: string;
  logo?: string;
  
  updatedAt?: number;
  createdAt?: number;
}
