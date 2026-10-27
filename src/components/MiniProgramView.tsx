/**
 * 微信小程序前端交互模拟器 (WeChat Mini-Program Simulator)
 * 依据《基于TDIM的胃癌术后患者及照顾者营养管理平台的开发与可用性评价》开题报告构建
 * 核心功能模块：
 * 1. 🏠 今日康复：阶段横幅、6~8餐定时提醒、智能康复指导、二元协同状态卡、快捷金刚区
 * 2. 📖 科普讲堂：权威专栏（图解改建/并发症/微量元素）、食物红绿灯速查库、常见误区辟谣、一周示范食谱
 * 3. 🤖 智能问答：AI 专科责任护士顾问（Gemini 3.8 / 循证知识库双引擎）、长者语音播报、分类高频热问
 * 4. 🤝 二元管理：二元评价（独立答题比对与误区辨析）+ 二元管理行为（任务清晰拆解、双向确认与执行困难填报）
 * 5. 📋 健康监测：3合1日常极简记录、红旗危急征象分诊、SUS与ZBI-12量表、配对与分项权限中心
 */

import React, { useState, useEffect } from 'react';
import {
  Utensils,
  HelpCircle,
  CheckSquare,
  ClipboardList,
  UserCheck,
  Shield,
  AlertTriangle,
  Volume2,
  Mic,
  MicOff,
  CheckCircle2,
  Send,
  UserMinus,
  Sparkles,
  Columns,
  Smartphone,
  ChevronRight,
  BookOpen,
  Bot,
  Play,
  Square,
  Award,
  BookMarked,
  Clock,
  ArrowLeft,
  Search,
  PhoneCall,
  MessageSquare,
  Calendar,
  AlertCircle,
  RotateCcw,
  Gift,
  Coins,
  Flame,
  Trophy,
  ShoppingBag,
  Truck,
  Check,
  Copy,
  Heart,
  Smile,
  Scale,
  Plus
} from 'lucide-react';
import { tdimStore } from '../services/store';
import { tdimApi } from '../services/api';
import {
  scienceArticles,
  foodTrafficLights,
  scienceMyths,
  weeklyDietPlans,
  FoodTrafficLight,
  ScienceMyth
} from '../services/scienceData';
import {
  UserRole,
  RecoveryStage,
  GuidanceItem,
  AppraisalQuestion,
  DyadicTask,
  HealthRecord,
  IntakeLevel,
  ScienceArticle,
  AiChatMessage,
  PointsAccount,
  MallProduct,
  PointsTransaction,
  ExchangeOrder,
  NutritionIssueJudgment,
  PatientEatingExperience,
  CaregiverExecutionBurden
} from '../types/tdim';
import {
  mcpMedicalService,
  McpMedicalKnowledgeRecord,
  MCP_MEDICAL_DATABASE
} from '../services/mcpMedicalService';

export const MiniProgramView: React.FC = () => {
  // 视图模式: 'single' (单手机) 或 'dual' (患者与照顾者双端并排联动演示)
  const [viewMode, setViewMode] = useState<'single' | 'dual'>('single');
  const [activeRole, setActiveRole] = useState<UserRole>('patient');
  const [seniorMode, setSeniorMode] = useState<boolean>(true);

  // 主底部导航：5大核心高内聚板块 (微信小程序标准 TabBar)
  const [activeTab, setActiveTab] = useState<'home' | 'science' | 'ai_chat' | 'dyad' | 'health'>('home');

  // 科普模块子Tab: 权威专栏 | 食物红绿灯 | 辟谣讲堂 | 一周食谱 | 🔬 MCP医学检索
  const [scienceSubTab, setScienceSubTab] = useState<'articles' | 'traffic_light' | 'myths' | 'recipes' | 'mcp_search'>('traffic_light');
  const [mcpSearchQuery, setMcpSearchQuery] = useState('');
  const [selectedMcpRecord, setSelectedMcpRecord] = useState<McpMedicalKnowledgeRecord | null>(null);

  // 二元管理子Tab: 二元评价(Dyadic Appraisal) | 任务分工(二元行为)
  const [dyadSubTab, setDyadSubTab] = useState<'appraisal' | 'tasks'>('appraisal');

  // 二元评价四大维度: 1.营养问题判断 | 2.患者进食感受 | 3.照顾者执行困难 | 4.知识核对(教育功能)
  const [appraisalDimension, setAppraisalDimension] = useState<
    'nutrition_issues' | 'eating_experience' | 'caregiver_burdens' | 'knowledge_check'
  >('nutrition_issues');

  // 1. 双方对同一营养问题判断
  const [nutritionIssues, setNutritionIssues] = useState<NutritionIssueJudgment[]>([]);
  const [selectedIssueChoices, setSelectedIssueChoices] = useState<Record<string, string>>({});
  const [issueNotes, setIssueNotes] = useState<Record<string, string>>({});

  // 2. 患者进食感受自评与照顾者共情
  const [eatingExperiences, setEatingExperiences] = useState<PatientEatingExperience[]>([]);
  const [isAddingExperienceModal, setIsAddingExperienceModal] = useState(false);
  const [newExpMealType, setNewExpMealType] = useState<PatientEatingExperience['mealType']>('lunch');
  const [newExpMealTypeName, setNewExpMealTypeName] = useState('午餐正餐 (第3餐)');
  const [newExpComfort, setNewExpComfort] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [newExpEarlySatiety, setNewExpEarlySatiety] = useState<number>(1);
  const [newExpBloating, setNewExpBloating] = useState<number>(1);
  const [newExpDumping, setNewExpDumping] = useState<number>(0);
  const [newExpFatigue, setNewExpFatigue] = useState<number>(0);
  const [newExpFear, setNewExpFear] = useState<number>(0);
  const [newExpTasteChange, setNewExpTasteChange] = useState<boolean>(false);
  const [newExpAcidReflux, setNewExpAcidReflux] = useState<boolean>(false);
  const [newExpNote, setNewExpNote] = useState<string>('');

  // 照顾者共情回帖弹窗/状态
  const [replyingExpId, setReplyingExpId] = useState<string | null>(null);
  const [empathyMessageInput, setEmpathyMessageInput] = useState<string>('');
  const [careAdjustmentInput, setCareAdjustmentInput] = useState<string>('');

  // 3. 照顾者执行困难与减负锦囊
  const [caregiverBurdens, setCaregiverBurdens] = useState<CaregiverExecutionBurden[]>([]);
  const [isAddingBurdenModal, setIsAddingBurdenModal] = useState(false);
  const [newBurdenStress, setNewBurdenStress] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [selectedDifficultyTags, setSelectedDifficultyTags] = useState<string[]>([
    '每日6~8餐备餐耗竭',
    '劝饭拒食矛盾'
  ]);
  const [newCaregiverVoice, setNewCaregiverVoice] = useState<string>('');

  // 患者感恩回音弹窗/状态
  const [replyingBurdenId, setReplyingBurdenId] = useState<string | null>(null);
  const [gratitudeMessageInput, setGratitudeMessageInput] = useState<string>('');

  // 健康监测子Tab: 日常打卡 | 量表测评 | 配对权限 | 联系医护
  const [healthSubTab, setHealthSubTab] = useState<'records' | 'scales' | 'permissions' | 'contact'>('records');

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const reloadData = () => setRefreshTrigger(prev => prev + 1);

  const patient = tdimStore.users.get('USR_PATIENT_01')!;
  const caregiver = tdimStore.users.get('USR_CAREGIVER_01')!;
  const currentUser = activeRole === 'patient' ? patient : caregiver;
  const currentStage = tdimStore.computeStage(patient.dischargeDate);
  const pair = patient.dyadPairId ? tdimStore.dyadPairs.get(patient.dyadPairId) : null;
  const isPaired = pair && pair.status === 'active';

  // 指导数据
  const [guidanceData, setGuidanceData] = useState<{
    items: GuidanceItem[];
    missingWarning: string | null;
    rulePath: string;
  }>({ items: [], missingWarning: null, rulePath: '' });

  // 语音播报状态 (TTS)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudioText, setCurrentAudioText] = useState<string>('');

  // 语音输入状态
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // 核对题目数据
  const [questions, setQuestions] = useState<AppraisalQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isProxyFlags, setIsProxyFlags] = useState<Record<string, boolean>>({});

  // 任务数据
  const [tasks, setTasks] = useState<DyadicTask[]>([]);

  // 记录数据
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [permission, setPermission] = useState(tdimStore.permissions.get(patient.id));

  // 记录表单状态
  const [dietLevel, setDietLevel] = useState<IntakeLevel>(3);
  const [dietFood, setDietFood] = useState('细烂稠米粥 + 蒸嫩蛋羹 (半碗)');
  const [weightValue, setWeightValue] = useState<number>(56.5);
  const [symptomScores, setSymptomScores] = useState({
    earlySatiety: 1,
    nauseaVomiting: 0,
    abdominalDistension: 1,
    dumpingSyndrome: 0,
    reflux: 0,
    diarrhea: 0,
    hasRedFlag: false
  });
  const [isProxyRecord, setIsProxyRecord] = useState(activeRole === 'caregiver');

  // 配对操作
  const [inputCode, setInputCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'warn' | 'error'; msg: string } | null>(null);

  // 附录量表
  const [susAnswers, setSusAnswers] = useState<number[]>([4, 2, 4, 1, 4, 1, 4, 1, 4, 1]);
  const [susResultScore, setSusResultScore] = useState<number | null>(null);
  const [zbiAnswers, setZbiAnswers] = useState<number[]>([1, 2, 0, 1, 0, 1, 1, 2, 1, 2, 2, 1]);
  const [zbiResultScore, setZbiResultScore] = useState<number | null>(null);

  // 科普模块状态
  const [readingArticle, setReadingArticle] = useState<ScienceArticle | null>(null);
  const [foodSearchKeyword, setFoodSearchKeyword] = useState('');
  const [selectedFoodCategory, setSelectedFoodCategory] = useState<'all' | 'protein' | 'staple' | 'fruit_veg' | 'drink_snack'>('all');
  const [selectedFoodLevel, setSelectedFoodLevel] = useState<'all' | 'green' | 'yellow' | 'red'>('all');

  // 智能问答模块状态
  const [aiChatHistory, setAiChatHistory] = useState<AiChatMessage[]>([
    {
      id: 'AI_INIT',
      sender: 'assistant',
      content: '您好！我是您的“胃爱守护”专属营养护理顾问。南昌大学一附院胃肠外科团队与您一路同行，暖心陪伴您的每一步康复。\n\n关于术后少食多餐、进餐后不适应对、高蛋白营养备餐以及红绿灯健康饮食指导，我和团队随时为您守护解答。',
      timestamp: '刚刚'
    }
  ]);
  const [userQuery, setUserQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // 医护留言
  const [nurseMessageText, setNurseMessageText] = useState('');

  // 积分打卡与商城状态
  const [pointsAcc, setPointsAcc] = useState<PointsAccount | null>(null);
  const [mallProducts, setMallProducts] = useState<MallProduct[]>([]);
  const [pointsTxList, setPointsTxList] = useState<PointsTransaction[]>([]);
  const [showMallView, setShowMallView] = useState(false);
  const [mallTab, setMallTab] = useState<'products' | 'budget_rules' | 'history'>('products');
  const [deliveryChoice] = useState<'express'>('express');
  const [selectedProductToRedeem, setSelectedProductToRedeem] = useState<MallProduct | null>(null);
  const [redeemSuccessInfo, setRedeemSuccessInfo] = useState<{
    productName: string;
    costPoints: number;
  } | null>(null);
  const [copiedWeChat, setCopiedWeChat] = useState(false);

  // 阶段显示字典 (暖心人文关怀版本)
  const stageMap: Record<RecoveryStage, { title: string; sub: string; badge: string }> = {
    discharge_prep: { title: '🌸 出院暖心准备期', sub: '医护宣教 · 居家安心过渡准备', badge: 'bg-amber-100 text-amber-900 border-amber-300' },
    week_1: { title: '🌱 居家调养第1周', sub: '出院第1~7天 · 温润流质与少食多餐', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    week_2_4: { title: '🌿 居家调养第2~4周', sub: '出院第8~28天 · 软食细嚼与优质高蛋白', badge: 'bg-blue-100 text-blue-900 border-blue-300' },
    post_1_month: { title: '🌾 长期康复陪伴期', sub: '常态膳食调养 · 医护长期守候', badge: 'bg-purple-100 text-purple-900 border-purple-300' }
  };

  useEffect(() => {
    tdimApi.getGuidanceItems(patient.id).then(res => {
      setGuidanceData({
        items: res.items,
        missingWarning: res.missingWarning,
        rulePath: res.rulePath
      });
      if (res.items.length > 0) {
        setCurrentAudioText(res.items[0].audioText || res.items[0].content);
      }
    });

    tdimApi.getQuestions(currentStage).then(setQuestions);
    tdimApi.getNutritionIssues(currentStage).then(setNutritionIssues);

    if (patient.dyadPairId) {
      tdimApi.getTasks(patient.dyadPairId, currentStage).then(setTasks);
      tdimApi.getHealthRecords(patient.dyadPairId, activeRole, patient.id).then(setHealthRecords);
      tdimApi.getEatingExperiences(patient.dyadPairId).then(setEatingExperiences);
      tdimApi.getCaregiverBurdens(patient.dyadPairId).then(setCaregiverBurdens);
    }

    setPermission(tdimStore.permissions.get(patient.id));
    setIsProxyRecord(activeRole === 'caregiver');

    // 加载积分与商城数据
    tdimApi.getPointsAccount(currentUser.id).then(setPointsAcc);
    tdimApi.getMallProducts().then(setMallProducts);
    tdimApi.getPointsTransactions(currentUser.id).then(setPointsTxList);
  }, [activeRole, refreshTrigger, currentStage, patient.dyadPairId, patient.surgeryType, patient.dietTolerance, currentUser.id]);

  // 今日签到打卡处理
  const handleDoCheckIn = async () => {
    const res = await tdimApi.checkInToday(currentUser.id);
    if (res.success) {
      setActionNotice({ type: 'success', msg: res.message });
      reloadData();
    } else {
      setActionNotice({ type: 'warn', msg: res.message });
    }
  };

  // 提交商品兑换申请
  const handleConfirmRedeem = async (prod: MallProduct) => {
    const res = await tdimApi.redeemMallProduct(currentUser.id, prod.id, 'express');
    if (res.success) {
      setSelectedProductToRedeem(null);
      setRedeemSuccessInfo({
        productName: prod.name,
        costPoints: prod.costPoints
      });
      setActionNotice({ type: 'success', msg: res.message });
      reloadData();
    } else {
      setActionNotice({ type: 'error', msg: res.message });
    }
  };

  // 语音朗读控制 (TTS)
  const handleToggleAudio = (textToRead?: string) => {
    const text = textToRead || currentAudioText;
    if (!text) return;

    if (isPlayingAudio) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'zh-CN';
        utter.rate = 0.85;
        utter.onend = () => setIsPlayingAudio(false);
        utter.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utter);
      } else {
        setTimeout(() => setIsPlayingAudio(false), 5000);
      }
    }
  };

  // 语音输入模拟
  const handleSimulateVoiceInput = () => {
    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      const simulatedText = '中午吃了细烂稠米粥半小碗，加了蒸嫩蛋羹和肉末豆腐，目前没有恶心反酸。';
      setVoiceTranscript(simulatedText);
      setDietFood(simulatedText);
      setActionNotice({ type: 'success', msg: '语音识别成功，已自动填入记录！' });
    } else {
      setIsRecordingVoice(true);
      setActionNotice({ type: 'warn', msg: '正在录音... 请直接说出食物与身体感受' });
      setTimeout(() => {
        setIsRecordingVoice(false);
        const simulatedText = '中午吃了细烂稠米粥半小碗，加了蒸嫩蛋羹和肉末豆腐，目前没有恶心反酸。';
        setVoiceTranscript(simulatedText);
        setDietFood(simulatedText);
        setActionNotice({ type: 'success', msg: '语音转换完成！' });
      }, 2200);
    }
  };

  // 发送智能问答
  const handleSendAiQuery = async (queryText?: string) => {
    const q = queryText || userQuery;
    if (!q.trim()) return;

    const userMsg: AiChatMessage = {
      id: 'MSG_' + Date.now(),
      sender: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiChatHistory(prev => [...prev, userMsg]);
    setUserQuery('');
    setIsAiLoading(true);

    try {
      const answer = await tdimApi.askAiAssistant(
        q,
        activeRole,
        stageMap[currentStage].title,
        patient.surgeryType === 'total_gastrectomy' ? '全胃切除术' : '部分胃切除术'
      );
      const botMsg: AiChatMessage = {
        id: 'AI_' + Date.now(),
        sender: 'assistant',
        content: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAiChatHistory(prev => [...prev, botMsg]);
    } catch (e) {
      const errMsg: AiChatMessage = {
        id: 'AI_ERR_' + Date.now(),
        sender: 'assistant',
        content: '抱歉，当前网络稍有延迟。胃部调养康复期请牢记：少食多餐（每日6~8次）、干稀分食、细嚼慢咽。如有突发剧烈腹痛或高热，请立刻就医。',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAiChatHistory(prev => [...prev, errMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // 渲染单个手机屏幕界面
  const renderPhoneScreen = (role: UserRole) => {
    const isPatient = role === 'patient';
    const userObj = isPatient ? patient : caregiver;
    const partnerName = isPatient ? caregiver.nickname : patient.nickname;

    // 筛选食物红绿灯列表
    const filteredFoods = foodTrafficLights.filter(food => {
      const matchKey = foodSearchKeyword
        ? food.name.toLowerCase().includes(foodSearchKeyword.toLowerCase()) ||
          food.tags.some(t => t.toLowerCase().includes(foodSearchKeyword.toLowerCase())) ||
          food.reason.toLowerCase().includes(foodSearchKeyword.toLowerCase())
        : true;
      const matchCat = selectedFoodCategory === 'all' || food.category === selectedFoodCategory;
      const matchLevel = selectedFoodLevel === 'all' || food.level === selectedFoodLevel;
      return matchKey && matchCat && matchLevel;
    });

    return (
      <div className={`w-full max-w-md bg-white border border-slate-300 rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col ${
        seniorMode ? 'text-slate-900 text-base' : 'text-slate-800 text-sm'
      }`}>
        {/* 顶部状态栏与医院标题区 */}
        <div className="bg-emerald-900 text-white pt-4 px-5 pb-3">
          <div className="flex justify-between items-center text-xs opacity-90 mb-1.5">
            <span className="font-medium">09:41</span>
            <span className="font-mono text-[11px] bg-emerald-800/90 px-2.5 py-0.5 rounded-full border border-emerald-700">
              {userObj.campus === 'donghu' ? '🏥 南昌大学一附院·东湖院区' : '🏥 南昌大学一附院·象湖院区'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${isPatient ? 'bg-emerald-400' : 'bg-blue-400'}`}></span>
                <h1 className="font-bold text-lg leading-tight">
                  {isPatient ? '🌸 胃爱守护·暖心康复站' : '🤝 胃爱同行·照顾者支持站'}
                </h1>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                {userObj.nickname} · 编号: <span className="font-mono font-bold text-white">{userObj.researchId}</span>
              </p>
            </div>
            <div className="text-right">
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                isPaired ? 'bg-emerald-800 text-emerald-200' : 'bg-amber-700 text-amber-100'
              }`}>
                {isPaired ? `已二元绑定: ${partnerName}` : '未完成配对'}
              </span>
            </div>
          </div>
        </div>

        {/* 康复阶段直观横幅 */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${stageMap[currentStage].badge}`}>
              {stageMap[currentStage].title}
            </span>
            <span className="text-xs text-slate-600 hidden sm:inline">
              {stageMap[currentStage].sub}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            实际出院: {patient.dischargeDate || '未核实录入'}
          </span>
        </div>

        {/* 操作消息提醒 */}
        {actionNotice && (
          <div className={`mx-4 mt-2 p-2.5 rounded-xl text-xs flex items-center justify-between gap-2 animate-in fade-in ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : actionNotice.type === 'warn'
              ? 'bg-amber-50 text-amber-900 border border-amber-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}>
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionNotice.msg}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-slate-600">×</button>
          </div>
        )}

        {/* 主体滚动区 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[580px] min-h-[460px]">

          {/* ===================== 积分商城全屏视图 (3000元课题激励) ===================== */}
          {showMallView ? (
            <div className="space-y-4">
              {/* 商城顶部导航与积分看板 */}
              <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-700 text-white rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowMallView(false)}
                    className="flex items-center gap-1 text-xs font-bold bg-black/20 hover:bg-black/30 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>返回今日康复</span>
                  </button>
                  <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-medium">
                    南昌一附院课题专项激励
                  </span>
                </div>

                <div className="flex justify-between items-end pt-1">
                  <div>
                    <span className="text-xs text-amber-100 block">我的可用积分</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-3xl font-mono font-bold">{pointsAcc?.pointsBalance || 0}</span>
                      <span className="text-xs text-amber-200">积分</span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-amber-100">
                    <div>累计获得: <span className="font-mono font-bold text-white">{pointsAcc?.totalEarned || 0}</span> 分</div>
                    <div>已连续打卡: <span className="font-mono font-bold text-white">{pointsAcc?.checkInStreak || 0}</span> 天</div>
                  </div>
                </div>

                {/* 签到打卡快捷动作条 */}
                <div className="bg-black/20 rounded-xl p-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>
                      {pointsAcc?.lastCheckInDate === new Date().toISOString().split('T')[0]
                        ? '今日打卡已完成，明天继续加油！'
                        : '今日未打卡，点击立即领积分！'}
                    </span>
                  </div>
                  <button
                    onClick={handleDoCheckIn}
                    disabled={pointsAcc?.lastCheckInDate === new Date().toISOString().split('T')[0]}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      pointsAcc?.lastCheckInDate === new Date().toISOString().split('T')[0]
                        ? 'bg-white/20 text-white cursor-default'
                        : 'bg-white text-emerald-900 hover:bg-amber-100 active:scale-95 shadow-2xs'
                    }`}
                  >
                    {pointsAcc?.lastCheckInDate === new Date().toISOString().split('T')[0] ? '✓ 今日已打卡' : '🔥 连签双倍打卡'}
                  </button>
                </div>
              </div>

              {/* 商城三大子专栏切换 */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl text-xs">
                {[
                  { id: 'products', label: '🛍️ 礼品兑换' },
                  { id: 'budget_rules', label: '📜 3000元预算与连签规则' },
                  { id: 'history', label: '🧾 积分收支明细' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setMallTab(tab.id as any)}
                    className={`py-2 rounded-xl font-bold transition-all text-center ${
                      mallTab === tab.id ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* 1. 商品列表 */}
              {mallTab === 'products' && (
                <div className="space-y-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-950">
                    <span className="font-bold block flex items-center gap-1.5 text-emerald-900">
                      <span>📦 礼品兑换与免费寄送说明</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">课题全额包邮</span>
                    </span>
                    <p className="mt-1 text-slate-700 leading-relaxed text-[11px]">
                      礼品专为胃部调养与二元健康管理精选。保持连续打卡享双倍积分（连续10天左右可获鸡蛋，20天左右获保鲜盒，35天左右获智能手环）。<strong className="text-emerald-900">礼品唯一领取方式为【免费快递寄送到家】</strong>，兑换成功后请添加研究团队微信：<span className="font-mono font-bold text-emerald-900 bg-white px-1.5 py-0.5 rounded border border-emerald-300">qwer131606</span>，由科研团队负责邮资，寄送至档案预留家庭地址。
                    </p>
                  </div>

                  {mallProducts.map(prod => {
                    const canAfford = (pointsAcc?.pointsBalance || 0) >= prod.costPoints;
                    return (
                      <div
                        key={prod.id}
                        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2.5 hover:border-emerald-300 transition-all"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 inline-block mb-1">
                              {prod.badge}
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm leading-snug">
                              {prod.name}
                            </h4>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-base font-mono font-bold text-amber-700">{prod.costPoints}</span>
                            <span className="text-xs text-slate-500 ml-0.5">积分</span>
                            <span className="block text-[10px] text-slate-400">价值约 ¥{prod.actualPriceRmb}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {prod.description}
                        </p>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] space-y-1">
                          <div className="text-emerald-900 font-semibold flex items-center gap-1">
                            <span>🩺 临床营养意义:</span>
                            <span className="font-normal text-slate-700">{prod.clinicalMeaning}</span>
                          </div>
                          <div className="text-slate-600 flex items-center justify-between pt-1 border-t border-slate-200">
                            <span>门槛: {prod.eligibility}</span>
                            <span className="text-amber-800 font-bold">余量: {prod.stockRemaining} / {prod.stockTotal}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedProductToRedeem(prod)}
                          disabled={!canAfford || prod.stockRemaining <= 0}
                          className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                            prod.stockRemaining <= 0
                              ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                              : canAfford
                              ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>
                            {prod.stockRemaining <= 0
                              ? '已兑罄'
                              : canAfford
                              ? '立即兑换'
                              : `还差 ${prod.costPoints - (pointsAcc?.pointsBalance || 0)} 积分`}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 2. 3000元预算规划说明 */}
              {mallTab === 'budget_rules' && (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-950 space-y-1.5">
                    <span className="font-bold text-sm block">📊 3000元课题激励预算与连续打卡双倍机制</span>
                    <p className="text-slate-700 leading-relaxed">
                      本课题总预算 3000 元，计划纳入 30 对（共 60 位）术后康复期患者与主要照顾者家庭。为了全面激发受试者长期依从性，特设【连续打卡双倍积分】机制：连续打卡未中断享受双倍积分，若漏签中断则双倍特权失效重置。
                    </p>
                  </div>

                  {/* 预算分配四重奏卡片 */}
                  <div className="space-y-2 text-xs">
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-emerald-950 text-sm">🥈 一阶·全员高蛋白保底礼 (鲜鸡蛋礼盒)</span>
                        <span className="font-mono font-bold text-emerald-800">预算: 900 元</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        • 规格与数量：30 盒（每对家庭足额 1 盒，30元/盒·30枚装）。<br />
                        • 达成周期：连续打卡 10 天左右（连续打卡双倍积分达 1000 积分）即可兑换。<br />
                        • 关怀初衷：鸡蛋富含极易消化吸收的优质蛋白质，是术后伤口及黏膜修复最必需的核心食材，确保 30 对家庭人人暖心保底可得！
                      </p>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-blue-950 text-sm">🥉 二阶·辅食分餐进阶礼 (刻度密封盒四件套)</span>
                        <span className="font-mono font-bold text-blue-800">预算: 600 元</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        • 规格与数量：30 套（20元/套）。<br />
                        • 达成周期：连续打卡 20 天左右（连续打卡双倍积分达 2000 积分）即可兑换。<br />
                        • 关怀初衷：清晰刻度辅助严格践行“一日6~8餐、干稀分食、每餐5~7分饱”，预防早期胃膨胀不适。
                      </p>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-purple-950 text-sm">🥇 三阶·健康监测大奖 (智能手环/手表)</span>
                        <span className="font-mono font-bold text-purple-800">预算: 1200 元</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        • 规格与数量：限量 12 台（约100元/台）。<br />
                        • 达成周期：连续打卡 35 天左右保持连签双倍积满 2800 积分的前12对家庭（先到先得）。<br />
                        • 关怀初衷：手环兼顾心率、睡眠与步数，若中断打卡双倍积分将失效重置，极大激发全周期依从性，预算3000元严控不超支！
                      </p>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 text-sm">📦 四阶·运营包装与快递备用金</span>
                        <span className="font-mono font-bold text-slate-800">预算: 300 元</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        • 用途：用于偏远受试者快递寄送运费、保鲜保温箱及荣誉达标证书制作。
                      </p>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-emerald-950 text-center font-bold">
                      💰 900 (鸡蛋) + 600 (分餐盒) + 1200 (手环) + 300 (备用金) = 3000 元整
                    </div>
                  </div>
                </div>
              )}

              {/* 3. 积分收支流水明细 */}
              {mallTab === 'history' && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700">近期积分变动记录:</span>
                  {pointsTxList.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs bg-white rounded-xl border">
                      暂无积分明细，每日打卡或记录饮食即可领取！
                    </div>
                  ) : (
                    pointsTxList.map(tx => (
                      <div key={tx.id} className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-slate-800 block">{tx.title}</span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(tx.timestamp).toLocaleString([], { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span className={`font-mono font-bold text-sm ${
                          tx.points > 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}>
                          {tx.points > 0 ? `+${tx.points}` : tx.points}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            // 正常功能 Tab 页面渲染
            <>
          {/* ===================== TAB 1: 首页 / 今日康复 ===================== */}
          {activeTab === 'home' && (
            <div className="space-y-4">
              {/* 每日签到打卡领积分横幅卡片 (支持二元协同双人加成) */}
              <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-700 text-white p-3.5 rounded-2xl shadow-xs space-y-2.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-5 h-5 text-amber-200 fill-amber-200" />
                    <span className="font-bold text-sm tracking-wide">每日签到领积分</span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">
                      🔥 已连签 {pointsAcc?.checkInStreak || 0} 天 · 双倍生效中
                    </span>
                  </div>
                  <button
                    onClick={() => setShowMallView(true)}
                    className="text-xs bg-white text-amber-950 font-bold px-2.5 py-1 rounded-xl shadow-xs hover:bg-amber-50 flex items-center gap-1 transition-colors"
                  >
                    <Gift className="w-3.5 h-3.5 text-amber-700" />
                    <span>积分商城</span>
                    <ChevronRight className="w-3 h-3 text-amber-700" />
                  </button>
                </div>

                <div className="flex justify-between items-center pt-0.5">
                  <div>
                    <span className="text-[11px] text-amber-100 block">可用积分余额</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-2xl font-mono font-bold leading-none">{pointsAcc?.pointsBalance || 0}</span>
                      <span className="text-xs text-amber-200 font-medium">积分</span>
                    </div>
                  </div>

                  <button
                    onClick={handleDoCheckIn}
                    disabled={pointsAcc?.lastCheckInDate === new Date().toISOString().split('T')[0]}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                      pointsAcc?.lastCheckInDate === new Date().toISOString().split('T')[0]
                        ? 'bg-emerald-900/60 text-emerald-200 cursor-default'
                        : 'bg-white text-emerald-950 hover:bg-amber-100 active:scale-95 animate-pulse'
                    }`}
                  >
                    {pointsAcc?.lastCheckInDate === new Date().toISOString().split('T')[0] ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>今日已打卡</span>
                      </>
                    ) : (
                      <>
                        <Flame className="w-4 h-4 text-amber-600 fill-amber-600" />
                        <span>🔥 连签双倍打卡</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-[10px] text-amber-100/90 bg-black/20 p-2 rounded-xl space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span>🔥 连续打卡双倍机制（中断则双倍重置）:</span>
                    <span className="text-amber-200">10天领鸡蛋 / 20天领盒 / 35天领手表</span>
                  </div>
                  <div className="flex items-center justify-between opacity-95 text-[10px]">
                    <span>🤝 二元协同：双方今日均打卡额外获得 +15分 协同加成</span>
                    <button
                      onClick={async () => {
                        const res = await tdimApi.simulateStreakBreak(currentUser.id);
                        setActionNotice({ type: 'warn', msg: res.message });
                        tdimApi.getPointsAccount(currentUser.id).then(setPointsAcc);
                      }}
                      className="text-[9px] underline text-amber-200 hover:text-white transition-colors"
                      title="点击可模拟打卡中断，测试双倍失效重置机制"
                    >
                      [模拟断签测试]
                    </button>
                  </div>
                </div>
              </div>

              {/* 四大核心功能金刚区 (适老大按键，一触即达) */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setActiveTab('ai_chat')}
                  className="p-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-2xl flex flex-col items-center justify-center text-center transition-all shadow-2xs group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-xs text-emerald-950">智能问答</span>
                  <span className="text-[10px] text-emerald-700 mt-0.5">AI护士助手</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('science');
                    setScienceSubTab('traffic_light');
                  }}
                  className="p-3 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-2xl flex flex-col items-center justify-center text-center transition-all shadow-2xs group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-xs text-amber-950">食物红绿灯</span>
                  <span className="text-[10px] text-amber-700 mt-0.5">能吃/严禁速查</span>
                </button>

                <button
                  onClick={() => setShowMallView(true)}
                  className="p-3 bg-purple-50 hover:bg-purple-100/80 border border-purple-200 rounded-2xl flex flex-col items-center justify-center text-center transition-all shadow-2xs group"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                    <Gift className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-xs text-purple-950">积分商城</span>
                  <span className="text-[10px] text-purple-700 mt-0.5">领鸡蛋/手环</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('health');
                    setHealthSubTab('contact');
                  }}
                  className="p-3 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-2xl flex flex-col items-center justify-center text-center transition-all shadow-2xs group"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-xs text-rose-950">联系医护</span>
                  <span className="text-[10px] text-rose-700 mt-0.5">急诊与留言</span>
                </button>
              </div>

              {/* 今日 6~8 餐进餐时间规划钟 (胃癌术后黄金原则) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-700" />
                    <h3 className="font-bold text-slate-900 text-sm">今日 6~8 餐少食多餐时间表</h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">每餐5~7分饱</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  {[
                    { slot: '07:30', name: '早餐', done: true },
                    { slot: '10:00', name: '早加餐', done: true },
                    { slot: '12:00', name: '午餐', done: true },
                    { slot: '15:00', name: '午加餐', done: false },
                    { slot: '18:00', name: '晚餐', done: false },
                    { slot: '20:30', name: '睡前加餐', done: false }
                  ].map((meal, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        meal.done
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <span className="text-[10px] block opacity-80">{meal.slot}</span>
                      <span className="text-xs font-bold block mt-0.5">{meal.name}</span>
                      <span className="text-[10px] mt-0.5 block">{meal.done ? '✓ 已打卡' : '待进餐'}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-1 flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    干稀分食：固体进食与饮水间隔 30 分钟
                  </span>
                  <button
                    onClick={() => {
                      setActiveTab('health');
                      setHealthSubTab('records');
                    }}
                    className="text-emerald-700 font-bold hover:underline text-xs"
                  >
                    去记录进食 &gt;
                  </button>
                </div>
              </div>

              {/* 二元协同状态卡 (TDIM 理论核心) */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-700" />
                    今日二元协同进度 (患者 + 照顾者)
                  </span>
                  <span className="text-[11px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                    协同良好
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-emerald-100 space-y-1">
                    <span className="text-slate-500 text-[11px] block">👴 患者自评打卡:</span>
                    <span className="font-bold text-slate-800 text-sm">已记录 3 餐进食</span>
                    <span className="text-[10px] text-emerald-700 block">晨起体重 56.5kg</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-100 space-y-1">
                    <span className="text-slate-500 text-[11px] block">👩 照顾者协同:</span>
                    <span className="font-bold text-slate-800 text-sm">备餐细烂已打卡</span>
                    <span className="text-[10px] text-blue-700 block">协助核对认知题 1 次</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1 text-xs">
                  <span className="text-slate-600">有 1 项任务待双方双向确认生效</span>
                  <button
                    onClick={() => {
                      setActiveTab('dyad');
                      setDyadSubTab('tasks');
                    }}
                    className="px-3 py-1 bg-emerald-700 text-white font-bold rounded-xl text-xs hover:bg-emerald-800 transition-colors shadow-2xs"
                  >
                    查看协商分工 &gt;
                  </button>
                </div>
              </div>

              {/* 今日重点康复营养指导条目 (决策树精准自适应匹配) */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    今日推荐营养指导 (南昌一附院循证方案)
                  </h3>
                  <button
                    onClick={() => handleToggleAudio()}
                    className="flex items-center gap-1 text-xs text-emerald-800 font-bold bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs hover:bg-emerald-50"
                  >
                    {isPlayingAudio ? <Square className="w-3.5 h-3.5 fill-emerald-800 text-emerald-800" /> : <Play className="w-3.5 h-3.5 fill-emerald-800 text-emerald-800" />}
                    <span>{isPlayingAudio ? '停止朗读' : '🔊 听今日指导'}</span>
                  </button>
                </div>

                {guidanceData.missingWarning && (
                  <div className="bg-amber-50 border border-amber-300 text-amber-900 p-2.5 rounded-xl text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">决策树提示：病历信息待完善</span>
                      <p className="mt-0.5">{guidanceData.missingWarning}</p>
                    </div>
                  </div>
                )}

                {guidanceData.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:border-emerald-300 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 font-bold border border-emerald-200">
                        {item.categoryName}
                      </span>
                      <button
                        onClick={() => handleToggleAudio(item.audioText || item.content)}
                        className="flex items-center gap-1 text-xs text-emerald-800 font-bold bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200 hover:bg-emerald-50"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>朗读</span>
                      </button>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== TAB 2: 科普讲堂 (权威专栏 + 食物红绿灯 + 辟谣 + 一周食谱) ===================== */}
          {activeTab === 'science' && (
            <div className="space-y-4">
              {/* 子专栏切换器 (不额外增加独立弹窗或窗口，紧密内聚在科普讲堂内) */}
              <div className="grid grid-cols-5 gap-1 bg-slate-100 p-1 rounded-2xl text-[11px] sm:text-xs">
                {[
                  { id: 'traffic_light', label: '🚦 食物红绿灯' },
                  { id: 'articles', label: '📑 权威专栏' },
                  { id: 'myths', label: '💡 辟谣讲堂' },
                  { id: 'recipes', label: '🍲 一周食谱' },
                  { id: 'mcp_search', label: '🔬 MCP医学检索' }
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setScienceSubTab(sub.id as any);
                      setReadingArticle(null);
                    }}
                    className={`py-2 rounded-xl font-bold transition-all text-center leading-tight ${
                      scienceSubTab === sub.id
                        ? 'bg-white text-emerald-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              {/* 1. 食物红绿灯速查库 */}
              {scienceSubTab === 'traffic_light' && (
                <div className="space-y-3">
                  <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-950 space-y-1">
                    <span className="font-bold text-sm block">🚦 胃爱守护·术后居家饮食红绿灯速查</span>
                    <p className="text-slate-700">根据南昌一附院临床经验编制。吃任何食物前先查一查：绿灯放心吃、黄灯测耐受、红灯坚决不碰！</p>
                  </div>

                  {/* 搜索框 */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={foodSearchKeyword}
                      onChange={(e) => setFoodSearchKeyword(e.target.value)}
                      placeholder="输入食物名称查询（如：柿子、年糕、龙利鱼、牛奶...）"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-emerald-600"
                    />
                  </div>

                  {/* 分类与红黄绿筛选器 */}
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {[
                      { id: 'all', label: '全部食物' },
                      { id: 'protein', label: '肉蛋水产' },
                      { id: 'staple', label: '主食谷薯' },
                      { id: 'fruit_veg', label: '蔬菜水果' },
                      { id: 'drink_snack', label: '饮品加餐' }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedFoodCategory(cat.id as any)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                          selectedFoodCategory === cat.id ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-1.5 text-xs">
                    {[
                      { id: 'all', label: '全部等级' },
                      { id: 'green', label: '🟢 推荐吃' },
                      { id: 'yellow', label: '🟡 谨慎吃' },
                      { id: 'red', label: '🔴 严禁吃' }
                    ].map(lvl => (
                      <button
                        key={lvl.id}
                        onClick={() => setSelectedFoodLevel(lvl.id as any)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                          selectedFoodLevel === lvl.id
                            ? 'bg-emerald-700 text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-700'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>

                  {/* 食物卡片列表 */}
                  <div className="space-y-2.5 pt-1">
                    {filteredFoods.map(food => (
                      <div
                        key={food.id}
                        className={`p-3.5 rounded-2xl border transition-all space-y-1.5 ${
                          food.level === 'green'
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : food.level === 'yellow'
                            ? 'bg-amber-50/60 border-amber-200'
                            : 'bg-rose-50/70 border-rose-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900 text-sm sm:text-base">
                            {food.name}
                          </span>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                            food.level === 'green'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : food.level === 'yellow'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-rose-100 text-rose-900 border-rose-300'
                          }`}>
                            {food.levelLabel}
                          </span>
                        </div>

                        <div className="text-xs text-slate-700 leading-relaxed">
                          <span className="font-semibold text-slate-800">备餐与进食指导：</span>
                          {food.advice}
                        </div>

                        <div className="text-xs text-slate-600 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-slate-100">
                          <span className="font-semibold text-slate-700">医学原理依据：</span>
                          {food.reason}
                        </div>

                        {food.evidenceSource && (
                          <div className="flex items-center justify-between text-[10px] text-emerald-900 bg-emerald-100/70 px-2.5 py-1 rounded-lg border border-emerald-200">
                            <span className="flex items-center gap-1 font-semibold truncate">
                              <span>🔬 循证数据源:</span>
                              <span className="font-bold">{food.evidenceSource.database}</span>
                              <span className="text-slate-400">·</span>
                              <span className="text-slate-700 truncate max-w-[190px]">{food.evidenceSource.citation}</span>
                            </span>
                            <span className="shrink-0 font-mono text-[9px] font-bold bg-white px-1.5 rounded text-emerald-800 border border-emerald-300">
                              {food.evidenceSource.evidenceLevel}
                            </span>
                          </div>
                        )}

                        <div className="flex gap-1 pt-1">
                          {food.tags.map(t => (
                            <span key={t} className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-600">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. 权威科普专栏 */}
              {scienceSubTab === 'articles' && (
                <div className="space-y-3">
                  {readingArticle ? (
                    // 文章阅读模式
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setReadingArticle(null)}
                          className="flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>返回专栏目录</span>
                        </button>
                        <button
                          onClick={() => handleToggleAudio(readingArticle.title + '。' + readingArticle.content.join(' '))}
                          className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>朗读全文</span>
                        </button>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          {readingArticle.categoryName}
                        </span>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1.5 leading-snug">
                          {readingArticle.title}
                        </h2>
                        <span className="text-[11px] text-slate-400 block mt-1">
                          阅读用时约 {readingArticle.readTimeMin} 分钟 · 临床护理审定
                        </span>
                      </div>

                      {/* 核心要点速览 (中老年友好) */}
                      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1">
                        <span className="font-bold block">💡 护士划重点:</span>
                        {readingArticle.keyTips.map((tip, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-xs leading-relaxed">
                            <span className="text-amber-700 font-bold">•</span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>

                      {/* 正文内容 */}
                      <div className="space-y-2.5 text-xs sm:text-sm text-slate-800 leading-relaxed pt-1">
                        {readingArticle.content.map((para, idx) => (
                          <p key={idx} className="whitespace-pre-wrap">{para}</p>
                        ))}
                      </div>

                      {/* 权威循证医学数据源溯源卡片 (基于 ModelScope 医学查询MCP 与国内外权威指南) */}
                      {readingArticle.evidenceSource && (
                        <div className="bg-gradient-to-br from-emerald-50 via-teal-50/60 to-slate-50 border border-emerald-300 rounded-2xl p-4 text-xs space-y-2.5 mt-3 shadow-2xs">
                          <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                            <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs sm:text-sm">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                              <span>🔬 循证出处 · 5大权威医学数据源溯源</span>
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                              {readingArticle.evidenceSource.evidenceLevel}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-[11px] text-slate-700 pt-0.5">
                            <div className="flex items-start gap-1">
                              <span className="text-slate-400 shrink-0">权威数据源:</span>
                              <span className="font-bold text-emerald-900">{readingArticle.evidenceSource.database}</span>
                            </div>
                            <div className="flex items-start gap-1">
                              <span className="text-slate-400 shrink-0">医学出处全称:</span>
                              <span className="font-medium text-slate-900 leading-relaxed">{readingArticle.evidenceSource.citation}</span>
                            </div>
                            {readingArticle.evidenceSource.meshId && (
                              <div className="flex items-center gap-1">
                                <span className="text-slate-400 shrink-0">NLM MeSH主题词:</span>
                                <span className="font-mono font-bold text-indigo-900 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200 text-[10px]">
                                  {readingArticle.evidenceSource.meshId}
                                </span>
                              </div>
                            )}
                            {readingArticle.evidenceSource.icd10 && (
                              <div className="flex items-center gap-1">
                                <span className="text-slate-400 shrink-0">梅斯医学编码:</span>
                                <span className="font-mono font-bold text-purple-900 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200 text-[10px]">
                                  {readingArticle.evidenceSource.icd10}
                                </span>
                              </div>
                            )}
                            {readingArticle.evidenceSource.standardTerm && (
                              <div className="flex items-start gap-1">
                                <span className="text-slate-400 shrink-0">全国科技名词审定委员会《术语在线》规范名:</span>
                                <span className="font-semibold text-slate-900">{readingArticle.evidenceSource.standardTerm}</span>
                              </div>
                            )}
                            {readingArticle.evidenceSource.drugOrFsmpApproval && (
                              <div className="flex items-start gap-1">
                                <span className="text-slate-400 shrink-0">国家药监局(NMPA)说明书/标准:</span>
                                <span className="font-mono text-slate-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 text-[10px]">
                                  {readingArticle.evidenceSource.drugOrFsmpApproval}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // 专栏列表模式
                    <div className="space-y-2.5">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-950">
                        <span className="font-bold text-sm block">胃部术后居家营养权威科普专栏（暖心陪护）</span>
                        <p className="mt-0.5 text-slate-700">精选消化道改建图解、倾倒自救、全胃B12防贫血、防反流体位与红旗警示。</p>
                      </div>

                      {scienceArticles.map((art) => (
                        <div
                          key={art.id}
                          onClick={() => setReadingArticle(art)}
                          className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs hover:border-emerald-400 cursor-pointer transition-all space-y-1.5"
                        >
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                              {art.categoryName}
                            </span>
                            <span className="text-slate-400 text-[11px]">{art.readTimeMin} 分钟读完</span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm leading-snug">
                            {art.title}
                          </h4>
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {art.summary}
                          </p>

                          {art.evidenceSource && (
                            <div className="flex items-center justify-between text-[10px] text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                              <span className="truncate">🔬 循证: {art.evidenceSource.database} · {art.evidenceSource.citation}</span>
                              <span className="font-mono font-bold shrink-0 ml-1 text-emerald-800">{art.evidenceSource.evidenceLevel}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                            <div className="flex gap-1">
                              {art.tags.map(t => (
                                <span key={t} className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">#{t}</span>
                              ))}
                            </div>
                            <span className="text-emerald-700 font-bold flex items-center">
                              阅读全文 <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3. 辟谣讲堂 (四大常见长者民间误区) */}
              {scienceSubTab === 'myths' && (
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-xs text-blue-950">
                    <span className="font-bold text-sm block">💡 常见康复营养民间误区辟谣</span>
                    <p className="mt-0.5 text-slate-700">破解浓肉汤、发物、餐后喝大碗水、盲目少食等民间谣言，树立循证科学认知。</p>
                  </div>

                  {scienceMyths.map(myth => (
                    <div key={myth.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-xs shrink-0">
                          误区辨析
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm leading-snug">
                          {myth.question}
                        </h4>
                      </div>

                      <div className="bg-rose-50 border border-rose-200 text-rose-950 p-2.5 rounded-xl text-xs font-bold">
                        {myth.verdict}
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">
                        {myth.analysis}
                      </p>

                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 p-2.5 rounded-xl text-xs space-y-0.5">
                        <span className="font-bold block">👩‍⚕️ 护士专业指导：</span>
                        <p>{myth.nursingTip}</p>
                      </div>

                      {/* 循证出处 */}
                      {myth.evidenceSource && (
                        <div className="flex items-center justify-between text-[10px] text-blue-950 bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-200">
                          <span className="flex items-center gap-1 font-semibold truncate">
                            <span>📚 权威出处:</span>
                            <span className="font-bold text-blue-900">{myth.evidenceSource.database}</span>
                            <span className="text-slate-400">·</span>
                            <span className="truncate max-w-[190px]">{myth.evidenceSource.citation}</span>
                          </span>
                          <span className="shrink-0 font-mono text-[9px] bg-white px-1.5 rounded text-blue-900 border border-blue-300 font-bold">
                            {myth.evidenceSource.evidenceLevel}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 4. 一周示范食谱 */}
              {scienceSubTab === 'recipes' && (
                <div className="space-y-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-950">
                    <span className="font-bold text-sm block">🍲 一日6餐精选示范食谱 (周一至周日)</span>
                    <p className="mt-0.5 text-slate-700">基于中华医学会与临床营养指南编制。涵盖细烂半流质、高蛋白加强、补铁防贫血与二元家庭协同备餐全周期。</p>
                  </div>

                  {weeklyDietPlans.map((plan, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2.5">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <h4 className="font-bold text-slate-900 text-sm">
                          {plan.dayName}
                        </h4>
                        <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-900 rounded-full font-bold border border-emerald-200">
                          {plan.stageName}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {plan.meals.map((m, midx) => (
                          <div key={midx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-emerald-900">{m.timeSlot}</span>
                              <span className="text-[11px] text-slate-500">{m.notes}</span>
                            </div>
                            <div className="font-medium text-slate-800">{m.mealName}</div>
                            <div className="text-[11px] text-slate-600">{m.food}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 5. 🔬 医学知识检索 MCP 服务器 (Termonline-Research-MCP 五大权威数据源检索) */}
              {scienceSubTab === 'mcp_search' && (
                <div className="space-y-3">
                  {/* MCP 规范介绍横幅 */}
                  <div className="bg-gradient-to-br from-indigo-50/80 via-purple-50/60 to-white border border-indigo-200 rounded-2xl p-4 text-xs text-indigo-950 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="p-1.5 bg-indigo-700 text-white rounded-lg text-xs font-bold">🔬 MCP</span>
                        <div>
                          <h4 className="font-bold text-sm text-indigo-950">医学知识检索 MCP 服务器</h4>
                          <span className="text-[10px] text-indigo-700 font-mono">@ASchenmo/Termonline-Research-MCP</span>
                        </div>
                      </div>
                      <div className="flex gap-1 text-[9px] font-mono font-bold">
                        <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-300">Node.js 18.x+</span>
                        <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded border border-blue-300">MCP Ready</span>
                      </div>
                    </div>

                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      基于 <strong>Model Context Protocol (MCP)</strong> 的专业医学信息查询工具。平台所有科普专栏、红绿灯饮食、辟谣及护士建议均在此 <strong>5 大权威医学数据源</strong> 强力循证支撑下生成：
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px] pt-1">
                      <div className="bg-white/90 p-1.5 rounded-lg border border-indigo-100 flex items-center gap-1.5">
                        <span>📖</span>
                        <div>
                          <strong className="block text-slate-800">MSD诊疗手册</strong>
                          <span className="text-slate-400">专业医学知识提取</span>
                        </div>
                      </div>
                      <div className="bg-white/90 p-1.5 rounded-lg border border-indigo-100 flex items-center gap-1.5">
                        <span>🧬</span>
                        <div>
                          <strong className="block text-slate-800">NLM MeSH主题词</strong>
                          <span className="text-slate-400">医学树状精准分类</span>
                        </div>
                      </div>
                      <div className="bg-white/90 p-1.5 rounded-lg border border-indigo-100 flex items-center gap-1.5">
                        <span>🔬</span>
                        <div>
                          <strong className="block text-slate-800">梅斯医学编码</strong>
                          <span className="text-slate-400">ICD-10/ICD-9规范</span>
                        </div>
                      </div>
                      <div className="bg-white/90 p-1.5 rounded-lg border border-indigo-100 flex items-center gap-1.5">
                        <span>📗</span>
                        <div>
                          <strong className="block text-slate-800">术语在线</strong>
                          <span className="text-slate-400">全国科技名词定名</span>
                        </div>
                      </div>
                      <div className="bg-white/90 p-1.5 rounded-lg border border-indigo-100 flex items-center gap-1.5 sm:col-span-2">
                        <span>💊</span>
                        <div>
                          <strong className="block text-slate-800">国家药监局 (NMPA)</strong>
                          <span className="text-slate-400">药品与特医食品(FSMP)说明书</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 搜索框 */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={mcpSearchQuery}
                      onChange={(e) => setMcpSearchQuery(e.target.value)}
                      placeholder="搜索权威医学数据源（如：倾倒综合征、维生素B12、消化道改建、反流、优质蛋白...）"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-indigo-600 shadow-2xs"
                    />
                  </div>

                  {/* 快捷主题标签 */}
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {[
                      '倾倒综合征',
                      '消化道改建',
                      '维生素B12与贫血',
                      '反流性食管炎',
                      '优质蛋白质与蛋类',
                      '红旗警示征象',
                      '特殊医学用途配方食品与ONS',
                      '骨代谢与钙吸收障碍'
                    ].map(tag => (
                      <button
                        key={tag}
                        onClick={() => setMcpSearchQuery(tag)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                          mcpSearchQuery === tag
                            ? 'bg-indigo-700 text-white font-bold shadow-2xs'
                            : 'bg-indigo-50/70 text-indigo-900 border border-indigo-200 hover:bg-indigo-100'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                    {mcpSearchQuery && (
                      <button
                        onClick={() => setMcpSearchQuery('')}
                        className="px-2 py-1 rounded-lg text-[11px] text-slate-500 hover:text-slate-800 font-bold"
                      >
                        重置搜索
                      </button>
                    )}
                  </div>

                  {/* 检索结果展示 */}
                  <div className="space-y-3 pt-1">
                    {mcpMedicalService.searchMedicalKnowledgeMcp(mcpSearchQuery).map(rec => (
                      <div
                        key={rec.id}
                        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3 hover:border-indigo-300 transition-all"
                      >
                        {/* 头部元数据 */}
                        <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-2.5">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 text-base">
                                {rec.keyword}
                              </span>
                              <span className="font-mono text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 font-semibold">
                                {rec.mesh.descriptorNameEn}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              MeSH ID: <strong className="font-mono text-slate-600">{rec.mesh.meshId}</strong> | ICD-10: <strong className="font-mono text-slate-600">{rec.medSci.icd10}</strong>
                            </span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 shrink-0">
                            {rec.evidenceLevel}
                          </span>
                        </div>

                        {/* 5大权威数据源结构化卡片 */}
                        <div className="space-y-2 text-xs">
                          {/* 1. MSD诊疗手册 */}
                          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-1">
                            <div className="flex items-center justify-between text-indigo-950 font-bold">
                              <span className="flex items-center gap-1">
                                <span>📖 MSD诊疗手册</span>
                                <span className="text-[10px] text-slate-500 font-normal">({rec.msd.sourceEdition})</span>
                              </span>
                              <span className="text-[10px] px-1.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold">
                                {rec.msd.evidenceGrade}
                              </span>
                            </div>
                            <div className="text-slate-800 leading-relaxed text-[11px]">
                              <strong>病理生理机制：</strong>{rec.msd.coreMechanism}
                            </div>
                            <div className="text-slate-700 leading-relaxed text-[11px] bg-white p-2 rounded-lg border border-slate-100">
                              <strong>临床营养规范：</strong>{rec.msd.dietaryPrinciple}
                            </div>
                          </div>

                          {/* 2. 术语在线 (全国科技名词审定委员会) */}
                          <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-200 text-[11px] space-y-1">
                            <div className="flex items-center justify-between text-emerald-950 font-bold">
                              <span>📗 全国科学技术名词审定委员会《术语在线》</span>
                              <span className="font-mono text-[10px] text-emerald-800">{rec.termOnline.publishYear}年公布</span>
                            </div>
                            <div className="text-slate-800">
                              <strong>规范定名：</strong>{rec.termOnline.termCn} ({rec.termOnline.termEn})
                            </div>
                            <div className="text-slate-600 leading-relaxed text-[10px]">
                              <strong>权威审定定义：</strong>{rec.termOnline.definition}
                            </div>
                          </div>

                          {/* 3. MeSH 与 梅斯医学双栏 */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-200 space-y-0.5">
                              <span className="font-bold text-blue-950 block">🧬 NLM MeSH 主题词</span>
                              <div className="text-slate-700"><strong>主题词：</strong>{rec.mesh.descriptorNameCn}</div>
                              <div className="text-slate-500 text-[10px]">Tree: {rec.mesh.treeNumbers.join(', ')}</div>
                              <p className="text-[10px] text-slate-600 line-clamp-2">{rec.mesh.scopeNote}</p>
                            </div>

                            <div className="p-2.5 bg-purple-50/50 rounded-xl border border-purple-200 space-y-0.5">
                              <span className="font-bold text-purple-950 block">🔬 梅斯医学 (ICD-10/ICD-9)</span>
                              <div className="text-slate-800 font-mono font-bold text-xs">{rec.medSci.icd10}</div>
                              <div className="text-slate-600 text-[10px]">{rec.medSci.chapter} · {rec.medSci.subCategory}</div>
                              <p className="text-[10px] text-slate-600 line-clamp-2">{rec.medSci.clinicalSignificance}</p>
                            </div>
                          </div>

                          {/* 4. 国家药监局 NMPA 说明书 */}
                          <div className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-200 text-[11px] space-y-1">
                            <div className="flex items-center justify-between font-bold text-amber-950">
                              <span>💊 国家药品监督管理局 (NMPA) 药品与特医食品说明书</span>
                              <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 rounded font-mono">{rec.nmpa.registrationType}</span>
                            </div>
                            <div className="text-slate-800">
                              <strong>推荐品类/药品：</strong>{rec.nmpa.productOrCategory} ({rec.nmpa.standardOrApprovalNo})
                            </div>
                            <div className="text-slate-700 text-[10px] leading-relaxed">
                              <strong>适应症与用法：</strong>{rec.nmpa.indications} · {rec.nmpa.usageAndDosage}
                            </div>
                            <div className="text-rose-700 text-[10px]">
                              <strong>用药与进食禁忌：</strong>{rec.nmpa.contraindications}
                            </div>
                          </div>

                          {/* 5. 护士临床划重点 */}
                          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-300 text-[11px] space-y-1">
                            <span className="font-bold text-emerald-950 block">💡 护士长临床护理划重点 (实操要诀)：</span>
                            {rec.clinicalHighlights.map((hl, hidx) => (
                              <div key={hidx} className="flex items-start gap-1 text-slate-700 text-[10px]">
                                <span className="text-emerald-700 font-bold">•</span>
                                <span>{hl}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================== TAB 3: 智能问答 (AI 护士小助手) ===================== */}
          {activeTab === 'ai_chat' && (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-950 flex items-start gap-2.5">
                <Bot className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm block">胃爱守护·智能护理顾问 (AI Q&A)</span>
                  <p className="mt-0.5 text-slate-700">基于南昌大学一附院胃肠外科临床指南与 Gemini 3.8 模型，针对进食不适、倾倒反应、营养粉调配即时答疑。</p>
                </div>
              </div>

              {/* 常见热点问题快捷一键提问 (分类展示) */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-600 block">长者高频热问 (点击直接询问):</span>
                <div className="grid grid-cols-1 gap-1.5 text-xs">
                  {[
                    '全胃切除后经常反酸烧心怎么办？',
                    '早期倾倒综合征餐后心慌出冷汗如何缓解？',
                    '胃部术后可以吃柿子、年糕和糯米吗？',
                    '术后第2周可以吃鱼肉虾肉吗？',
                    '口服全营养配方粉(ONS)怎么冲调吸收最好？',
                    '全胃切除为什么必须补维生素B12？'
                  ].map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendAiQuery(preset)}
                      className="text-left p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex items-center justify-between text-xs"
                    >
                      <span>💬 {preset}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>

              {/* 聊天消息列表 */}
              <div className="space-y-3 pt-2">
                {aiChatHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5">
                      <span>{msg.sender === 'user' ? (isPatient ? '👴 患者' : '👩 照顾者') : '🤖 专科护士顾问'}</span>
                      <span>· {msg.timestamp}</span>
                    </div>
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[92%] whitespace-pre-wrap ${
                        msg.sender === 'user'
                          ? 'bg-emerald-700 text-white rounded-tr-none'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-2xs'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {msg.sender === 'assistant' && (
                      <button
                        onClick={() => handleToggleAudio(msg.content)}
                        className="mt-1 flex items-center gap-1 text-[11px] text-emerald-800 font-bold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-emerald-50"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>语音朗读答复</span>
                      </button>
                    )}
                  </div>
                ))}

                {isAiLoading && (
                  <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-500">
                    <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    <span>AI 护士正在查阅临床循证库生成个性化建议...</span>
                  </div>
                )}
              </div>

              {/* 输入框与语音输入 */}
              <div className="pt-2 sticky bottom-0 bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendAiQuery()}
                    placeholder="输入您想咨询的进食或不适问题..."
                    className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-emerald-600"
                  />
                  <button
                    onClick={() => handleSendAiQuery()}
                    disabled={isAiLoading || !userQuery.trim()}
                    className="px-4 py-2.5 bg-emerald-700 text-white font-bold rounded-xl text-xs hover:bg-emerald-800 transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>发送</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 4: 二元管理 (理解核对 + 任务分工) ===================== */}
          {activeTab === 'dyad' && (
            <div className="space-y-4">
              {/* 子Tab切换 */}
              <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-2xl text-xs">
                <button
                  onClick={() => setDyadSubTab('appraisal')}
                  className={`py-2 rounded-xl font-bold transition-all ${
                    dyadSubTab === 'appraisal' ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  💡 理解核对 (二元评价)
                </button>
                <button
                  onClick={() => setDyadSubTab('tasks')}
                  className={`py-2 rounded-xl font-bold transition-all ${
                    dyadSubTab === 'tasks' ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  🤝 任务分工 (二元行为)
                </button>
              </div>

              {/* 1. 二元评价 (Dyadic Appraisal) - 四大支柱全新重构 */}
              {dyadSubTab === 'appraisal' && (
                <div className="space-y-4">
                  {/* 顶栏理论背景引导 */}
                  <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-cyan-50 border border-teal-200 rounded-2xl p-3.5 text-xs text-teal-950 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm flex items-center gap-1.5 text-teal-900">
                        <Scale className="w-4 h-4 text-teal-700" />
                        二元评价 (Dyadic Appraisal) 全维度协同
                      </span>
                      <span className="bg-teal-100 text-teal-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-300">
                        TDIM 核心支柱
                      </span>
                    </div>
                    <p className="text-[11px] text-teal-900/90 leading-relaxed">
                      超越单一题库作答，建立双方对同一营养问题的判断协同、患者主观进食体感透明化、照顾者执行困难减负，知识核对作为常态教育功能。
                    </p>
                  </div>

                  {/* 四维子导航切换 */}
                  <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-2xl text-[11px] font-bold">
                    <button
                      onClick={() => setAppraisalDimension('nutrition_issues')}
                      className={`py-2 px-1 rounded-xl text-center transition-all flex flex-col items-center gap-0.5 ${
                        appraisalDimension === 'nutrition_issues'
                          ? 'bg-white text-emerald-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span className="flex items-center gap-1">⚖️ 营养判断</span>
                      <span className="text-[9px] font-normal opacity-80">二元对齐</span>
                    </button>
                    <button
                      onClick={() => setAppraisalDimension('eating_experience')}
                      className={`py-2 px-1 rounded-xl text-center transition-all flex flex-col items-center gap-0.5 ${
                        appraisalDimension === 'eating_experience'
                          ? 'bg-white text-emerald-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span className="flex items-center gap-1">🥣 进食感受</span>
                      <span className="text-[9px] font-normal opacity-80">体感自评</span>
                    </button>
                    <button
                      onClick={() => setAppraisalDimension('caregiver_burdens')}
                      className={`py-2 px-1 rounded-xl text-center transition-all flex flex-col items-center gap-0.5 ${
                        appraisalDimension === 'caregiver_burdens'
                          ? 'bg-white text-emerald-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span className="flex items-center gap-1">🧡 执行困难</span>
                      <span className="text-[9px] font-normal opacity-80">照护减负</span>
                    </button>
                    <button
                      onClick={() => setAppraisalDimension('knowledge_check')}
                      className={`py-2 px-1 rounded-xl text-center transition-all flex flex-col items-center gap-0.5 ${
                        appraisalDimension === 'knowledge_check'
                          ? 'bg-white text-emerald-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span className="flex items-center gap-1">📖 知识核对</span>
                      <span className="text-[9px] font-normal opacity-80">教育功能</span>
                    </button>
                  </div>

                  {/* 维度 1: 双方对同一营养问题的判断 (Dyadic Judgment on Nutrition Issues) */}
                  {appraisalDimension === 'nutrition_issues' && (
                    <div className="space-y-4">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-950 space-y-1">
                        <span className="font-bold flex items-center gap-1 text-emerald-900">
                          <span>🎯 双方对同一营养问题独立评定与分歧对齐</span>
                        </span>
                        <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                          针对胃部术后核心营养情境，患者与照顾者双盲独立选择认知判断。系统自动比对二元协同程度，揭示“过度劝饭”与“饱胀防御”等潜在家庭对抗，出具护士长二元沟通处方。
                        </p>
                      </div>

                      {nutritionIssues.map((issue, idx) => {
                        const evalObj = issue.concordanceEvaluation;
                        const myChoice = selectedIssueChoices[issue.id] ||
                          (isPatient ? evalObj?.patientAnswer?.answerKey : evalObj?.caregiverAnswer?.answerKey) || '';
                        const myNote = issueNotes[issue.id] ||
                          (isPatient ? evalObj?.patientAnswer?.note : evalObj?.caregiverAnswer?.note) || '';
                        const isBothSubmitted = evalObj && evalObj.patientAnswer && evalObj.caregiverAnswer;

                        return (
                          <div key={issue.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md">
                                营养判断议题 {idx + 1} / 共 {nutritionIssues.length} 项
                              </span>
                              <span className="text-slate-400 text-[11px]">
                                {isBothSubmitted ? '✓ 双方已对齐' : '⏳ 双方评定中'}
                              </span>
                            </div>

                            <h3 className="font-bold text-slate-900 text-base leading-snug">
                              {issue.title}
                            </h3>

                            {/* 临床背景说明 */}
                            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-[11px] text-slate-600 leading-relaxed">
                              <span className="font-semibold text-slate-700 block mb-0.5">💡 临床二元背景:</span>
                              {issue.clinicalSignificance}
                            </div>

                            {/* 选项大按钮 */}
                            <div className="space-y-2">
                              {issue.options.map((opt) => {
                                const isChosen = myChoice === opt.key;
                                return (
                                  <button
                                    key={opt.key}
                                    onClick={() => setSelectedIssueChoices({ ...selectedIssueChoices, [issue.id]: opt.key })}
                                    className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1 min-h-[52px] ${
                                      isChosen
                                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-xs'
                                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2.5">
                                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 font-bold mt-0.5 ${
                                        isChosen ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                                      }`}>
                                        {opt.key}
                                      </span>
                                      <span className="text-sm leading-snug flex-1">{opt.label}</span>
                                    </div>
                                    <span className="text-[11px] text-slate-500 font-normal pl-7">
                                      临床含义: {opt.clinicalMeaning}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* 选填心声输入框 */}
                            <div className="pt-1">
                              <input
                                type="text"
                                placeholder={`选填：写下您做出该判断的具体真实感受或顾虑（当前身份: ${isPatient ? '患者' : '照顾者'}）`}
                                value={myNote}
                                onChange={(e) => setIssueNotes({ ...issueNotes, [issue.id]: e.target.value })}
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-emerald-600"
                              />
                            </div>

                            {/* 提交按钮 */}
                            <button
                              onClick={async () => {
                                const choice = selectedIssueChoices[issue.id] || myChoice;
                                if (!choice) {
                                  setActionNotice({ type: 'warn', msg: '请先选择一个判断选项' });
                                  return;
                                }
                                const res = await tdimApi.submitNutritionIssueAnswer({
                                  issueId: issue.id,
                                  dyadId: patient.dyadPairId || 'PAIR_0001',
                                  userId: currentUser.id,
                                  role: activeRole,
                                  answerKey: choice,
                                  note: myNote
                                });
                                setActionNotice({
                                  type: 'success',
                                  msg: res.bothRevealed
                                    ? '二元判断已提交，双方协同结果已揭晓！积分 +15'
                                    : '您的独立评定已保存，等待对方提交后解锁对比。积分 +15'
                                });
                                reloadData();
                              }}
                              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                            >
                              提交我的判断并获取二元协同分析
                            </button>

                            {/* 揭晓对比报告卡片 */}
                            {isBothSubmitted && evalObj ? (
                              <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-800">二元协同评定报告:</span>
                                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                                    evalObj.concordance === 'concordant'
                                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                      : evalObj.concordance === 'severe_discrepancy'
                                      ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                                  }`}>
                                    {evalObj.concordanceTitle}
                                  </span>
                                </div>

                                {/* 双方答案与心里话对比 */}
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                                    <span className="text-slate-400 block text-[11px]">👴 患者判断 ({evalObj.patientAnswer?.answerKey} 项):</span>
                                    <p className="font-semibold text-slate-800 text-xs">
                                      {issue.options.find(o => o.key === evalObj.patientAnswer?.answerKey)?.label}
                                    </p>
                                    {evalObj.patientAnswer?.note && (
                                      <p className="text-[11px] text-slate-500 italic bg-slate-50 p-1.5 rounded">
                                        “{evalObj.patientAnswer.note}”
                                      </p>
                                    )}
                                  </div>
                                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                                    <span className="text-slate-400 block text-[11px]">👩 照顾者判断 ({evalObj.caregiverAnswer?.answerKey} 项):</span>
                                    <p className="font-semibold text-slate-800 text-xs">
                                      {issue.options.find(o => o.key === evalObj.caregiverAnswer?.answerKey)?.label}
                                    </p>
                                    {evalObj.caregiverAnswer?.note && (
                                      <p className="text-[11px] text-slate-500 italic bg-slate-50 p-1.5 rounded">
                                        “{evalObj.caregiverAnswer.note}”
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* 护士长二元处方与沟通对齐模板 */}
                                <div className="bg-teal-50 border border-teal-200 p-3 rounded-xl text-xs space-y-2">
                                  <div>
                                    <span className="font-bold text-teal-950 block mb-0.5">🩺 专科护士长二元沟通处方:</span>
                                    <p className="text-slate-700 leading-relaxed text-[11px]">{evalObj.nursePrescription}</p>
                                  </div>

                                  <div className="bg-white/80 p-2 rounded-lg border border-teal-200/60">
                                    <span className="font-bold text-teal-900 block text-[11px] mb-0.5">💬 餐桌温情沟通话术:</span>
                                    <p className="text-[11px] text-teal-950 font-medium italic">{evalObj.communicationScript}</p>
                                  </div>

                                  {issue.evidenceSource && (
                                    <div className="text-[10px] text-teal-900 pt-1.5 border-t border-teal-200/80 flex items-center justify-between font-medium">
                                      <span className="flex items-center gap-1">
                                        <span>🔬 权威出处:</span>
                                        <span className="font-bold">{issue.evidenceSource.database}</span>
                                        <span>•</span>
                                        <span>{issue.evidenceSource.citation}</span>
                                      </span>
                                      {issue.evidenceSource.meshId && (
                                        <span className="font-mono text-[9px] text-indigo-800 bg-white px-1 rounded border border-indigo-200">
                                          {issue.evidenceSource.meshId}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-2 text-slate-400 text-xs flex items-center justify-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>等待对方提交独立评定后，系统将自动对比双方判断并出具护士长处方</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 维度 2: 患者进食感受 (Patient Subjective Eating Sensations) */}
                  {appraisalDimension === 'eating_experience' && (
                    <div className="space-y-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-950 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold flex items-center gap-1 text-amber-900">
                            <span>🥣 患者进食真实体感与照顾者共情视窗</span>
                          </span>
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            主观体验透明化
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-900/80 leading-relaxed">
                          胃切除后早饱、胃胀、倾倒心慌是生理物理限制，绝非“挑食不听话”。患者记录真实体感，照顾者在共情视窗实时读懂心声，避免盲目催饭，实现温情照护。
                        </p>
                      </div>

                      {/* 患者记录按钮 */}
                      {isPatient && (
                        <button
                          onClick={() => setIsAddingExperienceModal(true)}
                          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl text-xs transition-all shadow-xs flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>记录本餐进食真实感受 (早饱/饱胀/舒适度 · 积分+20)</span>
                        </button>
                      )}

                      {/* 进食感受填报卡片/弹窗 */}
                      {isAddingExperienceModal && (
                        <div className="bg-white border-2 border-emerald-500 rounded-2xl p-4 shadow-sm space-y-3">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <span className="font-bold text-sm text-slate-800">📝 记录进食感受 (自评)</span>
                            <button
                              onClick={() => setIsAddingExperienceModal(false)}
                              className="text-slate-400 hover:text-slate-600 text-xs"
                            >
                              取消
                            </button>
                          </div>

                          {/* 餐次选择 */}
                          <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1">选择本次就餐阶段:</label>
                            <div className="grid grid-cols-3 gap-1.5 text-xs">
                              {[
                                { key: 'breakfast', label: '早餐饮食' },
                                { key: 'morning_snack', label: '上午加餐' },
                                { key: 'lunch', label: '午餐饮食' },
                                { key: 'afternoon_snack', label: '下午加餐' },
                                { key: 'dinner', label: '晚餐饮食' },
                                { key: 'night_snack', label: '睡前加餐' }
                              ].map(m => (
                                <button
                                  key={m.key}
                                  onClick={() => {
                                    setNewExpMealType(m.key as any);
                                    setNewExpMealTypeName(m.label);
                                  }}
                                  className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                                    newExpMealType === m.key
                                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold'
                                      : 'bg-slate-50 border-slate-200 text-slate-700'
                                  }`}
                                >
                                  {m.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* 整体舒适度打分 (1~5星) */}
                          <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1">本次就餐整体舒适度:</label>
                            <div className="flex items-center gap-1.5">
                              {[1, 2, 3, 4, 5].map(star => (
                                <button
                                  key={star}
                                  onClick={() => setNewExpComfort(star as any)}
                                  className={`flex-1 py-1.5 rounded-lg border text-center text-xs font-bold transition-all ${
                                    newExpComfort === star
                                      ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-xs'
                                      : 'bg-slate-50 border-slate-200 text-slate-600'
                                  }`}
                                >
                                  {star === 1 && '😫 极难受'}
                                  {star === 2 && '😣 胀痛'}
                                  {star === 3 && '😐 勉强'}
                                  {star === 4 && '🙂 舒适'}
                                  {star === 5 && '😊 轻松'}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* 6大特异性体感打分 */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                            <span className="font-bold text-slate-800 block text-xs">胃部特异性进食体感打分:</span>

                            <div className="flex items-center justify-between">
                              <span className="text-slate-700">早饱感 (吃两三口就饱胀):</span>
                              <div className="flex gap-1">
                                {[0, 1, 2, 3].map(v => (
                                  <button
                                    key={v}
                                    onClick={() => setNewExpEarlySatiety(v)}
                                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                      newExpEarlySatiety === v ? 'bg-emerald-700 text-white' : 'bg-white border text-slate-700'
                                    }`}
                                  >
                                    {v === 0 ? '无' : v === 1 ? '轻微' : v === 2 ? '明显' : '严重'}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-slate-700">胃膨满感 (上腹下坠顶塞):</span>
                              <div className="flex gap-1">
                                {[0, 1, 2, 3].map(v => (
                                  <button
                                    key={v}
                                    onClick={() => setNewExpBloating(v)}
                                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                      newExpBloating === v ? 'bg-emerald-700 text-white' : 'bg-white border text-slate-700'
                                    }`}
                                  >
                                    {v === 0 ? '无' : v === 1 ? '轻微' : v === 2 ? '明显' : '胀痛'}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-slate-700">倾倒征兆 (心慌出汗虚脱):</span>
                              <div className="flex gap-1">
                                {[0, 1, 2, 3].map(v => (
                                  <button
                                    key={v}
                                    onClick={() => setNewExpDumping(v)}
                                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                      newExpDumping === v ? 'bg-rose-700 text-white' : 'bg-white border text-slate-700'
                                    }`}
                                  >
                                    {v === 0 ? '无' : v === 1 ? '微汗' : v === 2 ? '头晕' : '严重需卧床'}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-slate-700">进食疲倦感 (吃顿饭耗尽力气):</span>
                              <div className="flex gap-1">
                                {[0, 1, 2, 3].map(v => (
                                  <button
                                    key={v}
                                    onClick={() => setNewExpFatigue(v)}
                                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                      newExpFatigue === v ? 'bg-amber-700 text-white' : 'bg-white border text-slate-700'
                                    }`}
                                  >
                                    {v === 0 ? '轻松' : v === 1 ? '微累' : v === 2 ? '费劲' : '极度疲惫'}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 pt-1 border-t border-slate-200">
                              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                                <input
                                  type="checkbox"
                                  checked={newExpAcidReflux}
                                  onChange={e => setNewExpAcidReflux(e.target.checked)}
                                  className="rounded text-emerald-600"
                                />
                                <span>伴反酸烧心嗳气</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                                <input
                                  type="checkbox"
                                  checked={newExpTasteChange}
                                  onChange={e => setNewExpTasteChange(e.target.checked)}
                                  className="rounded text-emerald-600"
                                />
                                <span>食之无味/金属味</span>
                              </label>
                            </div>
                          </div>

                          {/* 真实心里话 */}
                          <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1">写下您的真实进食体感与顾虑 (照顾者可见):</label>
                            <textarea
                              rows={2}
                              value={newExpNote}
                              onChange={e => setNewExpNote(e.target.value)}
                              placeholder="例：喝了小半碗鲫鱼蛋羹，咽了四口就觉得胃顶得慌，不敢再咽了；坐着歇了会儿感觉好多了。"
                              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-emerald-600"
                            />
                          </div>

                          <button
                            onClick={async () => {
                              await tdimApi.addEatingExperience({
                                dyadId: patient.dyadPairId || 'PAIR_0001',
                                patientId: patient.id,
                                mealType: newExpMealType,
                                mealTypeName: newExpMealTypeName,
                                comfortRating: newExpComfort,
                                sensations: {
                                  earlySatiety: newExpEarlySatiety,
                                  gastricBloating: newExpBloating,
                                  dumpingSymptoms: newExpDumping,
                                  eatingFatigue: newExpFatigue,
                                  fearOfDiscomfort: newExpFear,
                                  tasteChange: newExpTasteChange,
                                  acidReflux: newExpAcidReflux
                                },
                                patientVerbalNote: newExpNote || '按少食多餐原则细嚼慢咽，进食基本平稳。'
                              });
                              setIsAddingExperienceModal(false);
                              setNewExpNote('');
                              setActionNotice({ type: 'success', msg: '进食感受已保存！积分 +20，已同步至照顾者视窗' });
                              reloadData();
                            }}
                            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                          >
                            保存进食感受并同步至家庭共情视窗
                          </button>
                        </div>
                      )}

                      {/* 进食感受卡片列表 */}
                      {eatingExperiences.map((exp) => (
                        <div key={exp.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5">
                              <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                              {exp.mealTypeName}
                            </span>
                            <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                              <span>{'★'.repeat(exp.comfortRating)}{'☆'.repeat(5 - exp.comfortRating)}</span>
                              <span className="text-slate-500 text-[11px]">
                                {exp.comfortRating >= 4 ? '比较舒适' : exp.comfortRating === 3 ? '勉强耐受' : '不适明显'}
                              </span>
                            </div>
                          </div>

                          {/* 体感标签云 */}
                          <div className="flex flex-wrap gap-1 text-[10px]">
                            {exp.sensations.earlySatiety > 0 && (
                              <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                                早饱感: {exp.sensations.earlySatiety === 1 ? '轻度' : exp.sensations.earlySatiety === 2 ? '明显早饱' : '严重'}
                              </span>
                            )}
                            {exp.sensations.gastricBloating > 0 && (
                              <span className="bg-orange-50 text-orange-900 border border-orange-200 px-2 py-0.5 rounded-full font-medium">
                                胃膨满: {exp.sensations.gastricBloating === 1 ? '微胀' : '明显膨满'}
                              </span>
                            )}
                            {exp.sensations.dumpingSymptoms > 0 && (
                              <span className="bg-rose-50 text-rose-900 border border-rose-200 px-2 py-0.5 rounded-full font-medium">
                                倾倒先兆: {exp.sensations.dumpingSymptoms === 1 ? '微出汗' : '头晕心慌需平卧'}
                              </span>
                            )}
                            {exp.sensations.acidReflux && (
                              <span className="bg-purple-50 text-purple-900 border border-purple-200 px-2 py-0.5 rounded-full font-medium">
                                伴有反酸嗳气
                              </span>
                            )}
                            {exp.sensations.eatingFatigue > 0 && (
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                                进食疲倦感
                              </span>
                            )}
                          </div>

                          {/* 患者真实心里话原声 */}
                          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 text-xs space-y-1">
                            <span className="font-bold text-emerald-950 block text-[11px]">👴 患者真实体感自述:</span>
                            <p className="text-slate-800 leading-relaxed text-xs">“{exp.patientVerbalNote}”</p>
                          </div>

                          {/* 专科护士长专业贴士 */}
                          <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-2.5 text-xs text-teal-950">
                            <span className="font-bold block text-[11px] text-teal-900 mb-0.5">🩺 护士长临床护理贴士:</span>
                            <p className="text-[11px] leading-relaxed text-slate-700">{exp.nurseClinicalTip}</p>
                          </div>

                          {/* 照顾者共情视窗卡片 */}
                          {exp.caregiverFeedback ? (
                            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs space-y-1.5">
                              <div className="flex items-center justify-between text-amber-900 font-bold text-[11px]">
                                <span>👩 照顾者共情回音与照护调适:</span>
                                <span className="text-[10px] text-amber-700 font-normal">已阅读体谅</span>
                              </div>
                              <p className="text-slate-800 text-xs italic">“{exp.caregiverFeedback.empathyMessage}”</p>
                              <div className="pt-1 border-t border-amber-200/80 text-[11px] text-amber-950 flex items-center gap-1 font-medium">
                                <span>🍲 照护行动调整:</span>
                                <span>{exp.caregiverFeedback.careAdjustment}</span>
                              </div>
                            </div>
                          ) : (
                            <div>
                              {activeRole === 'caregiver' ? (
                                <div>
                                  {replyingExpId === exp.id ? (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-xs">
                                      <span className="font-bold text-slate-800 block">👩 发送共情回音 (消除就餐紧张):</span>
                                      <input
                                        type="text"
                                        placeholder="输入一句温暖鼓励（如：老伴我知道你胃顶，下顿我不催你多吃了）"
                                        value={empathyMessageInput}
                                        onChange={e => setEmpathyMessageInput(e.target.value)}
                                        className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                                      />
                                      <input
                                        type="text"
                                        placeholder="具体的备餐微调（如：下顿减量1/3并滤去水分，下午两点加一次蛋白粉）"
                                        value={careAdjustmentInput}
                                        onChange={e => setCareAdjustmentInput(e.target.value)}
                                        className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                                      />
                                      <div className="flex gap-2 justify-end">
                                        <button
                                          onClick={() => setReplyingExpId(null)}
                                          className="px-3 py-1 rounded-lg text-slate-600 border text-xs"
                                        >
                                          取消
                                        </button>
                                        <button
                                          onClick={async () => {
                                            if (!empathyMessageInput.trim()) {
                                              setActionNotice({ type: 'warn', msg: '请输入共情话语' });
                                              return;
                                            }
                                            await tdimApi.addCaregiverEmpathyFeedback({
                                              experienceId: exp.id,
                                              caregiverId: caregiver.id,
                                              empathyMessage: empathyMessageInput,
                                              careAdjustment: careAdjustmentInput || '下餐按需减量，增加加餐频次'
                                            });
                                            setReplyingExpId(null);
                                            setEmpathyMessageInput('');
                                            setCareAdjustmentInput('');
                                            setActionNotice({ type: 'success', msg: '共情回音已送达老伴！积分 +15' });
                                            reloadData();
                                          }}
                                          className="px-3 py-1 bg-amber-700 text-white rounded-lg font-bold text-xs"
                                        >
                                          发送共情回音
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setReplyingExpId(exp.id)}
                                      className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-xl text-xs transition-colors"
                                    >
                                      🧡 读懂了老伴难受：一键发送共情回音与备餐微调 (积分+15)
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center py-1 text-slate-400 text-[11px]">
                                  ○ 照顾者视窗待阅（已实时同步给老伴）
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 维度 3: 照顾者执行困难 (Caregiver Execution Burdens & Solutions) */}
                  {appraisalDimension === 'caregiver_burdens' && (
                    <div className="space-y-4">
                      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs text-rose-950 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold flex items-center gap-1 text-rose-900">
                            <span>🧡 照顾者备餐负荷与执行困难填报</span>
                          </span>
                          <span className="bg-rose-100 text-rose-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            照护者赋能减负
                          </span>
                        </div>
                        <p className="text-[11px] text-rose-900/80 leading-relaxed">
                          一日6~8餐反复起火极其繁重，劝饭遭拒时更易产生挫败、焦虑与内疚。倾诉照护难处，系统提供科学减负锦囊，患者端同步开启感恩视窗，促进二元情感双向奔赴。
                        </p>
                      </div>

                      {/* 照顾者填报按钮 */}
                      {!isPatient && (
                        <button
                          onClick={() => setIsAddingBurdenModal(true)}
                          className="w-full py-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold rounded-2xl text-xs transition-all shadow-xs flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>填报照护执行困难与心声 (生成减负锦囊 · 积分+20)</span>
                        </button>
                      )}

                      {/* 照顾者困难填报弹窗/卡片 */}
                      {isAddingBurdenModal && (
                        <div className="bg-white border-2 border-rose-500 rounded-2xl p-4 shadow-sm space-y-3">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <span className="font-bold text-sm text-slate-800">📝 照护负荷与心里话填报</span>
                            <button
                              onClick={() => setIsAddingBurdenModal(false)}
                              className="text-slate-400 hover:text-slate-600 text-xs"
                            >
                              取消
                            </button>
                          </div>

                          {/* 压力自评 */}
                          <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1">近期照护压力等级评定:</label>
                            <div className="flex gap-1.5">
                              {[1, 2, 3, 4, 5].map(lvl => (
                                <button
                                  key={lvl}
                                  onClick={() => setNewBurdenStress(lvl as any)}
                                  className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                                    newBurdenStress === lvl
                                      ? 'bg-rose-100 border-rose-400 text-rose-950 shadow-xs'
                                      : 'bg-slate-50 border-slate-200 text-slate-600'
                                  }`}
                                >
                                  {lvl === 1 && '从容'}
                                  {lvl === 2 && '稍累'}
                                  {lvl === 3 && '中度'}
                                  {lvl === 4 && '偏重'}
                                  {lvl === 5 && '筋疲力竭'}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* 困难痛点多选 */}
                          <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1">勾选面临的核心执行困难 (多选):</label>
                            <div className="grid grid-cols-2 gap-1.5 text-xs">
                              {[
                                '每日6~8餐备餐耗竭',
                                '劝饭拒食矛盾',
                                '热量蛋白质计算困难',
                                '照护与工作睡眠冲突',
                                '恐慌病情并发症'
                              ].map(tag => {
                                const isChecked = selectedDifficultyTags.includes(tag);
                                return (
                                  <button
                                    key={tag}
                                    onClick={() => {
                                      if (isChecked) {
                                        setSelectedDifficultyTags(selectedDifficultyTags.filter(t => t !== tag));
                                      } else {
                                        setSelectedDifficultyTags([...selectedDifficultyTags, tag]);
                                      }
                                    }}
                                    className={`p-2 rounded-xl border text-left transition-all ${
                                      isChecked
                                        ? 'bg-rose-50 border-rose-400 text-rose-950 font-bold'
                                        : 'bg-slate-50 border-slate-200 text-slate-700'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <span className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[10px] ${
                                        isChecked ? 'bg-rose-600 text-white' : 'border border-slate-400'
                                      }`}>
                                        {isChecked && '✓'}
                                      </span>
                                      <span className="text-[11px]">{tag}</span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* 倾诉心里话 */}
                          <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1">写下您的心里话与难处 (患者端可见感恩视窗):</label>
                            <textarea
                              rows={3}
                              value={newCaregiverVoice}
                              onChange={e => setNewCaregiverVoice(e.target.value)}
                              placeholder="例：每天起火六七次做饭，看到他只吃两口推开，心里又急又委屈，忍不住语气就冲了，事后又特别自责……"
                              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-rose-600"
                            />
                          </div>

                          <button
                            onClick={async () => {
                              if (!newCaregiverVoice.trim()) {
                                setActionNotice({ type: 'warn', msg: '请先写下一句心里话' });
                                return;
                              }
                              await tdimApi.addCaregiverBurden({
                                dyadId: patient.dyadPairId || 'PAIR_0001',
                                caregiverId: caregiver.id,
                                stressLevel: newBurdenStress,
                                difficultyTags: selectedDifficultyTags.length > 0 ? selectedDifficultyTags : ['每日6~8餐备餐耗竭'],
                                caregiverVoice: newCaregiverVoice
                              });
                              setIsAddingBurdenModal(false);
                              setNewCaregiverVoice('');
                              setActionNotice({ type: 'success', msg: '照护困难已填报，系统已生成减负锦囊！积分 +20' });
                              reloadData();
                            }}
                            className="w-full py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                          >
                            提交填报并生成护士长减负锦囊
                          </button>
                        </div>
                      )}

                      {/* 照顾者困难卡片列表 */}
                      {caregiverBurdens.map((burden) => (
                        <div key={burden.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5">
                              <Heart className="w-3.5 h-3.5 text-rose-600" />
                              照顾者照护负荷自评
                            </span>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                              burden.stressLevel >= 4
                                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}>
                              压力评定: {burden.stressLevel} 级 ({burden.stressLevel >= 4 ? '偏重耗竭' : '中度疲累'})
                            </span>
                          </div>

                          {/* 困难标签云 */}
                          <div className="flex flex-wrap gap-1 text-[10px]">
                            {burden.difficultyTags.map((tag, tIdx) => (
                              <span key={tIdx} className="bg-rose-50 text-rose-900 border border-rose-200 px-2 py-0.5 rounded-full font-medium">
                                ⚡ {tag}
                              </span>
                            ))}
                          </div>

                          {/* 照顾者心里话原声 */}
                          <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3 text-xs space-y-1">
                            <span className="font-bold text-rose-950 block text-[11px]">👩 照顾者倾诉心里话:</span>
                            <p className="text-slate-800 leading-relaxed text-xs">“{burden.caregiverVoice}”</p>
                          </div>

                          {/* 护士长科学减负锦囊 */}
                          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs space-y-2">
                            <span className="font-bold text-emerald-950 block text-xs">💡 专科护士长减负锦囊 (3条落地技巧):</span>
                            <div className="space-y-1.5 text-[11px] text-slate-700 leading-relaxed">
                              {burden.reliefStrategies.map((strat, sIdx) => (
                                <p key={sIdx}>{strat}</p>
                              ))}
                            </div>
                          </div>

                          {/* 患者端感恩视窗卡片 */}
                          {burden.patientGratitude ? (
                            <div className="bg-teal-50/80 border border-teal-200 rounded-xl p-3 text-xs space-y-1">
                              <div className="flex items-center justify-between text-teal-900 font-bold text-[11px]">
                                <span>👴 患者感恩温情回馈:</span>
                                <span className="text-[10px] text-teal-700 font-normal">已阅读体谅</span>
                              </div>
                              <p className="text-slate-800 text-xs italic">“{burden.patientGratitude.gratitudeMessage}”</p>
                            </div>
                          ) : (
                            <div>
                              {isPatient ? (
                                <div>
                                  {replyingBurdenId === burden.id ? (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-xs">
                                      <span className="font-bold text-slate-800 block">👴 发送感恩体谅回音:</span>
                                      <input
                                        type="text"
                                        placeholder="写下对家人的感谢（如：老伴我知道你辛苦了，听护士长的话少做点，多睡会儿）"
                                        value={gratitudeMessageInput}
                                        onChange={e => setGratitudeMessageInput(e.target.value)}
                                        className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                                      />
                                      <div className="flex gap-2 justify-end">
                                        <button
                                          onClick={() => setReplyingBurdenId(null)}
                                          className="px-3 py-1 rounded-lg text-slate-600 border text-xs"
                                        >
                                          取消
                                        </button>
                                        <button
                                          onClick={async () => {
                                            if (!gratitudeMessageInput.trim()) {
                                              setActionNotice({ type: 'warn', msg: '请输入感恩寄语' });
                                              return;
                                            }
                                            await tdimApi.addPatientGratitudeFeedback({
                                              burdenId: burden.id,
                                              patientId: patient.id,
                                              message: gratitudeMessageInput
                                            });
                                            setReplyingBurdenId(null);
                                            setGratitudeMessageInput('');
                                            setActionNotice({ type: 'success', msg: '感恩回音已送达老伴！积分 +15' });
                                            reloadData();
                                          }}
                                          className="px-3 py-1 bg-teal-700 text-white rounded-lg font-bold text-xs"
                                        >
                                          发送温情致谢
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setReplyingBurdenId(burden.id)}
                                      className="w-full py-2 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 font-bold rounded-xl text-xs transition-colors"
                                    >
                                      🧡 看见了家人的辛劳：一键发送感恩体谅致谢 (积分+15)
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center py-1 text-slate-400 text-[11px]">
                                  ○ 患者感恩视窗待阅（已同步呈现在患者端）
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 维度 4: 知识核对 (作为二元评价的教育功能) (Knowledge Verification) */}
                  {appraisalDimension === 'knowledge_check' && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-xs text-blue-950 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold flex items-center gap-1 text-blue-900">
                            <span>📖 双方知识核对（二元评价之教育功能）</span>
                          </span>
                          <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            权威循证出处
                          </span>
                        </div>
                        <p className="text-[11px] text-blue-900/80 leading-relaxed">
                          双方独立双盲作答护理核对题。提交后系统即刻比对双方答案，识别是否存在共同认知误区，依托权威医学数据源（MSD、MeSH、CSCO/CSPEN指南、术语在线、NMPA）巩固科学循证知识。
                        </p>
                      </div>

                      {questions.map((q, idx) => {
                        const evalResult = tdimStore.evaluateAppraisalOutcome(q.id, patient.dyadPairId || '', 1);
                        const myAns = selectedAnswers[q.id];
                        const isProxyChecked = isProxyFlags[q.id] || false;

                        return (
                          <div key={q.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                                第 {idx + 1} 题 / 共 {questions.length} 题
                              </span>
                              <span className="text-slate-400 text-[11px]">版本: {q.version}</span>
                            </div>

                            <h3 className="font-bold text-slate-900 text-base leading-snug">
                              {q.title}
                            </h3>

                            {/* 选项大按钮 (高度 48px, 适老直达) */}
                            <div className="space-y-2">
                              {q.options.map((opt) => {
                                const isChosen = myAns === opt.key;
                                return (
                                  <button
                                    key={opt.key}
                                    disabled={evalResult.revealed}
                                    onClick={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: opt.key })}
                                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 min-h-[48px] ${
                                      isChosen
                                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-xs'
                                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                                    } ${evalResult.revealed ? 'opacity-85 cursor-default' : ''}`}
                                  >
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 font-bold ${
                                      isChosen ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                                    }`}>
                                      {opt.key}
                                    </span>
                                    <span className="text-sm leading-snug flex-1">{opt.label}</span>
                                  </button>
                                );
                              })}
                            </div>

                            {!evalResult.revealed && (
                              <div className="flex items-center justify-between text-xs pt-1">
                                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
                                  <input
                                    type="checkbox"
                                    checked={isProxyChecked}
                                    onChange={(e) => setIsProxyFlags({ ...isProxyFlags, [q.id]: e.target.checked })}
                                    className="rounded-sm text-emerald-600"
                                  />
                                  <span>标记为“代答/共同讨论”</span>
                                </label>
                                <span className="text-[10px] text-slate-400">(统计独立一致性时剔除)</span>
                              </div>
                            )}

                            {!evalResult.revealed && (
                              <button
                                onClick={async () => {
                                  if (!myAns) {
                                    setActionNotice({ type: 'warn', msg: '请先勾选一个选项' });
                                    return;
                                  }
                                  await tdimApi.submitAppraisalAnswer({
                                    questionId: q.id,
                                    dyadId: patient.dyadPairId || 'PAIR_0001',
                                    userId: currentUser.id,
                                    userRole: activeRole,
                                    answer: myAns,
                                    attemptNumber: 1,
                                    isProxyOrDiscussed: isProxyChecked
                                  });
                                  setActionNotice({ type: 'success', msg: `${isPatient ? '患者' : '照顾者'}作答已保存！` });
                                  reloadData();
                                }}
                                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition-colors shadow-xs"
                              >
                                提交当前作答
                              </button>
                            )}

                            {/* 揭晓对比卡片 */}
                            {evalResult.revealed ? (
                              <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-700">二元对比结果:</span>
                                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                                    evalResult.outcome === 'both_match_correct'
                                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                      : evalResult.outcome === 'both_match_incorrect'
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : 'bg-rose-100 text-rose-900 border border-rose-300'
                                  }`}>
                                    {evalResult.outcome === 'both_match_correct' && '✓ 双方一致且正确'}
                                    {evalResult.outcome === 'both_match_incorrect' && '⚠️ 双方一致但都答错'}
                                    {evalResult.outcome === 'mismatch' && '✕ 双方认知不一致'}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                                    <span className="text-slate-400 block text-[11px]">👴 患者答案:</span>
                                    <span className="font-bold text-slate-800 text-sm">{evalResult.patientAns?.answer} 选项</span>
                                  </div>
                                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                                    <span className="text-slate-400 block text-[11px]">👩 照顾者答案:</span>
                                    <span className="font-bold text-slate-800 text-sm">{evalResult.caregiverAns?.answer} 选项</span>
                                  </div>
                                </div>

                                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-emerald-950">标准答案: {evalResult.correctAnswer} 选项</span>
                                    {q.evidenceSource && (
                                      <span className="text-[10px] bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-bold border border-emerald-300">
                                        {q.evidenceSource.evidenceLevel}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-slate-700 leading-relaxed text-[11px]">{evalResult.explanation}</p>
                                  {q.evidenceSource && (
                                    <div className="text-[10px] text-emerald-900 pt-1 border-t border-emerald-200/80 flex items-center justify-between font-medium">
                                      <span className="flex items-center gap-1">
                                        <span>🔬 权威出处:</span>
                                        <span className="font-bold">{q.evidenceSource.database}</span>
                                        <span>•</span>
                                        <span>{q.evidenceSource.citation}</span>
                                      </span>
                                      {q.evidenceSource.meshId && (
                                        <span className="font-mono text-[9px] text-indigo-800 bg-white px-1 rounded border border-indigo-200">
                                          {q.evidenceSource.meshId}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-2 text-slate-400 text-xs flex items-center justify-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>等待对方提交后，系统将自动对比双方理解</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 2. 二元行为 (任务分工) */}
              {dyadSubTab === 'tasks' && (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 space-y-1">
                    <span className="font-bold text-sm block">二元管理行为 (Dyadic Management)</span>
                    <p>任务清晰拆解双方职责。必须双方均同意确认后，分工方案方可正式生效。</p>
                  </div>

                  {tasks.map((task) => (
                    <div key={task.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-slate-900 text-base leading-snug">
                          {task.title}
                        </h3>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold shrink-0 ${
                          task.isConfirmed ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {task.isConfirmed ? '✓ 已双向确认生效' : '⏳ 待双方确认'}
                        </span>
                      </div>

                      {/* 职责清晰拆解 */}
                      <div className="bg-slate-50 rounded-xl p-3 space-y-2 text-xs border border-slate-200">
                        <div>
                          <span className="font-bold text-slate-800">👴 患者负责部分:</span>
                          <p className="text-slate-600 mt-0.5">{task.patientRoleDesc}</p>
                        </div>
                        <div className="pt-1.5 border-t border-slate-200">
                          <span className="font-bold text-slate-800">👩 照顾者负责部分:</span>
                          <p className="text-slate-600 mt-0.5">{task.caregiverRoleDesc}</p>
                        </div>
                      </div>

                      {/* 协商承担者 (3个大按钮) */}
                      <div>
                        <span className="text-xs font-semibold text-slate-600 block mb-1.5">协商主承担人:</span>
                        <div className="grid grid-cols-3 gap-2">
                          {(['patient', 'caregiver', 'joint'] as const).map((assignee) => (
                            <button
                              key={assignee}
                              onClick={async () => {
                                await tdimApi.updateTaskAssignment({
                                  taskId: task.id,
                                  operatorRole: role,
                                  proposedAssignee: assignee
                                });
                                setActionNotice({ type: 'warn', msg: `已提议由【${assignee === 'patient' ? '患者' : assignee === 'caregiver' ? '照顾者' : '共同'}】承担，等待对方确认` });
                                reloadData();
                              }}
                              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                task.proposedAssignee === assignee
                                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {assignee === 'patient' && '患者承担'}
                              {assignee === 'caregiver' && '照顾者承担'}
                              {assignee === 'joint' && '共同分工'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 双向确认按钮与状态 */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <div className={task.patientAgreed ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                            {task.patientAgreed ? '✓ 患者已同意' : '○ 患者未确认'}
                          </div>
                          <div className={task.caregiverAgreed ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                            {task.caregiverAgreed ? '✓ 照顾者已同意' : '○ 照顾者未确认'}
                          </div>
                        </div>

                        {((isPatient && !task.patientAgreed) || (!isPatient && !task.caregiverAgreed)) && (
                          <button
                            onClick={async () => {
                              await tdimApi.confirmTaskAgreement(task.id, role);
                              setActionNotice({ type: 'success', msg: '您已确认分工方案！' });
                              reloadData();
                            }}
                            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs"
                          >
                            我同意此分工
                          </button>
                        )}
                      </div>

                      {/* 执行打卡 */}
                      {task.isConfirmed && (
                        <div className="pt-1 flex items-center justify-between gap-1 text-xs">
                          <span className="text-slate-500">今日执行状态:</span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={async () => {
                                await tdimApi.updateTaskExecStatus({ taskId: task.id, execStatus: 'completed' });
                                setActionNotice({ type: 'success', msg: '任务已标记完成！' });
                                reloadData();
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                task.execStatus === 'completed' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              已完成
                            </button>
                            <button
                              onClick={async () => {
                                const reason = prompt('请输入执行困难原因（开题报告要求必填）：', '患者术后偶发早饱乏力');
                                if (reason) {
                                  await tdimApi.updateTaskExecStatus({ taskId: task.id, execStatus: 'difficult', difficultyReason: reason });
                                  reloadData();
                                }
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                task.execStatus === 'difficult' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              有困难
                            </button>
                          </div>
                        </div>
                      )}

                      {task.difficultyReason && (
                        <div className="text-xs bg-amber-50 text-amber-900 p-2.5 rounded-xl border border-amber-200">
                          <span className="font-bold">困难原因归档:</span> {task.difficultyReason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===================== TAB 5: 健康监测 (日常记录 + 量表 + 配对与权限 + 联系医护) ===================== */}
          {activeTab === 'health' && (
            <div className="space-y-4">
              {/* 子Tab切换 */}
              <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-2xl text-xs">
                {[
                  { id: 'records', label: '📝 日常记录' },
                  { id: 'scales', label: '📊 量表测评' },
                  { id: 'permissions', label: '🔐 配对权限' },
                  { id: 'contact', label: '📞 联系医护' }
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setHealthSubTab(sub.id as any)}
                    className={`py-2 rounded-xl font-bold transition-all text-center ${
                      healthSubTab === sub.id ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              {/* 1. 日常记录 */}
              {healthSubTab === 'records' && (
                <div className="space-y-4">
                  {!isPatient && permission && (!permission.shareDiet || !permission.shareWeight || !permission.shareSymptoms) && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>患者已自主关闭部分记录类型的共享查看权限。</span>
                    </div>
                  )}

                  {/* 记录录入大卡片 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-slate-900 text-base">
                        今日营养监测记录
                      </h3>
                      <span className="text-xs text-slate-500 font-medium">
                        {isProxyRecord ? '👩 照顾者代录' : '👴 患者自报'}
                      </span>
                    </div>

                    {/* 1. 进食量 5 档点选 */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-2">
                        1. 单餐实际进食量 (以标准小碗约250ml为基准):
                      </label>
                      <div className="grid grid-cols-5 gap-1.5 text-center">
                        {[
                          { level: 1, label: '极少', desc: '<1/4碗' },
                          { level: 2, label: '少量', desc: '约1/4碗' },
                          { level: 3, label: '半量', desc: '约1/2碗' },
                          { level: 4, label: '大半', desc: '约3/4碗' },
                          { level: 5, label: '整餐', desc: '约1整碗' }
                        ].map((item) => (
                          <button
                            key={item.level}
                            type="button"
                            onClick={() => setDietLevel(item.level as IntakeLevel)}
                            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all min-h-[58px] ${
                              dietLevel === item.level
                                ? 'bg-emerald-700 text-white border-emerald-700 font-bold shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-xs font-bold">{item.level}档</span>
                            <span className="text-[10px] opacity-80 mt-0.5">{item.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 食物内容 + 语音转文字直达按钮 */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700">食物与餐次说明:</label>
                        <button
                          type="button"
                          onClick={handleSimulateVoiceInput}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            isRecordingVoice ? 'bg-rose-600 text-white animate-pulse' : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                          }`}
                        >
                          {isRecordingVoice ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                          <span>{isRecordingVoice ? '松开结束录音' : '🎙️ 语音输入转文字'}</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={dietFood}
                        onChange={(e) => setDietFood(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-emerald-600"
                        placeholder="例如：细烂稠米粥半碗、蛋花肉末羹"
                      />
                    </div>

                    {/* 2. 晨起空腹体重快捷步进器 */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        2. 今晨空腹体重 (公斤/kg):
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setWeightValue(prev => Math.round((prev - 0.1) * 10) / 10)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 text-sm"
                        >
                          -0.1
                        </button>
                        <div className="flex-1 text-center bg-slate-50 py-2 rounded-xl border border-slate-200">
                          <span className="font-mono font-bold text-xl text-slate-900">{weightValue.toFixed(1)}</span>
                          <span className="text-xs text-slate-500 ml-1">kg</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setWeightValue(prev => Math.round((prev + 0.1) * 10) / 10)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 text-sm"
                        >
                          +0.1
                        </button>
                      </div>
                    </div>

                    {/* 3. 常见不适症状 (0~3分) */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">
                        3. 进食后不适症状评分 (0分=无，1分=轻微，2分=中度，3分=重度):
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          { key: 'earlySatiety', name: '早饱感(两口就饱)' },
                          { key: 'abdominalDistension', name: '腹部饱胀' },
                          { key: 'nauseaVomiting', name: '恶心/呕吐' },
                          { key: 'reflux', name: '反酸/烧心' },
                          { key: 'dumpingSyndrome', name: '倾倒(心慌头晕)' },
                          { key: 'diarrhea', name: '腹泻' }
                        ].map((sym) => (
                          <div key={sym.key} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex justify-between items-center">
                            <span className="text-slate-800 font-medium">{sym.name}</span>
                            <select
                              value={(symptomScores as any)[sym.key]}
                              onChange={(e) => setSymptomScores({ ...symptomScores, [sym.key]: parseInt(e.target.value) })}
                              className="bg-white border border-slate-300 rounded-lg px-2 py-0.5 font-bold text-emerald-800 text-xs"
                            >
                              <option value="0">0 无</option>
                              <option value="1">1 轻</option>
                              <option value="2">2 中</option>
                              <option value="3">3 重</option>
                            </select>
                          </div>
                        ))}
                      </div>

                      {/* 4. 危险红旗征象提示 */}
                      <div className="mt-2 p-3 bg-rose-50 border-2 border-rose-300 rounded-xl">
                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={symptomScores.hasRedFlag}
                            onChange={(e) => setSymptomScores({ ...symptomScores, hasRedFlag: e.target.checked })}
                            className="mt-0.5 w-4 h-4 text-rose-600 rounded-sm"
                          />
                          <div>
                            <span className="text-xs font-bold text-rose-900 flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4 text-rose-600" />
                              红旗危急征象（出现任一项立即勾选报警）
                            </span>
                            <p className="text-[11px] text-rose-700 mt-0.5 leading-snug">
                              体温高于38.5℃ / 突发剧烈腹痛 / 伤口渗血裂开 / 呕血或排黑便
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* 提交按钮 */}
                    <button
                      onClick={async () => {
                        const record = await tdimApi.addHealthRecord({
                          dyadId: patient.dyadPairId || 'PAIR_0001',
                          recorderId: userObj.id,
                          recorderRole: role,
                          isProxy: isProxyRecord,
                          voiceInputUsed: !!voiceTranscript,
                          recordType: 'symptom',
                          dietData: {
                            mealTime: '当日正餐/加餐',
                            foodType: dietFood,
                            intakeLevel: dietLevel,
                            notes: voiceTranscript || '常规打卡'
                          },
                          weightData: {
                            weightKg: weightValue,
                            measuredAt: new Date().toISOString()
                          },
                          symptomData: symptomScores
                        });

                        if (record.triageResult?.level === 'emergency') {
                          alert(`【⚠️ 决策树紧急报警】\n\n${record.triageResult.advice}`);
                        } else if (record.triageResult?.level === 'contact_nurse') {
                          alert(`【⚡ 决策树建议】\n\n${record.triageResult.advice}`);
                        } else {
                          setActionNotice({ type: 'success', msg: '监测数据已保存！决策树评估为常规居家照护。' });
                        }
                        reloadData();
                      }}
                      className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition-colors shadow-xs"
                    >
                      保存监测记录并提交规则评估
                    </button>
                  </div>

                  {/* 历史记录简览 */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700">近期监测打卡 ({healthRecords.length}条):</span>
                    {healthRecords.slice(0, 4).map((r) => (
                      <div key={r.id} className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex justify-between items-center text-slate-500">
                          <span>{new Date(r.createdAt).toLocaleString([], { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="font-bold text-slate-800">{r.isProxy ? '照顾者代录' : '患者自报'}</span>
                        </div>
                        {r.dietData && (
                          <div className="text-slate-800">
                            进食: {r.dietData.intakeLevel}档 · {r.dietData.foodType}
                          </div>
                        )}
                        {r.triageResult && (
                          <div className={`p-2 rounded-lg font-medium text-[11px] ${
                            r.triageResult.level === 'emergency'
                              ? 'bg-rose-50 text-rose-900 border border-rose-200'
                              : r.triageResult.level === 'contact_nurse'
                              ? 'bg-amber-50 text-amber-900 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                          }`}>
                            {r.triageResult.alertTitle}: {r.triageResult.advice}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. 量表测评 */}
              {healthSubTab === 'scales' && (
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5 text-xs text-purple-900 space-y-1">
                    <span className="font-bold text-sm block">课题终末可用性与健康量表测评</span>
                    <p>依据开题报告第 31~35 页设计：出院后第 29~35 天由患者与照顾者独立完成 SUS 可用性评分与 ZBI-12 照顾者负担量表。</p>
                  </div>

                  {/* 附录 C4: 系统可用性量表 (SUS) */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-purple-700" />
                        附录 C4 中文版系统可用性量表 (SUS)
                      </h3>
                      <span className="text-xs text-slate-400">10条目 (1~5分)</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {[
                        '1. 我愿意经常使用这个系统',
                        '2. 我发现这个系统太复杂',
                        '3. 我认为这个系统使用起来很容易',
                        '4. 我认为需要技术人员帮助才能使用',
                        '5. 我发现系统很好地集成了各种功能',
                        '6. 发现很多操作结果和预想功能不一致',
                        '7. 我想大多数用户能很快学会使用',
                        '8. 我发现这个系统使用起来很别扭',
                        '9. 我对熟练掌握这个系统很有信心',
                        '10. 在使用这个系统前，我需要学习很多知识'
                      ].map((title, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                          <span className="text-slate-800 font-medium text-xs flex-1 pr-2">{title}</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((score) => (
                              <button
                                key={score}
                                type="button"
                                onClick={() => {
                                  const newArr = [...susAnswers];
                                  newArr[idx] = score;
                                  setSusAnswers(newArr);
                                }}
                                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                                  susAnswers[idx] === score
                                    ? 'bg-purple-700 text-white'
                                    : 'bg-white border border-slate-200 text-slate-600'
                                }`}
                              >
                                {score}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={async () => {
                        const res = await tdimApi.submitSusScale(patient.dyadPairId || 'PAIR_0001', userObj.id, role, susAnswers);
                        setSusResultScore(res.totalScore);
                        setActionNotice({ type: 'success', msg: `SUS 提交成功！标准转换总分: ${res.totalScore} / 100 分` });
                        reloadData();
                      }}
                      className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                    >
                      计算并保存 SUS 总分 (公式: 奇减1+偶减5乘以2.5)
                    </button>

                    {susResultScore !== null && (
                      <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 text-center">
                        <span className="text-xs text-purple-900 block font-semibold">您的可用性评价标准得分:</span>
                        <span className="text-3xl font-mono font-bold text-purple-950">{susResultScore} 分</span>
                        <span className="text-[11px] text-purple-800 block mt-1">
                          {susResultScore >= 80 ? '🌟 优秀可用性水平 (Grade A / 可行性极高)' : '良好可用性水平 (具备临床推广价值)'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 附录 C6: 照顾者专属填写 ZBI-12 照顾者负担量表 */}
                  {!isPatient && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 text-sm">附录 C6 Zarit 照顾者负担量表 (ZBI-12)</h3>
                        <span className="text-xs text-slate-400">12条目 (0~4分)</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        {[
                          '1. 觉得花时间在亲人身上导致自己没有足够时间',
                          '2. 因照料亲人同时应对家庭工作而觉得有压力',
                          '3. 和亲人在一起时感到生气或烦躁',
                          '4. 觉得负面影响了和其他家人朋友的关系',
                          '5. 和亲人在一起时感到不自在',
                          '6. 觉得因为照顾亲人而损害到自己的健康',
                          '7. 觉得因照料亲人而不能得到想要的私人空间',
                          '8. 觉得因为照顾亲人而损害到了社交生活',
                          '9. 觉得自从亲人患病后自己对生活失去控制',
                          '10. 觉得不能确定要为亲人做什么',
                          '11. 觉得应该为亲人做得更多',
                          '12. 觉得能把亲人照顾得更好'
                        ].map((t, i) => (
                          <div key={i} className="p-2 bg-slate-50 rounded-lg flex justify-between items-center">
                            <span className="text-slate-700 truncate pr-2">{t}</span>
                            <select
                              value={zbiAnswers[i]}
                              onChange={(e) => {
                                const arr = [...zbiAnswers];
                                arr[i] = parseInt(e.target.value);
                                setZbiAnswers(arr);
                              }}
                              className="bg-white border rounded px-1.5 py-0.5 text-xs font-bold"
                            >
                              <option value="0">0 从不</option>
                              <option value="1">1 很少</option>
                              <option value="2">2 有时</option>
                              <option value="3">3 经常</option>
                              <option value="4">4 总是</option>
                            </select>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={async () => {
                          const res = await tdimApi.submitZbiScale(userObj.id, 'terminal', zbiAnswers);
                          setZbiResultScore(res.totalScore);
                          setActionNotice({ type: 'success', msg: `ZBI-12 提交成功！总分: ${res.totalScore} / 48 分` });
                          reloadData();
                        }}
                        className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs"
                      >
                        保存 ZBI-12 照顾者负担量表
                      </button>

                      {zbiResultScore !== null && (
                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-center">
                          <span className="text-xs text-blue-900 block font-semibold">主观照护负担得分:</span>
                          <span className="text-2xl font-mono font-bold text-blue-950">{zbiResultScore} / 48 分</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 3. 配对与共享权限中心 */}
              {healthSubTab === 'permissions' && (
                <div className="space-y-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-emerald-700" />
                      二元配对管理 (1对1精准绑定)
                    </h3>

                    {isPaired ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">当前绑定伴侣:</span>
                          <span className="font-bold text-emerald-950 text-sm">{partnerName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          配对编号: {pair?.id} · 绑定时间: {pair?.pairedAt ? new Date(pair.pairedAt).toLocaleDateString() : '已激活'}
                        </div>

                        <button
                          onClick={async () => {
                            if (confirm('开题报告严格规定：解除配对后，照顾者将立即失去所有数据访问权限。确认解除吗？')) {
                              await tdimApi.unpair(userObj.id, pair!.id);
                              setActionNotice({ type: 'warn', msg: '配对已解除，照顾者已即刻撤权！' });
                              reloadData();
                            }
                          }}
                          className="w-full mt-2 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          解除二元配对 (即刻撤回数据访问)
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {isPatient ? (
                          <div className="space-y-2 text-xs">
                            <p className="text-slate-600">点击生成6位有限时效动态配对码，由照顾者在手机输入：</p>
                            <button
                              onClick={async () => {
                                const code = await tdimApi.generatePairCode(patient.id);
                                setGeneratedCode(code);
                                setActionNotice({ type: 'success', msg: `配对码: ${code} (10分钟有效)` });
                              }}
                              className="w-full py-2.5 bg-emerald-700 text-white font-bold rounded-xl text-xs hover:bg-emerald-800"
                            >
                              生成6位动态配对码
                            </button>
                            {generatedCode && (
                              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-center">
                                <span className="text-xs text-amber-900 block font-semibold">动态配对码 (10分钟有效):</span>
                                <span className="text-2xl font-mono font-bold text-amber-950 tracking-widest">{generatedCode}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2 text-xs">
                            <p className="text-slate-600">请输入患者屏幕显示的6位动态配对码：</p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                maxLength={6}
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value)}
                                placeholder="输入6位数字配对码"
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-center font-mono font-bold tracking-widest text-base"
                              />
                              <button
                                onClick={async () => {
                                  const res = await tdimApi.confirmPairing(caregiver.id, inputCode);
                                  if (res.success) {
                                    setActionNotice({ type: 'success', msg: '配对绑定成功！' });
                                    reloadData();
                                  } else {
                                    setActionNotice({ type: 'error', msg: res.message });
                                  }
                                }}
                                className="px-4 py-2 bg-blue-700 text-white font-bold rounded-xl text-xs hover:bg-blue-800"
                              >
                                完成绑定
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 患者端专属共享权限开关 */}
                  {isPatient && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                      <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-emerald-700" />
                        授权共享范围 (患者自主开启/关闭)
                      </h3>
                      <div className="space-y-2 text-xs">
                        {[
                          { key: 'shareDiet', label: '共享饮食记录与食谱', enabled: permission?.shareDiet },
                          { key: 'shareWeight', label: '共享晨起空腹体重', enabled: permission?.shareWeight },
                          { key: 'shareSymptoms', label: '共享不适症状及分诊评分', enabled: permission?.shareSymptoms }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="font-medium text-slate-800">{item.label}</span>
                            <button
                              onClick={async () => {
                                if (!permission) return;
                                const update = {
                                  shareDiet: item.key === 'shareDiet' ? !permission.shareDiet : permission.shareDiet,
                                  shareWeight: item.key === 'shareWeight' ? !permission.shareWeight : permission.shareWeight,
                                  shareSymptoms: item.key === 'shareSymptoms' ? !permission.shareSymptoms : permission.shareSymptoms
                                };
                                const p = await tdimApi.updatePermissions(patient.id, update);
                                setPermission(p);
                                setActionNotice({ type: 'success', msg: '共享授权状态已更新' });
                                reloadData();
                              }}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                item.enabled ? 'bg-emerald-700 text-white' : 'bg-slate-300 text-slate-700'
                              }`}
                            >
                              {item.enabled ? '已共享' : '已关闭'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 4. 联系医护 */}
              {healthSubTab === 'contact' && (
                <div className="space-y-4">
                  {/* 应急热线 */}
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-2xs space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                        <PhoneCall className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-rose-950 text-sm">医院绿色通道与科室热线</h4>
                        <span className="text-[11px] text-rose-700">南昌大学第一附属医院胃肠外科</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-rose-100 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 block">东湖院区急诊外科</span>
                          <span className="text-slate-500 text-[11px]">24小时急诊救治绿色通道</span>
                        </div>
                        <a
                          href="tel:0791-88692748"
                          onClick={(e) => { e.preventDefault(); alert('模拟拨打急诊电话: 0791-88692748 (东湖急诊外科)'); }}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-2xs"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>一键呼叫</span>
                        </a>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-rose-100 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 block">象湖院区胃肠外科病房护士站</span>
                          <span className="text-slate-500 text-[11px]">日间随访咨询 (08:00~17:30)</span>
                        </div>
                        <a
                          href="tel:0791-88695120"
                          onClick={(e) => { e.preventDefault(); alert('模拟拨打象湖病房护士站: 0791-88695120'); }}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-2xs"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>一键呼叫</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* 留言反馈 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-emerald-700" />
                      给责任护士留言
                    </h4>
                    <p className="text-xs text-slate-500">
                      如非紧急情况（常规饮食疑问或出院后复诊安排），您可在此留言，管床护士将在12小时内后台回复。
                    </p>

                    <textarea
                      value={nurseMessageText}
                      onChange={(e) => setNurseMessageText(e.target.value)}
                      rows={3}
                      placeholder="请输入您的留言内容..."
                      className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600"
                    />

                    <button
                      onClick={async () => {
                        if (!nurseMessageText.trim()) return;
                        await tdimApi.sendNurseMessage(patient.dyadPairId || 'PAIR_0001', userObj.id, nurseMessageText);
                        setNurseMessageText('');
                        setActionNotice({ type: 'success', msg: '留言已提交给主管护士！' });
                        reloadData();
                      }}
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs"
                    >
                      发送留言
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          </>
        )}

        {/* 商品兑换确认对话框 */}
        {selectedProductToRedeem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 inline-block mb-1">
                    {selectedProductToRedeem.badge}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    确认兑换【{selectedProductToRedeem.name}】
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedProductToRedeem(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
                >
                  ✕
                </button>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">消耗积分:</span>
                  <span className="font-mono font-bold text-amber-700 text-sm">{selectedProductToRedeem.costPoints} 积分</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">当前剩余可用积分:</span>
                  <span className="font-mono font-bold text-slate-800">{pointsAcc?.pointsBalance || 0} 积分</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500">兑换后结余:</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {(pointsAcc?.pointsBalance || 0) - selectedProductToRedeem.costPoints} 积分
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700 block">礼品领取方式 (唯一方式):</label>
                <div className="p-3 rounded-2xl border border-emerald-300 bg-emerald-50/70 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">免费快递寄送到家</span>
                      <span className="text-[10px] text-emerald-800 font-medium">科研课题全额包邮 · 受试者零费用</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-600 bg-white/90 p-2.5 rounded-xl border border-emerald-200 leading-relaxed space-y-1">
                    <p>
                      • <strong>由科研团队负责邮资</strong>，寄送至档案预留家庭地址。
                    </p>
                    <p>
                      • 兑换成功后请添加研究团队微信：<span className="font-mono font-bold text-emerald-900 bg-emerald-100/70 px-1.5 py-0.5 rounded border border-emerald-300">qwer131606</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setSelectedProductToRedeem(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  再想想
                </button>
                <button
                  onClick={() => handleConfirmRedeem(selectedProductToRedeem)}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  确认扣分兑换
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 兑换成功专属提醒弹窗 (遵照要求展示微信号及寄送说明) */}
        {redeemSuccessInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-emerald-200 text-center animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center text-3xl shadow-inner border border-emerald-200">
                🎉
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 inline-block">
                  礼品兑换成功 · 课题全额包邮
                </span>
                <h3 className="font-bold text-slate-900 text-lg">
                  恭喜您兑换成功！
                </h3>
                <p className="text-xs text-slate-500">
                  已扣除 <span className="font-mono font-bold text-amber-700">{redeemSuccessInfo.costPoints}</span> 积分，成功兑换【{redeemSuccessInfo.productName}】
                </p>
              </div>

              {/* 核心指引卡片 */}
              <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-slate-50 p-4 rounded-2xl border border-emerald-200 text-left space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <span className="text-emerald-700 text-sm">💬</span>
                    <span>请添加研究团队微信：</span>
                  </div>

                  <div className="flex items-center justify-between bg-white px-3 py-2.5 rounded-xl border border-emerald-300 shadow-2xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 block">科研助手微信号</span>
                      <span className="font-mono font-bold text-base text-emerald-950 tracking-wider">
                        qwer131606
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText('qwer131606');
                        }
                        setCopiedWeChat(true);
                        setTimeout(() => setCopiedWeChat(false), 3000);
                      }}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-xs"
                    >
                      {copiedWeChat ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedWeChat ? '已复制' : '复制微信号'}</span>
                    </button>
                  </div>

                  {copiedWeChat && (
                    <div className="text-[11px] text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-300 font-semibold text-center animate-in fade-in">
                      ✓ 微信号已复制！可打开微信搜索添加好友
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-emerald-200/80 space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold shrink-0 mt-0.5">📦</span>
                    <p className="text-[11px] leading-relaxed text-slate-600">
                      <strong>由科研团队负责邮资，寄送至档案预留家庭地址。</strong>
                    </p>
                  </div>
                  <div className="bg-white/90 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
                    <div>• 受试者档案编号：<span className="font-mono font-bold text-slate-800">{currentUser.researchId}</span></div>
                    <div>• 归属院区：<span className="font-bold text-slate-800">{currentUser.campus === 'donghu' ? '东湖院区' : '象湖院区'}</span></div>
                    <div>• 收货说明：科研团队将按入组档案家庭地址发货，如有地址变更请直接在微信告知研究团队。</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setRedeemSuccessInfo(null)}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                我知道了，已记住微信号
              </button>
            </div>
          </div>
        )}

        </div>

        {/* 底部原生Tab导航栏 (5大核心板块清晰排布，符合微信小程序官方规范) */}
        <div className="bg-slate-50 border-t border-slate-200 px-2 py-2 grid grid-cols-5 gap-1 text-center">
          {[
            { id: 'home', label: '今日康复', icon: Clock },
            { id: 'science', label: '科普讲堂', icon: BookMarked },
            { id: 'ai_chat', label: '智能问答', icon: Bot },
            { id: 'dyad', label: '二元管理', icon: HelpCircle },
            { id: 'health', label: '健康监测', icon: ClipboardList }
          ].map((tab) => {
            const Icon = tab.icon;
            const isCur = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setReadingArticle(null);
                }}
                className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
                  isCur ? 'text-emerald-950 font-bold bg-emerald-100/80 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isCur ? 'stroke-[2.5] text-emerald-800' : 'stroke-2'}`} />
                <span className={`text-[10px] mt-0.5 truncate w-full ${isCur ? 'font-bold text-emerald-900' : 'font-medium'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center p-3 sm:p-6 bg-slate-100 min-h-[calc(100vh-60px)]">
      {/* 顶部模拟控制横条 */}
      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-2xl p-3.5 mb-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* 左侧：单机 vs 双端联动切换 */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">演示模式:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('single')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'single' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              单手机视图
            </button>
            <button
              onClick={() => setViewMode('dual')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'dual' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              左右双端并排联动演示 (患者+照顾者同屏答辩)
            </button>
          </div>
        </div>

        {/* 右侧：单机身份选择与大字模式 */}
        <div className="flex items-center gap-2">
          {viewMode === 'single' && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setActiveRole('patient')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  activeRole === 'patient' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                👴 患者端 (P0001)
              </button>
              <button
                onClick={() => setActiveRole('caregiver')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  activeRole === 'caregiver' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                👩 照顾者端 (C0001)
              </button>
            </div>
          )}

          <button
            onClick={() => setSeniorMode(!seniorMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              seniorMode
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            适老特大字号: {seniorMode ? '已开启' : '普通'}
          </button>
        </div>
      </div>

      {/* 手机界面渲染区 */}
      {viewMode === 'single' ? (
        <div className="w-full flex justify-center">
          {renderPhoneScreen(activeRole)}
        </div>
      ) : (
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
          <div className="w-full flex flex-col items-center">
            <div className="mb-2 font-bold text-xs text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
              <span>👴 患者端视窗 (P0001 王大伯)</span>
            </div>
            {renderPhoneScreen('patient')}
          </div>
          <div className="w-full flex flex-col items-center">
            <div className="mb-2 font-bold text-xs text-blue-900 bg-blue-100 px-3 py-1 rounded-full flex items-center gap-1">
              <span>👩 照顾者端视窗 (C0001 王女士)</span>
            </div>
            {renderPhoneScreen('caregiver')}
          </div>
        </div>
      )}
    </div>
  );
};
