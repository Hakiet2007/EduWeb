import React, { useState, useEffect } from "react";
import { 
  Key, 
  Settings, 
  RotateCcw, 
  FolderSync, 
  HelpCircle, 
  Laptop, 
  Moon, 
  Sun, 
  Globe, 
  Eye, 
  EyeOff,
  UserCheck,
  CheckCircle2,
  Lock,
  Network
} from "lucide-react";

interface SettingsTabProps {
  currentUser: any;
  language: "vi" | "en";
  darkMode: boolean;
  onUpdateCurrentUser: (updatedFields: Partial<any>) => void;
  onToggleDarkMode: () => void;
  onToggleLanguage: () => void;
}

export default function SettingsTab({ 
  currentUser, 
  language, 
  darkMode, 
  onUpdateCurrentUser, 
  onToggleDarkMode, 
  onToggleLanguage 
}: SettingsTabProps) {
  
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Read local customized API key if exists
    const stored = localStorage.getItem("gemini_user_api_key") || "";
    setApiKeyInput(stored);
  }, []);

  const handleSaveApiKey = () => {
    localStorage.setItem("gemini_user_api_key", apiKeyInput.trim());
    setIsSaved(true);
    window.showToast?.(
      language === "vi" 
        ? "Đã lưu khóa API Gemini cá nhân thành công!" 
        : "Successfully saved your custom Gemini model API Key!",
      "success"
    );
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleClearApiKey = () => {
    localStorage.removeItem("gemini_user_api_key");
    setApiKeyInput("");
    window.showToast?.(
      language === "vi" 
        ? "Đã xóa khóa API Key thành công. Sử dụng khóa hệ thống." 
        : "Cleared personal API Key. Falling back to system defaults.",
      "info"
    );
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-2" id="settings-tab-view-container">
      
      {/* Settings Card Base */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Header decoration */}
        <div className="bg-neutral-50 dark:bg-neutral-850 p-6 border-b border-neutral-200/60 dark:border-neutral-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-md font-black tracking-tight text-neutral-900 dark:text-white">
              {language === "vi" ? "Tùy Chỉnh & Kết Nối Hệ Thống" : "System Customization Settings"}
            </h2>
            <p className="text-xs text-neutral-400">
              {language === "vi" ? "Quản lý khóa API, đồng bộ hóa thiết bị, ngôn ngữ hiển thị và chủ đề." : "Manage backend key integrations, language localized values, and visual styles."}
            </p>
          </div>
        </div>

        {/* Form contents */}
        <div className="p-6 space-y-6">
          
          {/* Section A: Gemini API Key configuration */}
          <div className="space-y-4 border-b border-neutral-150 dark:border-neutral-800/60 pb-6" id="settings-api-key-panel">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-neutral-400" />
                  {language === "vi" ? "Gemini API Key (Cá nhân)" : "Personal Gemini Model Key"}
                </span>
                <p className="text-[11px] text-neutral-400">
                  {language === "vi" 
                    ? "Nhập API Key riêng từ Google AI Studio để chủ động tạo đề thi nhanh hơn và không lo giới hạn truy cập." 
                    : "Enter your private API credential for higher limits and unlimited question generation speed."}
                </p>
              </div>
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
              >
                {language === "vi" ? "Lấy khóa miễn phí →" : "Get Free Key →"}
              </a>
            </div>

            {/* Input fields */}
            <div className="flex gap-2.5 items-center">
              <div className="relative flex-1">
                <input
                  id="gemini-user-key-input"
                  type={showKey ? "text" : "password"}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Paste your AI Studio GEMINI_API_KEY here..."
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs p-2.5 pl-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-neutral-900 dark:text-neutral-100"
                />
                
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Action buttons */}
              <button
                onClick={handleSaveApiKey}
                id="save-user-api-key-btn"
                className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-850 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-extrabold text-xs rounded-lg shadow-sm transition-all"
              >
                {isSaved ? (
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Saved</span>
                ) : (
                  language === "vi" ? "Lưu" : "Save"
                )}
              </button>

              {apiKeyInput && (
                <button
                  onClick={handleClearApiKey}
                  className="p-2.5 text-neutral-400 hover:text-red-600 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800/30"
                  title="Xóa khóa API"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* API Status Labels */}
            <div className="bg-neutral-50 dark:bg-neutral-850 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Network className="w-3.5 h-3.5 text-neutral-400" />
                <span>{language === "vi" ? "Phương thức kết nối:" : "Gateway link type:"}</span>
              </div>
              
              {apiKeyInput ? (
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 animate-pulse">
                  <span>●</span> {language === "vi" ? "Đã bật: Đang sử dụng API Key cá nhân để tải AI đề thi thời gian thực." : "Active: Using your custom API Key for real-time AI generation."}
                </p>
              ) : (
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-bold flex items-center gap-1.5">
                  <span>○</span> {language === "vi" ? "Chế độ mặc định: Sử dụng AI thông minh bằng cổng API hệ thống (hoặc cấu hình API Key riêng phía trên)." : "Default mode active: Using centralized system AI gateway (or provide your backup API Key above)."}
                </p>
              )}
            </div>
          </div>

          {/* Section B: UI and Theme selection toggle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-neutral-150 dark:border-neutral-800/60 pb-6" id="settings-theme-localization-panel">
            
            {/* Language Selection */}
            <div className="p-4 bg-neutral-50 dark:bg-neutral-850/40 rounded-xl border border-neutral-200/50 dark:border-neutral-800 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-neutral-950 dark:text-neutral-50 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  {language === "vi" ? "Ngôn Ngữ Học Tập" : "Curriculum Language"}
                </span>
                <p className="text-[10px] text-neutral-400">
                  {language === "vi" ? "Thay đổi ngôn ngữ cho giao diện học tập." : "Toggle Vietnamese/English standard displays."}
                </p>
              </div>

              <button
                onClick={onToggleLanguage}
                id="settings-lang-switch-btn"
                className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold rounded-lg text-neutral-800 dark:text-neutral-200 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                Vietnamese (VI)
              </button>
            </div>

            {/* Dark mode selection */}
            <div className="p-4 bg-neutral-50 dark:bg-neutral-850/40 rounded-xl border border-neutral-200/50 dark:border-neutral-800 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-neutral-950 dark:text-neutral-50 flex items-center gap-1.5">
                  {darkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  {language === "vi" ? "Chế Độ Giao Diện" : "Visual Theme Style"}
                </span>
                <p className="text-[10px] text-neutral-400">
                  {language === "vi" ? "Chuyển đổi giao diện Sáng / Tối bảo vệ mắt." : "Protect eyes with Dark mode."}
                </p>
              </div>

              <button
                onClick={onToggleDarkMode}
                id="settings-theme-switch-btn"
                className="p-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Section C: Role metadata indicator */}
          <div className="p-4 bg-indigo-50/40 dark:bg-neutral-850 rounded-xl border border-indigo-100/50 dark:border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4" id="settings-sync-panel">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center justify-center sm:justify-start gap-1.5">
                <UserCheck className="w-4.5 h-4.5 text-indigo-500" />
                {language === "vi" ? "Danh Tính Người Dùng & Đồng Bộ" : "Account Identity & Cloud Sync"}
              </span>
              <p className="text-[10px] text-neutral-500">
                {language === "vi" 
                  ? "Hệ thống tự động đồng bộ hóa tất cả lịch sử làm bài thông qua cơ sở dữ liệu lưu trữ đám mây đa thiết bị." 
                  : "All grades and solved activities automatically sync to the database."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-[9px] uppercase font-mono bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400 rounded-full font-extrabold border border-indigo-200/50">
                User-ID: {currentUser.id || "Anonymous"}
              </span>
              <span className="px-2 py-1 text-[9px] uppercase font-mono bg-neutral-900 text-neutral-300 rounded mx-auto block max-w-xs text-center font-bold">
                {currentUser.role === "developer" ? "Developer Tools Active" : "Regular Student Account"}
              </span>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}
