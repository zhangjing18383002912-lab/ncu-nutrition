/**
 * 基于TDIM的胃癌术后患者及照顾者营养管理平台 - 核心领域模型定义
 * Theoretical Framework: Dyadic Illness Management Theory (TDIM)
 * 论文归属: 南昌大学医学院护理学硕士开题报告 (张靖 / 导师: 何朝珠教授)
 */

export type UserRole = 'patient' | 'caregiver' | 'admin';

export type HospitalCampus = 'donghu' | 'xianghu'; // 南昌大学第一附属医院: 东湖院区 / 象湖院区

export type RecoveryStage = 
  | 'discharge_prep'  // 出院准备期 (未录入出院日期)
  | 'week_1'          // 出院后第1周 (出院第1~7天)
  | 'week_2_4'        // 出院后第2~4周 (出院第8~28天)
  | 'post_1_month';   // 出院1个月以后 (长期巩固与复查随访)

export type SurgeryType = 'total_gastrectomy' | 'subtotal_gastrectomy' | 'distal_gastrectomy' | 'proximal_gastrectomy' | null;

export type DietTolerance = 'good' | 'moderate' | 'poor' | null;

// 权威循证医学数据源出处 (基于 ModelScope 医学查询MCP 与国内外权威指南)
export interface EvidenceSource {
  database: 'MSD诊疗手册' | 'NLM MeSH' | '术语在线' | '梅斯医学 (ICD-10)' | '国家药监局 (NMPA)' | 'CSCO/CSPEN指南';
  citation: string;          // 权威出处全称或章节
  evidenceLevel: string;     // 证据等级: 如 "Level I (RCT/Meta分析)", "Grade A 强推荐", "临床指南A级"
  meshId?: string;           // NLM MeSH 主题词 ID
  icd10?: string;            // 梅斯医学 ICD-10 编码
  standardTerm?: string;     // 全国科技名词审定委员会规范定名
  drugOrFsmpApproval?: string; // 国家药监局批准文号或标准号
}

// 科普知识分类
export type ScienceCategory = 'anatomy' | 'recipes' | 'complications' | 'nutrients' | 'red_flags';

export interface ScienceArticle {
  id: string;
  category: ScienceCategory;
  categoryName: string;
  title: string;
  summary: string;
  content: string[];
  keyTips: string[];
  readTimeMin: number;
  tags: string[];
  evidenceSource?: EvidenceSource;
}

// 智能问答消息模型
export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isAudioPlaying?: boolean;
}

// 附录 C1: 患者一般资料调查表模型
export interface PatientBaselineProfile {
  age: number;
  gender: 'male' | 'female';
  education: string;
  campus: HospitalCampus;
  surgeryType: SurgeryType;
  surgeryDate: string;
  dischargeDate: string | null;
  pathologyStage: string;
  comorbidities: string[];
  adjuvantTherapy: string;
  onsUsage: { used: boolean; name?: string; details?: string };
  digitalToolNeedsHelp: boolean;
  financialBurdenDesc: string;
  heightCm: number;
  preOpWeightKg: number;
}

// 附录 C2: 照顾者一般资料调查表模型
export interface CaregiverBaselineProfile {
  age: number;
  gender: 'male' | 'female';
  education: string;
  relationWithPatient: string;
  employmentStatus: string;
  livingArrangement: 'with_patient' | 'separate';
  primaryTasks: string[];
  dailyCareHours: number;
  hasOtherCaregivers: boolean;
  digitalToolNeedsHelp: boolean;
}

export interface UserProfile {
  id: string;
  researchId: string; // P0001 / C0001 / ADM01
  role: UserRole;
  wechatOpenId: string;
  nickname: string;
  phone: string;
  campus: HospitalCampus;
  pairedUserId?: string | null;
  dyadPairId?: string | null;
  surgeryType?: SurgeryType;
  dischargeDate?: string | null;
  dietTolerance?: DietTolerance;
  patientBaseline?: PatientBaselineProfile;
  caregiverBaseline?: CaregiverBaselineProfile;
  createdAt: string;
}

export interface DyadPair {
  id: string;
  patientId: string;
  caregiverId?: string | null;
  campus: HospitalCampus;
  pairCode: string;
  codeExpiresAt: number;
  status: 'pending' | 'active' | 'unpaired';
  pairedAt?: string | null;
  unpairedAt?: string | null;
}

export interface SharingPermission {
  patientId: string;
  shareDiet: boolean;
  shareWeight: boolean;
  shareSymptoms: boolean;
  updatedAt: string;
}

export interface GuidanceItem {
  id: string;
  stage: RecoveryStage;
  category: 'diet_transition' | 'symptom_coping' | 'nutrition_supp' | 'nutrition_monitoring';
  categoryName: string;
  title: string;
  content: string;
  audioText?: string;
  isConditional: boolean;
  conditionDescription?: string;
  conditionRuleId?: string;
  version: string;
  isExample: boolean;
  evidenceSource?: EvidenceSource;
}

export interface AppraisalQuestion {
  id: string;
  stage: RecoveryStage;
  title: string;
  options: { key: string; label: string }[];
  correctAnswer: string;
  explanation: string;
  version: string;
  isExample: boolean;
  evidenceSource?: EvidenceSource;
}

export type AppraisalOutcome = 'both_match_correct' | 'both_match_incorrect' | 'mismatch' | 'waiting_other';

export interface AppraisalAnswer {
  id: string;
  questionId: string;
  questionVersion: string;
  dyadId: string;
  userId: string;
  userRole: UserRole;
  answer: string;
  attemptNumber: 1 | 2;
  isProxyOrDiscussed: boolean;
  submittedAt: string;
}

// -------------------------------------------------------------
// 二元评价核心支柱 1: 双方对同一营养问题的判断 (Dyadic Judgment on Nutrition Issues)
// -------------------------------------------------------------
export interface NutritionIssueJudgment {
  id: string;
  stage: RecoveryStage;
  title: string;
  clinicalSignificance: string;
  options: {
    key: string;
    label: string;
    clinicalMeaning: string;
  }[];
  concordanceEvaluation?: {
    patientAnswer?: {
      userId: string;
      answerKey: string;
      note?: string;
      submittedAt: string;
    };
    caregiverAnswer?: {
      userId: string;
      answerKey: string;
      note?: string;
      submittedAt: string;
    };
    concordance: 'concordant' | 'mild_discrepancy' | 'severe_discrepancy' | 'waiting';
    concordanceTitle: string;
    nursePrescription: string;
    communicationScript: string;
  };
  evidenceSource?: EvidenceSource;
}

// -------------------------------------------------------------
// 二元评价核心支柱 2: 患者进食感受 (Patient Subjective Eating Sensations)
// -------------------------------------------------------------
export interface PatientEatingExperience {
  id: string;
  dyadId: string;
  patientId: string;
  mealType: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'night_snack';
  mealTypeName: string;
  comfortRating: 1 | 2 | 3 | 4 | 5; // 1: 极度难受, 5: 舒适轻松
  sensations: {
    earlySatiety: number; // 0: 无, 1: 轻度, 2: 明显早饱(吃两三口就饱), 3: 严重
    gastricBloating: number; // 0: 无, 1: 轻微饱胀, 2: 胃部膨满下坠, 3: 胀痛
    dumpingSymptoms: number; // 0: 无, 1: 稍感心慌出冷汗, 2: 明显虚脱头晕需平卧, 3: 严重
    eatingFatigue: number; // 0: 轻松, 1: 略累, 2: 进食费力气喘, 3: 极度疲惫
    fearOfDiscomfort: number; // 0: 无, 1: 略有顾虑, 2: 畏惧进食后难受, 3: 严重惧食
    tasteChange: boolean; // 味觉改变/金属味/食之无味
    acidReflux: boolean; // 反酸嗳气
  };
  patientVerbalNote: string;
  caregiverFeedback?: {
    viewedAt: string;
    caregiverId: string;
    empathyMessage: string; // 照顾者暖心回音
    careAdjustment: string; // 照护行动调整 (如：下餐减量1/3并加半勺蛋白粉)
  };
  nurseClinicalTip: string;
  createdAt: string;
}

// -------------------------------------------------------------
// 二元评价核心支柱 3: 照顾者执行困难 (Caregiver Execution Difficulties & Burdens)
// -------------------------------------------------------------
export interface CaregiverExecutionBurden {
  id: string;
  dyadId: string;
  caregiverId: string;
  stressLevel: 1 | 2 | 3 | 4 | 5; // 1: 尚可从容, 5: 精疲力竭极度焦虑
  difficultyTags: string[]; // e.g. '每日6~8餐备餐耗竭', '劝饭拒食矛盾', '热量蛋白质计算困难', '照护与工作睡眠冲突', '恐慌病情并发症'
  caregiverVoice: string; // 照顾者心里话填报
  patientGratitude?: {
    readAt: string;
    patientId: string;
    gratitudeMessage: string; // 患者温暖回馈与体谅
  };
  reliefStrategies: string[]; // 系统/护士长给出的减负锦囊
  createdAt: string;
}

export type TaskAssignee = 'patient' | 'caregiver' | 'joint';
export type TaskExecStatus = 'completed' | 'difficult' | 'not_applicable' | 'todo';

export interface DyadicTask {
  id: string;
  dyadId: string;
  stage: RecoveryStage;
  title: string;
  patientRoleDesc: string;
  caregiverRoleDesc: string;
  proposedAssignee: TaskAssignee;
  patientAgreed: boolean;
  caregiverAgreed: boolean;
  isConfirmed: boolean;
  execStatus: TaskExecStatus;
  difficultyReason?: string;
  updatedAt: string;
}

export type IntakeLevel = 1 | 2 | 3 | 4 | 5;

export interface SymptomScore {
  earlySatiety: number;
  nauseaVomiting: number;
  abdominalDistension: number;
  dumpingSyndrome: number;
  reflux: number;
  diarrhea: number;
  hasRedFlag: boolean;
  redFlagDetails?: string[];
}

export interface HealthRecord {
  id: string;
  dyadId: string;
  recorderId: string;
  recorderRole: UserRole;
  isProxy: boolean;
  voiceInputUsed?: boolean;
  recordType: 'diet' | 'weight' | 'symptom';
  dietData?: {
    mealTime: string;
    foodType: string;
    intakeLevel: IntakeLevel;
    notes?: string;
  };
  weightData?: {
    weightKg: number;
    measuredAt: string;
  };
  symptomData?: SymptomScore;
  triageResult?: {
    level: 'normal' | 'care_guidance' | 'contact_nurse' | 'emergency';
    alertTitle: string;
    advice: string;
    rulePath: string;
  };
  createdAt: string;
}

// 附录 C4: 系统可用性量表 (SUS) 填报记录
export interface SusEvaluation {
  id: string;
  dyadId: string;
  userId: string;
  userRole: UserRole;
  items: number[];
  totalScore: number;
  submittedAt: string;
}

// 附录 C5: 患者主观整体营养评估简表 (PG-SGA SF) 评估记录
export interface PgSgaSfEvaluation {
  id: string;
  patientId: string;
  timing: 'baseline' | 'terminal';
  weightScore: number;
  dietScore: number;
  symptomScore: number;
  activityScore: number;
  totalScore: number;
  submittedAt: string;
}

// 附录 C6: Zarit 照顾者负担量表 (ZBI-12) 评估记录
export interface Zbi12Evaluation {
  id: string;
  caregiverId: string;
  timing: 'baseline' | 'terminal';
  scores: number[];
  totalScore: number;
  submittedAt: string;
}

// 附录 C7: 临床实验室营养生化指标记录表
export interface ClinicalBiomarkers {
  id: string;
  patientId: string;
  timing: 'baseline' | 'terminal';
  heightCm: number;
  weightKg: number;
  bmi: number;
  alb: number;
  pa: number;
  tp: number;
  hb: number;
  lymphocytes: number;
  measuredAt: string;
}

export interface DecisionTreeNode {
  id: string;
  type: 'condition' | 'result' | 'missing_check';
  field?: string;
  operator?: 'equals' | 'in' | 'greaterThan' | 'isMissing';
  threshold?: any;
  missingBranchNodeId?: string;
  branches?: { value: any; nextNodeId: string }[];
  defaultBranchNodeId?: string;
  result?: {
    approved?: boolean;
    filterTags?: string[];
    action?: 'normal' | 'care_guidance' | 'contact_nurse' | 'emergency';
    alertTitle?: string;
    advice?: string;
    reason?: string;
  };
}

export interface DecisionTree {
  id: string;
  name: string;
  scene: 'guidance_filter' | 'symptom_triage';
  version: string;
  status: 'draft' | 'published' | 'deprecated';
  reviewer: string;
  effectiveDate: string;
  nodes: Record<string, DecisionTreeNode>;
  rootNodeId: string;
  updatedAt: string;
}

export interface DecisionRunLog {
  id: string;
  treeId: string;
  treeVersion: string;
  scene: string;
  input: Record<string, any>;
  hitPath: string[];
  output: Record<string, any>;
  isSimulation: boolean;
  runAt: string;
}

export interface NurseMessage {
  id: string;
  dyadId: string;
  senderId: string;
  senderRole: UserRole;
  senderName: string;
  content: string;
  reply?: string;
  repliedAt?: string;
  replierName?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  operatorId: string;
  operatorRole: string;
  action: string;
  detail: string;
  timestamp: string;
}

export interface EffectiveUsage {
  id: string;
  researchId: string;
  stage: RecoveryStage;
  actionType: 'view_guidance' | 'submit_appraisal' | 'assign_task' | 'submit_health_record' | 'contact_nurse' | 'complete_scale' | 'ask_ai_assistant';
  payloadSummary: string;
  timestamp: string;
}

export interface FeasibilityMetrics {
  targetDyadsTotal: number;
  targetDonghu: number;
  targetXianghu: number;
  eligibleInvitedDyads: number;
  enrolledDyads: number;
  recruitmentRate: number;
  completedTerminalSusDyads: number;
  dyadicTerminalCompletionRate: number;
  taskIndependentRate: number;
  taskAssistedRate: number;
  patientSusMean: number;
  caregiverSusMean: number;
}

// ======================== 🌟 积分打卡与二元激励模型 (Points & Rewards System) ========================
export type PointsActionType =
  | 'daily_checkin'      // 每日基础打卡 (+20)
  | 'dyad_streak_bonus'  // 二元协同双人同日打卡加成 (+15)
  | 'diet_record'        // 记录进食与健康 (+20)
  | 'appraisal_finish'   // 完成理解核对 (+30)
  | 'task_confirmed'     // 完成分工打卡 (+25)
  | 'read_science'       // 研读科普与朗读 (+10)
  | 'seven_day_bonus'    // 连续7天打卡里程碑 (+100)
  | 'reward_bonus'       // 研究员特别科研加分 (+100)
  | 'mall_exchange'      // 商城兑换支出 (负数)
  | 'appraisal_complete' // 二元评价与共情打卡 (+15/+20)
  | 'health_record';     // 进食体感与健康打卡 (+20)

export interface PointsAccount {
  userId: string;
  pointsBalance: number;
  totalEarned: number;
  checkInStreak: number;
  lastCheckInDate: string | null;
  dyadBonusUnlockedToday: boolean;
}

export interface PointsTransaction {
  id: string;
  userId: string;
  type: PointsActionType;
  points: number;
  title: string;
  timestamp: string;
}

export interface MallProduct {
  id: string;
  name: string;
  category: 'eggs' | 'smartwatch' | 'meal_box' | 'ons_powder';
  costPoints: number;
  actualPriceRmb: number;
  stockTotal: number;
  stockRemaining: number;
  unit: string;
  description: string;
  badge: string;
  clinicalMeaning: string;
  eligibility: string; // 兑换资格说明
}

export interface ExchangeOrder {
  id: string;
  userId: string;
  userRole: UserRole;
  researchId: string;
  campus: HospitalCampus;
  productId: string;
  productName: string;
  costPoints: number;
  status: 'pending' | 'dispensed';
  deliveryMethod: 'clinic_pickup' | 'express';
  createdAt: string;
  dispensedAt?: string;
}

export interface IncentiveBudgetPlan {
  totalBudgetRmb: number; // 3000 元
  targetDyadPairs: number; // 30 对
  items: {
    name: string;
    targetCount: number;
    unitCostRmb: number;
    totalCostRmb: number;
    pointsNeeded: number;
    allocationLogic: string;
  }[];
  contingencyFundRmb: number;
}
