export interface ParsedUnit {
  subUnit: string;
  subUnitRatio: number | undefined;
}

export function parseUnitString(unit: string): ParsedUnit | null {
  if (!unit) return null;

  const lowercaseUnit = unit.toLowerCase().trim();

  // 1. Shokara / Gwal (Bag) -> Kilo
  if (lowercaseUnit.includes("شيكارة") || lowercaseUnit.includes("شيكاره") || lowercaseUnit.includes("جوال") || lowercaseUnit.includes("كيس")) {
    const ratioMatch = lowercaseUnit.match(/\b(\d+)\b/); // Find the first number in the string
    return {
      subUnit: "كيلو",
      subUnitRatio: ratioMatch ? parseInt(ratioMatch[1], 10) : undefined,
    };
  }

  // 2. Ton -> Kilo (1000)
  if (lowercaseUnit.includes("طن")) {
    return {
      subUnit: "كيلو",
      subUnitRatio: 1000,
    };
  }

  // 3. Liter -> Milli
  // If the main unit is specifically "لتر" without "عبوة", or if it's "عبوة 1 لتر"
  if (lowercaseUnit.includes("عبوة") || lowercaseUnit.includes("زجاجة") || lowercaseUnit.includes("علبة") || lowercaseUnit.includes("جركن")) {
    const ratioMatch = lowercaseUnit.match(/\b(\d+)\b/);
    let ratio = ratioMatch ? parseInt(ratioMatch[1], 10) : undefined;
    
    // If it mentions Liter or ml
    if (lowercaseUnit.includes("لتر")) {
      // If it says "عبوة 1 لتر", ratio might be 1000 milli, or it could mean subUnit is liter and ratio is 1?
      // Usually users mean subUnit is ml
      return {
        subUnit: "ملي",
        subUnitRatio: ratio ? ratio * 1000 : 1000, // e.g. عبوة 1 لتر -> 1000 ملي, عبوة 5 لتر -> 5000 ملي
      };
    } else if (lowercaseUnit.includes("ملي") || lowercaseUnit.includes("مل")) {
      return {
        subUnit: "ملي",
        subUnitRatio: ratio, // e.g. عبوة 250 مل -> 250 ملي
      };
    } else if (lowercaseUnit.includes("جرام") || lowercaseUnit.includes("جم")) {
        // e.g. عبوة 500 جرام
        return {
            subUnit: "جرام",
            subUnitRatio: ratio, 
        };
    } else if (lowercaseUnit.includes("كيلو")) {
        // e.g. عبوة 5 كيلو
        return {
            subUnit: "كيلو",
            subUnitRatio: ratio, 
        };
    }

    // Default for packaging if no specific metric found
    return {
      subUnit: "قطعة",
      subUnitRatio: ratio,
    };
  }

  // 4. Irdeb -> Kilo (150)
  if (lowercaseUnit.includes("إردب") || lowercaseUnit.includes("اردب")) {
    return {
      subUnit: "كيلو",
      subUnitRatio: 150, // Standard approximate for wheat, can be changed by user
    };
  }
  
  // 5. Qintar -> Kilo (157.5)
  if (lowercaseUnit.includes("قنطار")) {
    return {
      subUnit: "كيلو",
      subUnitRatio: 157.5, // Standard for cotton
    };
  }

  // No specific parsing logic matched
  return null;
}
