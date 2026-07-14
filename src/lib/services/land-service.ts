import { landRepository } from "@/lib/repositories/land-repository";
import type { Land, LandFormValues } from "@/lib/types/land";

/** تحويل القيمة المُدخلة إلى فدان (1 فدان = 24 قيراط) */
function computeAreaInFeddan(
  areaValue?: number,
  areaUnit?: string
): number | undefined {
  if (areaValue == null || areaValue <= 0) return undefined;
  if (areaUnit === "qirat") return areaValue / 24;
  return areaValue; // default: feddan
}

/** تنظيف البيانات قبل الحفظ */
function prepareForSave(data: LandFormValues): LandFormValues {
  const clean = { ...data };

  // حساب المساحة بالفدان
  clean.areaInFeddan = computeAreaInFeddan(data.areaValue, data.areaUnit) || 0;

  // تنظيف بيانات الحيازة بناءً على النوع المختار
  if (clean.tenure) {
    const category = clean.tenure.category;

    // إذا مملوكة بالكامل → نحذف كل التفرعات الأخرى
    if (category === "owned_full") {
      clean.tenure.partner = undefined;
      clean.tenure.landlord = undefined;
      clean.tenure.rentCash = undefined;
      clean.tenure.rentCropShare = undefined;
    }
    
    // إذا مملوكة مع شريك
    if (category === "owned_partner") {
      clean.tenure.landlord = undefined;
      clean.tenure.rentCash = undefined;
      clean.tenure.rentCropShare = undefined;
    }

    // إيجار نقدي
    if (category === "rented_cash") {
      clean.tenure.partner = undefined;
      clean.tenure.rentCropShare = undefined;
    }

    // إيجار مشاركة
    if (category === "rented_crop_share") {
      clean.tenure.partner = undefined;
      clean.tenure.rentCash = undefined;
    }

    // إيجار مع شريك (إدارة/زراعة)
    if (category === "rented_partner") {
      // قد يكون هناك إيجار نقدي أو مشاركة، مبدئيا نحن لا ندعم الدمج بينهما في النموذج، 
      // لذا سنعتمد على أن الشريك فقط في المزارعة أو نكتفي بتسجيل اسم المؤجر.
      clean.tenure.rentCash = undefined;
      clean.tenure.rentCropShare = undefined;
    }
  }

  // Firestore doesn't support undefined values, so we strip them
  return JSON.parse(JSON.stringify(clean));
}

async function getAvailableArea(
  landId: string, 
  seasonId: string, 
  ignoreCropCycleId?: string, 
  ignoreLeaseId?: string, 
  userId?: string
): Promise<{ total: number; available: number; usedCrops: number; usedLeases: number }> {
  const land = await landRepository.getById(landId);
  if (!land) throw new Error("قطعة الأرض غير موجودة");

  const { cropCycleRepository } = await import("@/lib/repositories/crop-cycle-repository");
  const activeCrops = await cropCycleRepository.getByField("landId", landId, userId);
  
  let usedCrops = 0;
  activeCrops.forEach(c => {
    if (c.seasonId === seasonId && c.status === "نشطة" && c.id !== ignoreCropCycleId) {
      usedCrops += (c.areaInFeddan || 0);
    }
  });

  const { landLeaseOutRepository } = await import("@/lib/repositories/land-lease-repository");
  const activeLeases = await landLeaseOutRepository.getByField("landId", landId, userId);
  
  let usedLeases = 0;
  activeLeases.forEach(l => {
    // If lease is for this season, or it's a yearly lease that is active
    if (l.status === "نشط" && l.id !== ignoreLeaseId) {
      if (l.duration === "season" && l.seasonId === seasonId) {
        usedLeases += (l.areaInFeddan || 0);
      } else if (l.duration === "year") {
        // TODO: In a real system we would check if the season overlaps with the yearly lease dates.
        // For simplicity, we assume active yearly leases block the land across all seasons.
        usedLeases += (l.areaInFeddan || 0);
      }
    }
  });

  return {
    total: land.areaInFeddan,
    usedCrops,
    usedLeases,
    available: land.areaInFeddan - usedCrops - usedLeases
  };
}

export const landService = {
  list: (userId?: string): Promise<Land[]> => landRepository.getAll({ userId }),
  listByFarm: (farmId: string, userId?: string): Promise<Land[]> => landRepository.getByField("farmId", farmId, userId),
  get: (id: string): Promise<Land | null> => landRepository.getById(id),
  create: (data: LandFormValues, userId?: string): Promise<Land> =>
    landRepository.create(prepareForSave(data), userId),
  update: (id: string, data: Partial<LandFormValues>, userId?: string): Promise<Land> =>
    landRepository.update(id, prepareForSave(data as LandFormValues), userId),
  remove: (id: string, userId?: string): Promise<void> =>
    landRepository.softDelete(id, userId),
  getAvailableArea,
};
