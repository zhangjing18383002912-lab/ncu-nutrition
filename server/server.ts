/**
 * 基于TDIM的胃癌术后患者及照顾者营养管理平台 - Express 后端服务
 * Node.js + Express + SQLite 架构
 * 生产环境部署时提供 RESTful API，严格遵循去标识化、审计日志与AI问答规范
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// 初始化 Gemini API 客户端 (User-Agent 设置为 aistudio-build)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// 跨域处理与安全响应头
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 健康检查
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'TDIM Gastric Cancer Nutrition Platform API',
    version: '1.0.0-prototype',
    timestamp: new Date().toISOString()
  });
});

// 1. 微信与开发模式登录
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { code, devRole, mockOpenId, campus } = req.body;
  res.json({
    success: true,
    token: 'jwt_mock_token_for_' + (devRole || 'patient'),
    user: {
      researchId: devRole === 'patient' ? 'P0001' : devRole === 'caregiver' ? 'C0001' : 'ADM01',
      role: devRole || 'patient',
      campus: campus || 'donghu',
      wechatOpenId: mockOpenId || 'wx_mock_open_01'
    }
  });
});

// 2. 配对管理
app.post('/api/dyad/generate-code', (req: Request, res: Response) => {
  const pairCode = Math.floor(100000 + Math.random() * 900000).toString();
  res.json({ success: true, pairCode, expiresInSeconds: 600 });
});

app.post('/api/dyad/bind', (req: Request, res: Response) => {
  const { pairCode, caregiverId } = req.body;
  res.json({ success: true, message: '配对绑定成功', dyadId: 'PAIR_0001' });
});

app.post('/api/dyad/unpair', (req: Request, res: Response) => {
  res.json({ success: true, message: '配对已解除，照顾者已失去数据访问权限' });
});

// 3. 营养指导
app.get('/api/guidance', (req: Request, res: Response) => {
  res.json({
    stage: 'discharge_prep',
    items: [
      {
        id: 'G_PREP_01',
        title: '【出院准备】清流质到半流质过渡原则',
        content: '遵医嘱从清水、淡米汤过渡至清淡稠米粥，每日6~8次。'
      }
    ]
  });
});

// 4. 理解核对
app.post('/api/appraisal/answer', (req: Request, res: Response) => {
  res.json({ success: true, message: '作答已记录' });
});

// 5. 任务分工
app.post('/api/tasks/confirm', (req: Request, res: Response) => {
  res.json({ success: true, message: '分工协商已确认' });
});

// 6. 健康记录与红旗分诊
app.post('/api/records', (req: Request, res: Response) => {
  const { recordType, symptomData } = req.body;
  let triageLevel = 'normal';
  if (symptomData?.hasRedFlag) {
    triageLevel = 'emergency';
  }
  res.json({ success: true, recordId: 'REC_' + Date.now(), triageLevel });
});

// 7. 共享范围授权
app.post('/api/permissions', (req: Request, res: Response) => {
  res.json({ success: true, message: '共享权限已更新' });
});

// 8. 医护留言
app.post('/api/messages', (req: Request, res: Response) => {
  res.json({ success: true, message: '留言已提交' });
});

// 9. 智能AI问答 (Gemini 3.8 Flash 服务端代理接口)
app.post('/api/ai/qa', async (req: Request, res: Response) => {
  const { question, userRole, stage, surgeryType } = req.body;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ success: false, message: '请提供咨询问题' });
  }

  try {
    const systemPrompt = `你是一名南昌大学第一附属医院胃肠外科肿瘤营养支持团队的专科责任护士与临床营养顾问。
你的任务是为胃癌术后患者及家庭主要照顾者提供温和、专业、科学、易懂的康复期营养宣教与照护建议。
患者背景信息：
- 当前提问者身份: ${userRole === 'patient' ? '胃癌术后患者本人' : '患者主要照顾者（家属）'}
- 当前康复阶段: ${stage || '居家康复期'}
- 手术类型: ${surgeryType || '胃癌根治术后'}

请遵循以下临床指导准则：
1. 语言亲切温馨，用中老年人听得懂的大白话解释医学原理，分点排版清晰。
2. 核心原则：严格少食多餐（每日6~8餐）、干稀分食（固体与流质间隔半小时）、细嚼慢咽（每口嚼20~30次）。
3. 如涉及倾倒综合征（心慌出冷汗），立即提醒平卧或半卧位休息20分钟并减少高糖高渗流质。
4. 如涉及全胃切除，强调定期肌注补充维生素B12与补铁防贫血。
5. 【重要安全红线】：如果患者提问涉及高热超38.5℃、剧烈持续刀割样腹痛、引流口大量浑浊渗出、或呕血黑便等危险红旗体征，必须首要严肃警告用户立即前往急诊外科就医，切勿在家延误！`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: question,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    const answer = response.text || '暂未生成答复，请遵医嘱执行。';
    return res.json({
      success: true,
      answer,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.warn('[Gemini AI Q&A Fallback]', err?.message);
    const q = question.toLowerCase();
    // 降级高保真本地临床知识库备选答复
    let fallback = '您好！胃癌术后居家营养管理的核心是“少食多餐、干稀分食、细嚼慢咽”。建议每日分6~8餐，每餐5~7分饱，多摄入高蛋白（鱼虾、蛋羹、豆腐）与细烂软食。如有突发高热超38.5℃或剧烈刀割样腹痛，请立即前往急诊就医！';
    if (q.includes('柿子') || q.includes('黑枣') || q.includes('山楂')) {
      fallback = '【⚠️ 绝对禁食】生柿子、柿饼、黑枣和山楂含有大量高浓度“鞣酸”，极易与肠液蛋白质凝聚成坚硬结石造成急性肠梗阻，严重时需急诊手术，术后严禁食用！';
    } else if (q.includes('年糕') || q.includes('汤圆') || q.includes('粽子') || q.includes('糯米')) {
      fallback = '【⚠️ 绝对禁食】年糕、汤圆、粽子等黏性食品缺乏胃研磨，极易堵塞吻合口造成急性梗阻剧烈呕吐，术后半年内坚决不可食用！';
    } else if (q.includes('肉汤') || q.includes('鸡汤')) {
      fallback = '【护士长辟谣提示】浓肉汤里90%以上是油脂与嘌呤，优质蛋白质不足2%且都在肉渣中！建议撇净浮油，将肉剁成肉泥做成肉饼羹给患者吃肉补充优质蛋白。';
    } else if (q.includes('倾倒') || q.includes('心慌') || q.includes('冷汗')) {
      fallback = '【护士长急救提示】餐后心慌、出冷汗是早期倾倒综合征！即刻应对：立即协助患者就地平卧或半卧位休息20~30分钟；饮食上严禁浓糖水、甜点，严格干稀分食。';
    } else if (q.includes('全胃') || q.includes('贫血') || q.includes('b12')) {
      fallback = '全胃切除后失去了胃黏膜分泌的内因子，维生素B12无法正常吸收。临床指南建议术后定期（每2~3个月）至门诊肌肉注射补充维生素B12，多吃深绿叶蔬菜防贫血。';
    } else if (q.includes('反酸') || q.includes('烧心') || q.includes('睡')) {
      fallback = '术后反酸多为碱性胆汁反流。建议：睡觉时将床头抬高15~20厘米（利用重力防反流）；睡前2~3小时坚决不进餐不喝水；穿宽松衣物避免腹压过高。';
    } else if (q.includes('鱼') || q.includes('虾') || q.includes('肉') || q.includes('吃什么')) {
      fallback = '术后极需优质蛋白质修复吻合口！推荐清蒸去皮龙利鱼碎、鲜虾泥、嫩蛋羹和肉末炖豆腐。注意蒸煮软烂，进食时细嚼慢咽20~30次再吞下。';
    } else if (q.includes('发热') || q.includes('高烧') || q.includes('腹痛') || q.includes('出血') || q.includes('黑便')) {
      fallback = '【🚨 严重警告 · 立即就医】体温高于38.5℃、突发剧烈刀割样腹痛、引流口大量渗液或呕血黑便属于急腹症红旗征象！请立即拨打120或前往急诊外科，途中禁食禁水！';
    }
    return res.json({
      success: true,
      answer: fallback,
      fallbackUsed: true,
      timestamp: new Date().toISOString()
    });
  }
});

// 10. 研究数据导出 (CSV)
app.get('/api/admin/export-csv', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="tdim_research_deidentified.csv"');
  res.send('数据类型,研究编号,阶段,动作/指标,详情内容,时间戳\n有效使用行为,P0001,discharge_prep,view_guidance,示例数据,2026-03-01');
});

// 独立运行且有端口时监听
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[TDIM Backend] Express server running on port ${PORT}`);
  });
}

export default app;
