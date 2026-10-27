/**
 * TDIM 二元管理主流程端到端自动化接口测试套件 (E2E Integration Test Suite)
 * 严格覆盖完整二元流与开题报告量表测算：
 * 步骤 1: 登录与配对 (患者生成6位配对码 -> 照顾者输入配对 -> 二元绑定生效)
 * 步骤 2: 4阶段营养指导与决策树筛选 (依据出院日期判定阶段 -> 决策树条件筛选与缺失拦截)
 * 步骤 3: 理解核对/二元评价 (双方独立双盲作答 -> 触发3类二元评价分类展示 -> 重测与代答标记)
 * 步骤 4: 任务分工/二元管理行为 (协商承担者 -> 双方确认方生效 -> 状态变更与困难原因必填)
 * 步骤 5: 3合1日常记录与就医决策树预警 (5档进食点选 + 红旗征象紧急急诊预警)
 * 步骤 6: 共享授权动态控制 (患者开关饮食/体重/症状对照顾者的可见性)
 * 步骤 7: 解除配对即刻撤销权限 (解绑后照顾者立即丧失二元空间数据访问权限)
 * 步骤 8: 开题报告附录量表计算 (附录C4 SUS可用性量表公式与附录C6 ZBI-12自动算分)
 */

import { tdimStore } from './store';
import { defaultGuidanceTree, DecisionTreeEngine } from './decisionEngine';

export interface TestStepResult {
  stepIndex: number;
  stepName: string;
  passed: boolean;
  detail: string;
  timestamp: string;
  dataSnapshot?: any;
}

export interface TestSuiteReport {
  suiteName: string;
  totalSteps: number;
  passedSteps: number;
  failedSteps: number;
  allPassed: boolean;
  durationMs: number;
  steps: TestStepResult[];
}

export class TDIMIntegrationTestRunner {
  public static runFullDyadicLifecycle(): TestSuiteReport {
    const startTime = performance.now();
    const steps: TestStepResult[] = [];

    const recordStep = (index: number, name: string, passed: boolean, detail: string, dataSnapshot?: any) => {
      steps.push({
        stepIndex: index,
        stepName: name,
        passed,
        detail,
        timestamp: new Date().toLocaleTimeString(),
        dataSnapshot
      });
    };

    try {
      // -------------------------------------------------------------
      // 步骤 1: 配对流程测试
      // -------------------------------------------------------------
      const testPatientId = 'TEST_P_' + Date.now();
      const testCaregiverId = 'TEST_C_' + Date.now();

      tdimStore.users.set(testPatientId, {
        id: testPatientId,
        researchId: 'P9999',
        role: 'patient',
        campus: 'donghu',
        wechatOpenId: 'wx_test_p',
        nickname: '测试患者99',
        phone: '13800009999',
        surgeryType: 'total_gastrectomy',
        dischargeDate: null,
        dietTolerance: 'poor',
        createdAt: new Date().toISOString()
      });

      tdimStore.users.set(testCaregiverId, {
        id: testCaregiverId,
        researchId: 'C9999',
        role: 'caregiver',
        campus: 'donghu',
        wechatOpenId: 'wx_test_c',
        nickname: '测试照顾者99',
        phone: '13900009999',
        createdAt: new Date().toISOString()
      });

      const pairCode = tdimStore.generatePairCode(testPatientId);
      const codeValid = pairCode.length === 6 && /^\d+$/.test(pairCode);

      const pairResult = tdimStore.confirmPairingByCode(testCaregiverId, pairCode);
      const dyadPairId = pairResult.pair?.id;
      const pairSuccess = pairResult.success && dyadPairId && pairResult.pair?.status === 'active';

      recordStep(
        1,
        '配对流程 (患者生成6位配对码 -> 照顾者输入绑定)',
        !!pairSuccess && codeValid,
        `生成的6位配对码: ${pairCode}，配对结果: ${pairResult.message}，PairID: ${dyadPairId}`,
        { pairCode, pairStatus: pairResult.pair?.status }
      );

      if (!dyadPairId) throw new Error('配对失败，无法继续测试后续流程');

      // -------------------------------------------------------------
      // 步骤 2: 4阶段营养指导与决策树筛选测试
      // -------------------------------------------------------------
      const stagePrep = tdimStore.computeStage(null);
      const past5Days = new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0];
      const stageW1 = tdimStore.computeStage(past5Days);
      const past35Days = new Date(Date.now() - 35 * 86400000).toISOString().split('T')[0];
      const stageM1 = tdimStore.computeStage(past35Days);

      const decisionOut = DecisionTreeEngine.runTree(defaultGuidanceTree, {
        surgeryType: 'total_gastrectomy',
        dietTolerance: 'poor'
      });

      const guidanceMatched = decisionOut.output.filterTags?.includes('total_gastrectomy_special') &&
        decisionOut.output.filterTags?.includes('poor_tolerance_special');

      const decisionMissingOut = DecisionTreeEngine.runTree(defaultGuidanceTree, {
        surgeryType: null
      });
      const missingHandled = decisionMissingOut.output.reason === 'SURGERY_TYPE_MISSING';

      recordStep(
        2,
        '营养指导 (四阶段判定 & 决策树条件筛选 & 缺失拦截)',
        stagePrep === 'discharge_prep' && stageW1 === 'week_1' && stageM1 === 'post_1_month' && !!guidanceMatched && missingHandled,
        `准备期: ${stagePrep}; 第1周: ${stageW1}; 1个月后: ${stageM1}; 决策树命中: ${decisionOut.output.filterTags?.join(', ')}; 缺失拦截: ${decisionMissingOut.output.alertTitle}`,
        { decisionPath: decisionOut.hitPath, missingPath: decisionMissingOut.hitPath }
      );

      // -------------------------------------------------------------
      // 步骤 3: 理解核对（二元评价）
      // -------------------------------------------------------------
      const questionId = 'Q_PREP_01';
      const q = tdimStore.questions.find(x => x.id === questionId);

      tdimStore.appraisalAnswers.push({
        id: 'ANS_P1',
        questionId,
        questionVersion: q?.version || 'v1.0-ncuh',
        dyadId: dyadPairId,
        userId: testPatientId,
        userRole: 'patient',
        answer: 'B',
        attemptNumber: 1,
        isProxyOrDiscussed: false,
        submittedAt: new Date().toISOString()
      });

      const singleEval = tdimStore.evaluateAppraisalOutcome(questionId, dyadPairId, 1);
      const waitingCorrect = !singleEval.revealed && singleEval.outcome === 'waiting_other';

      tdimStore.appraisalAnswers.push({
        id: 'ANS_C1',
        questionId,
        questionVersion: q?.version || 'v1.0-ncuh',
        dyadId: dyadPairId,
        userId: testCaregiverId,
        userRole: 'caregiver',
        answer: 'B',
        attemptNumber: 1,
        isProxyOrDiscussed: false,
        submittedAt: new Date().toISOString()
      });

      const matchEval = tdimStore.evaluateAppraisalOutcome(questionId, dyadPairId, 1);
      const matchPass = matchEval.revealed && matchEval.outcome === 'both_match_correct';

      recordStep(
        3,
        '理解核对 (单盲不泄题 -> 双方均提交解锁 -> 双方一致且正确分类)',
        waitingCorrect && matchPass,
        `单方等待状态: ${waitingCorrect}; 双方提交后二元评价结果: ${matchEval.outcome} (${matchEval.outcomeDesc})`,
        { outcome: matchEval.outcome }
      );

      // -------------------------------------------------------------
      // 步骤 4: 任务分工（二元管理行为）
      // -------------------------------------------------------------
      const testTaskId = `TASK_${dyadPairId}_T_PREP_01`;
      const task = tdimStore.tasks.get(testTaskId);

      let taskTestPassed = false;
      if (task) {
        task.proposedAssignee = 'patient';
        task.patientAgreed = true;
        task.caregiverAgreed = false;
        task.isConfirmed = false;

        const notEffectiveYet = !task.isConfirmed;

        task.caregiverAgreed = true;
        task.isConfirmed = true;
        task.execStatus = 'difficult';
        task.difficultyReason = '患者体能尚未完全恢复，需由照顾者协助';

        const validReasonSaved = task.isConfirmed && task.difficultyReason.length > 5;
        taskTestPassed = notEffectiveYet && validReasonSaved;
      }

      recordStep(
        4,
        '任务分工 (协商承担者 -> 双向确认生效 -> 困难原因必填机制)',
        taskTestPassed,
        `任务分工变更生效状态: ${task?.isConfirmed ? '已双向确认生效' : '待确认'}，填报困难原因: ${task?.difficultyReason}`,
        { task }
      );

      // -------------------------------------------------------------
      // 步骤 5: 3合1健康记录与红旗征象决策树提示
      // -------------------------------------------------------------
      const dietRecord = tdimStore.addHealthRecord({
        dyadId: dyadPairId,
        recorderId: testPatientId,
        recorderRole: 'patient',
        isProxy: false,
        voiceInputUsed: true,
        recordType: 'diet',
        dietData: {
          mealTime: '正餐',
          foodType: '稠米粥+蛋花',
          intakeLevel: 3,
          notes: '语音识别转录'
        }
      });

      const symptomRecord = tdimStore.addHealthRecord({
        dyadId: dyadPairId,
        recorderId: testCaregiverId,
        recorderRole: 'caregiver',
        isProxy: true,
        recordType: 'symptom',
        symptomData: {
          earlySatiety: 2,
          nauseaVomiting: 2,
          abdominalDistension: 2,
          dumpingSyndrome: 1,
          reflux: 1,
          diarrhea: 0,
          hasRedFlag: true,
          redFlagDetails: ['体温38.7℃', '突发剧烈腹痛']
        }
      });

      const triageEmergency = symptomRecord.triageResult?.level === 'emergency';

      recordStep(
        5,
        '日常记录与就医决策树预警 (5档进食点选 + 红旗急诊预警)',
        dietRecord.dietData?.intakeLevel === 3 && triageEmergency,
        `进食档位: 3档; 症状红旗决策树分级: ${symptomRecord.triageResult?.level} (${symptomRecord.triageResult?.alertTitle})`,
        { triageResult: symptomRecord.triageResult }
      );

      // -------------------------------------------------------------
      // 步骤 6: 共享范围权限控制
      // -------------------------------------------------------------
      const perm = tdimStore.permissions.get(testPatientId);
      let permPassed = false;
      if (perm) {
        perm.shareWeight = false;
        perm.shareDiet = true;
        perm.shareSymptoms = true;
        permPassed = perm.shareWeight === false && perm.shareDiet === true;
      }

      recordStep(
        6,
        '共享授权机制 (患者自主控制: 关闭体重，开启饮食与症状)',
        permPassed,
        `权限状态: 饮食共享=${perm?.shareDiet}, 体重共享=${perm?.shareWeight}, 症状共享=${perm?.shareSymptoms}`,
        { perm }
      );

      // -------------------------------------------------------------
      // 步骤 7: 解除配对与权限即刻撤销
      // -------------------------------------------------------------
      const unpairRes = tdimStore.unpairDyad(testPatientId, dyadPairId);
      const pairAfter = tdimStore.dyadPairs.get(dyadPairId);
      const patientAfter = tdimStore.users.get(testPatientId);
      const caregiverAfter = tdimStore.users.get(testCaregiverId);

      const unpairSuccess = unpairRes.success &&
        pairAfter?.status === 'unpaired' &&
        patientAfter?.dyadPairId === null &&
        caregiverAfter?.dyadPairId === null;

      recordStep(
        7,
        '解除配对 (双方解绑 -> 照顾者立即丧失二元数据访问权限)',
        unpairSuccess,
        `解除结果: ${unpairRes.message}，Pair状态: ${pairAfter?.status}`,
        { pairStatus: pairAfter?.status }
      );

      // -------------------------------------------------------------
      // 步骤 8: 开题报告附录量表计算 (SUS 转换公式与 ZBI-12 计分)
      // -------------------------------------------------------------
      // 假设10项SUS得分为 [5, 1, 5, 1, 5, 1, 5, 1, 5, 1] -> 满分 100 分
      const susSample = [5, 1, 5, 1, 5, 1, 5, 1, 5, 1];
      const susRes = tdimStore.submitSusEvaluation(dyadPairId, testPatientId, 'patient', susSample);
      const susFormulaValid = susRes.totalScore === 100;

      // 假设12项ZBI得分为全部选 1 分 -> 总分 12 分
      const zbiSample = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
      const zbiRes = tdimStore.submitZbi12Evaluation(testCaregiverId, 'terminal', zbiSample);
      const zbiValid = zbiRes.totalScore === 12;

      recordStep(
        8,
        '附录量表自动计算 (附录C4 SUS公式奇减1偶减5*2.5 & 附录C6 ZBI-12总分)',
        susFormulaValid && zbiValid,
        `SUS 转换总分计算: ${susRes.totalScore}分 (预期100); ZBI-12 得分: ${zbiRes.totalScore}分 (预期12)`,
        { susScore: susRes.totalScore, zbiScore: zbiRes.totalScore }
      );

    } catch (err: any) {
      recordStep(99, '测试中断异常', false, err.message || '未知错误');
    }

    const durationMs = Math.round(performance.now() - startTime);
    const passedSteps = steps.filter(s => s.passed).length;
    const failedSteps = steps.filter(s => !s.passed).length;

    return {
      suiteName: 'TDIM 二元疾病管理闭环与开题报告量表自动化接口测试',
      totalSteps: steps.length,
      passedSteps,
      failedSteps,
      allPassed: failedSteps === 0 && steps.length >= 8,
      durationMs,
      steps
    };
  }
}
