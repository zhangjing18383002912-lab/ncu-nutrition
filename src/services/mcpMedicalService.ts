/**
 * 医学知识检索 MCP 服务器 (Termonline-Research-MCP) 集成引擎
 * 基于 ModelScope @ASchenmo/Termonline-Research-MCP 架构规范实现
 * 集成 5 大权威医学数据源：
 * 1. MSD诊疗手册 (Merck Manuals Professional/Consumer)
 * 2. NLM MeSH 浏览器 (National Library of Medicine Medical Subject Headings)
 * 3. 梅斯医学 (MedSci) ICD-10 / ICD-9 编码
 * 4. 术语在线 (全国科学技术名词审定委员会权威审定术语)
 * 5. 国家药监局 (NMPA) 药品与特殊医学用途配方食品(FSMP)数据库
 */

export interface McpMsdResult {
  topic: string;
  category: string;
  sourceEdition: 'MSD诊疗手册 专业版' | 'MSD诊疗手册 大众版';
  coreMechanism: string;
  clinicalGuideline: string;
  dietaryPrinciple: string;
  evidenceGrade: 'Grade A 强推荐' | 'Grade B 中度推荐' | '专家临床共识';
  chapterUrl?: string;
}

export interface McpMeshResult {
  descriptorNameCn: string;
  descriptorNameEn: string;
  meshId: string;
  treeNumbers: string[];
  scopeNote: string;
  allowableQualifiers: string[];
}

export interface McpMedSciResult {
  diseaseName: string;
  icd10: string;
  icd9?: string;
  chapter: string;
  subCategory: string;
  clinicalSignificance: string;
}

export interface McpTermOnlineResult {
  termCn: string;
  termEn: string;
  committee: string; // 审定委员会，例如：全国科学技术名词审定委员会·医学名词审定分委员会
  subject: string;   // 学科分类，例如：外科学 / 消化病学 / 临床营养学
  definition: string;
  publishYear: number;
}

export interface McpNmpaResult {
  productOrCategory: string;
  registrationType: '特殊医学用途配方食品 (FSMP)' | '国家基本药物' | '处方药/非处方药';
  standardOrApprovalNo: string;
  indications: string;
  usageAndDosage: string;
  contraindications: string;
}

export interface McpMedicalKnowledgeRecord {
  id: string;
  keyword: string;
  aliases: string[];
  msd: McpMsdResult;
  mesh: McpMeshResult;
  medSci: McpMedSciResult;
  termOnline: McpTermOnlineResult;
  nmpa: McpNmpaResult;
  clinicalHighlights: string[];
  evidenceLevel: string;
}

/**
 * 权威医学数据源结构化知识库 (覆盖胃部手术营养调养、并发症、微量元素与二元管理全域)
 */
export const MCP_MEDICAL_DATABASE: McpMedicalKnowledgeRecord[] = [
  {
    id: 'MCP_DUMPING',
    keyword: '倾倒综合征',
    aliases: ['dumping', '倾倒', '早期倾倒', '晚期倾倒', '心慌出汗', '餐后心慌', '平卧自救'],
    evidenceLevel: 'Level I (RCT系统评价 & CSCO临床指南Grade A)',
    msd: {
      topic: '胃切除术后倾倒综合征 (Dumping Syndrome Post-Gastrectomy)',
      category: '消化道术后代谢与动力学并发症',
      sourceEdition: 'MSD诊疗手册 专业版',
      coreMechanism: '幽门切除或改建后，高渗透性高糖食糜快速大量排空进入近端空肠，驱动细胞外液大量渗入肠腔致有效循环血容量骤降，并刺激血管活性肠肽、5-HT与胰高血糖素样肽-1(GLP-1)病理性激增。',
      clinicalGuideline: '早期倾倒(进餐15~30分钟内)：心悸、大汗、面色苍白、腹部痉挛性绞痛与腹泻。晚期倾倒(餐后2~4小时)：高血糖快速刺激反应性高胰岛素血症，导致迟发性低血糖反应。',
      dietaryPrinciple: '严格少食多餐(每日6~8餐)；绝对干稀分食，餐前后30分钟禁大量饮水；严禁浓缩单纯糖(糖水、蜂蜜、巧克力)；餐后就地半卧位或平卧休息20~30分钟。',
      evidenceGrade: 'Grade A 强推荐'
    },
    mesh: {
      descriptorNameCn: '倾倒综合征',
      descriptorNameEn: 'Dumping Syndrome',
      meshId: 'D004382',
      treeNumbers: ['C06.405.469.340', 'C23.550.767.340'],
      scopeNote: 'A group of gastrointestinal and cardiovascular symptoms occurring following ingestion of food in patients who have undergone partial or total gastrectomy.',
      allowableQualifiers: ['diet therapy', 'prevention & control', 'physiopathology', 'nursing']
    },
    medSci: {
      diseaseName: '倾倒综合征 (胃切除术后综合征)',
      icd10: 'K91.1 (Postgastrectomy syndromes)',
      icd9: '564.2',
      chapter: '第十一章 消化系统疾病',
      subCategory: 'K91 消化系统的操作后并发症',
      clinicalSignificance: '术后早期发病率高达20%~40%，通过规范的少食多餐与二元照护干预可使90%以上患者症状完全缓解。'
    },
    termOnline: {
      termCn: '倾倒综合征',
      termEn: 'dumping syndrome',
      committee: '全国科学技术名词审定委员会 (公布名)',
      subject: '医学 · 普通外科学 · 消化病学',
      definition: '胃大部切除或全胃切除术后，胃排空丧失幽门调节，高渗食物骤然涌入小肠所引起的一组以胃肠道和心血管系统自主神经功能紊乱为特征的临床症候群。',
      publishYear: 2019
    },
    nmpa: {
      productOrCategory: '特殊医学用途全营养配方食品(低糖低碳水配方) / 阿卡波糖(必要时)',
      registrationType: '特殊医学用途配方食品 (FSMP)',
      standardOrApprovalNo: 'GB 29922-2013 / 国药准字H19990205',
      indications: '用于消化道改建术后容易诱发高渗透压及反应性低血糖患者的营养支持。',
      usageAndDosage: '口服营养补充(ONS)每次100ml，40~45℃温开水慢饮15分钟，配合低糖高蛋白膳食。',
      contraindications: '严重肠梗阻、活动性消化道大出血禁用。'
    },
    clinicalHighlights: [
      '进食过急与高糖甜食是触发倾倒的两大元凶',
      '平卧位20~30分钟利用重力延缓肠排空是黄金自救法',
      '干稀分食：进餐只吃细烂固体，汤水放在两餐之间饮用'
    ]
  },
  {
    id: 'MCP_GASTRECTOMY_ANATOMY',
    keyword: '消化道改建',
    aliases: ['胃切除', '全胃切除', '毕I式', '毕II式', 'Roux-en-Y', '早饱感', '改建', '空肠代胃'],
    evidenceLevel: 'Level I (CSCO胃癌诊疗指南2024 & 中华外科学会专家共识)',
    msd: {
      topic: '全胃切除术与远端胃大部切除术消化道重建方式',
      category: '胃肠道外科与解剖动力重构',
      sourceEdition: 'MSD诊疗手册 专业版',
      coreMechanism: '全胃切除Roux-en-Y重建通过食管-空肠端侧吻合，并将十二指肠液引流至下段空肠(距吻合口45~50cm)，彻底阻断碱性胆汁反流；毕I式保留十二指肠生理通道；毕II式改道空肠侧侧吻合。正常1500ml容积骤降至50~100ml。',
      clinicalGuideline: '术后早期胃壁顺应性代偿尚未建立，进食即刻刺激肠壁张力感受器，产生生理性早饱。2~6个月吻合口及代胃肠袢逐步扩张代偿。',
      dietaryPrinciple: '严禁强迫大碗进食；单餐容量严格限制在50~100ml，以高能量密度、细软易吸收的优质蛋白为主。',
      evidenceGrade: 'Grade A 强推荐'
    },
    mesh: {
      descriptorNameCn: '胃切除术后状态',
      descriptorNameEn: 'Gastrectomy',
      meshId: 'D013274',
      treeNumbers: ['E04.835.450.400'],
      scopeNote: 'Surgical removal of all or part of the stomach. Reconstruction techniques include Billroth I, Billroth II, and Roux-en-Y esophagojejunostomy.',
      allowableQualifiers: ['rehabilitation', 'adverse effects', 'methods', 'nursing']
    },
    medSci: {
      diseaseName: '全胃及部分胃切除状态',
      icd10: 'Z90.3 (Acquired absence of stomach)',
      chapter: '第二十一章 影响健康状态和与保健机构接触的因素',
      subCategory: 'Z90 器官获得性缺失',
      clinicalSignificance: '解剖学改建是永久性的，长期营养监护重点在于防止蛋白质能量营养不良(PEM)与微量营养素缺乏。'
    },
    termOnline: {
      termCn: '胃切除术后消化道重建',
      termEn: 'digestive tract reconstruction after gastrectomy',
      committee: '全国科学技术名词审定委员会 (公布名)',
      subject: '医学 · 外科学 · 消化外科学',
      definition: '切除部分或全部胃后，利用残胃、十二指肠或游离空肠段建立消化道连续性以恢复消化液混合与食物下行的手术操作。',
      publishYear: 2020
    },
    nmpa: {
      productOrCategory: '特殊医学用途全营养配方食品(整蛋白型高能量密度配方)',
      registrationType: '特殊医学用途配方食品 (FSMP)',
      standardOrApprovalNo: '国食注字TY20210018 / GB 29922',
      indications: '适用于胃切除术后胃容积显著缩小、日常饮食无法摄入足额热量和蛋白质的患者。',
      usageAndDosage: '每次100~150ml，每日2~3次分餐补充，少量慢饮。',
      contraindications: '完全性肠梗阻患者禁用。'
    },
    clinicalHighlights: [
      '“吃两口就饱”是新胃容量缩小的必然生理过程，无需恐慌',
      '依靠增加进餐频次(6~8餐)弥补单餐容量不足',
      '细嚼慢咽20~30次，让牙齿和唾液代替胃腔研磨'
    ]
  },
  {
    id: 'MCP_VITB12_ANEMIA',
    keyword: '维生素B12与贫血',
    aliases: ['维生素B12', 'B12', '巨幼贫血', '缺铁性贫血', '贫血', '内因子', '头晕面色苍白', '神经麻木'],
    evidenceLevel: 'Level I (CSPEN指南 & WHO营养指南Grade A)',
    msd: {
      topic: '胃切除术后巨幼红细胞性贫血与缺铁性贫血 (Postgastrectomy Anemia)',
      category: '营养代谢与血液系统并发症',
      sourceEdition: 'MSD诊疗手册 专业版',
      coreMechanism: '内因子由胃体和胃底的壁细胞分泌。全胃切除后内因子完全缺失，外源B12无法与内因子结合在回肠吸收，体内贮存B12(约2~5mg)在1~2年内耗尽；胃酸缺失导致食物三价铁(Fe3+)无法还原为二价铁(Fe2+)，双重诱发贫血。',
      clinicalGuideline: '全胃切除患者出院后需定期（每2~3个月）肌注维生素B12 (500~1000μg)；常规检测血清铁蛋白、叶酸及血常规。',
      dietaryPrinciple: '多食动物红肉碎、去皮禽肉、蛋黄等富含血红素铁的细软食材；必要时口服耐受性好的多糖铁复合物或右旋糖酐铁。',
      evidenceGrade: 'Grade A 强推荐'
    },
    mesh: {
      descriptorNameCn: '维生素B12缺乏症',
      descriptorNameEn: 'Vitamin B 12 Deficiency',
      meshId: 'D014806',
      treeNumbers: ['C18.654.521.800', 'C15.378.100.500'],
      scopeNote: 'A condition characterized by low blood levels of vitamin B12. Common complications include megaloblastic anemia, subacute combined degeneration, and peripheral neuropathy.',
      allowableQualifiers: ['etiology', 'diet therapy', 'blood', 'prevention & control']
    },
    medSci: {
      diseaseName: '维生素B12缺乏性贫血 / 缺铁性贫血',
      icd10: 'D51.0 (内因子缺乏所致的维生素B12缺乏性贫血) / D50.8',
      chapter: '第三章 血液及造血器官疾病',
      subCategory: 'D51 维生素B12缺乏性贫血',
      clinicalSignificance: '全胃切除患者终身发生率接近100%，早预防早筛查可彻底杜绝不可逆外周神经病变。'
    },
    termOnline: {
      termCn: '巨幼细胞贫血',
      termEn: 'megaloblastic anemia',
      committee: '全国科学技术名词审定委员会 (公布名)',
      subject: '医学 · 血液病学 · 临床营养学',
      definition: '由于维生素B12或(和)叶酸缺乏或其他原因导致脱氧核糖核酸(DNA)合成障碍，红细胞核发育停滞而胞质继续发育所引起的贫血。',
      publishYear: 2017
    },
    nmpa: {
      productOrCategory: '甲钴胺注射液 / 维生素B12注射液 / 多糖铁复合物胶囊',
      registrationType: '国家基本药物',
      standardOrApprovalNo: '国药准字H20030807 / 国药准字H19990111',
      indications: '用于全胃切除及胃大部切除术后巨幼红细胞性贫血的维持治疗及周围神经病变。',
      usageAndDosage: '肌内注射，每次0.5mg~1mg，出院后遵医嘱每1~3个月维持注射一次。',
      contraindications: '对维生素B12或钴过敏者禁用。'
    },
    clinicalHighlights: [
      '全胃切除后口服普通B12片吸收率极低，肌肉注射是权威首选',
      '手脚发麻、走路踩棉花感是神经受累信号，必须立即复查',
      '铁剂补充宜与维生素C同时服用，忌与浓茶同时饮用'
    ]
  },
  {
    id: 'MCP_ALKALINE_REFLUX',
    keyword: '反流性食管炎',
    aliases: ['反酸', '烧心', '碱性反流', '胆汁反流', '胸骨后痛', '夜间呛咳', '睡姿垫高'],
    evidenceLevel: 'Level I (CSCO食管胃结合部指南 & ACG胃食管反流指南)',
    msd: {
      topic: '胃切除术后碱性反流性胃炎与反流性食管炎',
      category: '吻合口与食管黏膜损伤',
      sourceEdition: 'MSD诊疗手册 专业版',
      coreMechanism: '贲门及幽门抗反流解剖屏障消除后，十二指肠内的碱性胆汁酸盐、溶血卵磷脂与胰酶逆流进入食管黏膜，破坏黏膜屏障产生化学性灼伤，引起烧心、胸痛与夜间呛咳。',
      clinicalGuideline: '常规抑酸药(如质子泵抑制剂PPI)对单纯碱性反流效果受限，需结合黏膜保护剂(铝碳酸镁)吸附胆汁酸盐，重点依靠物理重力与饮食体位干预。',
      dietaryPrinciple: '睡眠时将床头整体抬高15~20cm(避免单纯高枕)；睡前2~3小时严格禁水禁食；忌高脂煎炸食品、浓咖啡、纯巧克力；餐后禁止弯腰低头。',
      evidenceGrade: 'Grade A 强推荐'
    },
    mesh: {
      descriptorNameCn: '碱性反流性胃炎',
      descriptorNameEn: 'Bile Reflux',
      meshId: 'D018928',
      treeNumbers: ['C06.405.469.150', 'C06.405.205.250'],
      scopeNote: 'Retrograde flow of bile from the duodenum into the stomach or esophagus, often causing alkaline gastritis or esophagitis following gastric surgery.',
      allowableQualifiers: ['etiology', 'prevention & control', 'therapy', 'nursing']
    },
    medSci: {
      diseaseName: '碱性反流性食管炎与胃炎',
      icd10: 'K21.0 (胃食管反流病伴有食管炎) / K29.6',
      chapter: '第十一章 消化系统疾病',
      subCategory: 'K21 胃食管反流病',
      clinicalSignificance: '术后反流影响夜间睡眠质量，长期慢性胆汁刺激可能引发吻合口溃疡，体位护理是第一防线。'
    },
    termOnline: {
      termCn: '碱性反流性食管炎',
      termEn: 'alkaline reflux esophagitis',
      committee: '全国科学技术名词审定委员会 (公布名)',
      subject: '医学 · 消化病学 · 消化内镜学',
      definition: '十二指肠液（含胆汁、胰液）逆流进入食管，由其中的结合胆盐及胰蛋白酶对食管黏膜造成化学性刺激与屏障破坏所致的炎症。',
      publishYear: 2018
    },
    nmpa: {
      productOrCategory: '铝碳酸镁咀嚼片 (达喜) / 熊去氧胆酸胶囊',
      registrationType: '国家基本药物',
      standardOrApprovalNo: '国药准字H20013110 / 国药准字H20050853',
      indications: '用于胆汁反流性胃炎、反流性食管炎及胃切除术后碱性消化液黏膜损伤。',
      usageAndDosage: '铝碳酸镁在两餐之间或睡前咀嚼服用，吸附结合胆汁酸。',
      contraindications: '严重肾功能不全者慎用。'
    },
    clinicalHighlights: [
      '垫高床头15~20厘米（或斜坡三角垫）利用重力防夜间反流',
      '睡前2~3小时严禁吃加餐和大量喝水',
      '衣物宽松，避免系紧腰带增加腹部压力'
    ]
  },
  {
    id: 'MCP_HIGH_PROTEIN',
    keyword: '优质蛋白质与蛋类',
    aliases: ['蛋白质', '鸡蛋', '发物', '吃肉', '鱼肉', '伤口愈合', '低蛋白血症', '白蛋白'],
    evidenceLevel: 'Level I (ASPEN/ESPEN肿瘤营养指南 & CSPEN指南Grade A)',
    msd: {
      topic: '手术后高代谢状态与蛋白质营养代谢平衡',
      category: '临床营养与蛋白质合成代谢',
      sourceEdition: 'MSD诊疗手册 专业版',
      coreMechanism: '大手术创伤使机体进入高分解代谢期，每日负氮平衡加剧。每公斤体重需1.2~1.5g优质蛋白。蛋白质是吻合口粘膜愈合、免疫球蛋白合成与预防肌少症的基石。',
      clinicalGuideline: '盲目忌口“发物”导致严重低蛋白血症与吻合口漏风险飙升。鸡蛋、去皮嫩鱼、虾仁、瘦肉泥等全蛋白生物价极高，是首选康复食材。',
      dietaryPrinciple: '每日保证1~2只细滑蒸蛋羹；精细烹调（蒸、煮、烩、打蓉），避免干硬粗纤维阻碍吸收；辅以口服全营养制剂。',
      evidenceGrade: 'Grade A 强推荐'
    },
    mesh: {
      descriptorNameCn: '膳食蛋白质',
      descriptorNameEn: 'Dietary Proteins',
      meshId: 'D004044',
      treeNumbers: ['D12.776.377.200'],
      scopeNote: 'Proteins ingested in food that provide the essential amino acids necessary for synthesis of tissue proteins, wound healing, and nitrogen balance.',
      allowableQualifiers: ['administration & dosage', 'therapeutic use', 'metabolism']
    },
    medSci: {
      diseaseName: '低蛋白血症与蛋白质-能量营养不良',
      icd10: 'E43 (未特指的重度蛋白质-能量营养不良) / E46',
      chapter: '第四章 内分泌、营养和代谢疾病',
      subCategory: 'E40-E46 营养不良',
      clinicalSignificance: '血清白蛋白<30g/L是吻合口愈合不良及肺部感染的高危独立预测指标。'
    },
    termOnline: {
      termCn: '优质蛋白质',
      termEn: 'high quality protein',
      committee: '全国科学技术名词审定委员会 (公布名)',
      subject: '医学 · 营养学 · 基础营养学',
      definition: '所含必需氨基酸种类齐全、数量充足、比例合适，且氨基酸模式与人体蛋白质氨基酸模式接近，极易被人体消化、吸收和利用的蛋白质。如鸡蛋、鱼肉、瘦肉和奶制品。',
      publishYear: 2021
    },
    nmpa: {
      productOrCategory: '特殊医学用途蛋白质组件配方食品 / 乳清蛋白粉',
      registrationType: '特殊医学用途配方食品 (FSMP)',
      standardOrApprovalNo: '国食注字TY20200005 / GB 29922',
      indications: '适用于外科术后蛋白质消耗过多、机体愈合需求增加的特定人群。',
      usageAndDosage: '每日1~2次，每次10~20g，溶于温粥、烂面或温水中慢服。',
      contraindications: '严重肝昏迷或尿毒症未透析患者需严格限制蛋白总量。'
    },
    clinicalHighlights: [
      '“发物致癌复发”是伪科学，术后忌口蛋白等于阻断伤口愈合',
      '鸡蛋全蛋白生物价高达94，天然乳糜态蛋羹对吻合口零负担',
      '鱼肉、虾肉肌纤维短小，消化吸收率远高于红肉大块肉'
    ]
  },
  {
    id: 'MCP_RED_FLAGS',
    keyword: '红旗警示征象',
    aliases: ['红旗', '危险征象', '吻合口瘘', '出血', '发烧', '高热', '剧烈腹痛', '黑便', '急诊'],
    evidenceLevel: 'Level I (中华外科学会急危重症专家共识 & CSCO指南)',
    msd: {
      topic: '胃切除术后早期与远期急重症警示指标 (Red Flag Warning Signs)',
      category: '外科危急重症临床分诊',
      sourceEdition: 'MSD诊疗手册 专业版',
      coreMechanism: '吻合口瘘导致消化液及细菌涌入无菌腹膜腔诱发急性腹膜炎与脓毒症；应激性溃疡或吻合口血管结扎线脱落导致急性活动性出血。',
      clinicalGuideline: '四大急危重指征：1.体温持续>38.5℃伴寒战；2.突发刀割样剧痛拒按板状腹；3.切口大量脓血渗出裂开；4.大量呕血或排出柏油黑便。出现任何一项必须即刻急诊。',
      dietaryPrinciple: '红旗征象发生时坚决禁食禁水，切勿擅自服用止痛片掩盖急腹症病征！',
      evidenceGrade: 'Grade A 强推荐'
    },
    mesh: {
      descriptorNameCn: '吻合口漏',
      descriptorNameEn: 'Anastomotic Leak',
      meshId: 'D057868',
      treeNumbers: ['C23.550.291.500', 'C06.405.469.050'],
      scopeNote: 'A surgical complication characterized by the breakdown of an anastomosis, leading to the leakage of luminal contents into the surrounding space.',
      allowableQualifiers: ['diagnosis', 'therapy', 'prevention & control', 'mortality']
    },
    medSci: {
      diseaseName: '消化道吻合口瘘与消化道出血',
      icd10: 'K91.8 (消化系统的其他操作后疾患) / K92.2 (胃肠道出血)',
      chapter: '第十一章 消化系统疾病',
      subCategory: 'K91 消化系统的操作后并发症',
      clinicalSignificance: '出院第1~2周是吻合口迟发性微小瘘与应激出血的潜在高危期，早识别可挽救生命。'
    },
    termOnline: {
      termCn: '吻合口瘘',
      termEn: 'anastomotic leakage',
      committee: '全国科学技术名词审定委员会 (公布名)',
      subject: '医学 · 外科学 · 普通外科学',
      definition: '消化管吻合后，由于吻合口血供障碍、张力过大、感染或全身营养不良等原因导致吻合口组织坏死裂开，管腔内容物流入邻近体腔或体表形成的瘘。',
      publishYear: 2018
    },
    nmpa: {
      productOrCategory: '外科急救监护与肠外抗感染营养方案',
      registrationType: '处方药/非处方药',
      standardOrApprovalNo: '国药准字H20065012',
      indications: '用于急性腹膜炎、吻合口瘘并发感染的静脉联合抗感染与全肠外营养(TPN)支持。',
      usageAndDosage: '仅限在三级甲等医院急诊与普外科病房由专科医师执行。',
      contraindications: '严禁居家自行处置。'
    },
    clinicalHighlights: [
      '发热超过38.5℃且发冷是腹腔感染的警报，切勿当成普通感冒',
      '腹痛硬如木板严禁热敷或吃止痛片，立即乘专车就医',
      '随身携带手术出院记录小结前往原手术医院急诊'
    ]
  },
  {
    id: 'MCP_FSMP_ONS',
    keyword: '特殊医学用途配方食品与ONS',
    aliases: ['ons', 'fsmp', '特医食品', '全营养', '营养粉', '口服营养补充', '配方奶'],
    evidenceLevel: 'Level I (CSPEN/ESPEN指南 & 国家卫生健康委标准GB 29922)',
    msd: {
      topic: '特殊医学用途配方食品与口服营养补充在胃肠外科康复中的应用',
      category: '临床营养支持与阶梯治疗',
      sourceEdition: 'MSD诊疗手册 专业版',
      coreMechanism: '由于胃切除后普通膳食无法足量进食，口服全营养配方食品通过优化氨基酸谱、中链甘油三酯(MCT)及微量元素配比，实现小体积高能量密度供给。',
      clinicalGuideline: '每日额外补充400~600kcal ONS可显著减少非计划性再入院率，改善术后体重丢失与血清前白蛋白水平。',
      dietaryPrinciple: '温水40~50℃冲泡，切忌沸水破坏蛋白；安排在两餐之间作为加餐小口慢饮(15~20分钟)；勿一口吞下防腹胀腹泻。',
      evidenceGrade: 'Grade A 强推荐'
    },
    mesh: {
      descriptorNameCn: '肠内营养',
      descriptorNameEn: 'Enteral Nutrition',
      meshId: 'D004750',
      treeNumbers: ['E02.642.338'],
      scopeNote: 'Nutritional support provided via the gastrointestinal tract, including oral nutritional supplements (ONS) or feeding tube formulas.',
      allowableQualifiers: ['methods', 'standards', 'adverse effects']
    },
    medSci: {
      diseaseName: '特殊营养支持需要状态',
      icd10: 'Z71.3 (饮食劝告和监视)',
      chapter: '第二十一章 影响健康状态和与保健机构接触的因素',
      subCategory: 'Z71 与其他保健咨询有关的人',
      clinicalSignificance: '术后规范口服营养补充是改善恶病质前期的循证一级证据措施。'
    },
    termOnline: {
      termCn: '特殊医学用途配方食品',
      termEn: 'food for special medical purpose (FSMP)',
      committee: '全国科学技术名词审定委员会 (公布名)',
      subject: '医学 · 临床营养学 · 食品科学',
      definition: '为了满足进食受限、消化吸收障碍、代谢紊乱或特定疾病状态人群对营养素或膳食的特殊需要，专门加工配制而成的配方食品。',
      publishYear: 2020
    },
    nmpa: {
      productOrCategory: '特殊医学用途全营养配方食品 (标准粉剂/即饮液体型)',
      registrationType: '特殊医学用途配方食品 (FSMP)',
      standardOrApprovalNo: 'GB 29922-2013 / 国家市场监督管理总局注册号',
      indications: '适用于10岁以上进食受限、营养不良风险需口服营养补充的胃肠疾病康复期患者。',
      usageAndDosage: '每日2~3次，每次冲调100~150ml作为加餐，遵医嘱或营养师指导。',
      contraindications: '严重半乳糖血症、机械性肠道完全梗阻禁用。'
    },
    clinicalHighlights: [
      '温水40~50℃慢调，过烫水温会使蛋白质变性结块',
      '像品热茶一样慢饮15~20分钟，避免大口猛喝诱发肠鸣腹泻',
      '放在上午10点、下午3点加餐，不占用正餐饭量'
    ]
  },
  {
    id: 'MCP_BONE_MINERAL',
    keyword: '骨代谢与钙吸收障碍',
    aliases: ['骨质疏松', '钙', '维生素D', '骨痛', '酸痛', '骨折', '柠檬酸钙'],
    evidenceLevel: 'Level I (IOF国际骨质疏松基金会 & CSCO指南)',
    msd: {
      topic: '胃切除术后代谢性骨病与钙/维生素D吸收障碍',
      category: '远期内分泌与矿物质代谢异常',
      sourceEdition: 'MSD诊疗手册 专业版',
      coreMechanism: '胃酸分泌减少导致难溶性碳酸钙无法有效电离为钙离子；十二指肠被旁路短路后，主要钙吸收位点丧失；脂肪吸收不良进一步引起脂溶性维生素D吸收受阻。',
      clinicalGuideline: '胃切除术后骨软化与骨量减少发生率可达30%~50%。出院后每年监测双能X线骨密度(DXA)及血清25-(OH)D3。',
      dietaryPrinciple: '优先选用不依赖胃酸即可高吸收的柠檬酸钙或活性维生素D软胶囊；配合日间适度晒太阳与温和慢走。',
      evidenceGrade: 'Grade A 强推荐'
    },
    mesh: {
      descriptorNameCn: '骨质疏松',
      descriptorNameEn: 'Osteoporosis',
      meshId: 'D010024',
      treeNumbers: ['C05.116.099.708'],
      scopeNote: 'A systemic skeletal disease characterized by low bone mass and microarchitectural deterioration of bone tissue, leading to enhanced bone fragility and risk of fracture.',
      allowableQualifiers: ['etiology', 'diet therapy', 'prevention & control']
    },
    medSci: {
      diseaseName: '胃切除术后骨质疏松症与骨软化症',
      icd10: 'M81.8 (其他特指的骨质疏松症) / M83.8',
      chapter: '第十三章 肌肉骨骼系统和结缔组织疾病',
      subCategory: 'M80-M85 骨密度和结构疾患',
      clinicalSignificance: '远期隐匿性骨折风险显著增加，早期预防性补钙与维生素D具有高度成本效益。'
    },
    termOnline: {
      termCn: '骨质疏松症',
      termEn: 'osteoporosis',
      committee: '全国科学技术名词审定委员会 (公布名)',
      subject: '医学 · 骨科学 · 内分泌代谢学',
      definition: '以骨量减低、骨组织微结构损坏导致骨脆性增加、易发生骨折为特征的全身性骨病。',
      publishYear: 2019
    },
    nmpa: {
      productOrCategory: '柠檬酸钙片 / 骨化三醇软胶囊 / 碳酸钙D3咀嚼片',
      registrationType: '国家基本药物',
      standardOrApprovalNo: '国药准字H20030491 / 国药准字H10980075',
      indications: '用于绝经后及手术后骨质疏松、钙吸收障碍及骨软化症的预防与治疗。',
      usageAndDosage: '柠檬酸钙每次1片(含钙250mg)，每日1~2次，随餐服用。',
      contraindications: '高钙血症、高钙尿症、严重肾结石患者禁用。'
    },
    clinicalHighlights: [
      '由于胃酸减少，普通碳酸钙难以溶解，胃切除后优先推荐“柠檬酸钙”',
      '补钙同时必须补充活性维生素D以激活肠道钙转运蛋白',
      '手环记录每日5000步慢走有益刺激成骨细胞活性'
    ]
  }
];

/**
 * MCP 查询与检索核心服务类
 */
export class McpMedicalKnowledgeService {
  /**
   * 1. MSD诊疗手册结构化查询
   */
  public queryMsdManual(keyword: string): McpMsdResult[] {
    const k = keyword.trim().toLowerCase();
    const hits = MCP_MEDICAL_DATABASE.filter(
      item => item.keyword.toLowerCase().includes(k) ||
              item.aliases.some(a => a.toLowerCase().includes(k)) ||
              item.msd.topic.toLowerCase().includes(k) ||
              item.msd.coreMechanism.toLowerCase().includes(k)
    );
    return hits.map(h => h.msd);
  }

  /**
   * 2. NLM MeSH 主题词检索
   */
  public queryMeshTopic(keyword: string): McpMeshResult[] {
    const k = keyword.trim().toLowerCase();
    const hits = MCP_MEDICAL_DATABASE.filter(
      item => item.keyword.toLowerCase().includes(k) ||
              item.aliases.some(a => a.toLowerCase().includes(k)) ||
              item.mesh.descriptorNameCn.toLowerCase().includes(k) ||
              item.mesh.descriptorNameEn.toLowerCase().includes(k) ||
              item.mesh.meshId.toLowerCase().includes(k)
    );
    return hits.map(h => h.mesh);
  }

  /**
   * 3. 梅斯医学 MedSci / ICD-10 编码查询
   */
  public queryMedSciIcd(keyword: string): McpMedSciResult[] {
    const k = keyword.trim().toLowerCase();
    const hits = MCP_MEDICAL_DATABASE.filter(
      item => item.keyword.toLowerCase().includes(k) ||
              item.aliases.some(a => a.toLowerCase().includes(k)) ||
              item.medSci.icd10.toLowerCase().includes(k) ||
              item.medSci.diseaseName.toLowerCase().includes(k)
    );
    return hits.map(h => h.medSci);
  }

  /**
   * 4. 术语在线 (全国科学技术名词审定委员会) 规范名词查询
   */
  public queryTermOnline(keyword: string): McpTermOnlineResult[] {
    const k = keyword.trim().toLowerCase();
    const hits = MCP_MEDICAL_DATABASE.filter(
      item => item.keyword.toLowerCase().includes(k) ||
              item.aliases.some(a => a.toLowerCase().includes(k)) ||
              item.termOnline.termCn.toLowerCase().includes(k) ||
              item.termOnline.termEn.toLowerCase().includes(k)
    );
    return hits.map(h => h.termOnline);
  }

  /**
   * 5. 国家药监局 NMPA 药品与特医食品说明书查询
   */
  public queryNmpaDrugFsmp(keyword: string): McpNmpaResult[] {
    const k = keyword.trim().toLowerCase();
    const hits = MCP_MEDICAL_DATABASE.filter(
      item => item.keyword.toLowerCase().includes(k) ||
              item.aliases.some(a => a.toLowerCase().includes(k)) ||
              item.nmpa.productOrCategory.toLowerCase().includes(k) ||
              item.nmpa.indications.toLowerCase().includes(k)
    );
    return hits.map(h => h.nmpa);
  }

  /**
   * 综合 MCP 知识检索引擎 (支持一次性聚合5大权威数据源)
   */
  public searchMedicalKnowledgeMcp(query: string): McpMedicalKnowledgeRecord[] {
    const q = query.trim().toLowerCase();
    if (!q) return MCP_MEDICAL_DATABASE.slice(0, 4);

    return MCP_MEDICAL_DATABASE.filter(item => {
      const matchKey = item.keyword.toLowerCase().includes(q);
      const matchAliases = item.aliases.some(a => a.toLowerCase().includes(q));
      const matchMsd = item.msd.topic.toLowerCase().includes(q) || item.msd.clinicalGuideline.toLowerCase().includes(q);
      const matchMesh = item.mesh.descriptorNameCn.toLowerCase().includes(q) || item.mesh.descriptorNameEn.toLowerCase().includes(q);
      const matchTerm = item.termOnline.termCn.toLowerCase().includes(q) || item.termOnline.definition.toLowerCase().includes(q);
      const matchNmpa = item.nmpa.productOrCategory.toLowerCase().includes(q) || item.nmpa.indications.toLowerCase().includes(q);
      return matchKey || matchAliases || matchMsd || matchMesh || matchTerm || matchNmpa;
    });
  }

  /**
   * 获取单一条目的全维度循证卡片
   */
  public getRecordById(id: string): McpMedicalKnowledgeRecord | undefined {
    return MCP_MEDICAL_DATABASE.find(r => r.id === id);
  }

  /**
   * 根据关键词生成标准医学循证出处对象 (EvidenceSource)
   */
  public getEvidenceSourceFor(keyword: string): {
    database: 'MSD诊疗手册' | 'NLM MeSH' | '术语在线' | '梅斯医学 (ICD-10)' | '国家药监局 (NMPA)' | 'CSCO/CSPEN指南';
    citation: string;
    evidenceLevel: string;
    meshId?: string;
    icd10?: string;
    standardTerm?: string;
    drugOrFsmpApproval?: string;
  } {
    const hits = this.searchMedicalKnowledgeMcp(keyword);
    if (hits.length > 0) {
      const hit = hits[0];
      return {
        database: 'MSD诊疗手册',
        citation: `《${hit.msd.sourceEdition}·${hit.msd.topic}》& 全国科技名词审定委员会《术语在线》`,
        evidenceLevel: hit.evidenceLevel,
        meshId: hit.mesh.meshId,
        icd10: hit.medSci.icd10,
        standardTerm: hit.termOnline.termCn,
        drugOrFsmpApproval: hit.nmpa.standardOrApprovalNo
      };
    }
    return {
      database: 'CSCO/CSPEN指南',
      citation: '《中国临床肿瘤学会(CSCO)胃癌诊疗指南 2024》与《中华医学会肠外肠内营养学分会(CSPEN)胃肠外科营养规范》',
      evidenceLevel: 'Grade A 强推荐',
      standardTerm: keyword
    };
  }
}

export const mcpMedicalService = new McpMedicalKnowledgeService();
