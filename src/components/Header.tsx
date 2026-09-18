import React, { useState } from 'react';
import { 
  Table2, 
  BarChart3, 
  Layers, 
  Sparkles, 
  Plus, 
  Upload, 
  Download, 
  RotateCcw, 
  Undo2, 
  Redo2, 
  CheckCircle2, 
  Trash2,
  FileSpreadsheet,
  TrendingUp,
  PieChart,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Sheet, ActiveTab } from '../types/sheet';

interface HeaderProps {
  sheets: Sheet[];
  activeSheetId: string;
  onSelectSheet: (id: string) => void;
  onAddNewSheet: () => void;
  onDeleteSheet: (id: string) => void;
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  onOpenImportModal: () => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  onResetDefaults: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  lastSaved: string;
  onSyncGoogleSheet?: () => void;
  isSyncing?: boolean;
  lastSynced?: string;
}

export const Header: React.FC<HeaderProps> = ({
  sheets,
  activeSheetId,
  onSelectSheet,
  onAddNewSheet,
  onDeleteSheet,
  activeTab,
  onChangeTab,
  onOpenImportModal,
  onExportCsv,
  onExportJson,
  onResetDefaults,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  lastSaved,
  onSyncGoogleSheet,
  isSyncing = false,
  lastSynced,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const activeSheet = sheets.find(s => s.id === activeSheetId);

  const getSheetIcon = (iconName?: string) => {
    switch (iconName) {
      case 'TrendingUp':
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'PieChart':
        return <PieChart className="w-4 h-4 text-sky-600" />;
      default:
        return <FileSpreadsheet className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Application Bar */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
        {/* Brand & App Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
            <Table2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Sheet Analitik
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                Sistem Pengelolaan & BI
              </span>
            </div>
            <p className="text-xs text-slate-700">
              {activeSheet?.description || 'Pengelolaan data tabular dan analitik terintegrasi'}
            </p>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 mr-1">
            <button
              id="btn-undo"
              onClick={onUndo}
              disabled={!canUndo}
              title="Urungkan Perubahan (Undo)"
              className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              id="btn-redo"
              onClick={onRedo}
              disabled={!canRedo}
              title="Ulangi Perubahan (Redo)"
              className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Google Sheets Sync Pill */}
          {activeSheet?.id === 'sheet-master-puskesmas' && (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-800 hidden md:inline">Google Sheets Terkoneksi</span>
              {onSyncGoogleSheet && (
                <button
                  onClick={onSyncGoogleSheet}
                  disabled={isSyncing}
                  title="Tarik data terbaru dari Google Sheets"
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-white border border-emerald-200 px-2 py-0.5 rounded shadow-2xs transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkron'}</span>
                </button>
              )}
              <a
                href="https://docs.google.com/spreadsheets/d/1ykpLnIE8305uphJMvXOdPuwb8T_mkQsnw8GOmByLFko/edit?gid=1900197277#gid=1900197277"
                target="_blank"
                rel="noopener noreferrer"
                title="Buka Spreadsheet di Google Sheets"
                className="text-emerald-700 hover:text-emerald-900 p-0.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Auto-saved indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tersimpan {lastSaved}</span>
          </div>

          {/* Import CSV */}
          <button
            id="btn-import-csv"
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Impor CSV</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              id="btn-export-dropdown"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Ekspor Data</span>
            </button>
            {showExportMenu && (
              <div 
                className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 text-xs text-slate-700"
                onClick={() => setShowExportMenu(false)}
              >
                <button
                  onClick={onExportCsv}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>Unduh Format CSV</span>
                  <span className="text-[10px] text-slate-400 font-mono">.csv</span>
                </button>
                <button
                  onClick={onExportJson}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>Unduh Format JSON</span>
                  <span className="text-[10px] text-slate-400 font-mono">.json</span>
                </button>
              </div>
            )}
          </div>

          {/* Reset sample button */}
          <button
            id="btn-reset-sample"
            onClick={onResetDefaults}
            title="Muat Ulang Contoh Data Bawaan"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sheets Navigation & Workspace View Switcher */}
      <div className="px-4 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 border-t border-slate-100">
        {/* Sheet Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-1.5 max-w-full">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider px-1">
            Lembar:
          </span>
          {sheets.map(sheet => {
            const isActive = sheet.id === activeSheetId;
            return (
              <div
                key={sheet.id}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-white text-emerald-800 border-slate-300 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent'
                }`}
                onClick={() => onSelectSheet(sheet.id)}
              >
                {getSheetIcon(sheet.icon)}
                <span className="truncate max-w-[160px]">{sheet.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded-full font-mono">
                  {sheet.rows.length}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSheet(sheet.id);
                  }}
                  title={`Hapus lembar kerja "${sheet.name}"`}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all ml-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          <button
            id="btn-add-sheet"
            onClick={onAddNewSheet}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition-colors border border-dashed border-slate-300"
            title="Tambah Lembar Kerja Baru"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Sheet Baru</span>
          </button>
        </div>

        {/* Workspace View Mode Selector */}
        <div className="flex items-center gap-1.5 py-1.5">
          <button
            id="tab-sheet-view"
            onClick={() => onChangeTab('sheet')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'sheet'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Table2 className="w-3.5 h-3.5" />
            <span>Data Sheet</span>
          </button>

          <button
            id="tab-analytics-view"
            onClick={() => onChangeTab('analytics')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'analytics' || activeTab === 'pivot'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Lembar Analitik & Grafik</span>
          </button>

          <button
            id="tab-ai-view"
            onClick={() => onChangeTab('ai')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'ai'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Wawasan AI (Gemini)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
