import { cropProgramTemplateRepository, cropCycleProgramRepository } from "../repositories/crop-program-repository";
import type { CropProgramTemplate, CropCycleProgram, CyclePhaseExecution } from "../types/crop-program";

export const cropProgramService = {
  // Templates
  createTemplate: async (data: Partial<CropProgramTemplate>, userId?: string): Promise<CropProgramTemplate> => {
    return cropProgramTemplateRepository.create(data, userId);
  },
  getTemplatesByFarm: async (farmId: string): Promise<CropProgramTemplate[]> => {
    return cropProgramTemplateRepository.getByField("farmId", farmId);
  },
  getSystemTemplates: async (): Promise<CropProgramTemplate[]> => {
    // افترض أن البرامج الافتراضية ليس لها farmId و isCustom = false
    const all = await cropProgramTemplateRepository.getAll();
    const system = all.filter(t => !t.isCustom && !t.farmId);
    if (system.length > 0) return system;

    // Hardcoded System Templates if DB is empty
    return [
      {
        id: "sys-tomato-1",
        name: "برنامج الطماطم الأساسي (صيفي)",
        cropName: "طماطم",
        description: "برنامج متكامل لزراعة الطماطم في العروة الصيفية يشمل الري والتسميد والوقاية.",
        isCustom: false,
        phases: [
          { id: "p1", dayNumber: 0, type: "ري", title: "رية الزراعة (تخضير)", description: "ري غزير للشتلات بعد الزراعة مباشرة" },
          { id: "p2", dayNumber: 3, type: "ري", title: "رية المحاياة", description: "ري خفيف لتثبيت الشتلات" },
          { id: "p3", dayNumber: 7, type: "تسميد", title: "تسميد تنشيطي", description: "إضافة أعفان جذور ومنشط جذور", recommendedProduct: "منشط جذور (هيوميك)", recommendedQuantity: 2, quantityUnit: "لتر/فدان" },
          { id: "p4", dayNumber: 15, type: "رش وقائي", title: "رش حشري وقائي", description: "للوقاية من الذبابة البيضاء", recommendedProduct: "أستامبريد 20%", recommendedQuantity: 100, quantityUnit: "جرام/فدان" },
          { id: "p5", dayNumber: 20, type: "تسميد", title: "تسميد آزوتي", description: "تشجيع النمو الخضري", recommendedProduct: "نترات نشادر", recommendedQuantity: 50, quantityUnit: "كجم/فدان" },
          { id: "p6", dayNumber: 35, type: "تسميد", title: "تسميد بوتاسي", description: "مرحلة التزهير وعقد الثمار", recommendedProduct: "سلفات بوتاسيوم", recommendedQuantity: 25, quantityUnit: "كجم/فدان" },
        ]
      },
      {
        id: "sys-wheat-1",
        name: "برنامج القمح المتكامل",
        cropName: "قمح",
        description: "برنامج متابعة محصول القمح خطوة بخطوة.",
        isCustom: false,
        phases: [
          { id: "w1", dayNumber: 0, type: "ري", title: "رية الزراعة", description: "رية غزيرة بعد البدار" },
          { id: "w2", dayNumber: 21, type: "ري", title: "رية المحاياة (الشتية)", description: "مهمة جداً للنمو وتفريع النبات", recommendedProduct: "يوريا 46%", recommendedQuantity: 50, quantityUnit: "كجم/فدان" },
          { id: "w3", dayNumber: 30, type: "رش علاجي", title: "مكافحة حشائش عريضة", description: "رش مبيد حشائش للزمير والعريضة", recommendedProduct: "جرانستار", recommendedQuantity: 8, quantityUnit: "جرام/فدان" },
          { id: "w4", dayNumber: 45, type: "ري", title: "الرية الثانية", description: "تسميد الدفعة الثانية من الآزوت", recommendedProduct: "نترات نشادر", recommendedQuantity: 50, quantityUnit: "كجم/فدان" },
          { id: "w5", dayNumber: 70, type: "ري", title: "الرية الثالثة (طرد السنابل)", description: "ري بدون تسميد لتكوين السنابل" },
        ]
      },
      {
        id: "sys-maize-1",
        name: "برنامج الذرة الشامية المتكامل",
        cropName: "ذرة شامية",
        description: "برنامج متكامل لزراعة وتسميد ومكافحة الذرة الشامية.",
        isCustom: false,
        phases: [
          { id: "m1", dayNumber: 0, type: "ري", title: "رية الزراعة (الخضير)", description: "رية الزراعة بعد التخطيط والزراعة العفير" },
          { id: "m2", dayNumber: 18, type: "ري", title: "رية المحاياة", description: "مهمة جدا للنمو الخضري، يتم خف النباتات قبلها", recommendedProduct: "يوريا 46%", recommendedQuantity: 100, quantityUnit: "كجم/فدان" },
          { id: "m3", dayNumber: 25, type: "رش وقائي", title: "مكافحة دودة الحشد", description: "رش وقائي ضد دودة الحشد الخريفية في قلب النبات", recommendedProduct: "إمامكتين بنزوات", recommendedQuantity: 100, quantityUnit: "جرام/فدان" },
          { id: "m4", dayNumber: 35, type: "ري", title: "الرية الثانية", description: "إضافة الدفعة الثانية من السماد الآزوتي", recommendedProduct: "نترات نشادر", recommendedQuantity: 100, quantityUnit: "كجم/فدان" },
          { id: "m5", dayNumber: 50, type: "ري", title: "الرية الثالثة (التزهير)", description: "أهم رية في حياة النبات (خروج السنبلة)" },
        ]
      },
      {
        id: "sys-super-seeds-1",
        name: "برنامج بطيخ التسلية (اللب السوبر)",
        cropName: "لب سوبر",
        description: "برنامج العناية بمحصول بطيخ اللب (اللب السوبر / الرومي).",
        isCustom: false,
        phases: [
          { id: "s1", dayNumber: 0, type: "ري", title: "رية الزراعة", description: "ري الأرض بعد زراعة البذور" },
          { id: "s2", dayNumber: 21, type: "عزيق", title: "خربشة وعزيق", description: "تكسير الشقوق وإزالة الحشائش قبل المحاياة" },
          { id: "s3", dayNumber: 25, type: "ري", title: "رية المحاياة", description: "تسميد تنشيطي لدفع النبات للنمو", recommendedProduct: "نترات نشادر + سلفات بوتاسيوم", recommendedQuantity: 50, quantityUnit: "كجم/فدان" },
          { id: "s4", dayNumber: 40, type: "رش علاجي", title: "مكافحة البياض الدقيقي", description: "رش كبريت ميكروني أو مبيد فطري وقائي", recommendedProduct: "كبريت ميكروني", recommendedQuantity: 250, quantityUnit: "جرام/فدان" },
          { id: "s5", dayNumber: 55, type: "ري", title: "رية التزهير والعقد", description: "ري منتظم للحفاظ على الأزهار وعقد الثمار", recommendedProduct: "كالسيوم بورون", recommendedQuantity: 1, quantityUnit: "لتر/فدان" },
        ]
      },
      {
        id: "sys-rice",
        name: "برنامج الأرز (طريقة المشتل)",
        cropName: "أرز",
        plantingMethods: ["تشتيل"],
        description: "برنامج زراعي متكامل ومحترف للأرز يبدأ من تجهيز المشتل، نقع البذور، الشتل، التسميد، وحتى الحصاد في 120 يوم.",
        isCustom: false,
        phases: [
          { id: "r1", dayNumber: -30, type: ["تجهيز أرض"], title: "حرث المشتل", description: "حرث المشتل وتجهيزه للزراعة" },
          { id: "r2", dayNumber: -28, type: ["أخرى"], title: "نقع التقاوي", description: "وضع التقاوي في المياه لبدء الاستنبات" },
          { id: "r3", dayNumber: -25, type: ["زراعة", "ري"], title: "بدر التقاوي وتنزيل المياه", description: "بدر التقاوي في المشتل وإضافة مياه الرية الأولى" },
          { id: "r4", dayNumber: -23, type: ["رش مبيدات"], title: "مكافحة حشائش المشتل", description: "إضافة المبيدات اللازمة لحماية المشتل" },
          { id: "r5", dayNumber: -1, type: ["أخرى"], title: "سحب المشتل", description: "سحب المشتل استعداداً للنقل للأرض المستديمة" },
          { id: "r6", dayNumber: 0, type: ["زراعة", "ري"], title: "نقل الشتلات (التشتيل)", description: "نقل الشتلات للأرض المستديمة وغمرها بالماء" },
          { id: "r7", dayNumber: 5, type: ["رش مبيدات"], title: "مكافحة الحشائش بعد الشتل", description: "إضافة مبيدات حشائش متخصصة للأرز" },
          { id: "r8", dayNumber: 15, type: ["تسميد"], title: "الدفعة الآزوتية الأولى", description: "إضافة اليوريا أو السلفات", recommendedProduct: "يوريا 46%", recommendedQuantity: 50, quantityUnit: "كجم/فدان" },
          { id: "r9", dayNumber: 30, type: ["رش مبيدات"], title: "مكافحة دودة الأرز", description: "الرش الدوري لمكافحة الدودة" },
          { id: "r10", dayNumber: 50, type: ["تسميد"], title: "الدفعة الآزوتية الثانية", description: "إضافة اليوريا لدفع النبات للتفريع" },
          { id: "r11", dayNumber: 110, type: ["أخرى"], title: "تنشيف الحقل", description: "منع الري قبل الحصاد لتجهيز الأرض للضم" },
          { id: "r12", dayNumber: 120, type: ["حصاد"], title: "الحصاد", description: "ضم وحصاد الأرز" },
        ]
      },
      {
        id: "sys-cotton",
        name: "برنامج القطن (الذهب الأبيض)",
        cropName: "قطن",
        description: "إدارة محصول القطن بدءاً من التخطيط وحتى الجني.",
        isCustom: false,
        phases: [
          { id: "c1", dayNumber: 0, type: "ري", title: "رية الزراعة", description: "الزراعة على خطوط وإعطاء رية غزيرة" },
          { id: "c2", dayNumber: 20, type: "عزيق", title: "خف وعزيق", description: "الخف على نباتين في الجورة وإزالة الحشائش" },
          { id: "c3", dayNumber: 35, type: "ري وتسميد", title: "رية المحاياة", description: "أهم رية للقطن مع إضافة الدفعة الأولى آزوت", recommendedProduct: "نترات نشادر", recommendedQuantity: 50, quantityUnit: "كجم/فدان" },
          { id: "c4", dayNumber: 70, type: "رش علاجي", title: "مكافحة دودة اللوز", description: "رش وقائي ضد دودة اللوز الشوكية أو القرنفلية", recommendedProduct: "كلورزان", recommendedQuantity: 1, quantityUnit: "لتر/فدان" },
          { id: "c5", dayNumber: 150, type: "حصاد", title: "الجنية الأولى", description: "جمع وتفتيح اللوز المبكر" },
        ]
      },
      {
        id: "sys-sugar-beet",
        name: "برنامج بنجر السكر",
        cropName: "بنجر السكر",
        description: "زراعة البنجر لإنتاج السكر، مع التركيز على التحجيم وزيادة نسبة السكر.",
        isCustom: false,
        phases: [
          { id: "sb1", dayNumber: 0, type: "ري", title: "رية الزراعة", description: "الزراعة على مصاطب أو خطوط" },
          { id: "sb2", dayNumber: 25, type: "عزيق", title: "خف وإزالة حشائش", description: "ترك نبات واحد قوي في الجورة" },
          { id: "sb3", dayNumber: 40, type: "تسميد", title: "تسميد آزوتي", description: "الدفعة الثانية والأساسية من الآزوت", recommendedProduct: "يوريا", recommendedQuantity: 50, quantityUnit: "كجم/فدان" },
          { id: "sb4", dayNumber: 80, type: "رش مغذي", title: "رش البورون", description: "مهم جدا لمنع عفن القلب الأسود وزيادة السكر", recommendedProduct: "بورون سائل", recommendedQuantity: 1, quantityUnit: "لتر/فدان" },
          { id: "sb5", dayNumber: 120, type: "تسميد", title: "تسميد بوتاسي", description: "لزيادة تحجيم الدرنات ونسبة الحلاوة" },
          { id: "sb6", dayNumber: 180, type: "حصاد", title: "منع الري والتقليع", description: "منع الري تماما قبل التقليع الميكانيكي بـ 20 يوم" },
        ]
      },
      {
        id: "sys-flax",
        name: "برنامج الكتان",
        cropName: "كتان",
        description: "برنامج زراعة الكتان لإنتاج الألياف والبذور.",
        isCustom: false,
        phases: [
          { id: "fl1", dayNumber: 0, type: "أخرى", title: "بدار الكتان", description: "بدار الكتان وتغطية البذور برية هادئة" },
          { id: "fl2", dayNumber: 30, type: "تسميد", title: "التسميد الفوسفاتي والآزوتي", description: "الجرعة الأساسية للنمو الطولي", recommendedProduct: "سوبر فوسفات + نشادر", recommendedQuantity: 100, quantityUnit: "كجم/فدان" },
          { id: "fl3", dayNumber: 60, type: "رش علاجي", title: "مكافحة الحشائش العريضة", description: "للحفاظ على نظافة الألياف" },
          { id: "fl4", dayNumber: 140, type: "حصاد", title: "التقليع والتصنيع", description: "التقليع يدويا أو آليا للحفاظ على طول الليفة" },
        ]
      },
      {
        id: "sys-fava-beans",
        name: "برنامج الفول البلدي",
        cropName: "فول بلدي",
        description: "البرنامج الشتوي لزراعة محصول الفول البلدي الاستراتيجي.",
        isCustom: false,
        phases: [
          { id: "fb1", dayNumber: 0, type: "أخرى", title: "معاملة العقدين والزراعة", description: "خلط البذور بالعقدين البكتيري ثم الزراعة" },
          { id: "fb2", dayNumber: 35, type: "ري وتسميد", title: "رية المحاياة", description: "ري مع جرعة تنشيطية للنمو الخضري" },
          { id: "fb3", dayNumber: 60, type: "رش علاجي", title: "مكافحة التبقع البني", description: "رش مبيد فطري وقائي ضروري جدا", recommendedProduct: "مانكوزيب", recommendedQuantity: 250, quantityUnit: "جرام/فدان" },
          { id: "fb4", dayNumber: 90, type: "تسميد", title: "رشة كالسيوم وبورون", description: "لتثبيت الأزهار وزيادة العقد" },
          { id: "fb5", dayNumber: 150, type: "حصاد", title: "الحصاد وتجفيف القرون", description: "تنشيف الحقل وضم النباتات لدرسها" },
        ]
      },
      {
        id: "sys-soybeans",
        name: "برنامج الفول الصويا",
        cropName: "فول صويا",
        description: "زراعة الصويا كمحصول استراتيجي زيتي وعلفي صيفي.",
        isCustom: false,
        phases: [
          { id: "sb1", dayNumber: 0, type: "أخرى", title: "التلقيح والزراعة", description: "تلقيح التقاوي بالبكتيريا العقدية (العقدين) والزراعة في أرض مستحرثة" },
          { id: "sb2", dayNumber: 20, type: "عزيق", title: "الخف والعزيق", description: "خربشة التربة وإزالة الحشائش" },
          { id: "sb3", dayNumber: 30, type: "ري", title: "رية المحاياة", description: "التأخر في رية المحاياة يدفع لتعمق الجذور وتكوين العقد" },
          { id: "sb4", dayNumber: 60, type: "رش علاجي", title: "مكافحة دودة ورق القطن", description: "المتابعة والرش عند الضرورة", recommendedProduct: "لانيت", recommendedQuantity: 300, quantityUnit: "جرام/فدان" },
          { id: "sb5", dayNumber: 120, type: "حصاد", title: "الجفاف والحصاد", description: "اصفرار الأوراق وتساقطها إيذاناً بالحصاد" },
        ]
      },
      {
        id: "sys-sesame",
        name: "برنامج السمسم",
        cropName: "سمسم",
        description: "برنامج زراعة محصول السمسم الصيفي الزيتي.",
        isCustom: false,
        phases: [
          { id: "se1", dayNumber: 0, type: "ري", title: "رية الزراعة", description: "زراعة البذرة مع الرمل لضمان التوزيع الجيد ثم الري الحذر" },
          { id: "se2", dayNumber: 15, type: "عزيق", title: "الخف المبكر", description: "نبات السمسم حساس للتزاحم، يتم الخف على نبات واحد" },
          { id: "se3", dayNumber: 25, type: "ري وتسميد", title: "رية خفيفة وتسميد فوسفور", description: "السمسم يحتاج لماء قليل فترات متباعدة" },
          { id: "se4", dayNumber: 50, type: "رش علاجي", title: "مكافحة الذبابة البيضاء والمن", description: "للوقاية من الأمراض الفيروسية" },
          { id: "se5", dayNumber: 110, type: "حصاد", title: "ضم النباتات وتكويشها", description: "يضم ويربط في حزم توضع بشكل هرمي (طواقي) لتجف قبل فصل البذور" },
        ]
      },
      {
        id: "sys-common-beans",
        name: "برنامج الفاصوليا (الجافة/الخضراء)",
        cropName: "فاصوليا",
        description: "برنامج شامل لزراعة الفاصوليا سواء للحصد الأخضر أو الجاف.",
        isCustom: false,
        phases: [
          { id: "cb1", dayNumber: 0, type: "ري", title: "رية كدابة أو زراعة عفير", description: "الزراعة على خطوط وتجنب الغمر المفرط" },
          { id: "cb2", dayNumber: 15, type: "عزيق", title: "خربشة", description: "إغلاق التشققات وتهوية الجذور" },
          { id: "cb3", dayNumber: 25, type: "تسميد", title: "تسميد تنشيطي (نيتروجين قليل)", description: "لأن الفاصوليا تثبت النيتروجين الجوي، يكتفى بجرعة صغيرة" },
          { id: "cb4", dayNumber: 45, type: "رش علاجي", title: "مكافحة صانعات الأنفاق", description: "الرش الدوري بالمبيدات الحشرية", recommendedProduct: "أبامكتين", recommendedQuantity: 200, quantityUnit: "سم/فدان" },
          { id: "cb5", dayNumber: 60, type: "رش مغذي", title: "رش بوتاسيوم وعناصر صغرى", description: "في مرحلة امتلاء القرون" },
          { id: "cb6", dayNumber: 80, type: "حصاد", title: "جمع القرون الخضراء أو الحصاد الجاف", description: "الجمع الأخضر يبدأ مبكرا، والجاف يترك حتى تمام النضج (90-100 يوم)" },
        ]
      },
      { id: "sys-sweet-potato", name: "برنامج البطاطا الحلوة", cropName: "بطاطا حلوة", description: "متابعة زراعة البطاطا", isCustom: false, phases: [] },
      { id: "sys-clover", name: "برنامج البرسيم المصري", cropName: "برسيم", description: "متابعة الحشات للبرسيم", isCustom: false, phases: [] },
      { id: "sys-sugarcane", name: "برنامج قصب السكر", cropName: "قصب السكر", description: "متابعة القصب", isCustom: false, phases: [] },
      { id: "sys-pastures", name: "برنامج المراعي وحشائش الأعلاف", cropName: "مراعي", description: "سن الفيل، البونيكام، الحشيشة، وغيرها", isCustom: false, phases: [] },
      { id: "sys-barley", name: "برنامج الشعير", cropName: "شعير", description: "متابعة محصول الشعير", isCustom: false, phases: [] },
      { id: "sys-eggplant", name: "برنامج الباذنجان", cropName: "باذنجان", description: "متابعة الباذنجان", isCustom: false, phases: [] },
      { id: "sys-pepper", name: "برنامج الفلفل", cropName: "فلفل", description: "متابعة الفلفل", isCustom: false, phases: [] },
    ] as CropProgramTemplate[];
  },

  // Cycle Programs
  createCycleProgram: async (data: Partial<CropCycleProgram>, userId?: string): Promise<CropCycleProgram> => {
    return cropCycleProgramRepository.create(data, userId);
  },
  getProgramsByFarm: async (farmId: string): Promise<CropCycleProgram[]> => {
    return cropCycleProgramRepository.getByField("farmId", farmId);
  },
  getProgramByCycleId: async (cycleId: string): Promise<CropCycleProgram | undefined> => {
    const programs = await cropCycleProgramRepository.getByField("cropCycleId", cycleId);
    return programs[0]; // Assuming one program per cycle for now
  },
  updatePhaseExecution: async (programId: string, phaseId: string, execution: CyclePhaseExecution, userId?: string): Promise<void> => {
    const program = await cropCycleProgramRepository.getById(programId);
    if (!program) throw new Error("البرنامج غير موجود");

    const updatedExecutions = {
      ...(program.executions || {}),
      [phaseId]: execution
    };

    await cropCycleProgramRepository.update(programId, { executions: updatedExecutions }, userId);
  },
  updateCycleProgramPhases: async (programId: string, phases: import("../types/crop-program").CropProgramPhase[], userId?: string): Promise<void> => {
    await cropCycleProgramRepository.update(programId, { phases }, userId);
  }
};
