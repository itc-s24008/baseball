"use client";

import { useEffect, useState } from "react";

type Game = {
    team: string;
    result: string;
};

type DayData = {
    date: number;
    month: number;
    games: Game[];
};

// チームカラーマッピング
const TEAM_COLORS: Record<string, { bg: string; text: string; name: string }> = {
    "巨": { bg: "#FF6600", text: "#FFFFFF", name: "巨人" },
    "神": { bg: "#FFE500", text: "#000000", name: "阪神" },
    "広": { bg: "#DC143C", text: "#FFFFFF", name: "広島" },
    "中": { bg: "#0057B8", text: "#FFFFFF", name: "中日" },
    "ヤ": { bg: "#006AB6", text: "#FFFFFF", name: "ヤクルト" },
    "デ": { bg: "#003FA8", text: "#FFFFFF", name: "DeNA" },
    "ソ": { bg: "#FFD700", text: "#000000", name: "ソフトバンク" },
    "西": { bg: "#003478", text: "#FFFFFF", name: "西武" },
    "楽": { bg: "#8B0000", text: "#FFFFFF", name: "楽天" },
    "ロ": { bg: "#000000", text: "#FFFFFF", name: "ロッテ" },
    "日": { bg: "#003A70", text: "#FFFFFF", name: "日本ハム" },
    "オ": { bg: "#002D62", text: "#FFFFFF", name: "オリックス" },
};

function buildCalendar(year = 2025, monthIndex = 4) {
    const firstDay = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const weeks: (number | null)[][] = [];
    let week = new Array(7).fill(null);
    let day = 1;

    for (let i = firstDay; i < 7; i++) {
        week[i] = day++;
    }
    weeks.push(week);

    while (day <= daysInMonth) {
        week = new Array(7).fill(null);
        for (let i = 0; i < 7 && day <= daysInMonth; i++) {
            week[i] = day++;
        }
        weeks.push(week);
    }
    return weeks;
}

function parseGameResult(game: Game) {
    const [teams, scores] = game.team.split(" vs ").length === 2 
        ? [game.team.split(" vs "), game.result.split(" - ")]
        : [game.team.split("vs"), game.result.split("-")];
    
    if (!teams[0] || !teams[1]) return null;
    
    const homeTeam = teams[0].trim();
    const awayTeam = teams[1].trim();
    
    if (game.result.includes("中止") || game.result.includes("未定")) {
        return { homeTeam, awayTeam, homeScore: null, awayScore: null, status: "中止" };
    }
    
    const homeScore = parseInt(scores[0]?.trim() || "0");
    const awayScore = parseInt(scores[1]?.trim() || "0");
    
    return { homeTeam, awayTeam, homeScore, awayScore, status: "完了" };
}

function GameCard({ game }: { game: Game }) {
    const parsed = parseGameResult(game);
    if (!parsed) return null;
    
    const { homeTeam, awayTeam, homeScore, awayScore, status } = parsed;
    const homeColor = TEAM_COLORS[homeTeam] || { bg: "#999", text: "#FFF", name: homeTeam };
    const awayColor = TEAM_COLORS[awayTeam] || { bg: "#999", text: "#FFF", name: awayTeam };
    
    const homeWon = homeScore !== null && awayScore !== null && homeScore > awayScore;
    const awayWon = homeScore !== null && awayScore !== null && awayScore > homeScore;
    const isDraw = homeScore !== null && awayScore !== null && homeScore === awayScore;
    
    return (
        <div className="mb-1.5 text-xs">
            <div className="flex items-center justify-center gap-1">
                {/* ホームチーム */}
                <div 
                    className="px-2 py-1 rounded font-bold"
                    style={{ 
                        backgroundColor: homeColor.bg,
                        color: homeColor.text,
                        opacity: status === "中止" ? 0.5 : homeWon ? 1 : 0.6,
                        minWidth: "32px",
                        textAlign: "center"
                    }}
                >
                    {homeTeam}
                </div>
                
                {/* スコア */}
                {status === "完了" ? (
                    <div className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                        {homeScore}-{awayScore}
                    </div>
                ) : (
                    <div className="text-xs text-slate-400">中止</div>
                )}
                
                {/* アウェイチーム */}
                <div 
                    className="px-2 py-1 rounded font-bold"
                    style={{ 
                        backgroundColor: awayColor.bg,
                        color: awayColor.text,
                        opacity: status === "中止" ? 0.5 : awayWon ? 1 : 0.6,
                        minWidth: "32px",
                        textAlign: "center"
                    }}
                >
                    {awayTeam}
                </div>
            </div>
        </div>
    );
}

export default function Home() {
    const [byDate, setByDate] = useState<Record<number, Game[]>>({});
    const [loading, setLoading] = useState(true);
    const year = 2025;
    const monthIndex = 4;

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/npb_data_202505.json");
                const json: DayData[] = await res.json();

                const map: Record<number, Game[]> = {};
                for (const entry of json) {
                    if (entry.month === 5) {
                        map[entry.date] = entry.games;
                    }
                }
                setByDate(map);
            } catch (err) {
                console.error("データ読み込みエラー:", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const weeks = buildCalendar(year, monthIndex);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">読み込み中...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                        ⚾ NPB 2025年5月
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">試合結果カレンダー</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden">
                    <div className="grid grid-cols-7 bg-slate-700 text-white">
                        {["日", "月", "火", "水", "木", "金", "土"].map((day, i) => (
                            <div
                                key={day}
                                className="text-center py-3 font-bold text-sm"
                                style={{ 
                                    backgroundColor: i === 0 ? "#DC143C" : i === 6 ? "#0057B8" : undefined 
                                }}
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {weeks.map((week, wi) => (
                            <div key={wi} className="grid grid-cols-7 divide-x divide-slate-200 dark:divide-slate-700">
                                {week.map((date, di) => (
                                    <div
                                        key={di}
                                        className="min-h-32 p-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                                        style={{
                                            backgroundColor: di === 0 
                                                ? "rgba(220, 20, 60, 0.05)" 
                                                : di === 6 
                                                ? "rgba(0, 87, 184, 0.05)" 
                                                : undefined
                                        }}
                                    >
                                        {date && (
                                            <>
                                                <div className="font-bold text-lg mb-2 text-slate-700 dark:text-slate-300">
                                                    {date}
                                                </div>

                                                <div className="space-y-1">
                                                    {byDate[date] && byDate[date].length > 0 ? (
                                                        byDate[date].map((g, i) => (
                                                            <GameCard key={i} game={g} />
                                                        ))
                                                    ) : (
                                                        <div className="text-xs text-slate-400 text-center py-4">
                                                            試合なし
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 凡例 */}
                <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                    <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-100">チームカラー凡例</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {Object.entries(TEAM_COLORS).map(([code, info]) => (
                            <div
                                key={code}
                                className="flex items-center gap-2 px-3 py-2 rounded"
                                style={{ backgroundColor: info.bg, color: info.text }}
                            >
                                <span className="font-bold">{code}</span>
                                <span className="text-sm">{info.name}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                        <p>⚪ = 勝利 / △ = 引き分け / 太字 = 勝利チーム</p>
                    </div>
                </div>
            </div>
        </div>
    );
}