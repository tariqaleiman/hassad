export interface OwnerProfile {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  
  /** بيانات المزرعة (المالك لديه مزرعة واحدة) */
  farmName?: string;
  farmLocation?: string;
  
  updatedAt?: string;
}
