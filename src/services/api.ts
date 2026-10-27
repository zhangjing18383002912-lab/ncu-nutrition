/**
 * TDIM 全栈接口客户端与模拟响应器 (API Client & Full-fidelity Mock Layer)
 * 严格对齐南昌大学医学院张靖硕士开题报告
 */

import { tdimStore } from './store';
import {
  RecoveryStage,
  UserRole,
  HospitalCampus,
  AiChatMessage,
  NutritionIssueJudgment,
  PatientEatingExperience,
  CaregiverExecutionBurden
} from '../types/tdim';
import { DecisionTreeEngine } from './decisionEngine';
import { mcpMedicalService, MCP_MEDICAL_DATABASE } from './mcpMedicalService';

export const tdimApi = {
  // 1. 用户与身份
  async getProfile(userId: string) {
    const user = tdimStore.users.get(userId);
    if (!user) throw new Error('用户不存在');
    const stage = tdimStore.computeStage(user.dischargeDate);
    return { user, stage };
  },

  async updateSurgeryInfo(userId: string, surgeryType: any, dietTolerance: any) {
    const user = tdimStore.users.get(userId);
    if (!user) throw new Error('用户不存在');
    user.surgeryType = surgeryType;
    user.dietTolerance = dietTolerance;
    tdimStore.recordAudit(userId, user.role, '更新病历信息', `手术方式: ${surgeryType}, 耐受程度: ${dietTolerance}`);
    return user;
  },

  // 2. 配对与二元空间
  async generatePairCode(patientId: string) {
    return tdimStore.generatePairCode(patientId);
  },

  async confirmPairing(caregiverId: string, pairCode: string) {
    return tdimStore.confirmPairingByCode(caregiverId, pairCode);
  },

  async unpair(operatorId: string, dyadId: string) {
    return tdimStore.unpairDyad(operatorId, dyadId);
  },

  // 3. 营养指导 (4阶段自适应与决策树筛选)
  async getGuidanceItems(patientId: string) {
    const patient = tdimStore.users.get(patientId);
    const stage = tdimStore.computeStage(patient?.dischargeDate);

    // 运行指导筛选决策树
    const guidanceTree = tdimStore.decisionTrees.get('TREE_GUIDANCE_FILTER')!;
    const { output, hitPath, log } = DecisionTreeEngine.runTree(guidanceTree, {
      surgeryType: patient?.surgeryType,
      dietTolerance: patient?.dietTolerance
    });

    if (!log.isSimulation) {
      tdimStore.decisionLogs.push(log);
    }

    const items = tdimStore.guidanceItems.filter(item => item.stage === stage);
    // 依据决策树标签筛选条件性条目
    const filteredItems = items.filter(item => {
      if (!item.isConditional) return true;
      if (output.filterTags?.includes('total_gastrectomy_special') && (item.id.includes('PREP_03') || item.id.includes('M1_02'))) return true;
      if (output.filterTags?.includes('poor_tolerance_special') && item.id.includes('W1_02')) return true;
      return false;
    });

    if (patient) {
      tdimStore.recordEffectiveUsage(patient.researchId, stage, 'view_guidance', `查阅${stage}阶段指导条目(${filteredItems.length}条)`);
    }

    return {
      stage,
      decisionOutput: output,
      rulePath: hitPath.join(' -> '),
      items: filteredItems,
      missingWarning: output.reason === 'SURGERY_TYPE_MISSING' ? output.advice : null
    };
  },

  // 4. 理解核对 (二元评价)
  async getQuestions(stage: RecoveryStage) {
    return tdimStore.questions.filter(q => q.stage === stage);
  },

  async submitAppraisalAnswer(payload: {
    questionId: string;
    dyadId: string;
    userId: string;
    userRole: UserRole;
    answer: string;
    attemptNumber: 1 | 2;
    isProxyOrDiscussed: boolean;
  }) {
    const q = tdimStore.questions.find(item => item.id === payload.questionId);
    const answerObj = {
      id: 'ANS_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      questionId: payload.questionId,
      questionVersion: q?.version || 'v1.0-ncuh',
      dyadId: payload.dyadId,
      userId: payload.userId,
      userRole: payload.userRole,
      answer: payload.answer,
      attemptNumber: payload.attemptNumber,
      isProxyOrDiscussed: payload.isProxyOrDiscussed,
      submittedAt: new Date().toISOString()
    };
    tdimStore.appraisalAnswers.push(answerObj);

    const user = tdimStore.users.get(payload.userId);
    if (user) {
      tdimStore.recordEffectiveUsage(
        user.researchId,
        tdimStore.computeStage(user.dischargeDate),
        'submit_appraisal',
        `提交核对作答题目 ${payload.questionId} (第${payload.attemptNumber}次作答, 代答标记:${payload.isProxyOrDiscussed})`
      );
    }

    return tdimStore.evaluateAppraisalOutcome(payload.questionId, payload.dyadId, payload.attemptNumber);
  },

  async getAppraisalOutcome(questionId: string, dyadId: string, attemptNumber: 1 | 2 = 1) {
    return tdimStore.evaluateAppraisalOutcome(questionId, dyadId, attemptNumber);
  },

  // 4.1 二元评价核心支柱 1: 双方对同一营养问题判断 (Dyadic Judgment on Nutrition Issues)
  async getNutritionIssues(stage?: RecoveryStage) {
    return tdimStore.getNutritionIssues(stage);
  },

  async submitNutritionIssueAnswer(payload: {
    issueId: string;
    dyadId: string;
    userId: string;
    role: UserRole;
    answerKey: string;
    note?: string;
  }) {
    return tdimStore.submitNutritionIssueAnswer(
      payload.issueId,
      payload.dyadId,
      payload.userId,
      payload.role,
      payload.answerKey,
      payload.note
    );
  },

  // 4.2 二元评价核心支柱 2: 患者进食感受 (Patient Subjective Eating Sensations)
  async getEatingExperiences(dyadId: string) {
    return tdimStore.getEatingExperiences(dyadId);
  },

  async addEatingExperience(payload: Omit<PatientEatingExperience, 'id' | 'createdAt' | 'nurseClinicalTip'>) {
    return tdimStore.addEatingExperience(payload);
  },

  async addCaregiverEmpathyFeedback(payload: {
    experienceId: string;
    caregiverId: string;
    empathyMessage: string;
    careAdjustment: string;
  }) {
    return tdimStore.addCaregiverEmpathyFeedback(
      payload.experienceId,
      payload.caregiverId,
      payload.empathyMessage,
      payload.careAdjustment
    );
  },

  // 4.3 二元评价核心支柱 3: 照顾者执行困难 (Caregiver Execution Burdens)
  async getCaregiverBurdens(dyadId: string) {
    return tdimStore.getCaregiverBurdens(dyadId);
  },

  async addCaregiverBurden(payload: Omit<CaregiverExecutionBurden, 'id' | 'createdAt' | 'reliefStrategies'>) {
    return tdimStore.addCaregiverBurden(payload);
  },

  async addPatientGratitudeFeedback(payload: {
    burdenId: string;
    patientId: string;
    message: string;
  }) {
    return tdimStore.addPatientGratitudeFeedback(
      payload.burdenId,
      payload.patientId,
      payload.message
    );
  },

  // 5. 任务分工 (二元管理行为)
  async getTasks(dyadId: string, stage: RecoveryStage) {
    return Array.from(tdimStore.tasks.values()).filter(t => t.dyadId === dyadId && t.stage === stage);
  },

  async updateTaskAssignment(payload: {
    taskId: string;
    operatorRole: UserRole;
    proposedAssignee: any;
  }) {
    const task = tdimStore.tasks.get(payload.taskId);
    if (!task) throw new Error('任务不存在');

    task.proposedAssignee = payload.proposedAssignee;
    if (payload.operatorRole === 'patient') {
      task.patientAgreed = true;
      task.caregiverAgreed = false;
    } else {
      task.caregiverAgreed = true;
      task.patientAgreed = false;
    }
    task.isConfirmed = false;
    task.updatedAt = new Date().toISOString();
    return task;
  },

  async confirmTaskAgreement(taskId: string, operatorRole: UserRole) {
    const task = tdimStore.tasks.get(taskId);
    if (!task) throw new Error('任务不存在');

    if (operatorRole === 'patient') task.patientAgreed = true;
    if (operatorRole === 'caregiver') task.caregiverAgreed = true;

    if (task.patientAgreed && task.caregiverAgreed) {
      task.isConfirmed = true;
    }
    task.updatedAt = new Date().toISOString();
    return task;
  },

  async updateTaskExecStatus(payload: {
    taskId: string;
    execStatus: any;
    difficultyReason?: string;
  }) {
    const task = tdimStore.tasks.get(payload.taskId);
    if (!task) throw new Error('任务不存在');

    if ((payload.execStatus === 'difficult' || payload.execStatus === 'not_applicable') && !payload.difficultyReason?.trim()) {
      throw new Error('执行有困难或不适用时，必须填写具体原因说明');
    }

    task.execStatus = payload.execStatus;
    task.difficultyReason = payload.difficultyReason;
    task.updatedAt = new Date().toISOString();
    return task;
  },

  // 6. 记录与共享
  async getHealthRecords(dyadId: string, viewerRole: UserRole, patientId: string) {
    const perm = tdimStore.permissions.get(patientId) || {
      patientId,
      shareDiet: true,
      shareWeight: true,
      shareSymptoms: true,
      updatedAt: ''
    };

    const all = tdimStore.healthRecords.filter(r => r.dyadId === dyadId);

    if (viewerRole === 'caregiver') {
      return all.filter(r => {
        if (r.recordType === 'diet' && !perm.shareDiet) return false;
        if (r.recordType === 'weight' && !perm.shareWeight) return false;
        if (r.recordType === 'symptom' && !perm.shareSymptoms) return false;
        return true;
      });
    }

    return all;
  },

  async addHealthRecord(recordData: any) {
    return tdimStore.addHealthRecord(recordData);
  },

  async getPermissions(patientId: string) {
    return tdimStore.permissions.get(patientId) || {
      patientId,
      shareDiet: true,
      shareWeight: true,
      shareSymptoms: true,
      updatedAt: new Date().toISOString()
    };
  },

  async updatePermissions(patientId: string, update: { shareDiet: boolean; shareWeight: boolean; shareSymptoms: boolean }) {
    const perm = {
      patientId,
      ...update,
      updatedAt: new Date().toISOString()
    };
    tdimStore.permissions.set(patientId, perm);
    tdimStore.recordAudit(patientId, 'patient', '更新共享授权', `饮食:${update.shareDiet}, 体重:${update.shareWeight}, 症状:${update.shareSymptoms}`);
    return perm;
  },

  // 7. 智能 AI 问答助手 (支持调用后端 /api/ai/qa 或本地临床知识库兜底)
  async askAiAssistant(question: string, userRole: UserRole, stage: string, surgeryType?: string): Promise<string> {
    const user = Array.from(tdimStore.users.values()).find(u => u.role === userRole);
    if (user) {
      tdimStore.recordEffectiveUsage(user.researchId, tdimStore.computeStage(user.dischargeDate), 'ask_ai_assistant', `咨询问题: ${question.slice(0, 30)}...`);
    }

    try {
      const res = await fetch('/api/ai/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, userRole, stage, surgeryType })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.answer) return data.answer;
      }
    } catch (e) {
      // 网络或纯前端环境降级到本地规则匹配
    }

    // 本地临床专家知识库答复库 (全面覆盖胃癌术后营养、饮食红绿灯、并发症与二元照护)
    const qLower = question.toLowerCase();

    // 循证溯源生成器 (基于 ModelScope 医学查询MCP 与国内外指南)
    const ev = mcpMedicalService.getEvidenceSourceFor(question);
    const evidenceFooter = `\n\n🔬【MCP医学检索循证溯源】\n• 权威数据源：${ev.database} (${ev.citation})\n• 临床证据等级：${ev.evidenceLevel}${ev.meshId ? ` | ${ev.meshId}` : ''}${ev.icd10 ? ` | ${ev.icd10}` : ''}${ev.standardTerm ? ` | 规范审定名: ${ev.standardTerm}` : ''}`;

    let reply = '';
    // 1. 食物禁忌与红绿灯食物
    if (qLower.includes('柿子') || qLower.includes('黑枣') || qLower.includes('山楂')) {
      reply = '【⚠️ 食物红灯警告 · 绝对禁食】\n千万不能吃！生柿子、柿饼、黑枣和山楂含有大量高浓度“鞣酸”与果胶。胃切除后消化液改变，鞣酸会与蛋白质迅速凝聚成坚如石头的“胃石”，极易堵塞代胃或小肠导致急性肠梗阻，严重时需急诊开腹手术！';
    } else if (qLower.includes('年糕') || qLower.includes('汤圆') || qLower.includes('粽子') || qLower.includes('糯米')) {
      reply = '【⚠️ 食物红灯警告 · 绝对禁食】\n术后早期严禁食用年糕、汤圆、粽子等黏性极高的糯米食品！切胃后缺乏正常的胃机械研磨和幽门缓冲，黏性食物极易在吻合口聚集成团造成急性吻合口完全梗阻，引起严重剧痛和剧烈呕吐！';
    } else if (qLower.includes('肉汤') || qLower.includes('鸡汤') || qLower.includes('排骨汤')) {
      reply = '【护士长辟谣提示】\n很多家属认为“营养全在汤里”，其实这是大误区！熬煮很久的浓肉汤里90%以上是脂肪、嘌呤和无机盐，水溶性蛋白质不足2%，真正的优质蛋白质都在肉渣里！\n💡 建议：喝汤前必须彻底撇去浮油（防高脂腹泻与胆汁反流），并将瘦肉剁成细肉糜做成肉饼羹给患者吃肉！';
    } else if (qLower.includes('牛奶') || qLower.includes('豆浆')) {
      reply = '【🟡 食物黄灯提示 · 谨慎少量】\n部分胃切除患者术后可能存在暂时性乳糖酶缺乏。如果喝牛奶，建议先从50ml微温牛奶开始少量尝试，观察有无腹胀肠鸣；豆浆需煮透并双层滤网彻底去渣，小口慢饮。';
    } else if (qLower.includes('倾倒') || qLower.includes('心慌') || qLower.includes('出冷汗') || qLower.includes('头晕')) {
      reply = '【护士长提示】您好！餐后15~30分钟突发心慌、出冷汗是典型的“早期倾倒综合征”。这主要是因为切胃后食物迅速涌入小肠引起有效循环血量暂时不足。\n\n💡 即刻应对三步法：\n1. 立即协助患者就地平卧或上半身垫高20度半卧位，安静休息20~30分钟；\n2. 饮食上严禁浓糖水、蛋糕甜点等高渗流质；\n3. 坚持“干稀分食”，饭前半小时和饭后半小时不宜大量喝汤喝水。';
    } else if (qLower.includes('全胃') || qLower.includes('贫血') || qLower.includes('b12') || qLower.includes('头晕乏力')) {
      reply = '【护士长提示】全胃切除后失去了分泌内因子的胃黏膜，维生素B12无法正常在回肠吸收，体内原有储备会在1~2年逐渐耗竭，极易引发巨幼红细胞贫血与手足麻木。\n\n💡 专家建议：\n出院后需定期（通常每2~3个月）至门诊肌肉注射补充维生素B12，并多吃深绿色蔬菜、遵医嘱化验血常规与血清铁蛋白。';
    } else if (qLower.includes('反酸') || qLower.includes('烧心') || qLower.includes('反流') || qLower.includes('睡') || qLower.includes('呛咳')) {
      reply = '【护士长提示】术后反流多为胆汁胰液的碱性反流，容易损伤食管黏膜。\n\n💡 居家护理四要点：\n1. 睡觉时将床头稍微抬高15~20厘米（垫高床头而非单纯垫枕头，利用重力防反流）；\n2. 睡前2~3小时严禁吃加餐和喝大量水；\n3. 忌浓茶、咖啡、巧克力及油腻煎炸食品；\n4. 衣服保持宽松，腰带不要勒得过紧以防腹压增高。';
    } else if (qLower.includes('鱼') || qLower.includes('虾') || qLower.includes('肉') || qLower.includes('吃什么') || qLower.includes('食谱') || qLower.includes('菜')) {
      reply = '【护士长提示】胃部调养期间，伤口与体力恢复极其依赖“优质蛋白质”！\n\n💡 备餐推荐清单：\n• 肉蛋水产：清蒸去皮龙利鱼碎、嫩鲈鱼肉、鲜虾肉泥、嫩蛋羹、肉末炖内酯豆腐；\n• 谷薯类：细烂稠米粥、发面小花卷（充分浸润细嚼）、去皮蒸山药泥；\n• 烹饪要诀：蒸、煮、炖至极软烂，进食时细嚼慢咽20~30次再咽下，避免干硬坚果粗纤维。';
    } else if (qLower.includes('ons') || qLower.includes('营养粉') || qLower.includes('全营养') || qLower.includes('配方奶')) {
      reply = '【护士长提示】口服全营养配方粉（ONS）是术后预防体重进行性下降的黄金武器！\n\n💡 冲调与服用诀窍：\n1. 水温控制在40~50℃（过热会破坏蛋白质与维生素活性）；\n2. 每次取小剂量（约100~150ml），放在两餐之间（如上午10点、下午3点）当加餐；\n3. 像品茶一样小口慢饮，用时15~20分钟喝完，避免一口气大口喝完引起腹胀腹泻。';
    } else if (qLower.includes('照顾') || qLower.includes('累') || qLower.includes('焦虑') || qLower.includes('家属')) {
      reply = '【护士长暖心关怀】照顾胃部手术调养期的亲人是一场身心考验，家属也是需要被关怀的“隐形守护者”！\n\n💡 二元协同建议：\n1. 善用平台的【任务分工】功能，将量体重、查体温、准备细软辅食明确分担；\n2. 与患者共同商量进食计划，多鼓励、少催促；\n3. 照顾者自己也要保证睡眠，有照护压力可随时在【留言咨询】中与责任护士倾诉。';
    } else if (qLower.includes('发热') || qLower.includes('高烧') || qLower.includes('腹痛') || qLower.includes('出血') || qLower.includes('黑便') || qLower.includes('裂开')) {
      reply = '【🚨 急危重症警报 · 立即就医】\n体温高于38.5℃、突发剧烈刀割样腹痛、腹部硬如板状、伤口大量渗液渗血、或排出柏油样黑便呕血，属于外科急危重症红旗征象！\n请立即前往南昌大学第一附属医院急诊外科或拨打120急救，途中保持患者禁食禁水、平卧安静！';
    } else {
      reply = '【护士长提示】胃部调养期间居家营养管理的核心是“少食多餐、干稀分食、细嚼慢咽”。建议每日分6~8餐，每餐5~7分饱，避免暴饮暴食。饮食以优质蛋白（鱼肉、蛋羹、豆腐）与细烂主食为主。如果出现高热超38.5℃、剧烈腹痛或呕血黑便等红旗征象，请立即前往急诊就医！';
    }

    return reply + evidenceFooter;
  },

  // 8. 附录量表提交
  async submitSusScale(dyadId: string, userId: string, userRole: UserRole, items: number[]) {
    return tdimStore.submitSusEvaluation(dyadId, userId, userRole, items);
  },

  async submitZbiScale(caregiverId: string, timing: 'baseline' | 'terminal', scores: number[]) {
    return tdimStore.submitZbi12Evaluation(caregiverId, timing, scores);
  },

  // 9. 医护留言
  async getMessages(dyadId: string) {
    return tdimStore.nurseMessages.filter(m => m.dyadId === dyadId);
  },

  async sendNurseMessage(dyadId: string, senderId: string, content: string) {
    const user = tdimStore.users.get(senderId);
    const msg: any = {
      id: 'MSG_' + Date.now(),
      dyadId,
      senderId,
      senderRole: user?.role || 'patient',
      senderName: user?.nickname || '患者/照顾者',
      content,
      createdAt: new Date().toISOString()
    };
    tdimStore.nurseMessages.unshift(msg);
    return msg;
  },

  async replyNurseMessage(messageId: string, reply: string, replierName: string) {
    const msg = tdimStore.nurseMessages.find(m => m.id === messageId);
    if (!msg) throw new Error('留言未找到');
    msg.reply = reply;
    msg.repliedAt = new Date().toISOString();
    msg.replierName = replierName;
    tdimStore.recordAudit('ADM01', 'admin', '回复患者留言', `回复留言 ${messageId}`);
    return msg;
  },

  // 10. 决策树测试沙盒
  testRunDecisionTree(treeId: string, input: Record<string, any>) {
    const tree = tdimStore.decisionTrees.get(treeId);
    if (!tree) throw new Error('未找到指定决策树');
    return DecisionTreeEngine.runTree(tree, input, true);
  },

  // 11. 管理员录入出院日期
  async setDischargeDate(patientId: string, dischargeDate: string | null) {
    const patient = tdimStore.users.get(patientId);
    if (!patient) throw new Error('患者不存在');
    patient.dischargeDate = dischargeDate;
    tdimStore.recordAudit('ADM01', 'admin', '核实录入实际出院日期', `为患者 ${patient.researchId} 录入出院日期: ${dischargeDate || '清空'}`);
    return patient;
  },

  // 12. 积分打卡与积分商城 API
  async getPointsAccount(userId: string) {
    return tdimStore.getPointsAccount(userId);
  },

  async checkInToday(userId: string) {
    return tdimStore.checkInToday(userId);
  },

  async getMallProducts() {
    return tdimStore.mallProducts;
  },

  async redeemMallProduct(userId: string, productId: string, deliveryMethod: 'express' | 'clinic_pickup' = 'express') {
    return tdimStore.redeemProduct(userId, productId, deliveryMethod);
  },

  async getPointsTransactions(userId: string) {
    return tdimStore.pointsTransactions.filter(t => t.userId === userId);
  },

  async getExchangeOrders() {
    return tdimStore.exchangeOrders;
  },

  async getBudgetPlan() {
    return tdimStore.getBudgetPlan();
  },

  async simulateStreakBreak(userId: string) {
    return tdimStore.simulateStreakBreak(userId);
  },

  // 13. 医学知识检索 MCP 引擎查询 (Termonline-Research-MCP 五大权威数据源聚合)
  async queryMedicalMcp(query: string) {
    return mcpMedicalService.searchMedicalKnowledgeMcp(query);
  },

  async getMcpDatabase() {
    return MCP_MEDICAL_DATABASE;
  },

  async getEvidenceForTopic(topic: string) {
    return mcpMedicalService.getEvidenceSourceFor(topic);
  },

  // 13. 科研数据去标识化导出 (CSV 格式，严格符合 SPSS/R 导入要求)
  exportResearchCsv() {
    const rows: string[] = [];
    rows.push('数据大类,研究编号,院区,康复阶段,指标项目,详细数值/选项,时间戳');

    tdimStore.users.forEach(u => {
      if (u.role === 'patient' && u.patientBaseline) {
        const b = u.patientBaseline;
        rows.push(`患者基线资料,${u.researchId},${u.campus},基线,年龄_性别_文化_分期,"年龄:${b.age},性别:${b.gender},文化:${b.education},分期:${b.pathologyStage},手术:${b.surgeryType}",${u.createdAt}`);
      }
      if (u.role === 'caregiver' && u.caregiverBaseline) {
        const c = u.caregiverBaseline;
        rows.push(`照顾者基线资料,${u.researchId},${u.campus},基线,关系_照料时长,"关系:${c.relationWithPatient},每日时长:${c.dailyCareHours}h,任务:${c.primaryTasks.join('|')}",${u.createdAt}`);
      }
    });

    tdimStore.susEvaluations.forEach(s => {
      const u = tdimStore.users.get(s.userId);
      rows.push(`系统可用性SUS,${u?.researchId || 'UNKNOWN'},${u?.campus || 'donghu'},终末评价,SUS总分(0-100),${s.totalScore}分_各题得分[${s.items.join('|')}],${s.submittedAt}`);
    });

    tdimStore.zbi12Evaluations.forEach(z => {
      const u = tdimStore.users.get(z.caregiverId);
      rows.push(`照顾者负担ZBI12,${u?.researchId || 'UNKNOWN'},${u?.campus || 'donghu'},${z.timing},ZBI总分(0-48),${z.totalScore}分_各题得分[${z.scores.join('|')}],${z.submittedAt}`);
    });

    tdimStore.biomarkers.forEach(b => {
      const u = tdimStore.users.get(b.patientId);
      rows.push(`临床营养生化指标,${u?.researchId || 'UNKNOWN'},${u?.campus || 'donghu'},${b.timing},生化检验,"BMI:${b.bmi},ALB:${b.alb}g/L,PA:${b.pa}mg/L,TP:${b.tp}g/L,Hb:${b.hb}g/L,淋巴细胞:${b.lymphocytes}",${b.measuredAt}`);
    });

    tdimStore.effectiveUsages.forEach(u => {
      rows.push(`有效使用依从性,${u.researchId},东湖/象湖,${u.stage},${u.actionType},"${u.payloadSummary.replace(/"/g, '""')}",${u.timestamp}`);
    });

    tdimStore.appraisalAnswers.forEach(a => {
      const u = tdimStore.users.get(a.userId);
      const resId = u?.researchId || 'UNKNOWN';
      const q = tdimStore.questions.find(x => x.id === a.questionId);
      rows.push(`二元理解核对,${resId},${u?.campus || 'donghu'},${q?.stage || 'NA'},题目_${a.questionId}_v${a.questionVersion},选项_${a.answer}_第${a.attemptNumber}次_代答${a.isProxyOrDiscussed ? 1 : 0},${a.submittedAt}`);
    });

    Array.from(tdimStore.tasks.values()).forEach(t => {
      const p = tdimStore.dyadPairs.get(t.dyadId);
      const patient = p ? tdimStore.users.get(p.patientId) : null;
      const resId = patient?.researchId || 'DYAD';
      rows.push(`任务分工执行,${resId},${patient?.campus || 'donghu'},${t.stage},${t.title},责任人_${t.proposedAssignee}_状态_${t.execStatus}_原因_${(t.difficultyReason || '无').replace(/"/g, '""')},${t.updatedAt}`);
    });

    tdimStore.healthRecords.forEach(r => {
      const u = tdimStore.users.get(r.recorderId);
      const resId = u?.researchId || 'UNKNOWN';
      let brief = '';
      if (r.recordType === 'diet') brief = `进食_${r.dietData?.foodType}_${r.dietData?.intakeLevel}档_语音输入:${r.voiceInputUsed ? '是' : '否'}`;
      if (r.recordType === 'weight') brief = `体重_${r.weightData?.weightKg}kg`;
      if (r.recordType === 'symptom') brief = `分级_${r.triageResult?.level}_红旗_${r.symptomData?.hasRedFlag ? 1 : 0}`;
      rows.push(`日常健康记录,${resId},${u?.campus || 'donghu'},${r.recordType},${r.isProxy ? '照顾者代录' : '患者自报'},"${brief.replace(/"/g, '""')}",${r.createdAt}`);
    });

    // 积分商城兑换激励记录
    tdimStore.exchangeOrders.forEach(o => {
      rows.push(`激励商城兑换,${o.researchId},${o.campus},终末激励,${o.productName},消耗积分:${o.costPoints}_配送:${o.deliveryMethod}_状态:${o.status},${o.createdAt}`);
    });

    return rows.join('\n');
  }
};
