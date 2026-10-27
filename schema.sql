-- ======================================================================================
-- 课题名称: 《基于TDIM的胃癌术后患者及照顾者营养管理平台的开发与可用性评价》
-- 数据库架构设计 (SQLite / MySQL 兼容 DDL 规范)
-- 理论核心: 二元疾病管理理论 (Dyadic Illness Management Theory, TDIM)
-- 包含: 用户身份与研究编号去标识化分离、配对与即刻解绑机制、二元评价核对、二元管理分工、
--       细粒度共享授权、分级就医决策树、审计日志与科研依从性有效使用记录
-- ======================================================================================

-- 1. 用户表 (身份信息与研究编号关联，生产环境中手机号/OpenID与科研分析库物理解耦)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  research_id VARCHAR(32) NOT NULL UNIQUE,     -- 研究编号: 患者如 P0001, 照顾者如 C0001, 导出时不含真实身份
  role VARCHAR(16) NOT NULL CHECK(role IN ('patient', 'caregiver', 'admin')), -- 首次选择后不可更改
  wechat_openid VARCHAR(128) UNIQUE,           -- 微信OpenID (支持开发模式模拟)
  nickname VARCHAR(64) NOT NULL,
  phone VARCHAR(20),
  surgery_type VARCHAR(32),                    -- 手术方式: total_gastrectomy(全胃) / subtotal_gastrectomy(部分胃) / NULL(缺失)
  diet_tolerance VARCHAR(16),                  -- 进食耐受: good / moderate / poor
  discharge_date DATE,                         -- 实际出院日期 (由研究者/管理员在后台核实录入)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 二元配对表 (1名患者同时最多对应1名照顾者，配对码6位有限时效)
CREATE TABLE IF NOT EXISTS dyad_pairs (
  id VARCHAR(64) PRIMARY KEY,
  patient_id VARCHAR(64) NOT NULL,
  caregiver_id VARCHAR(64),                    -- 输入配对码并确认后填充
  pair_code VARCHAR(8) NOT NULL,               -- 6位数字动态配对码
  code_expires_at TIMESTAMP NOT NULL,          -- 时效性 (通常10分钟)
  status VARCHAR(16) NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'unpaired')),
  paired_at TIMESTAMP,
  unpaired_at TIMESTAMP,                       -- 解除后照顾者立即失去数据访问权限
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id),
  FOREIGN KEY (caregiver_id) REFERENCES users(id)
);

-- 3. 共享授权范围表 (患者按记录类型单独开启或关闭对照顾者的共享)
CREATE TABLE IF NOT EXISTS sharing_permissions (
  patient_id VARCHAR(64) PRIMARY KEY,
  share_diet BOOLEAN NOT NULL DEFAULT 1,       -- 共享进食记录
  share_weight BOOLEAN NOT NULL DEFAULT 1,     -- 共享体重数据
  share_symptoms BOOLEAN NOT NULL DEFAULT 1,   -- 共享症状评分
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id)
);

-- 4. 分阶段营养指导条目表 (包含条件性决策树筛选与版本控制)
CREATE TABLE IF NOT EXISTS guidance_items (
  id VARCHAR(64) PRIMARY KEY,
  stage VARCHAR(24) NOT NULL CHECK(stage IN ('discharge_prep', 'week_1', 'week_2_4', 'post_28')),
  category VARCHAR(32) NOT NULL CHECK(category IN ('diet_transition', 'symptom_coping', 'nutrition_supp', 'nutrition_monitoring')),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_conditional BOOLEAN NOT NULL DEFAULT 0,  -- 是否条件性条目
  condition_description VARCHAR(255),
  condition_rule_id VARCHAR(64),               -- 关联决策树规则ID
  version VARCHAR(24) NOT NULL DEFAULT 'v1.0', -- 版本号
  is_example BOOLEAN NOT NULL DEFAULT 1,       -- 标注【示例】占位数据
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. 理解核对题库表 (二元评价题目与标准答案)
CREATE TABLE IF NOT EXISTS appraisal_questions (
  id VARCHAR(64) PRIMARY KEY,
  stage VARCHAR(24) NOT NULL,
  title TEXT NOT NULL,
  options_json TEXT NOT NULL,                  -- JSON 选项列表: [{"key": "A", "label": "..."}]
  correct_answer VARCHAR(8) NOT NULL,
  explanation TEXT NOT NULL,                   -- 临床标准解释说明
  version VARCHAR(24) NOT NULL DEFAULT 'v1.0', -- 题目版本号，科研比对必备
  is_example BOOLEAN NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. 理解核对作答记录表 (双方独立提交后方可展示，支持重测与代答剔除标记)
CREATE TABLE IF NOT EXISTS appraisal_answers (
  id VARCHAR(64) PRIMARY KEY,
  question_id VARCHAR(64) NOT NULL,
  question_version VARCHAR(24) NOT NULL,       -- 记录作答时题目版本
  dyad_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  user_role VARCHAR(16) NOT NULL,
  answer VARCHAR(8) NOT NULL,
  attempt_number INT NOT NULL DEFAULT 1,       -- 1=首次作答, 2=重测
  is_proxy_or_discussed BOOLEAN NOT NULL DEFAULT 0, -- 代答/共同讨论标记 (统计一致性时剔除)
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES appraisal_questions(id),
  FOREIGN KEY (dyad_id) REFERENCES dyad_pairs(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 7. 任务清单与协商分工表 (二元管理行为: 双方协同与双重确认机制)
CREATE TABLE IF NOT EXISTS dyadic_tasks (
  id VARCHAR(64) PRIMARY KEY,
  dyad_id VARCHAR(64) NOT NULL,
  stage VARCHAR(24) NOT NULL,
  title VARCHAR(255) NOT NULL,
  patient_role_desc TEXT NOT NULL,             -- 患者负责部分
  caregiver_role_desc TEXT NOT NULL,           -- 照顾者负责部分
  proposed_assignee VARCHAR(16) NOT NULL CHECK(proposed_assignee IN ('patient', 'caregiver', 'joint')),
  patient_agreed BOOLEAN NOT NULL DEFAULT 0,
  caregiver_agreed BOOLEAN NOT NULL DEFAULT 0,
  is_confirmed BOOLEAN NOT NULL DEFAULT 0,     -- 双方都确认后任务才生效
  exec_status VARCHAR(20) NOT NULL DEFAULT 'todo' CHECK(exec_status IN ('todo', 'completed', 'difficult', 'not_applicable')),
  difficulty_reason TEXT,                      -- 有困难/不适用时必填原因
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dyad_id) REFERENCES dyad_pairs(id)
);

-- 8. 健康与营养日常记录表 (进食5档/体重/症状评分+红旗征象及决策树就医输出)
CREATE TABLE IF NOT EXISTS health_records (
  id VARCHAR(64) PRIMARY KEY,
  dyad_id VARCHAR(64) NOT NULL,
  recorder_id VARCHAR(64) NOT NULL,
  recorder_role VARCHAR(16) NOT NULL,
  is_proxy BOOLEAN NOT NULL DEFAULT 0,         -- 是否照顾者代录
  record_type VARCHAR(16) NOT NULL CHECK(record_type IN ('diet', 'weight', 'symptom')),
  data_json TEXT NOT NULL,                     -- 详细记录数据 (进食档位1-5 / 体重kg / 症状0-3及红旗征象)
  triage_result_json TEXT,                     -- 经决策树判断的分级输出 (normal, care_guidance, contact_nurse, emergency)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dyad_id) REFERENCES dyad_pairs(id),
  FOREIGN KEY (recorder_id) REFERENCES users(id)
);

-- 9. 规则决策树表 (与流程图一一对应的JSON配置，带审核与生效版本管理)
CREATE TABLE IF NOT EXISTS decision_trees (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  scene VARCHAR(32) NOT NULL CHECK(scene IN ('guidance_filter', 'symptom_triage')),
  version VARCHAR(24) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'deprecated')),
  reviewer VARCHAR(64),                        -- 审核专家/护士长姓名
  effective_date DATE,                         -- 生效日期
  tree_json TEXT NOT NULL,                     -- 决策树节点图JSON
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. 决策树运行溯源日志表 (每次运行记录完整输入、命中路径与输出)
CREATE TABLE IF NOT EXISTS decision_runs (
  id VARCHAR(64) PRIMARY KEY,
  tree_id VARCHAR(64) NOT NULL,
  tree_version VARCHAR(24) NOT NULL,
  scene VARCHAR(32) NOT NULL,
  input_json TEXT NOT NULL,
  path_json TEXT NOT NULL,                     -- 节点命中链条
  output_json TEXT NOT NULL,
  is_simulation BOOLEAN NOT NULL DEFAULT 0,   -- 是否模拟测试 (测试不入正式统计)
  run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. 医护留言咨询表 (双向沟通)
CREATE TABLE IF NOT EXISTS nurse_messages (
  id VARCHAR(64) PRIMARY KEY,
  dyad_id VARCHAR(64) NOT NULL,
  sender_id VARCHAR(64) NOT NULL,
  sender_role VARCHAR(16) NOT NULL,
  content TEXT NOT NULL,
  reply TEXT,
  replied_at TIMESTAMP,
  replier_name VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dyad_id) REFERENCES dyad_pairs(id)
);

-- 12. 系统与管理审计日志表 (写操作全记录)
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  operator_id VARCHAR(64) NOT NULL,
  operator_role VARCHAR(16) NOT NULL,
  action VARCHAR(64) NOT NULL,
  detail TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. 科研有效使用记录表 (仅记录查看内容、作答、提交记录等有效依从行为，单纯登录不算)
CREATE TABLE IF NOT EXISTS effective_usages (
  id VARCHAR(64) PRIMARY KEY,
  research_id VARCHAR(32) NOT NULL,            -- 只存研究编号 (如 P0001, C0001)
  stage VARCHAR(24) NOT NULL,
  action_type VARCHAR(32) NOT NULL,
  payload_summary TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
