/**
 * 规则决策树执行引擎 (Rule Decision Tree Engine)
 * 严格按照要求：
 * 1. JSON 保存决策树，与专家审核流程图一一对应
 * 2. 节点包含"信息缺失"分支和"未命中/冲突"默认分支
 * 3. 记录运行输入、命中路径、输出、规则版本
 * 4. 支持沙盒模拟测试（预期输出对比，不记正式日志）
 */

import { DecisionTree, DecisionTreeNode, DecisionRunLog } from '../types/tdim';

export class DecisionTreeEngine {
  /**
   * 执行决策树
   */
  public static runTree(
    tree: DecisionTree,
    input: Record<string, any>,
    isSimulation = false
  ): { output: Record<string, any>; hitPath: string[]; log: DecisionRunLog } {
    const hitPath: string[] = [];
    let currentNodeId: string | undefined = tree.rootNodeId;
    let finalResult: Record<string, any> = { action: 'normal', advice: '未命中具体规则，维持常规护理。' };

    let safetyLoopCounter = 0;
    while (currentNodeId && safetyLoopCounter < 50) {
      safetyLoopCounter++;
      hitPath.push(currentNodeId);
      const node: DecisionTreeNode | undefined = tree.nodes[currentNodeId];

      if (!node) {
        hitPath.push('NODE_NOT_FOUND_DEFAULT');
        break;
      }

      if (node.type === 'result') {
        finalResult = node.result || {};
        break;
      }

      if (node.type === 'missing_check') {
        const val = input[node.field || ''];
        if (val === undefined || val === null || val === '') {
          // 关键信息缺失，走缺失分支，禁止随意猜测
          if (node.missingBranchNodeId) {
            currentNodeId = node.missingBranchNodeId;
            continue;
          } else {
            finalResult = {
              action: 'care_guidance',
              alertTitle: '信息不全提示',
              advice: `缺少关键病历信息【${node.field}】，请患者或照顾者先完善手术与饮食信息，系统方可给出准确指导。`,
              reason: 'CRITICAL_INFO_MISSING'
            };
            break;
          }
        } else {
          // 信息完整，继续下推到下一默认或指定分支
          currentNodeId = node.defaultBranchNodeId;
          continue;
        }
      }

      if (node.type === 'condition') {
        const val = input[node.field || ''];
        let matched = false;

        // 检查缺失
        if (val === undefined || val === null || val === '') {
          if (node.missingBranchNodeId) {
            currentNodeId = node.missingBranchNodeId;
            continue;
          }
        }

        if (node.branches && node.branches.length > 0) {
          for (const branch of node.branches) {
            if (node.operator === 'equals' && val === branch.value) {
              currentNodeId = branch.nextNodeId;
              matched = true;
              break;
            } else if (node.operator === 'in' && Array.isArray(branch.value) && branch.value.includes(val)) {
              currentNodeId = branch.nextNodeId;
              matched = true;
              break;
            } else if (node.operator === 'greaterThan' && typeof val === 'number' && val > branch.value) {
              currentNodeId = branch.nextNodeId;
              matched = true;
              break;
            }
          }
        }

        if (!matched) {
          // 走默认兜底分支
          if (node.defaultBranchNodeId) {
            currentNodeId = node.defaultBranchNodeId;
          } else {
            finalResult = {
              action: 'normal',
              advice: '未命中具体条件分支，维持常规观察。',
              reason: 'UNMATCHED_DEFAULT'
            };
            break;
          }
        }
      }
    }

    const log: DecisionRunLog = {
      id: 'RUN_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      treeId: tree.id,
      treeVersion: tree.version,
      scene: tree.scene,
      input,
      hitPath,
      output: finalResult,
      isSimulation,
      runAt: new Date().toISOString()
    };

    return { output: finalResult, hitPath, log };
  }
}

/**
 * 预设决策树 1：指导条目筛选
 * 场景：输入 surgeryType (全胃切除/远端胃切除/未填写) 与 dietTolerance (差/中/好/未填写)
 */
export const defaultGuidanceTree: DecisionTree = {
  id: 'TREE_GUIDANCE_FILTER',
  name: '胃癌术后指导条目筛选决策树',
  scene: 'guidance_filter',
  version: 'v1.0.0',
  status: 'published',
  reviewer: '张护士长（胃肠外科主任护师）',
  effectiveDate: '2026-03-01',
  updatedAt: '2026-03-01T08:00:00Z',
  rootNodeId: 'node_check_surgery',
  nodes: {
    node_check_surgery: {
      id: 'node_check_surgery',
      type: 'missing_check',
      field: 'surgeryType',
      missingBranchNodeId: 'node_result_missing_surgery',
      defaultBranchNodeId: 'node_cond_surgery_type'
    },
    node_result_missing_surgery: {
      id: 'node_result_missing_surgery',
      type: 'result',
      result: {
        approved: false,
        filterTags: ['generic_only'],
        action: 'care_guidance',
        alertTitle: '请补充手术方式',
        advice: '检测到尚未录入胃切除手术方式（全胃或部分胃切除）。为保证营养指导安全性，目前仅展示通用基础指导，请点击个人资料补全。',
        reason: 'SURGERY_TYPE_MISSING'
      }
    },
    node_cond_surgery_type: {
      id: 'node_cond_surgery_type',
      type: 'condition',
      field: 'surgeryType',
      operator: 'equals',
      branches: [
        { value: 'total_gastrectomy', nextNodeId: 'node_cond_tolerance_total' },
        { value: 'subtotal_gastrectomy', nextNodeId: 'node_cond_tolerance_subtotal' },
        { value: 'distal_gastrectomy', nextNodeId: 'node_cond_tolerance_subtotal' }
      ],
      defaultBranchNodeId: 'node_result_subtotal_normal'
    },
    node_cond_tolerance_total: {
      id: 'node_cond_tolerance_total',
      type: 'condition',
      field: 'dietTolerance',
      operator: 'equals',
      branches: [
        { value: 'poor', nextNodeId: 'node_result_total_poor' },
        { value: 'moderate', nextNodeId: 'node_result_total_moderate' },
        { value: 'good', nextNodeId: 'node_result_total_good' }
      ],
      defaultBranchNodeId: 'node_result_total_moderate'
    },
    node_cond_tolerance_subtotal: {
      id: 'node_cond_tolerance_subtotal',
      type: 'condition',
      field: 'dietTolerance',
      operator: 'equals',
      branches: [
        { value: 'poor', nextNodeId: 'node_result_subtotal_poor' },
        { value: 'good', nextNodeId: 'node_result_subtotal_good' }
      ],
      defaultBranchNodeId: 'node_result_subtotal_normal'
    },
    node_result_total_poor: {
      id: 'node_result_total_poor',
      type: 'result',
      result: {
        approved: true,
        filterTags: ['all_generic', 'total_gastrectomy_special', 'poor_tolerance_special', 'vitamin_b12_alert'],
        action: 'care_guidance',
        alertTitle: '全胃切除 + 耐受欠佳重点关注',
        advice: '全胃切除无胃容量缓冲，进食耐受欠佳需严格少食多餐（每日6~8餐），以清淡细烂半流质为主，餐后平卧或半卧位20分钟预防倾倒综合征，并建议增加口服营养补充制剂（ONS）。'
      }
    },
    node_result_total_moderate: {
      id: 'node_result_total_moderate',
      type: 'result',
      result: {
        approved: true,
        filterTags: ['all_generic', 'total_gastrectomy_special', 'vitamin_b12_alert'],
        action: 'normal',
        advice: '全胃切除常规康复，注意终身补充维生素B12监测，进食定时定量，干稀分食。'
      }
    },
    node_result_total_good: {
      id: 'node_result_total_good',
      type: 'result',
      result: {
        approved: true,
        filterTags: ['all_generic', 'total_gastrectomy_special', 'gradual_texture_upgrade'],
        action: 'normal',
        advice: '全胃切除耐受良好，可按计划从稠粥细软食物逐步循序过渡，避免过甜、高渗流质。'
      }
    },
    node_result_subtotal_poor: {
      id: 'node_result_subtotal_poor',
      type: 'result',
      result: {
        approved: true,
        filterTags: ['all_generic', 'subtotal_gastrectomy', 'poor_tolerance_special'],
        action: 'care_guidance',
        alertTitle: '部分胃切除 + 耐受欠佳指导',
        advice: '建议退回上一进食阶段质地（如由软饭退回半流软粥），每次进食减量1/3，细嚼慢咽，避免产气食物。'
      }
    },
    node_result_subtotal_good: {
      id: 'node_result_subtotal_good',
      type: 'result',
      result: {
        approved: true,
        filterTags: ['all_generic', 'subtotal_gastrectomy'],
        action: 'normal',
        advice: '残胃代偿良好，按出院周次正常过渡软食，保证优质蛋白质摄入。'
      }
    },
    node_result_subtotal_normal: {
      id: 'node_result_subtotal_normal',
      type: 'result',
      result: {
        approved: true,
        filterTags: ['all_generic', 'subtotal_gastrectomy'],
        action: 'normal',
        advice: '遵循胃癌术后通用原则，少食多餐，细嚼慢咽。'
      }
    }
  }
};

/**
 * 预设决策树 2：症状就医提示决策树
 * 场景：红旗征象(剧痛/高热/呕血/伤口崩开) -> 立即就医；
 * 重度症状(倾倒/剧烈反流/腹泻>=3分) -> 联系专科医护；
 * 轻度症状 -> 居家护理应对
 */
export const defaultSymptomTree: DecisionTree = {
  id: 'TREE_SYMPTOM_TRIAGE',
  name: '胃癌术后症状就医分级决策树',
  scene: 'symptom_triage',
  version: 'v1.0.0',
  status: 'published',
  reviewer: '李主任医师（胃肠外科肿瘤学专家）',
  effectiveDate: '2026-03-01',
  updatedAt: '2026-03-01T08:00:00Z',
  rootNodeId: 'node_check_red_flag',
  nodes: {
    node_check_red_flag: {
      id: 'node_check_red_flag',
      type: 'condition',
      field: 'hasRedFlag',
      operator: 'equals',
      branches: [
        { value: true, nextNodeId: 'node_result_emergency' },
        { value: false, nextNodeId: 'node_check_max_score' }
      ],
      defaultBranchNodeId: 'node_check_max_score'
    },
    node_result_emergency: {
      id: 'node_result_emergency',
      type: 'result',
      result: {
        action: 'emergency',
        alertTitle: '⚠️ 触发红旗警示，请立即就医！',
        advice: '监测到红旗危险征象（如体温>38.5℃、突发剧烈腹痛、呕血黑便或伤口异常渗出）。请立即前往手术医院急诊科就诊，并携带近期出院小结，切勿拖延！',
        reason: 'RED_FLAG_TRIGGERED'
      }
    },
    node_check_max_score: {
      id: 'node_check_max_score',
      type: 'condition',
      field: 'maxScore',
      operator: 'greaterThan',
      threshold: 2, // 即评分为3分(重度)
      branches: [
        { value: 2, nextNodeId: 'node_result_contact_nurse' }
      ],
      defaultBranchNodeId: 'node_check_moderate_score'
    },
    node_result_contact_nurse: {
      id: 'node_result_contact_nurse',
      type: 'result',
      result: {
        action: 'contact_nurse',
        alertTitle: '⚡ 症状较为明显，建议联系责任护士',
        advice: '某项不适症状评分为重度（3分）。请在工作时间致电造口伤口/营养随访专线，或在【联系医护】留言，医护团队将协助评估是否需要调整抑酸药、助消化药或线下加号复诊。',
        reason: 'SEVERE_SYMPTOM_SCORE_3'
      }
    },
    node_check_moderate_score: {
      id: 'node_check_moderate_score',
      type: 'condition',
      field: 'maxScore',
      operator: 'greaterThan',
      threshold: 0, // 评分为1~2分(轻中度)
      branches: [
        { value: 0, nextNodeId: 'node_result_care_coping' }
      ],
      defaultBranchNodeId: 'node_result_normal_care'
    },
    node_result_care_coping: {
      id: 'node_result_care_coping',
      type: 'result',
      result: {
        action: 'care_guidance',
        alertTitle: '💡 轻度不适，请参照居家应对建议',
        advice: '早饱、轻度反酸或便秘属于胃切除术后早期常见适应反应。请参照【营养指导-症状应对】专栏执行：少食多餐、餐后抬高床头、适度床旁或室内散步。若连续3天无改善，请在留言区反馈。',
        reason: 'MILD_SYMPTOM_COPING'
      }
    },
    node_result_normal_care: {
      id: 'node_result_normal_care',
      type: 'result',
      result: {
        action: 'normal',
        alertTitle: '✅ 恢复状态稳定',
        advice: '当前未报告明显不适症状，请继续保持规律饮食记录，按部就班推进阶段饮食。',
        reason: 'SYMPTOM_SCORE_ZERO'
      }
    }
  }
};
