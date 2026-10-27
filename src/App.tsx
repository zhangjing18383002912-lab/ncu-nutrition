/**
 * 基于TDIM的胃癌术后患者及照顾者营养管理平台
 * 硕士学位论文课题系统 - 统一入口与多视图工作台
 * 研究生: 张靖 (南昌大学医学院) · 导师: 何朝珠教授
 */

import React, { useState } from 'react';
import { Smartphone, LayoutDashboard, FileCode2, BookOpen, HeartHandshake } from 'lucide-react';
import { MiniProgramView } from './components/MiniProgramView';
import { AdminDashboard } from './components/AdminDashboard';
import { TestRunnerView } from './components/TestRunnerView';
import { ArchitectureDocs } from './components/ArchitectureDocs';

export default function App() {
  const [currentView, setCurrentView] = useState<'miniprogram' | 'admin' | 'test_runner' | 'docs'>('miniprogram');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* 顶部全局工作台导航栏 (遵循单行三区规范，无机械注释无伪状态) */}
      <header className="bg-emerald-900 text-white shadow-sm border-b border-emerald-950 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">
          {/* 区域1: 品牌标题 */}
          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center font-bold text-white shadow-xs">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base leading-tight block">
                胃癌术后二元营养管理平台
              </span>
              <span className="text-[10px] text-emerald-200 block">
                南昌大学医学院 · TDIM理论模型验证原型
              </span>
            </div>
          </div>

          {/* 区域2: 核心视图切换单行导航链接 */}
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setCurrentView('miniprogram')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                currentView === 'miniprogram'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-emerald-100 hover:bg-emerald-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>小程序端</span>
            </button>

            <button
              onClick={() => setCurrentView('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                currentView === 'admin'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-emerald-100 hover:bg-emerald-800'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>科研后台</span>
            </button>

            <button
              onClick={() => setCurrentView('test_runner')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                currentView === 'test_runner'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-emerald-100 hover:bg-emerald-800'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>接口测试</span>
            </button>

            <button
              onClick={() => setCurrentView('docs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                currentView === 'docs'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-emerald-100 hover:bg-emerald-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>开题方案规范</span>
            </button>
          </nav>
        </div>
      </header>

      {/* 视图内容切换渲染 */}
      <main className="flex-1">
        {currentView === 'miniprogram' && <MiniProgramView />}
        {currentView === 'admin' && <AdminDashboard />}
        {currentView === 'test_runner' && <TestRunnerView />}
        {currentView === 'docs' && <ArchitectureDocs />}
      </main>
    </div>
  );
}
