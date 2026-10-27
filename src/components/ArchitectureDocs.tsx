/**
 * 课题设计与系统架构规范书 (System Architecture & Thesis Design Document)
 * 对应南昌大学医学院张靖硕士研究生开题报告全文与附录
 */

import React, { useState } from 'react';
import { Layers, Database, Network, Key, FolderTree, Award, HeartHandshake } from 'lucide-react';

export const ArchitectureDocs: React.FC = () => {
  const [activeDocTab, setActiveDocTab] = useState<'overview' | 'tables' | 'apis' | 'config' | 'folders'>('overview');

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-60px)] p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* 顶部标题 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
              南昌大学医学院 · 硕士研究生学位论文开题设计规格书
            </span>
            <span className="text-xs text-slate-400">研究生: 张靖 | 导师: 何朝珠教授</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            《基于TDIM的胃癌术后患者及照顾者营养管理平台的开发与可用性评价》系统设计
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            研究基地: 南昌大学第一附属医院（东湖院区、象湖院区）胃肠外科 | 理论框架: 二元疾病管理理论 (TDIM)
          </p>
        </div>

        {/* 导航标签 */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          {[
            { id: 'overview', label: '1. TDIM 理论与4阶段对齐', icon: Layers },
            { id: 'folders', label: '2. 工程代码目录结构', icon: FolderTree },
            { id: 'tables', label: '3. 数据库 13 表实体设计', icon: Database },
            { id: 'apis', label: '4. RESTful 核心接口清单', icon: Network },
            { id: 'config', label: '5. 部署上线前必改配置', icon: Key }
          ].map((tab) => {
            const Icon = tab.icon;
            const isCur = activeDocTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveDocTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isCur
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 1. 整体架构 */}
        {activeDocTab === 'overview' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-xs sm:text-sm">
            <h2 className="text-base font-bold text-slate-900">1. TDIM 理论模型与平台四大康复阶段映射</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <span className="font-bold text-emerald-950 block text-sm">TDIM 核心构念在平台中的转化</span>
                <p className="text-emerald-900 leading-relaxed">
                  <strong>① 二元背景 (Dyadic Context):</strong> 胃切除术后早期面临消化道解剖重建、倾倒综合征与早饱乏力，患者与主照顾者构成相互依赖的疾病管理单元。
                </p>
                <p className="text-emerald-900 leading-relaxed">
                  <strong>② 二元评价 (Dyadic Appraisal):</strong> 超越单纯考题，全面涵盖：① 双方对同一营养问题的判断（独立双盲评定与二元分歧比对，出具护士长二元处方）；② 患者进食感受（早饱感、膨满感、倾倒心慌自评，构建照顾者共情视窗）；③ 照顾者执行困难（6~8餐备餐耗竭与劝饭挫败填报，生成减负锦囊与患者感恩视窗）；④ 知识核对（作为常态专业教育功能，基于权威医学数据源巩固认知）。
                </p>
                <p className="text-emerald-900 leading-relaxed">
                  <strong>③ 二元管理行为 (Dyadic Management Behaviors):</strong> 进食记录、备餐烹饪、称重与症状应对。系统通过【任务分工】双向协商机制，清晰界定患者与照顾者职责并需双向确认生效。
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-900 block text-sm">开题报告四大康复阶段严格定义</span>
                <p className="text-slate-700 leading-relaxed">
                  <strong>1. 出院准备期:</strong> 未录入实际出院日期（住院期间开展宣教与使用培训）。
                </p>
                <p className="text-slate-700 leading-relaxed">
                  <strong>2. 出院后第 1 周 (第1~7天):</strong> 清流质向细烂半流质过渡，严控干稀分食，防范倾倒综合征。
                </p>
                <p className="text-slate-700 leading-relaxed">
                  <strong>3. 出院后第 2～4 周 (第8~28天):</strong> 逐步过渡至软饭并强化优质蛋白质，开展第 4 周末终末可用性（SUS）评价。
                </p>
                <p className="text-slate-700 leading-relaxed">
                  <strong>4. 出院 1 个月以后:</strong> 建立长期平衡膳食习惯，全胃切除患者防范巨幼细胞贫血与定期肿瘤随访。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. 目录结构 */}
        {activeDocTab === 'folders' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-xs font-mono">
            <h2 className="text-base font-bold text-slate-900 font-sans">2. 微信小程序与后端完整工程目录结构</h2>
            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl overflow-x-auto leading-relaxed">
{`gastric-tdim-platform/
├── miniprogram/                     # 微信小程序原生前端源码
│   ├── app.js                       # 小程序生命周期与开发登录兼容逻辑
│   ├── app.json                     # 页面路径、6大底部Tab与窗口导航配置
│   ├── app.wxss                     # 适老化大字体样式变量(>=18pt)与全屏对比度
│   ├── pages/
│   │   ├── login/                   # 微信登录与角色选择(东湖/象湖两院区选择)
│   │   ├── pairing/                 # 6位动态配对码生成、绑定与即刻解除配对
│   │   ├── guidance/                # 四阶段营养指导 (含TTS语音播报与缺失拦截)
│   │   ├── appraisal/               # 理解核对 (二元评价独立作答与3类结果揭晓)
│   │   ├── tasks/                   # 任务分工 (二元协商、承担者确认与困难原因填报)
│   │   ├── records/                 # 3合1日常记录 (5档食碗大按钮/体重/语音识别)
│   │   ├── scales/                  # 附录量表评测 (SUS 可用性量表 / ZBI-12 负担量表)
│   │   ├── nurse/                   # 联系医护专线、紧急情形指南与在线留言
│   │   └── permissions/             # 患者端细粒度共享授权开关(饮食/体重/症状)
│   └── utils/
│       ├── request.js               # 请求封装 (携带研究Token与开发OpenID)
│       └── decision-runner.js       # 决策树客户端预校验
│
├── server/                          # 后端 Node.js + Express 服务
│   ├── server.ts                    # 后端入口文件与 CORS / API 中间件
│   ├── routes/                      # RESTful 业务路由
│   ├── controllers/                 # 业务控制器 (配对、核对、分工、记录、量表)
│   ├── engine/
│   │   └── decisionTree.ts          # 决策树执行引擎 (支持信息缺失分支与沙盒测试)
│   ├── db/
│   │   ├── sqlite.ts                # SQLite 数据库连接驱动
│   │   └── schema.sql               # 数据库全量 DDL 脚本 (13张表)
│   └── tests/
│       └── integration.test.ts      # 二元生命周期与量表自动化集成测试套件
│
└── config/
    └── .env.example                 # 环境变量模板 (包含微信AppSecret、专线电话)`}
            </div>
          </div>
        )}

        {/* 3. 数据库表结构 */}
        {activeDocTab === 'tables' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900">3. 数据库实体表设计清单 (13 张数据表)</h2>
            <div className="space-y-3">
              {[
                { name: 'users', desc: '用户主表', detail: '存储身份、研究编号(P0001/C0001)、院区(donghu/xianghu)、角色(不可变)、手术方式、出院日期、进食耐受' },
                { name: 'dyad_pairs', desc: '二元配对表', detail: '管理1对1绑定关系、6位限时配对码(10分钟)、配对与解绑时间戳' },
                { name: 'sharing_permissions', desc: '共享授权范围表', detail: '记录患者对照顾者的授权状态: share_diet, share_weight, share_symptoms' },
                { name: 'guidance_items', desc: '营养指导条目表', detail: '分阶段指导内容、条件性标记、关联决策树规则ID、语音播报朗读文稿' },
                { name: 'appraisal_questions', desc: '理解核对题库表', detail: '二元核对题目、选项JSON、标准答案、临床解释、版本号' },
                { name: 'appraisal_answers', desc: '理解核对作答记录表', detail: '作答答案、轮次(1=首次, 2=重测)、代答/共同讨论标记(用于统计剔除)' },
                { name: 'dyadic_tasks', desc: '任务分工协商表', detail: '阶段任务清单、患者负责说明、照顾者负责说明、提议承担者、双向确认状态、执行状态与困难原因' },
                { name: 'health_records', desc: '健康与营养记录表', detail: '进食5档/体重/0~3分症状、红旗征象、语音转文字标记、自报/代录标记、决策树分级就医输出' },
                { name: 'sus_evaluations', desc: '附录 C4 系统可用性量表', detail: '10个条目原始评分、标准转换总分(0~100分)、提交时间' },
                { name: 'zbi12_evaluations', desc: '附录 C6 照顾者负担量表', detail: '12个条目评分(0~4分)、总分(0~48分)、基线/终末评价时点' },
                { name: 'clinical_biomarkers', desc: '附录 C7 实验室生化指标', detail: '身高、体重、BMI、ALB(白蛋白)、PA(前白蛋白)、TP、Hb、淋巴细胞' },
                { name: 'decision_trees', desc: '规则决策树配置表', detail: '决策树结构JSON、版本号、状态(草稿/已发布/已停用)、审核人、生效日期' },
                { name: 'audit_logs', desc: '系统写操作审计表', detail: '操作人、角色、操作类型、参数明细、时间戳' }
              ].map((t) => (
                <div key={t.name} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-800">{t.name}</span>
                    <span className="font-bold text-slate-800">({t.desc})</span>
                  </div>
                  <p className="text-slate-600 mt-1">{t.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. RESTful 接口清单 */}
        {activeDocTab === 'apis' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900">4. 核心 RESTful API 接口清单</h2>
            <div className="space-y-2">
              {[
                { method: 'POST', path: '/api/auth/login', desc: '微信登录或开发模拟登录，选择院区与确定角色' },
                { method: 'POST', path: '/api/dyad/generate-code', desc: '患者生成6位时效配对码' },
                { method: 'POST', path: '/api/dyad/bind', desc: '照顾者输入配对码，患者确认绑定' },
                { method: 'POST', path: '/api/dyad/unpair', desc: '解除配对，照顾者即刻失去数据访问权限' },
                { method: 'GET', path: '/api/guidance', desc: '获取4阶段指导条目（经决策树条件筛选，缺失拦截）' },
                { method: 'POST', path: '/api/appraisal/answer', desc: '提交核对作答（双盲独立提交，支持代答标记）' },
                { method: 'GET', path: '/api/appraisal/evaluation', desc: '获取核对结果（双方均答后显示一致/不一致/一致但全错）' },
                { method: 'POST', path: '/api/tasks/confirm', desc: '确认任务分工方案（双方均同意后任务生效）' },
                { method: 'POST', path: '/api/records', desc: '提交进食5档/体重/症状/语音输入，自动触发决策树预警' },
                { method: 'POST', path: '/api/scales/sus', desc: '提交附录 C4 SUS可用性量表并计算0~100总分' },
                { method: 'POST', path: '/api/scales/zbi', desc: '提交附录 C6 ZBI-12照顾者负担量表并计算总分' },
                { method: 'POST', path: '/api/admin/discharge-date', desc: '管理员核实录入出院日期，重算康复阶段' },
                { method: 'GET', path: '/api/admin/export-csv', desc: '导出去标识化科研数据集（包含量表与生化指标）' }
              ].map((api) => (
                <div key={api.path} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                      api.method === 'POST' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {api.method}
                    </span>
                    <span className="font-mono text-slate-800 font-semibold">{api.path}</span>
                  </div>
                  <span className="text-slate-500">{api.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. 部署前必须修改的配置 */}
        {activeDocTab === 'config' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-xs sm:text-sm">
            <h2 className="text-base font-bold text-slate-900">5. 部署上线前必须修改的配置清单</h2>
            <div className="space-y-3">
              {[
                {
                  item: '1. 微信小程序凭证 (WX_APPID / WX_APPSECRET)',
                  advice: '在微信公众平台申请真实的医疗/政企类小程序AppID，并配置服务器合法域名；未配置前系统已开启开发免密登录模式供本地调试。'
                },
                {
                  item: '2. JWT 鉴权密钥 (JWT_SECRET)',
                  advice: '必须替换为强随机32位以上字符，杜绝使用默认密钥，防止研究会话被伪造。'
                },
                {
                  item: '3. 管理员安全令牌 (ADMIN_TOKEN)',
                  advice: '研究者后台登录口令与数据导出鉴权Token，防止未授权人员窃取临床研究数据。'
                },
                {
                  item: '4. 南昌大学第一附属医院专科随访联系电话与服务时间',
                  advice: '替换为南昌大学第一附属医院东湖院区/象湖院区胃肠外科护士站真实固定座机电话及白班值班时间。'
                },
                {
                  item: '5. 专家审核签字与决策树版本',
                  advice: '在正式发布决策树前，将审核人替换为实际主持论证的临床专家/护士长真实姓名及伦理批件编号。'
                }
              ].map((cfg, i) => (
                <div key={i} className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
                  <span className="font-bold text-amber-950 block">{cfg.item}</span>
                  <p className="text-amber-900 leading-relaxed text-xs">{cfg.advice}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
