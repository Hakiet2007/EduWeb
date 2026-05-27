import React, { useState } from "react";
import { 
  Play, 
  CheckCircle, 
  HelpCircle, 
  BookOpen, 
  Award, 
  Compass, 
  RefreshCw, 
  UserCheck, 
  Lock, 
  Calendar,
  Layers,
  Sparkles,
  AlertTriangle,
  Flame,
  Check,
  X,
  ChevronRight
} from "lucide-react";

interface QuizItem {
  subject: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface DailyQuizTabProps {
  currentUser: any;
  language: "vi" | "en";
  onRewardXp: (amount: number, reasonVi: string, reasonEn: string) => void;
  onSaveQuizSubmission: (submission: {
    date: string;
    score: number;
    total: number;
    subjects: string[];
    grade: string;
    xpEarned: number;
  }) => void;
  onUpdateCurrentUser: (updatedFields: Partial<any>) => void;
}

const translations = {
  vi: {
    title: "Thách Thức Trực Tuyến Hàng Ngày",
    subtitle: "Tạo đề thi ngẫu nhiên bằng AI từ 3 môn học bất kỳ theo khung chương trình của bạn để rèn luyện trí tuệ.",
    selectSubjects: "Chọn 3 môn học để AI xây dựng đề thi:",
    gradeLabel: "Trình độ cấp lớp:",
    generateBtn: "Bắt đầu tạo đề thi (AI Realtime)",
    generating: "Mạng lưới AI đang biên soạn câu hỏi...",
    submitting: "Đang chấm điểm và lưu kết quả...",
    timeRemaining: "Thời gian còn lại",
    xpEarned: "Bạn nhận được",
    bypassCooldown: "Bỏ qua thời gian chờ (Chế độ Nhà phát triển)",
    dailyLimitReached: "Hôm nay bạn đã vượt quá giới hạn 12 câu hỏi giải quyết hàng ngày!",
    cooldownTitle: "Hệ thống AI đang nghỉ ngơi",
    cooldownDesc: "Vui lòng đợi cho đến khi hết thời gian chờ để bắt đầu lượt thách thức tiếp theo.",
    limitDesc: "Học tập hiệu quả đòi hỏi sự nghỉ ngơi. Hãy quay trở lại vào ngày mai nhé!",
    score: "Điểm số của bạn",
    passed: "ĐẠT CHỈ TIÊU!",
    failed: "CẦN CỐ GẮNG HƠN",
    correct: "Đúng",
    incorrect: "Sai",
    showExplanation: "Xem giải thích chi tiết",
    submitBtn: "Nộp bài và Chấm điểm",
    tryAgain: "Làm đề thi mới",
  },
  en: {
    title: "Daily AI Learning Challenge",
    subtitle: "AI builds active quiz generators with any 3 selected subjects matching your core curriculum grade.",
    selectSubjects: "Select 3 subjects for personalized AI generated quizzes:",
    gradeLabel: "Target Grade level:",
    generateBtn: "Initiate Quiz Generation (Active AI)",
    generating: "AI cognitive engine is designing questions...",
    submitting: "Submitting scorecard and verifying solutions...",
    timeRemaining: "Time remaining",
    xpEarned: "You have earned",
    bypassCooldown: "Bypass cooldown timer (Developer override)",
    dailyLimitReached: "You have exceeded your allowance of 12 questions resolved today!",
    cooldownTitle: "AI Quiz Cooldown Active",
    cooldownDesc: "Please wait until the recovery timer cooldown runs out before initiating your next challenge.",
    limitDesc: "Steady learning rewards pauses. Return tomorrow to build your streak higher!",
    score: "Your Score",
    passed: "CRITERION MET!",
    failed: "PRACTICE MAKES PERFECT",
    correct: "Correct",
    incorrect: "Incorrect",
    showExplanation: "Review Analytical Explanation",
    submitBtn: "Submit and Score Exam",
    tryAgain: "Formulate New Quiz",
  }
};

const SUBJECT_POOL = [
  { id: "Toán", labelVi: "Toán học (Maths)", labelEn: "Mathematics" },
  { id: "Lý", labelVi: "Vật lý (Physics)", labelEn: "Physics" },
  { id: "Hoá", labelVi: "Hóa học (Chemistry)", labelEn: "Chemistry" },
  { id: "Anh", labelVi: "Tiếng Anh (English)", labelEn: "English Language" },
  { id: "Sinh", labelVi: "Sinh học (Biology)", labelEn: "Biology" },
  { id: "Khoa học tự nhiên", labelVi: "Khoa học tự nhiên (Science)", labelEn: "Natural Sciences" }
];

const GRADE_OPTIONS = [
  { value: "6", labelVi: "Lớp 6 (THCS)", labelEn: "Grade 6 (Secondary School)" },
  { value: "7", labelVi: "Lớp 7 (THCS)", labelEn: "Grade 7 (Secondary School)" },
  { value: "8", labelVi: "Lớp 8 (THCS)", labelEn: "Grade 8 (Secondary School)" },
  { value: "9", labelVi: "Lớp 9 (THCS)", labelEn: "Grade 9 (Secondary School)" },
  { value: "10", labelVi: "Lớp 10 (THPT)", labelEn: "Grade 10 (High School)" },
  { value: "11", labelVi: "Lớp 11 (THPT)", labelEn: "Grade 11 (High School)" },
  { value: "12", labelVi: "Lớp 12 (THPT)", labelEn: "Grade 12 (High School)" },
];

export default function DailyQuizTab({ currentUser, language, onRewardXp, onSaveQuizSubmission, onUpdateCurrentUser }: DailyQuizTabProps) {
  const t = translations[language];
  const [loading, setLoading] = useState(false);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scores, setScores] = useState<Record<number, boolean>>({});
  const [errorMsg, setErrorMsg] = useState("");
  
  // Picked subjects to send to the AI
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(["Toán", "Lý", "Hoá"]);
  const [selectedGrade, setSelectedGrade] = useState<string>("10");
  const [isConfiguringSubjects, setIsConfiguringSubjects] = useState(true);

  // Check limits & cooldowns
  const todayStr = new Date().toISOString().split("T")[0];
  const userStats = currentUser.stats || {
    xp: 0,
    streak: 0,
    solvedCountToday: 0,
    lastActiveDate: "",
    quizCooldownUntil: ""
  };

  const solvedCountToday = userStats.lastActiveDate === todayStr ? (userStats.solvedCountToday || 0) : 0;
  const isCooldownActive = userStats.quizCooldownUntil && new Date(userStats.quizCooldownUntil) > new Date();
  const isDailyLimitReached = solvedCountToday >= 12;

  const toggleSubject = (subId: string) => {
    if (selectedSubjects.includes(subId)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter(s => s !== subId));
      }
    } else {
      if (selectedSubjects.length < 3) {
        setSelectedSubjects([...selectedSubjects, subId]);
      } else {
        // Shift first element out & add new
        setSelectedSubjects([...selectedSubjects.slice(1), subId]);
      }
    }
  };

  const fetchQuizzes = async () => {
    setLoading(true);
    setErrorMsg("");
    setQuizzes([]);

    const subjectsToGenerate = selectedSubjects.length > 0 ? selectedSubjects : ["Toán", "Lý", "Hoá"];

    try {
      // Pass the user's custom key securely if they pasted one
      const userKey = localStorage.getItem("gemini_user_api_key") || "";
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-key": userKey
        },
        body: JSON.stringify({
          subjects: subjectsToGenerate,
          grade: selectedGrade
        })
      });

      let data;
      if (res.ok) {
        data = await res.json();
      }

      if (data && data.success && data.quiz) {
        setQuizzes(data.quiz);
        setSelectedAnswers({});
        setIsSubmitted(false);
        setScores({});
        setIsConfiguringSubjects(false);
      } else {
        const errorText = data?.error || (language === "vi" ? "Đường truyền AI bận hoặc lỗi tạo đề thi. Vui lòng thử lại sau!" : "Gemini is busy or quiz generation failed. Please try again later!");
        setErrorMsg(errorText);
        window.showToast?.(errorText, "role_alert");
      }
    } catch (err) {
      console.warn("API Endpoint fetch failed:", err);
      const errorText = language === "vi" 
        ? "Kết nối máy chủ thất bại. Không thể tải bộ câu hỏi tự động." 
        : "Server connection failed. Unable to fetch automated quiz.";
      setErrorMsg(errorText);
      window.showToast?.(errorText, "role_alert");
    } finally {
      setLoading(false);
    }
  };

  const handleBypassCooldown = () => {
    onUpdateCurrentUser({
      stats: {
        ...userStats,
        quizCooldownUntil: "",
        solvedCountToday: 0
      }
    });
    window.showToast?.(
      language === "vi" ? "Đã đặt lại bộ bấm giờ chờ học tập thành công!" : "Successfully reset learning wait timers!", 
      "success"
    );
  };

  const handleOptionSelect = (qIdx: number, ansChar: string) => {
    if (isSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [qIdx]: ansChar
    });
  };

  const handleSubmitQuiz = () => {
    if (quizzes.length === 0 || isSubmitted) return;

    // Must answer all
    const keysUnanswered = quizzes.map((_, idx) => idx).filter(idx => !selectedAnswers[idx]);
    if (keysUnanswered.length > 0) {
      window.showToast?.(
        language === "vi" 
          ? `Bạn chưa hoàn thành tất cả các câu hỏi (${3 - keysUnanswered.length}/3)!` 
          : `Please fill in all options before grading (${3 - keysUnanswered.length}/3)!`,
        "info"
      );
      return;
    }

    const calculatedScores: Record<number, boolean> = {};
    let correctCount = 0;

    quizzes.forEach((q, idx) => {
      const userAns = selectedAnswers[idx] || "";
      const isCorrect = userAns.toUpperCase().trim().startsWith(q.correctAnswer.toUpperCase().trim());
      calculatedScores[idx] = isCorrect;
      if (isCorrect) {
        correctCount++;
      }
    });

    setScores(calculatedScores);
    setIsSubmitted(true);

    // Give points rewards
    const pointsPerQuestion = 15;
    const gainedXp = correctCount * pointsPerQuestion;
    const bonusXp = correctCount === quizzes.length ? 15 : 0; // All right bonus
    const totalAwardXp = gainedXp + bonusXp;

    if (totalAwardXp > 0) {
      onRewardXp(
        totalAwardXp,
        `Hoàn thành thử thách AI (${correctCount}/${quizzes.length} câu đúng)${bonusXp > 0 ? " + Thưởng Tuyệt Đối" : ""}`,
        `Completed AI Quiz challenge (${correctCount}/${quizzes.length} correct answers)${bonusXp > 0 ? " + Perfect Run Bonus" : ""}`
      );
    }

    // Set a dynamic learning cooldown of 3 minutes for pedagogical health
    const fiveMinutesLater = new Date(Date.now() + 3 * 60 * 1000).toISOString();
    
    onUpdateCurrentUser({
      stats: {
        ...userStats,
        solvedCountToday: solvedCountToday + quizzes.length,
        lastActiveDate: todayStr,
        quizCooldownUntil: fiveMinutesLater
      }
    });

    onSaveQuizSubmission({
      date: new Date().toISOString(),
      score: correctCount,
      total: quizzes.length,
      subjects: selectedSubjects,
      grade: selectedGrade,
      xpEarned: totalAwardXp
    });

    window.showToast?.(
      language === "vi"
        ? `Kết quả: Đúng được ${correctCount}/${quizzes.length} câu học tập!`
        : `Graded: You got ${correctCount}/${quizzes.length} challenges accurate!`,
      correctCount >= 2 ? "success" : "info"
    );
  };

  const resetChallengeFlow = () => {
    setQuizzes([]);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScores({});
    setIsConfiguringSubjects(true);
    setErrorMsg("");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-2" id="ai-quiz-view-container">
      {/* Upper Brand Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] uppercase font-mono tracking-widest bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/35 rounded-full font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Proctored
            </span>
            {currentUser.role === "developer" && (
              <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 rounded-full font-bold">
                Dev Bypass Active
              </span>
            )}
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50 flex items-center gap-2">
            <Layers className="w-5.5 h-5.5 text-indigo-500" /> {t.title}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xl">
            {t.subtitle}
          </p>
        </div>

        {/* Cooldown/Reset Shortcuts */}
        <div className="flex flex-wrap gap-2 items-center">
          {currentUser.role === "developer" && (
            <button
              onClick={handleBypassCooldown}
              id="dev-bypass-cooldown-btn"
              className="px-3 py-1.5 text-xs font-mono font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg flex items-center gap-1.5 border border-dashed border-neutral-300 dark:border-neutral-700"
            >
              <RefreshCw className="w-3.5 h-3.5" /> {t.bypassCooldown}
            </button>
          )}

          {/* Today stats */}
          <div className="px-3.5 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-mono flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>
              {language === "vi" ? `Đã làm: ${solvedCountToday}/12 câu hằng ngày` : `Solved Today: ${solvedCountToday}/12`}
            </span>
          </div>
        </div>
      </div>

      {/* Main Error Message if any */}
      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-950/25 border border-red-100 dark:border-red-900/40 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-start gap-2.5 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <span className="font-bold">{language === "vi" ? "Lỗi truy cập AI:" : "AI Service Alert:"}</span>
            <p className="font-medium text-neutral-700 dark:text-neutral-300">{errorMsg}</p>
            <p className="text-[10px] text-red-500/80 mt-1">
              {language === "vi" 
                ? "💡 Gợi ý: Hãy nhấp vào Thử chọn lại môn học hoặc dán khóa Gemini API Key của riêng bạn trong tab Cài đặt để hoạt động 24/7."
                : "💡 Advice: Click back to select other topics, or paste your personal Gemini API Key in Settings to restore realtime generation directly."}
            </p>
            <div className="pt-2">
              <button 
                onClick={resetChallengeFlow}
                className="px-2.5 py-1 bg-red-600 text-white rounded text-[10px] hover:bg-red-700 font-bold transition-all"
              >
                {language === "vi" ? "Quay lại chọn môn học" : "Choose Subjects Again"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Limits Checked: Cooldown Timer */}
      {!isDailyLimitReached && isCooldownActive && currentUser.role !== "developer" && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto shadow-sm animate-fadeIn" id="cooldown-active-notif">
          <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7 text-amber-600 dark:text-amber-400 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {t.cooldownTitle}
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
              {t.cooldownDesc} (Học tập thông minh đòi hỏi các khoảng giãn nghỉ lý tưởng từ 2-3 phút giữa mỗi bài thi để củng cố trí nhớ dài hạn).
            </p>
          </div>
          <div className="pt-2">
            <div className="inline-block p-1 bg-neutral-200/50 dark:bg-neutral-800 px-4 py-2 rounded-xl font-mono text-xs font-bold text-amber-600">
              {t.timeRemaining}: <b>{Math.ceil((new Date(userStats.quizCooldownUntil).getTime() - Date.now()) / 1000)}s</b>
            </div>
          </div>
          <p className="text-[10px] text-neutral-400">
            {language === "vi" ? "Mẹo: Bạn có thể chọn học lý thuyết hoặc tra cứu các tab khác trong lúc chờ." : "Tip: Practice reading textbook core materials or track classes while waiting."}
          </p>
        </div>
      )}

      {/* 2. Limits Checked: Daily Allowances */}
      {isDailyLimitReached && currentUser.role !== "developer" && (
        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto shadow-sm animate-fadeIn" id="daily-quota-reached-notif">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950 rounded-full flex items-center justify-center mx-auto">
            <Award className="w-7 h-7 text-indigo-600 dark:text-indigo-400 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
              {t.dailyLimitReached}
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
              {t.limitDesc} Thói quen học chăm chỉ mỗi ngày (Daily Streaks) hiệu quả gấp nhiều lần việc dốc hết sức trong một buổi tối duy nhất.
            </p>
          </div>
          <div className="font-mono text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-lg inline-block">
            {language === "vi" ? "Khôi phục lượt làm bài AI sau: 24h" : "Refresing in: 24h"}
          </div>
        </div>
      )}

      {/* 3. Setup Configured Board */}
      {isConfiguringSubjects && (!isCooldownActive || isDailyLimitReached || currentUser.role === "developer") && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-6 animate-fadeIn" id="subject-selector-board">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4 gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-1.5">
                <BookOpen className="w-4.5 h-4.5 text-neutral-500" />
                {t.selectSubjects}
              </h3>
              <p className="text-xs text-neutral-400">
                {language === "vi" ? "Chọn đúng tối đa và tối thiểu 3 môn học để AI xây dựng lộ trình" : "Personalize combinations for multiple topics based on curriculum."}
              </p>
            </div>

            {/* Grade Selection */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                {t.gradeLabel}
              </span>
              <select
                id="grade-select-box"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-bold px-3 py-1.5 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-indigo-500"
              >
                {GRADE_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {language === "vi" ? g.labelVi : g.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subjects Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SUBJECT_POOL.map((item) => {
              const selected = selectedSubjects.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleSubject(item.id)}
                  id={`subject-tag-${item.id}`}
                  className={`flex flex-col gap-2 p-4 text-left rounded-xl border transition-all relative overflow-hidden group hover:scale-[1.01] ${
                    selected
                      ? "bg-indigo-50/70 border-indigo-400 dark:bg-indigo-950/25 dark:border-indigo-600/80 text-indigo-950 dark:text-indigo-100 ring-2 ring-indigo-100 dark:ring-indigo-900/20"
                      : "bg-neutral-50 border-neutral-200 dark:bg-neutral-800/55 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold block">
                      {language === "vi" ? item.labelVi : item.labelEn}
                    </span>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                      selected ? "bg-indigo-500 text-white" : "border border-neutral-300 dark:border-neutral-700"
                    }`}>
                      {selected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </span>
                  </div>

                  {/* Subtitle */}
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
                    {selected ? "In Selection" : "Click to select"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-800/30 p-4 rounded-xl border border-neutral-150 dark:border-neutral-850/40 text-xs flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {language === "vi"
                ? `Độ khó của đề thi sẽ tự động bám sát chương trình Giáo Dục Phổ Thông mới đối với ${
                    selectedGrade === "10" || selectedGrade === "11" || selectedGrade === "12" ? "THPT" : "THCS"
                  } Lớp ${selectedGrade}.`
                : `Exam criteria dynamically scales according to Vietnamese national core standards for Grade ${selectedGrade}.`}
            </p>
          </div>

          {/* Generate Button Trigger */}
          <div className="pt-2 text-center">
            <button
              onClick={fetchQuizzes}
              disabled={loading}
              id="generate-realtime-quiz-btn"
              className="w-full sm:w-auto px-8 py-3 bg-neutral-900 hover:bg-neutral-850 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 mx-auto"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  {t.generating}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse text-indigo-400 dark:text-indigo-100" />
                  {t.generateBtn}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 4. Active Live Exam Board */}
      {quizzes.length > 0 && (
        <div className="space-y-6 animate-fadeIn" id="live-quiz-exam-board">
          <div className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-850 p-4 px-5 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-heartbeat"></span>
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                {language === "vi" ? `Đề thi trắc nghiệm Lớp ${selectedGrade}: 3 câu hỏi` : `Exam Session G-${selectedGrade}: 3 topics`}
              </span>
            </div>
            
            <button
              onClick={resetChallengeFlow}
              id="back-to-subject-cfg-btn"
              className="px-3 py-1 bg-white hover:bg-neutral-50 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-[11px] text-neutral-600 dark:text-neutral-300 font-bold rounded-md border border-neutral-200 dark:border-neutral-700 transition-all flex items-center gap-1"
            >
              ← {language === "vi" ? "Chọn lại môn học" : "Select subjects"}
            </button>
          </div>

          {/* Quizzes List Cards */}
          <div className="space-y-5">
            {quizzes.map((quiz, qId) => {
              const quizSelectedAns = selectedAnswers[qId] || "";
              const questionScore = scores[qId];

              return (
                <div
                  key={qId}
                  id={`quiz-card-${qId}`}
                  className={`bg-white dark:bg-neutral-900 border rounded-2xl shadow-sm overflow-hidden transition-all ${
                    isSubmitted
                      ? questionScore
                        ? "border-emerald-200 dark:border-emerald-900 ring-2 ring-emerald-50 dark:ring-emerald-950/25"
                        : "border-rose-200 dark:border-rose-900 ring-2 ring-rose-50 dark:ring-rose-950/25"
                      : "border-neutral-200 dark:border-neutral-800"
                  }`}
                >
                  {/* Topic Badge Header */}
                  <div className="bg-neutral-50 dark:bg-neutral-850/50 p-4 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-4">
                    <span className="px-3 py-1 bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-md text-[10px] font-mono tracking-wider font-bold uppercase">
                      📌 {quiz.subject}
                    </span>

                    {/* Score badges */}
                    {isSubmitted && (
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md flex items-center gap-1 font-mono ${
                        questionScore
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400"
                      }`}>
                        {questionScore ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" /> 100% Correct (+15 XP)
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5" /> Incorrect (0 XP)
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Question Prompt */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono block">
                        Question {qId + 1} of 3:
                      </span>
                      <h4 className="text-sm font-bold text-neutral-850 dark:text-neutral-100 leading-relaxed">
                        {quiz.question}
                      </h4>
                    </div>

                    {/* Options Buttons Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                      {quiz.options.map((option, opId) => {
                        const optionChar = option.trim().startsWith("A.") 
                          ? "A" 
                          : option.trim().startsWith("B.") 
                            ? "B" 
                            : option.trim().startsWith("C.") 
                              ? "C" 
                              : option.trim().startsWith("D.")
                                ? "D"
                                : String.fromCharCode(65 + opId); // Fallback to index letter

                        const isOptionSelected = quizSelectedAns === optionChar;
                        const isCorrectAnswer = optionChar === quiz.correctAnswer;

                        let optBg = "bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-850/70 border-neutral-200 dark:border-neutral-800 dark:text-neutral-200";
                        if (isOptionSelected) {
                          optBg = "bg-indigo-50 border-indigo-400 dark:bg-indigo-950/35 dark:border-indigo-600 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-400";
                        }

                        // Style feedback results
                        if (isSubmitted) {
                          if (isCorrectAnswer) {
                            optBg = "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 text-emerald-950 dark:text-emerald-300 font-semibold ring-2 ring-emerald-100 dark:ring-emerald-950";
                          } else if (isOptionSelected && !questionScore) {
                            optBg = "bg-rose-50 dark:bg-rose-950/35 border-rose-400 text-rose-950 dark:text-rose-300 ring-2 ring-rose-100 dark:ring-rose-950";
                          } else {
                            optBg = "bg-neutral-50/50 dark:bg-neutral-850/20 border-neutral-100 dark:border-neutral-850 opacity-60 text-neutral-500";
                          }
                        }

                        return (
                          <button
                            key={opId}
                            disabled={isSubmitted}
                            onClick={() => handleOptionSelect(qId, optionChar)}
                            className={`p-4 text-left rounded-xl border transition-all text-xs flex items-center gap-3 relative overflow-hidden ${optBg}`}
                          >
                            <span className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center border shrink-0 ${
                              isOptionSelected 
                                ? "bg-indigo-600 border-indigo-600 text-white" 
                                : isSubmitted && isCorrectAnswer
                                  ? "bg-emerald-600 border-emerald-600 text-white"
                                  : isSubmitted && isOptionSelected && !questionScore
                                    ? "bg-rose-600 border-rose-600 text-white"
                                    : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-350 dark:border-neutral-700"
                            }`}>
                              {optionChar}
                            </span>
                            
                            <span className="leading-tight shrink">{option}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanations Toggle */}
                    {isSubmitted && (
                      <div className="pt-3 border-t border-neutral-100 dark:border-neutral-850 bg-neutral-50/60 dark:bg-neutral-850/30 p-4 rounded-xl space-y-2">
                        <span className="text-[10px] font-mono tracking-wider text-indigo-500 dark:text-indigo-400 uppercase font-black flex items-center gap-1">
                          ✨ {t.showExplanation}
                        </span>
                        <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
                          {quiz.explanation || (language === "vi" ? "Đáp án chính xác là " + quiz.correctAnswer : "The correct solution is " + quiz.correctAnswer)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Score Summary Metrics */}
          {isSubmitted && (
            <div className="bg-neutral-900 border border-neutral-800 text-white rounded-2xl p-6 text-center space-y-4 animate-fadeIn shadow-xl" id="scores-card-summary">
              <h3 className="text-sm font-mono tracking-widest text-neutral-400 uppercase">
                {t.score}
              </h3>
              
              <div className="flex items-center justify-center gap-4">
                {/* Count */}
                <span className="text-5xl font-black text-indigo-400 tracking-tight">
                  {Object.values(scores).filter(Boolean).length} / 3
                </span>
                
                <span className="text-neutral-600 text-3xl font-light">|</span>

                {/* Passed status */}
                <div className="text-left">
                  <span className={`text-md font-extrabold uppercase ${
                    Object.values(scores).filter(Boolean).length >= 2 ? "text-emerald-400" : "text-amber-400"
                  }`}>
                    {Object.values(scores).filter(Boolean).length >= 2 ? t.passed : t.failed}
                  </span>
                  <p className="text-[11px] text-neutral-400 block font-mono">
                    +{Object.values(scores).filter(Boolean).length * 15} XP Received
                  </p>
                </div>
              </div>

              {/* Retry New Challenge */}
              <div className="pt-2">
                <button
                  onClick={resetChallengeFlow}
                  id="exam-flow-retry-btn"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all"
                >
                  {t.tryAgain}
                </button>
              </div>
            </div>
          )}

          {/* Bottom Action bar */}
          {!isSubmitted && (
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4">
              <span className="text-[10pt] text-neutral-500 font-mono hidden sm:inline">
                💡 {language === "vi" ? "Đáp án không thể thay đổi sau khi chấm điểm!" : "Solutions lock in upon scoring submission."}
              </span>
              
              <button
                onClick={handleSubmitQuiz}
                id="submit-exam-scoring-btn"
                className="w-full sm:w-auto px-10 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs tracking-wide uppercase rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all"
              >
                {t.submitBtn}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
