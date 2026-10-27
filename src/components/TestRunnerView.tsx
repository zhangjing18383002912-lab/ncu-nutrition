/**
 * 二元管理主流程与量表自动化测试运行器 (Automated Dyadic E2E Test Runner)
 * 覆盖开题报告 8 大核心断言闭环:
 * 1. 配对 -> 2. 四阶段与决策树 -> 3. 理解核对 -> 4. 任务分工 -> 5. 3合1日常记录 -> 6. 共享控制 -> 7. 解绑撤权 -> 8. 量表公式
 */

import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, Clock, FileCode, Award, Check } from 'lucide-react';
import { TDIMIntegrationTestRunner, TestSuiteReport } from '../services/integrationTest';

export const TestRunnerView: React.FC = () => {
  const [report, setReport] = useState<TestSuiteReport | null>(null);
  const [running, setRunning] = useState(false);

  const runTest = () => {
    setRunning(true);
    setTimeout(() => {
      const res = TDIMIntegrationTestRunner.runFullDyadicLifecycle();
      setReport(res);
      setRunning(false);
    }, 300);
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-60px)] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* 顶部标题卡片 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
                学位论文开题 · 自动化接口校验套件
              </span>
              <span className="text-xs text-slate-400">理论映射: TDIM 二元全流程与附录量表</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1.5">
              二元流程与量表自动化接口测试套件 (E2E Integration Test)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              验证规范：配对绑定 ➔ 4阶段决策树 ➔ 理解核对 ➔ 任务分工 ➔ 3合1记录预警 ➔ 权限开关 ➔ 即刻撤权 ➔ 附录C4 SUS与C6 ZBI-12自动算分
            </p>
          </div>

          <button
            onClick={runTest}
            disabled={running}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            {running ? '正在执行集成测试...' : '一键运行二元与量表全流程测试'}
          </button>
        </div>

        {/* 测试概要看板 */}
        {report && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">综合测试结果</span>
              <div className="flex items-center gap-1.5 mt-1 font-bold text-base">
                {report.allPassed ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 全部通过 (100%)
                  </span>
                ) : (
                  <span className="text-rose-700 flex items-center gap-1">
                    <XCircle className="w-4 h-4 text-rose-600" /> 部分失败
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">用例断言总数</span>
              <div className="mt-1 font-bold font-mono text-lg text-slate-800">
                {report.totalSteps} 个核心断言
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">通过 / 失败</span>
              <div className="mt-1 font-bold font-mono text-lg text-emerald-700">
                {report.passedSteps} 通过 / <span className="text-slate-400 font-normal">{report.failedSteps} 失败</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">执行耗时</span>
              <div className="mt-1 font-bold font-mono text-lg text-slate-800 flex items-center gap-1">
                <Clock className="w-4 h-4 text-slate-400" />
                {report.durationMs} ms
              </div>
            </div>
          </div>
        )}

        {/* 详细步骤列表 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900">
              步骤级断言执行明细 ({report ? report.steps.length : 0} 步骤)
            </h2>
            {!report && (
              <span className="text-xs text-slate-400">请点击右上角按钮启动测试</span>
            )}
          </div>

          {!report && (
            <div className="text-center py-12 text-slate-400 text-sm space-y-2">
              <FileCode className="w-8 h-8 mx-auto text-slate-300" />
              <p>测试套件已就绪，覆盖毕业论文所有核心流转节点与附录量表公式</p>
              <button
                onClick={runTest}
                className="text-xs text-emerald-700 font-bold underline hover:text-emerald-800"
              >
                点击立即运行
              </button>
            </div>
          )}

          {report && (
            <div className="space-y-3">
              {report.steps.map((st) => (
                <div
                  key={st.stepIndex}
                  className={`p-4 rounded-xl border text-xs space-y-2 transition-all ${
                    st.passed
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-rose-50 border-rose-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        st.passed ? 'bg-emerald-700 text-white' : 'bg-rose-600 text-white'
                      }`}>
                        {st.stepIndex}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">
                        {st.stepName}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                      st.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {st.passed ? '✓ PASSED' : '✕ FAILED'}
                    </span>
                  </div>

                  <p className="text-slate-700 pl-7 leading-relaxed text-xs">
                    {st.detail}
                  </p>

                  {st.dataSnapshot && (
                    <div className="ml-7 p-2.5 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-600 overflow-x-auto">
                      <span className="text-slate-400 block mb-0.5 font-sans">运行快照数据:</span>
                      {JSON.stringify(st.dataSnapshot, null, 2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
