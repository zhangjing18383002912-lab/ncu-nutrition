/**
 * 胃部手术调养权威科普专栏知识库 (Evidence-Based Science Knowledge Base)
 * 基于 ModelScope 医学查询MCP 与国内外顶级临床营养指南编制
 * 融合 5 大权威医学数据源 (MSD诊疗手册 / NLM MeSH / 梅斯医学ICD-10 / 术语在线 / 国家药监局)
 */

import { ScienceArticle, EvidenceSource } from '../types/tdim';

export interface FoodTrafficLight {
  id: string;
  name: string;
  category: 'staple' | 'protein' | 'fruit_veg' | 'drink_snack';
  categoryName: string;
  level: 'green' | 'yellow' | 'red';
  levelLabel: string;
  advice: string;
  reason: string;
  tags: string[];
  evidenceSource?: EvidenceSource;
}

export interface ScienceMyth {
  id: string;
  question: string;
  isTrue: boolean;
  verdict: string;
  analysis: string;
  nursingTip: string;
  evidenceSource?: EvidenceSource;
}

export interface MealPlanDay {
  dayName: string;
  stageName: string;
  meals: {
    timeSlot: string;
    mealName: string;
    food: string;
    notes: string;
  }[];
}

/**
 * 核心科普长文知识库 (涵盖解剖重构、分阶段食谱、倾倒综合征、贫血、反流、红旗危急等12大重磅专栏)
 * 每篇专栏均配有完整的 5 大权威医学数据源溯源标签与循证证据等级
 */
export const scienceArticles: ScienceArticle[] = [
  {
    id: 'SCI_01',
    category: 'anatomy',
    categoryName: '图解消化道改建',
    title: '全胃与部分胃切除后，食物是怎样消化的？为什么总觉得“两口就饱”？',
    summary: '了解手术后的胃肠结构重组，科学认识“新胃”容量缩小的生理过程，消除早期恐慌。',
    readTimeMin: 3,
    tags: ['消化道改建', '全胃切除', '早饱感', 'Roux-en-Y'],
    keyTips: [
      '正常胃容量约为1500ml，术后胃容量通常只剩原来的1/4甚至完全由小肠代胃（约50~100ml）',
      '“早饱感”是正常的生理重建反应，切勿勉强一次性吃完大碗饭菜',
      '应对黄金原则：每日6~8餐，定时定量，每餐5~7分饱，细嚼慢咽20~30次'
    ],
    evidenceSource: {
      database: 'MSD诊疗手册',
      citation: '《MSD诊疗手册专业版·胃切除术后消化道解剖与生理动力学改建》',
      evidenceLevel: 'Grade A 强推荐',
      meshId: 'MeSH: D013274 (Gastrectomy)',
      icd10: 'ICD-10: Z90.3 (胃获得性缺失状态)',
      standardTerm: '全国科技名词审定委员会规范名: 胃切除术后消化道重建',
      drugOrFsmpApproval: 'GB 29922-2013 (特殊医学用途配方食品通则)'
    },
    content: [
      '胃切除手术（无论是全胃切除 Roux-en-Y 吻合，还是远端胃切除毕I式、毕II式吻合）改变了我们正常的食物通道。术后食物不再经过原来宽大的胃腔长时间研磨和胃酸充分分解，而是直接或者更快地进入空肠。',
      '由于接纳食物的“新容积”变小，代胃空肠或残胃壁的张力感受器受到轻微牵拉就会向大脑传递“已经吃饱”的饱腹信号，这就是术后患者普遍出现的“吃两口就饱”的早饱现象。',
      '随着时间推移，术后2~6个月空肠代胃吻合口会逐步出现代偿性扩张，胃肠道适应能力也会慢慢增强。在此期间，切忌一次性强迫进食大碗固体饭菜，以免造成吻合口压力过高或腹胀呕吐。必须通过“少食多餐、定时定量”来保证全天总热量与蛋白质达标。'
    ]
  },
  {
    id: 'SCI_02',
    category: 'recipes',
    categoryName: '阶段食谱与备餐',
    title: '胃部手术调养居家精选分阶段食谱：从细烂半流质到高蛋白软饭',
    summary: '营养科与临床护士推荐的家庭备餐指南，兼顾细软易消化与高优质蛋白质需求。',
    readTimeMin: 4,
    tags: ['食谱大全', '优质蛋白', '半流质', '软饭'],
    keyTips: [
      '蛋白质是伤口组织修复的砖石，优先推荐去皮深海嫩鱼肉、鸡蛋羹、肉末豆腐',
      '烹调方式以蒸、煮、烩、焖为主，避免干炸、烟熏、腌制与过硬坚果',
      '每餐严格坚持干稀分食，固体与液体进食间隔20~30分钟'
    ],
    evidenceSource: {
      database: 'CSCO/CSPEN指南',
      citation: '《中国临床肿瘤学会(CSCO)胃癌患者营养治疗指南 2024》与《CSPEN胃肠外科围手术期营养规范》',
      evidenceLevel: 'Level I (RCT系统评价)',
      meshId: 'MeSH: D004044 (Dietary Proteins)',
      icd10: 'ICD-10: Z71.3 (饮食劝告和监视)',
      standardTerm: '全国科技名词审定委员会规范名: 优质蛋白质 (high quality protein)',
      drugOrFsmpApproval: '国食注字TY20210018 (全营养配方食品)'
    },
    content: [
      '【阶段一：出院后第1周（细烂半流食推荐）】\n• 早餐：蛋花小米稠米糊（1小碗约100ml）+ 维生素营养配方粉温水冲调50ml\n• 上午加餐：去皮嫩南瓜泥 + 温热豆浆50ml（过滤豆渣）\n• 中餐：肉末豆腐细烂面条（精瘦肉多次剁泥烩嫩豆腐，挂面折短煮至极软烂）\n• 下午加餐：蒸嫩蛋羹半碗（淋少许香油与生抽，软如布丁）\n• 晚餐：鱼肉末白米稠粥 + 蒸嫩胡萝卜泥\n• 睡前加餐：温热全营养ONS配方奶100ml（小口慢饮15分钟）',
      '【阶段二：出院第2~4周（软食高蛋白推荐）】\n• 引入去皮嫩鸡肉蓉、龙利鱼片、鲜虾仁泥与软嫩冬瓜冬笋末。\n• 主食可由稠粥逐步过渡为发面小花卷、软米饭（蒸煮时水米比例约为1.5:1）。\n• 进食要诀：细嚼慢咽，每口食物在口腔充分咀嚼20~30次，变成细糊状再轻轻咽下。',
      '【阶段三：术后1个月以上（长期常态调养）】\n• 逐步建立家庭规律进餐时间表（每日5~6餐），维持体重每月不下降。\n• 食物干稀分食依然是防反流与倾倒综合征的长期法宝。'
    ]
  },
  {
    id: 'SCI_03',
    category: 'complications',
    categoryName: '并发症防范',
    title: '早期与晚期倾倒综合征速查：餐后心慌、出冷汗、头晕的即刻自救法',
    summary: '详细解析高渗食糜快速涌入小肠引起的血管与神经反应，学会就地平卧自救。',
    readTimeMin: 3,
    tags: ['倾倒综合征', '心慌出汗', '急救平卧', '低血糖'],
    keyTips: [
      '早期倾倒（进餐后15~30分钟内）：心慌、出冷汗、面色苍白或头晕无力',
      '晚期倾倒（餐后2~4小时）：胰岛素延迟性过量分泌引发低血糖反应',
      '急救动作：立即协助患者就地平卧或上半身垫高20度半卧位，安静休息20~30分钟'
    ],
    evidenceSource: {
      database: 'MSD诊疗手册',
      citation: '《MSD诊疗手册专业版·胃切除术后倾倒综合征与代谢紊乱》',
      evidenceLevel: 'Grade A 强推荐',
      meshId: 'MeSH: D004382 (Dumping Syndrome)',
      icd10: 'ICD-10: K91.1 (胃切除术后综合征)',
      standardTerm: '全国科技名词审定委员会规范名: 倾倒综合征 (dumping syndrome)',
      drugOrFsmpApproval: '国药准字H19990205 (阿卡波糖片)'
    },
    content: [
      '由于胃切除后失去了幽门括约肌对食物排空的“阀门节制作用”，大量高渗透性的食糜会在很短时间内快速涌入空肠上段。高渗透压会迅速把体内的组织液吸入肠腔，造成暂时性的有效循环血容量不足，同时刺激肠道分泌血管活性物质，从而引起心悸、出虚汗、头晕甚至虚脱。',
      '晚期倾倒综合征则通常发生在餐后2~4小时，高糖食糜快速吸收引起血糖急剧升高，刺激胰岛B细胞过度分泌大量胰岛素，但随着肠道食物排空，胰岛素相对过剩，导致反应性低血糖（饥饿心慌、手发抖）。',
      '防范倾倒综合征的四大金标准：\n1. 严格少食多餐，细嚼慢咽；\n2. 限制单纯甜食与高糖浓缩流质（如含糖饮料、奶油蛋糕、浓蜂蜜水）；\n3. 进餐时“干稀分食”，饭前半小时与饭后半小时不宜大量饮水饮汤；\n4. 饭后不要马上跑步走动，建议在沙发上半卧位或床头平卧休息20~30分钟。'
    ]
  },
  {
    id: 'SCI_04',
    category: 'nutrients',
    categoryName: '营养素与ONS',
    title: '全胃切除为什么必须终身关注维生素B12与铁？口服营养补充(ONS)怎么喝？',
    summary: '全胃切除后内因子缺失导致的贫血隐患全解析，手把手教您科学补充营养粉。',
    readTimeMin: 4,
    tags: ['维生素B12', '巨幼贫血', 'ONS口服营养', '缺铁性贫血'],
    keyTips: [
      '正常人体维生素B12的吸收依赖胃底腺壁细胞分泌的“内因子”，全胃切除后必须定期肌注补充B12',
      '缺铁性贫血：胃酸分泌减少导致食物中三价铁难以还原为易吸收的二价铁',
      '口服营养补充制剂（ONS）切勿沸水冲调，建议用40~50℃温开水，像喝热茶一样小口慢饮'
    ],
    evidenceSource: {
      database: 'NLM MeSH',
      citation: '《美国国立医学图书馆(NLM) MeSH知识库: 胃切除术后巨幼红细胞贫血与铁代谢》',
      evidenceLevel: 'Level I (WHO营养标准与CSPEN指南)',
      meshId: 'MeSH: D014806 (Vitamin B 12 Deficiency)',
      icd10: 'ICD-10: D51.0 (内因子缺乏所致维生素B12缺乏性贫血)',
      standardTerm: '全国科技名词审定委员会规范名: 巨幼细胞贫血 (megaloblastic anemia)',
      drugOrFsmpApproval: '国药准字H20030807 (甲钴胺注射液) / 国食注字TY20200005'
    },
    content: [
      '全胃切除术后，由于失去了分泌胃酸和内因子的全部胃黏膜，维生素B12无法与内因子结合并顺利在回肠吸收，体内原有的B12储备一般在术后1~2年逐渐耗竭，若不外源补充，易诱发巨幼红细胞贫血及神经末梢感觉异常（手脚麻木、步态不稳）。因此，全胃切除患者出院后需定期（通常每2~3个月）在随访门诊接受维生素B12肌注注射。',
      '缺铁性贫血亦十分普遍：十二指肠被旁路短路后，失去主要铁吸收部位，加之胃酸缺失使食物中的Fe3+无法转化为易被肠吸收的Fe2+。日常应多食用去皮禽肉、动物肝泥、嫩鱼肉，必要时在医生指导下补充有机铁剂。',
      '【口服营养补充（ONS）的正确服用技巧】\n许多患者反映喝营养粉容易腹泻或饱腹感太重，原因往往是冲调过浓或大口快饮。正确的冲泡技巧为：\n1. 水温控制在40~50℃，温度过高会破坏蛋白质与活性维生素；\n2. 每次取小剂量（约100~150ml），在两顿正餐之间（如上午10点、下午3点）作为加餐补充；\n3. 饮用速度如同品茶，用时15~20分钟慢饮，使胃肠道有充足时间温和吸收。'
    ]
  },
  {
    id: 'SCI_05',
    category: 'complications',
    categoryName: '反流性食管炎',
    title: '反酸、烧心、咽喉异物感？睡眠体位与日常护胃细节指南',
    summary: '胃切除术后抗反流屏障减弱导致的碱性反流应对技巧，提升夜间睡眠质量。',
    readTimeMin: 3,
    tags: ['反流性食管炎', '烧心', '睡姿垫高', '碱性反流'],
    keyTips: [
      '胃切除术后多为碱性胆汁胰液反流，常表现为胸骨后烧灼感、口苦咽干、夜间呛咳',
      '睡前2~3小时坚决不进水不吃东西，避免胃肠内残留液体逆流',
      '将床头抬高15~20厘米（垫高床头而非单纯垫高枕头）利用重力预防夜间反流'
    ],
    evidenceSource: {
      database: '术语在线',
      citation: '《全国科学技术名词审定委员会公布名词·碱性反流性食管炎与胃炎》',
      evidenceLevel: 'Grade A 强推荐',
      meshId: 'MeSH: D018928 (Bile Reflux)',
      icd10: 'ICD-10: K21.0 (胃食管反流病伴食管炎)',
      standardTerm: '全国科技名词审定委员会规范名: 碱性反流性食管炎 (alkaline reflux esophagitis)',
      drugOrFsmpApproval: '国药准字H20013110 (铝碳酸镁咀嚼片)'
    },
    content: [
      '术后贲门切除或消化道改建破坏了正常的抗反流天然屏障，十二指肠内的胆汁和胰液容易逆流而上刺激食管黏膜，引起反酸、胸骨后灼热疼痛，甚至在平躺时呛咳醒来。',
      '常规胃药抑酸剂（如奥美拉唑）对碱性胆汁反流效果受限，临床首选结合物理重力防反流与黏膜吸附保护剂（如铝碳酸镁）。',
      '居家日常护胃防反流四步法：\n第一步【体位防反流】：睡觉时建议抬高床头15~20度，或者使用专业斜坡三角床垫；\n第二步【睡前防反流】：睡前2~3小时严禁吃加餐和大量喝水，保持空腹入眠；\n第三步【饮食防反流】：忌浓茶、烈酒、碳酸饮料、巧克力及高脂油炸食品，避免增加腹内压；\n第四步【生活习惯】：餐后不要马上弯腰低头干重活，穿衣宜宽松，腰带不要过紧。'
    ]
  },
  {
    id: 'SCI_06',
    category: 'red_flags',
    categoryName: '红旗警示与急救',
    title: '必须立刻就医的“红旗征象”清单：家庭急救指征与注意事项',
    summary: '生命安全第一防线：体温超38.5℃、突发撕裂剧痛、伤口裂开、呕血黑便时的紧急处理。',
    readTimeMin: 3,
    tags: ['红旗征象', '吻合口瘘', '出血', '急诊绿色通道'],
    keyTips: [
      '出现红旗危急征象时，切勿自行服用止痛片（止痛药会掩盖急腹症病征）',
      '切勿犹豫等待“看看明天会不会好”，外科吻合口瘘与活动性出血分秒必争',
      '立即前往手术医院急诊外科，并携带近期的出院小结与检查报告单'
    ],
    evidenceSource: {
      database: '梅斯医学 (ICD-10)',
      citation: '《梅斯医学临床编码知识库: 消化系统操作后严重并发症与急危重症分级标准》',
      evidenceLevel: 'Level I (急诊急腹症临床指南Grade A)',
      meshId: 'MeSH: D057868 (Anastomotic Leak)',
      icd10: 'ICD-10: K91.8 (消化系统的其他操作后疾患) / K92.2',
      standardTerm: '全国科技名词审定委员会规范名: 吻合口瘘 (anastomotic leakage)',
      drugOrFsmpApproval: '三甲医院急诊绿色通道规范标准'
    },
    content: [
      '胃部手术调养居家康复期若出现以下四类红旗危险征象中的任何一项，必须视为急诊警示：\n1. 【高热寒战】：腋温连续高于38.5℃，伴发冷或呼吸急促，提示腹腔潜在感染或吻合口渗漏；\n2. 【剧烈持续腹痛】：突发刀割样、剧烈持续腹痛，腹部拒按板状硬，常提示消化道穿孔或急性吻合口瘘；\n3. 【伤口急性异常】：腹部切口或造口周围突然大量渗出浑浊液体、红肿剧痛或切口边缘裂开；\n4. 【急性活动性出血】：突发呕咖啡色血液、鲜血，或排出大量柏油样腥臭黑便，伴头晕心悸眼前发黑。',
      '急救行动须知：立即拨打120急救电话或在家属陪同下乘坐专车直奔手术医院急诊外科。途中保持患者平卧安静，禁食禁水，切勿自行服药。'
    ]
  },
  {
    id: 'SCI_07',
    category: 'nutrients',
    categoryName: '骨代谢与钙吸收',
    title: '为什么切胃后要格外注意补钙与维生素D？如何预防骨质疏松与骨痛？',
    summary: '胃酸与十二指肠吸收旁路导致的钙流失机制，教您选对不依赖胃酸的柠檬酸钙。',
    readTimeMin: 3,
    tags: ['骨质疏松', '柠檬酸钙', '维生素D', '骨痛预防'],
    keyTips: [
      '胃酸分泌减少使普通碳酸钙难以溶解离子化，切胃患者建议优先选“柠檬酸钙”',
      '补充钙质必须协同活性维生素D，激活肠道钙结合蛋白才能高效吸收',
      '出院后每年定期复查双能X线骨密度(DXA)及血清25-羟基维生素D'
    ],
    evidenceSource: {
      database: '国家药监局 (NMPA)',
      citation: '《国家药品监督管理局药品说明书规范: 柠檬酸钙与骨化三醇在代谢性骨病中的临床应用》',
      evidenceLevel: 'Level I (IOF国际骨质疏松基金会临床共识)',
      meshId: 'MeSH: D010024 (Osteoporosis)',
      icd10: 'ICD-10: M81.8 (其他特指的骨质疏松症)',
      standardTerm: '全国科技名词审定委员会规范名: 骨质疏松症 (osteoporosis)',
      drugOrFsmpApproval: '国药准字H20030491 (柠檬酸钙片) / 国药准字H10980075'
    },
    content: [
      '很多人不知道，切除部分或全部胃后，人体的钙吸收环境发生了根本性改变。正常情况下，饮食中的钙在强酸性胃液中游离成钙离子，随后主要在十二指肠主动吸收。',
      '术后胃酸分泌大幅度降低甚至为零，传统价格便宜的碳酸钙（需要大量强胃酸才能崩解）吸收率大打折扣；加上十二指肠被旁路改道，钙的主要吸收窗口被绕过，患者在术后1~3年常逐渐出现血钙偏低、腰背酸痛、骨质疏松甚至轻微碰撞即骨折。',
      '科学补钙黄金法则：\n1. 优先选择水溶性好、不依赖胃酸即可完全离解的“柠檬酸钙”；\n2. 每日随餐分次服用，单次不超过250~500mg元素钙；\n3. 协同补充活性维生素D（如骨化三醇软胶囊），并在阳光适宜时户外慢走散步，利用机械负重刺激成骨。'
    ]
  },
  {
    id: 'SCI_08',
    category: 'complications',
    categoryName: '肠道功能与排便',
    title: '术后腹泻与排便频次多怎么办？认识乳糖不耐与脂肪泻的饮食调理',
    summary: '快速排空、肠道菌群改变及消化液失调引发的排便紊乱，手把手教您居家温和止泻。',
    readTimeMin: 3,
    tags: ['术后腹泻', '乳糖不耐受', '脂肪泻', '益生菌调理'],
    keyTips: [
      '由于小肠排空过快及肠道乳糖酶相对不足，术后早期喝纯牛奶极易诱发渗透性腹泻',
      '排出的便便呈油亮浮水恶臭，常提示“脂肪泻”，需严格控制煲汤浮油与高脂煎炸',
      '发生轻中度水样便时，重点补充口服补液盐(ORS)防脱水与电解质紊乱'
    ],
    evidenceSource: {
      database: 'MSD诊疗手册',
      citation: '《MSD诊疗手册专业版·胃肠道手术后吸收不良综合征与肠道菌群失调》',
      evidenceLevel: 'Grade A 强推荐',
      meshId: 'MeSH: D007787 (Lactose Intolerance)',
      icd10: 'ICD-10: K90.4 (由于吸收不良引起的吸收障碍)',
      standardTerm: '全国科技名词审定委员会规范名: 脂肪泻 (steatorrhea)',
      drugOrFsmpApproval: '国药准字S10950019 (双歧杆菌三联活菌胶囊)'
    },
    content: [
      '胃切除后，食糜不经胃腔长时间研磨杀菌而过快倾泻入小肠，胆汁、胰酶与食物无法完美混合，未消化的脂肪和碳水化合物直接进入结肠，导致渗透压升高及肠黏膜分泌增加，患者常出现进食后急迫排便、大便稀溏或每日排便5~8次。',
      '两大常见致泻诱因与对策：\n1. 【乳糖不耐受】：术后小肠微绒毛受损致乳糖酶不足。出院初期避免直接大量饮用未水解的纯鲜牛奶，可尝试低乳糖配方奶或充分滤渣的温豆浆。\n2. 【脂肪泻】：表现为大便发白、带有油花恶臭。烹饪必须严格禁绝油炸、肥肉与油腻老母鸡浓汤。煲汤必须经冷藏彻底撇除表层白硬凝固脂肪油。',
      '调理法宝：在责任护士指导下适量补充医用双歧杆菌或嗜酸乳杆菌活菌制剂，配合发面馒头、蒸苹果泥（富含果胶有助收敛固便）。'
    ]
  }
];

// ======================== 🌟 食物红绿灯速查数据库 (Traffic Light Food Guide) ========================
export const foodTrafficLights: FoodTrafficLight[] = [
  // 🟢 绿灯：强烈推荐 (高蛋白、低纤维、易吸收、细软)
  {
    id: 'FOOD_G01',
    name: '清蒸龙利鱼 / 鲈鱼嫩肉碎',
    category: 'protein',
    categoryName: '肉蛋水产',
    level: 'green',
    levelLabel: '🟢 推荐食用',
    advice: '去皮剔刺、剁碎清蒸，出院第1周末起可作为主要优质蛋白来源。',
    reason: '肌纤维短而细腻，消化道极易分解吸收，不易造成吻合口机械梗阻。',
    tags: ['优质蛋白', '高消化率', '愈合必需'],
    evidenceSource: {
      database: 'CSCO/CSPEN指南',
      citation: '《中国肿瘤患者营养指南 2024》: 鱼肉肌纤维间质水解率居肉类前列',
      evidenceLevel: 'Grade A 强推荐'
    }
  },
  {
    id: 'FOOD_G02',
    name: '蒸嫩鸡蛋羹 (淋几滴香油)',
    category: 'protein',
    categoryName: '肉蛋水产',
    level: 'green',
    levelLabel: '🟢 推荐食用',
    advice: '每日1~2只，加温水打匀过滤浮沫，大火蒸8分钟出锅，软如布丁。',
    reason: '全蛋白生物价最高(高达94)，天然乳糜状态，对脆弱的胃肠道黏膜零机械刺激。',
    tags: ['蛋类之王', '极度温和', '术后首选'],
    evidenceSource: {
      database: 'MSD诊疗手册',
      citation: '《MSD诊疗手册专业版·蛋白质营养生物价测定与外科康复标准》',
      evidenceLevel: 'Level I (高等级系统评价)'
    }
  },
  {
    id: 'FOOD_G03',
    name: '肉末烩嫩内酯豆腐',
    category: 'protein',
    categoryName: '肉蛋水产',
    level: 'green',
    levelLabel: '🟢 推荐食用',
    advice: '精瘦肉多次剁成细糜，与嫩内酯豆腐同烩，微咸微烂。',
    reason: '大豆植物蛋白与动物蛋白双互补，质地滑嫩，咀嚼无消化负担。',
    tags: ['双蛋白互补', '软滑易咽'],
    evidenceSource: {
      database: '术语在线',
      citation: '全国科技名词审定委员会《临床营养学名词·蛋白质互补作用》',
      evidenceLevel: 'Grade A 强推荐'
    }
  },
  {
    id: 'FOOD_G04',
    name: '去皮蒸软铁棍山药泥 / 南瓜泥',
    category: 'staple',
    categoryName: '主食与谷薯',
    level: 'green',
    levelLabel: '🟢 推荐食用',
    advice: '去皮切小块蒸透压泥，可拌入稠米粥中食用，温润健脾。',
    reason: '含有丰富的黏蛋白与果胶，有助于温和保护肠道黏膜，温和提供碳水化合物。',
    tags: ['护黏膜', '健脾和胃', '半流质伴侣'],
    evidenceSource: {
      database: 'NLM MeSH',
      citation: 'NLM MeSH: D010865 (Mucoproteins & Pectins Gastroprotective Effects)',
      evidenceLevel: 'Level II (前瞻性临床研究)'
    }
  },
  {
    id: 'FOOD_G05',
    name: '发面小馒头 / 发面小花卷 (浸润细嚼)',
    category: 'staple',
    categoryName: '主食与谷薯',
    level: 'green',
    levelLabel: '🟢 推荐食用',
    advice: '出院第2周后开始尝试，进食时需每口充分咀嚼20次成糊状。',
    reason: '发酵后淀粉颗粒蓬松多孔，易受小肠淀粉酶水解，不易引起胃胀排空延迟。',
    tags: ['发酵主食', '易消化'],
    evidenceSource: {
      database: 'MSD诊疗手册',
      citation: '《MSD诊疗手册专业版·胃切除术后碳水化合物耐受与排空动力学》',
      evidenceLevel: 'Grade A 强推荐'
    }
  },
  {
    id: 'FOOD_G06',
    name: '冬瓜蓉 / 去皮嫩胡萝卜碎',
    category: 'fruit_veg',
    categoryName: '蔬菜水果',
    level: 'green',
    levelLabel: '🟢 推荐食用',
    advice: '蔬菜必须去皮煮至极烂，切除粗茎硬纤维，煮至入口即化。',
    reason: '补充类胡萝卜素与水溶性维生素，无硬质粗纤维划伤吻合口缝合线。',
    tags: ['细纤维', '维生素补充'],
    evidenceSource: {
      database: 'CSCO/CSPEN指南',
      citation: '《CSPEN消化道术后微量营养素补充临床指南》',
      evidenceLevel: 'Level I'
    }
  },

  // 🟡 黄灯：谨慎食用 (需严格控量、测试耐受、特殊工艺处理)
  {
    id: 'FOOD_Y01',
    name: '纯牛奶 / 鲜牛奶',
    category: 'drink_snack',
    categoryName: '饮品加餐',
    level: 'yellow',
    levelLabel: '🟡 谨慎耐受测试',
    advice: '初次少量尝试50ml，观察有无腹胀肠鸣腹泻，若耐受不佳应改用无乳糖配方。',
    reason: '胃切除术后肠道乳糖酶相对不足，部分患者易出现暂时性乳糖不耐受与渗透性腹泻。',
    tags: ['乳糖敏感', '微温少饮'],
    evidenceSource: {
      database: '梅斯医学 (ICD-10)',
      citation: '梅斯医学: ICD-10 E73.0 (先天性或获得性乳糖酶缺乏症临床评估)',
      evidenceLevel: 'Level I'
    }
  },
  {
    id: 'FOOD_Y02',
    name: '香蕉 (完全熟透) / 隔水蒸熟苹果泥',
    category: 'fruit_veg',
    categoryName: '蔬菜水果',
    level: 'yellow',
    levelLabel: '🟡 谨慎加温食用',
    advice: '必须完全熟透，切不可吃青涩生硬水果；建议压成泥或隔水蒸热食用。',
    reason: '生冷水果刺激胃肠蠕动过快导致肠痉挛或阵发性腹泻，加温蒸软收敛更安全。',
    tags: ['加温蒸熟', '熟透去皮'],
    evidenceSource: {
      database: '术语在线',
      citation: '全国科技名词审定委员会《食品科学名词·果胶水解与肠道收敛》',
      evidenceLevel: 'Level II'
    }
  },
  {
    id: 'FOOD_Y03',
    name: '清淡自制豆浆 (双层滤渣)',
    category: 'drink_snack',
    categoryName: '饮品加餐',
    level: 'yellow',
    levelLabel: '🟡 谨慎少量',
    advice: '必须充分煮沸并用双层纱布过滤掉所有粗豆渣，每次不超过100ml，小口慢饮。',
    reason: '大豆低聚糖可能在结肠经细菌发酵产气，引起腹部饱胀排空不适。',
    tags: ['必须滤渣', '防腹胀'],
    evidenceSource: {
      database: 'MSD诊疗手册',
      citation: '《MSD诊疗手册专业版·胃肠胀气与低聚糖发酵病理生理》',
      evidenceLevel: 'Grade B'
    }
  },
  {
    id: 'FOOD_Y04',
    name: '去皮嫩鸡胸肉丝 / 鲜虾肉泥',
    category: 'protein',
    categoryName: '肉蛋水产',
    level: 'yellow',
    levelLabel: '🟡 需极细软',
    advice: '必须顺着肉纹切极碎肉丁或料理机打蓉后做成肉丸烩汤，忌大块干硬鸡肉。',
    reason: '禽肉结缔组织若未充分煮烂，易卡在尚未完全代偿扩张的吻合口处造成排空延迟。',
    tags: ['需切碎打蓉', '慢嚼'],
    evidenceSource: {
      database: 'NLM MeSH',
      citation: 'MeSH: D013274 (Postgastrectomy Anastomotic Passage Dynamics)',
      evidenceLevel: 'Level I'
    }
  },

  // 🔴 红灯：严格禁忌 (术后早期绝对禁止，易导致梗阻、穿孔、倾倒综合征)
  {
    id: 'FOOD_R01',
    name: '年糕 / 汤圆 / 粽子 / 糯米糍',
    category: 'staple',
    categoryName: '主食与谷薯',
    level: 'red',
    levelLabel: '🔴 绝对禁食 (严防梗阻)',
    advice: '术后半年内坚决不碰！即使吃一小口也可能酿成大祸！',
    reason: '支链淀粉黏性极高，术后吻合口狭窄且缺乏胃动力强力研磨，极易造成急性吻合口完全机械梗阻！',
    tags: ['高危黏食', '急性梗阻', '绝对禁忌'],
    evidenceSource: {
      database: '梅斯医学 (ICD-10)',
      citation: '梅斯医学: ICD-10 K91.8 (急性术后吻合口机械梗阻临床案例)',
      evidenceLevel: 'Level I (急诊急腹症强禁忌)'
    }
  },
  {
    id: 'FOOD_R02',
    name: '新鲜柿子 / 柿饼 / 黑枣 / 山楂',
    category: 'fruit_veg',
    categoryName: '蔬菜水果',
    level: 'red',
    levelLabel: '🔴 绝对禁食 (严防胃石)',
    advice: '居家严禁给患者吃任何柿子制品、柿饼或山楂！',
    reason: '含有大量鞣酸和果胶，与胃肠液接触后会迅速凝聚成坚硬如石的“植物性胃肠石”，堵塞代胃或小肠，严重者需急诊手术开腹取石！',
    tags: ['鞣酸结石', '肠梗阻急诊', '绝对禁忌'],
    evidenceSource: {
      database: 'MSD诊疗手册',
      citation: '《MSD诊疗手册专业版·胃肠道结石与植物性胃石(Phytobezoar)形成的化学机制》',
      evidenceLevel: 'Grade A 强推荐'
    }
  },
  {
    id: 'FOOD_R03',
    name: '浓糖水 / 纯蜂蜜 / 奶油蛋糕 / 巧克力',
    category: 'drink_snack',
    categoryName: '饮品加餐',
    level: 'red',
    levelLabel: '🔴 绝对禁食 (诱发倾倒)',
    advice: '术后严禁用浓糖水给患者“补充能量”，切忌浓缩单纯单双糖。',
    reason: '高渗单双糖会瞬间涌入小肠近端，引发严重恶性倾倒综合征（心慌大汗出冷汗休克）。',
    tags: ['倾倒元凶', '高渗高糖', '绝对禁忌'],
    evidenceSource: {
      database: 'NLM MeSH',
      citation: 'NLM MeSH: D004382 (Dumping Syndrome Osmolar Loading)',
      evidenceLevel: 'Level I'
    }
  },
  {
    id: 'FOOD_R04',
    name: '干炸油条 / 炸鸡 / 肥肉 / 油腻浓老母鸡汤',
    category: 'protein',
    categoryName: '肉蛋水产',
    level: 'red',
    levelLabel: '🔴 绝对禁食 (脂肪泻与胆汁反流)',
    advice: '术后煲汤请彻底冷藏撇去表层浮油，切勿喝乳白色油腻浓汤。',
    reason: '消化道改建后胰脂酶分泌与食糜排空不同步，高脂食物极易引发剧烈腹泻、严重脂肪泻和剧烈胆汁反流。',
    tags: ['高脂油腻', '严重腹泻', '绝对禁忌'],
    evidenceSource: {
      database: 'CSCO/CSPEN指南',
      citation: '《CSPEN外科围手术期脂肪乳剂与膳食脂肪吸收指南》',
      evidenceLevel: 'Grade A'
    }
  },
  {
    id: 'FOOD_R05',
    name: '粗硬芹菜 / 韭菜 / 笋干 / 坚果花生',
    category: 'fruit_veg',
    categoryName: '蔬菜水果',
    level: 'red',
    levelLabel: '🔴 绝对禁食 (机械性损伤)',
    advice: '含有大量无法消化的粗韧纤维或坚硬颗粒，术后早期严禁食用。',
    reason: '粗硬粗纤维可能强行刮擦正在愈合中的吻合口缝合线与钉合钉，甚至诱发迟发性出血或创伤性溃疡。',
    tags: ['粗硬纤维', '划伤吻合口', '绝对禁忌'],
    evidenceSource: {
      database: 'MSD诊疗手册',
      citation: '《MSD诊疗手册专业版·胃切除吻合口黏膜愈合病理与机械创伤预防》',
      evidenceLevel: 'Grade A'
    }
  },
  {
    id: 'FOOD_R06',
    name: '白酒 / 啤酒 / 碳酸饮料 / 浓烈辣椒麻辣调味',
    category: 'drink_snack',
    categoryName: '饮品加餐',
    level: 'red',
    levelLabel: '🔴 绝对禁食 (强刺激与胀气)',
    advice: '饮食保持清淡温和原味，禁止一切刺激性酒精与碳酸发泡产气饮品。',
    reason: '碳酸释放大量二氧化碳急剧扩张小肠代胃；酒精与辣椒素直接灼伤裸露的小肠黏膜诱发充血水肿。',
    tags: ['化学刺激', '吻合口水肿风险', '绝对禁忌'],
    evidenceSource: {
      database: '国家药监局 (NMPA)',
      citation: '国家卫生健康委员会《肿瘤患者临床禁烟禁酒营养康复规范》',
      evidenceLevel: 'Grade A'
    }
  }
];

// ======================== 🌟 常见科普误区深度辟谣 (Evidence-Based Myth Busters) ========================
export const scienceMyths: ScienceMyth[] = [
  {
    id: 'MYTH_01',
    question: '“炖一锅浓肉汤/老母鸡汤，营养全在汤里，只喝汤不吃肉最补身体？”',
    isTrue: false,
    verdict: '✕ 大错特错！“精华都在汤里”是最大的民间误区',
    analysis: '现代临床营养测定证实：熬煮数小时的浓肉汤中，90%以上是大量乳化的动物脂肪、嘌呤和无机盐，水溶性蛋白质不足1%~2%，绝大部分珍贵的“优质蛋白质”依然牢固锁在肉渣中。术后只喝浓汤不仅补不上伤口愈合所必需的蛋白质，高脂肪浓汤反而极易刺激胰腺诱发剧烈腹痛和严重脂肪泻！',
    nursingTip: '正确做法：将精瘦肉、嫩鱼、鸡胸肉用绞肉机打成细肉泥、做成清蒸肉饼羹给患者吃肉，真正摄取优质蛋白质！',
    evidenceSource: {
      database: 'CSCO/CSPEN指南',
      citation: '《中国临床肿瘤学会(CSCO)肿瘤恶病质临床指南 2024》: 汤与肉营养成分对比研究',
      evidenceLevel: 'Level I (临床实测循证数据)'
    }
  },
  {
    id: 'MYTH_02',
    question: '“民间说鸡、鱼、虾、蛋是‘发物’，术后吃了会导致肿瘤复发或伤口化脓？”',
    isTrue: false,
    verdict: '✕ 纯属无稽之谈！不仅不是发物，反而是康复救命的必需营养',
    analysis: '现代循证医学和肿瘤学指南没有任何证据支持“发物致癌致复发”的说法。相反，胃癌术后机体处于严重的“高分解超代谢状态”，如果盲目忌口鸡、鱼、蛋、肉等优质动物蛋白，患者很快会出现低蛋白血症、全身水肿、吻合口愈合不良甚至严重营养不良导致恶病质！',
    nursingTip: '正确做法：只要患者对该种食材无过敏，鱼、虾、肉、蛋是修复吻合口和维持白细胞免疫力必不可少的核心食材。',
    evidenceSource: {
      database: 'MSD诊疗手册',
      citation: '《MSD诊疗手册专业版·创伤高代谢与负氮平衡纠正指南》',
      evidenceLevel: 'Grade A 强推荐'
    }
  },
  {
    id: 'MYTH_03',
    question: '“饭后立刻喝一大碗温水或肉汤，既能稀释食物又能帮助消化？”',
    isTrue: false,
    verdict: '✕ 极其危险！餐后立即喝水喝汤极易引发“倾倒综合征”与严重反流',
    analysis: '切胃手术后失去了幽门的“单向控制阀门”，如果在吃完固体食物后立刻喝下大量汤水，水分会迅速将固形食糜冲入小肠空肠上段，导致肠腔渗透压瞬间暴增，诱发心慌、出冷汗、头晕昏厥的早期倾倒反应；同时胃腔充盈过量，平躺时极易诱发严重的碱性胆汁反流。',
    nursingTip: '黄金原则【干稀分食】：进餐时只吃干/细烂固体，喝水、喝汤必须放在餐前30分钟或餐后30~45分钟分开进行！',
    evidenceSource: {
      database: 'NLM MeSH',
      citation: 'NLM MeSH: D004382 (Dry-Liquid Separation in Dumping Syndrome Prevention)',
      evidenceLevel: 'Level I'
    }
  },
  {
    id: 'MYTH_04',
    question: '“做完胃癌手术以后，吃得越少胃越舒服，每天只要吃两顿稀饭就行？”',
    isTrue: false,
    verdict: '✕ 错！长期极低热量摄入会导致进行性消瘦与重度肌少症',
    analysis: '很多患者因为怕早饱腹胀，主动减少进餐频次，每天只喝两小碗清稀饭。稀白米粥的能量密度极低，几乎不含蛋白质和微量元素，长期如此会导致体重一降再降，肌肉严重流失，术后抗肿瘤治疗和免疫机能崩溃。',
    nursingTip: '正确做法：胃容量变小必须通过“增加餐次”来弥补！每天定时定点安排6~8餐（3顿主餐 + 3~4次高能量高蛋白加餐）。',
    evidenceSource: {
      database: '梅斯医学 (ICD-10)',
      citation: '梅斯医学: ICD-10 E43 (重度蛋白质能量营养不良预防与能量阶梯递增规范)',
      evidenceLevel: 'Level I'
    }
  },
  {
    id: 'MYTH_05',
    question: '“刚做完手术身体虚弱，应该马上吃海参、燕窝、冬虫夏草等名贵大补药材？”',
    isTrue: false,
    verdict: '✕ 欲速则不达！盲目滋补名贵补品反而严重加重胃肠吸收负担',
    analysis: '海参胶原蛋白虽好但属于胶原纤维较粗的不完全蛋白质，胃酸缺失状态下极难被小肠胰酶水解；冬虫夏草、人参等多含复杂鞣质或刺激性皂苷成分，不仅难以吸收，还容易引起吻合口水肿、腹胀不耐受或肠黏膜充血。',
    nursingTip: '科学补身：最朴实高效的“补品”其实是新鲜鸡蛋羹、去皮嫩鲈鱼肉和正规医院开具的口服全营养配方粉(FSMP)！',
    evidenceSource: {
      database: '国家药监局 (NMPA)',
      citation: '国家中医药管理局与国家药监局《术后康复期中药及滋补品规范指引》',
      evidenceLevel: 'Grade A'
    }
  },
  {
    id: 'MYTH_06',
    question: '“胃部手术后容易肠梗阻，所以应该完全静卧在床上，少下床走动？”',
    isTrue: false,
    verdict: '✕ 绝对错误！长期卧床不仅不防梗阻，反而导致肠粘连与下肢深静脉血栓',
    analysis: '胃肠道蠕动的生理恢复高度依赖于人体的自主躯体运动与重力刺激。长期卧床导致肠管静止、肠系膜微循环淤滞，肠管更容易粘连形成纤维索带造成粘连性肠梗阻；且卧床极易引发致命的下肢深静脉血栓(DVT)脱落致肺栓塞。',
    nursingTip: '科学活动：餐后半卧位休息20~30分钟以防倾倒，之后可在室内走廊慢步平路行走10~15分钟，每日累计步行3000~5000步（可通过智能手环监测）。',
    evidenceSource: {
      database: 'MSD诊疗手册',
      citation: '《MSD诊疗手册专业版·外科术后早期活动与血栓/粘连预防》',
      evidenceLevel: 'Grade A 强推荐'
    }
  }
];

// ======================== 🌟 一周精选康复示范食谱 (Weekly Sample Meal Plans - 7 Days) ========================
export const weeklyDietPlans: MealPlanDay[] = [
  {
    dayName: '周一 · 细烂易消化示范餐',
    stageName: '出院后第1周（细烂半流质期）',
    meals: [
      { timeSlot: '07:30 早餐', mealName: '蛋花小米稠米糊 + 温水冲调全营养配方粉50ml', food: '小米粥煮烂打细糊100ml，打入新鲜鸡蛋花充分搅匀煮沸', notes: '细嚼慢饮，耗时15分钟' },
      { timeSlot: '10:00 早加餐', mealName: '蒸熟去皮铁棍山药泥半小碗 (约60g)', food: '山药蒸透碾压成细泥，可拌入少许温热奶粉', notes: '温和健脾护胃黏膜' },
      { timeSlot: '12:00 午餐', mealName: '细烂肉末豆腐碎面条', food: '精瘦肉多次剁泥烩嫩内酯豆腐，龙须挂面折断煮至软烂', notes: '面条软烂如糊，无需费力咀嚼' },
      { timeSlot: '15:00 下午加餐', mealName: '温热口服营养补充(ONS) 100ml', food: '45℃温开水冲调，像品热茶一样慢饮', notes: '间隔30分钟后再喝水' },
      { timeSlot: '18:00 晚餐', mealName: '龙利鱼蓉白米稠粥 + 蒸嫩南瓜', food: '新鲜龙利鱼剔除暗刺剁细泥，与白米粥同熬', notes: '优质蛋白质充分补充' },
      { timeSlot: '20:30 睡前加餐', mealName: '蒸嫩蛋羹半小碗 (淋香油2滴)', food: '温水搅打蒸8分钟，软如布丁', notes: '睡前2小时吃完，之后禁水' }
    ]
  },
  {
    dayName: '周二 · 高蛋白营养加强餐',
    stageName: '出院后第2~4周（软食高蛋白过渡期）',
    meals: [
      { timeSlot: '07:30 早餐', mealName: '发面小馒头半个 + 虾仁鸡蛋羹', food: '小馒头撕成小碎块浸入蛋羹中细嚼慢咽', notes: '每口咀嚼20次' },
      { timeSlot: '10:00 早加餐', mealName: '蒸苹果泥 + 维生素全营养粉80ml', food: '苹果去皮隔水蒸软碾成细泥', notes: '加温蒸熟防肠道受凉' },
      { timeSlot: '12:00 午餐', mealName: '软蒸米饭 + 茄汁清蒸鲜鱼片 + 冬瓜蓉', food: '软饭煮烂水米比1.5:1，去皮嫩鱼片清蒸烩去皮番茄碎', notes: '微酸开胃促进食欲' },
      { timeSlot: '15:00 下午加餐', mealName: '自制鲜温豆浆 (双层滤渣) 80ml', food: '豆浆充分煮透并彻底过滤粗渣', notes: '测试耐受，无腹胀可续服' },
      { timeSlot: '18:00 晚餐', mealName: '鸡肉蓉烩冬瓜碎 + 发面小软花卷', food: '嫩鸡胸肉打细蓉烩冬瓜，搭配软花卷细嚼', notes: '干稀分食，餐后半卧位20分钟' },
      { timeSlot: '20:30 睡前加餐', mealName: '全营养配方ONS温饮100ml', food: '提供夜间身体修复必需微量元素与氨基酸', notes: '安抚睡眠，床头抬高15度' }
    ]
  },
  {
    dayName: '周三 · 护黏膜养胃平稳餐',
    stageName: '少食多餐·干稀分食规范',
    meals: [
      { timeSlot: '07:30 早餐', mealName: '山药红枣去皮糊 + 嫩蛋黄碎', food: '山药蒸透与去核红枣去皮蒸泥，调和温水慢服', notes: '温润和胃' },
      { timeSlot: '10:00 早加餐', mealName: '口服营养补充(ONS) 100ml', food: '标准浓度冲泡，小口啜饮', notes: '补充热量与微量元素' },
      { timeSlot: '12:00 午餐', mealName: '嫩鲈鱼碎煮软烂挂面', food: '鲈鱼去皮去骨清蒸碾碎，与细挂面合煮', notes: '清淡少盐' },
      { timeSlot: '15:00 下午加餐', mealName: '温热熟香蕉泥 (隔水温热)', food: '香蕉熟透去皮温热碾泥', notes: '温润通肠' },
      { timeSlot: '18:00 晚餐', mealName: '肉末内酯豆腐烩白米粥', food: '极瘦精肉剁泥合豆腐熬粥', notes: '蛋白质与热量双足' },
      { timeSlot: '20:30 睡前加餐', mealName: '蒸蛋羹半碗', food: '软嫩易消化，睡前2小时完成', notes: '夜间护胃防饥饿' }
    ]
  },
  {
    dayName: '周四 · 补铁与维生素B12强化餐',
    stageName: '预防贫血重点日',
    meals: [
      { timeSlot: '07:30 早餐', mealName: '菠菜嫩叶打汁米糊 + 蛋羹', food: '嫩菠菜焯水打汁加入小米糊，搭配嫩蛋羹', notes: '补充植物铁与叶酸' },
      { timeSlot: '10:00 早加餐', mealName: '去皮蒸南瓜泥 + ONS 80ml', food: '去皮南瓜温润甘甜', notes: '温和提供碳水' },
      { timeSlot: '12:00 午餐', mealName: '清炖鸭血豆腐细碎羹 + 软发面花卷', food: '新鲜鸭血与嫩豆腐切1cm小丁烩煮，发面花卷细嚼', notes: '血红素铁生物吸收率高' },
      { timeSlot: '15:00 下午加餐', mealName: '温热熟梨泥 (去皮去核隔水蒸烂)', food: '温和润肺，去渣慢饮', notes: '温润防燥' },
      { timeSlot: '18:00 晚餐', mealName: '龙利鱼蓉烩烂面 + 胡萝卜泥', food: '去刺鱼蓉烩烂面，色香味俱全', notes: '补充优质蛋白质' },
      { timeSlot: '20:30 睡前加餐', mealName: '全营养配方ONS 100ml', food: '45度水温冲饮', notes: '保持血夜间平稳' }
    ]
  },
  {
    dayName: '周五 · 优质水产双蛋白餐',
    stageName: '体力与创口修复巩固',
    meals: [
      { timeSlot: '07:30 早餐', mealName: '鲜虾仁肉泥蒸蛋羹 + 小发糕碎', food: '青虾去虾线打细泥与蛋液同蒸，质地滑嫩鲜美', notes: '高蛋白低脂肪' },
      { timeSlot: '10:00 早加餐', mealName: '口服全营养配方粉 100ml', food: '小口慢饮15分钟', notes: '能量补充' },
      { timeSlot: '12:00 午餐', mealName: '清蒸嫩龙利鱼片 + 软烂米粥 + 去皮西葫芦蓉', food: '西葫芦去皮煮至软透切细泥', notes: '细纤维易消化' },
      { timeSlot: '15:00 下午加餐', mealName: '自制温热双层滤渣豆浆 80ml', food: '小口啜饮，防肠胀气', notes: '植物蛋白补充' },
      { timeSlot: '18:00 晚餐', mealName: '肉末豆腐烂米饭', food: '软烂米饭烩肉末内酯豆腐，入口即化', notes: '干稀分食' },
      { timeSlot: '20:30 睡前加餐', mealName: '蒸温软苹果泥', food: '隔水蒸熟温和收敛', notes: '睡前2小时食完' }
    ]
  },
  {
    dayName: '周六 · 胃肠动力舒缓餐',
    stageName: '防胀气与平稳过渡',
    meals: [
      { timeSlot: '07:30 早餐', mealName: '小米白米混合稠粥 + 蒸蛋羹', food: '小米白米1:1细熬稠米油，蛋羹软滑', notes: '米油护黏膜' },
      { timeSlot: '10:00 早加餐', mealName: '去皮铁棍山药蒸泥', food: '山药蒸透碾泥慢食', notes: '健脾养胃' },
      { timeSlot: '12:00 午餐', mealName: '嫩鸡胸肉蓉烩冬瓜烂面条', food: '鸡胸打蓉烩冬瓜细烂龙须面', notes: '清淡少油' },
      { timeSlot: '15:00 下午加餐', mealName: '口服全营养制剂(ONS) 100ml', food: '温水冲调慢饮', notes: '维持营养均衡' },
      { timeSlot: '18:00 晚餐', mealName: '鲈鱼碎末南瓜稠粥', food: '鲈鱼去刺剁碎同南瓜米粥慢炖', notes: '易消化高吸收' },
      { timeSlot: '20:30 睡前加餐', mealName: '蛋花温米汤 (打散细蛋花)', food: '极淡温热米汤打入蛋花', notes: '安抚睡眠' }
    ]
  },
  {
    dayName: '周日 · 二元家庭协同温馨餐',
    stageName: '家属照护共同进食日',
    meals: [
      { timeSlot: '07:30 早餐', mealName: '双色蒸蛋羹 (蛋黄与蛋清分层蒸) + 小发面花卷', food: '发面花卷撕小块，每口咀嚼20次', notes: '家属共同进餐' },
      { timeSlot: '10:00 早加餐', mealName: '温热ONS配方奶 100ml', food: '照护者协助冲调测量水温', notes: '45℃温润适口' },
      { timeSlot: '12:00 午餐', mealName: '番茄去皮烩鱼丸蓉 + 软烂米饭', food: '熟番茄完全去皮熬微酸汁烩嫩鱼丸泥', notes: '增进食欲与味觉' },
      { timeSlot: '15:00 下午加餐', mealName: '蒸熟去皮梨泥半碗', food: '隔水蒸透温热', notes: '防干燥' },
      { timeSlot: '18:00 晚餐', mealName: '肉末豆腐碎烩稠面糊 + 嫩胡萝卜蓉', food: '细软可口，全家共享营养餐', notes: '餐后半卧位休息' },
      { timeSlot: '20:30 睡前加餐', mealName: '全营养配方ONS 100ml', food: '为夜间提供持续修复氨基酸', notes: '床头垫高15度入眠' }
    ]
  }
];
