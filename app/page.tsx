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

type Team = {
    code: string;
    name: string;
    color: string;
    textColor: string;
};

const CENTRAL_TEAMS: Team[] = [
    { code: "巨", name: "読売ジャイアンツ", color: "#FF6600", textColor: "#FFF" },
    { code: "神", name: "阪神タイガース", color: "#FFE500", textColor: "#000" },
    { code: "広", name: "広島東洋カープ", color: "#DC143C", textColor: "#FFF" },
    { code: "中", name: "中日ドラゴンズ", color: "#0057B8", textColor: "#FFF" },
    { code: "ヤ", name: "東京ヤクルトスワローズ", color: "#006AB6", textColor: "#FFF" },
    { code: "デ", name: "横浜DeNAベイスターズ", color: "#003FA8", textColor: "#FFF" }
];

const PACIFIC_TEAMS: Team[] = [
    { code: "ソ", name: "福岡ソフトバンクホークス", color: "#FFD700", textColor: "#000" },
    { code: "西", name: "埼玉西武ライオンズ", color: "#003478", textColor: "#FFF" },
    { code: "楽", name: "東北楽天ゴールデンイーグルス", color: "#8B0000", textColor: "#FFF" },
    { code: "ロ", name: "千葉ロッテマリーンズ", color: "#000000", textColor: "#FFF" },
    { code: "日", name: "北海道日本ハムファイターズ", color: "#003A70", textColor: "#FFF" },
    { code: "オ", name: "オリックス・バファローズ", color: "#002D62", textColor: "#FFF" }
];

const ALL_TEAMS = [...CENTRAL_TEAMS, ...PACIFIC_TEAMS];

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

export default function Home() {
    const [byDate, setByDate] = useState<Record<number, Game[]>>({});
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
    const year = 2025;
    const monthIndex = 4;

    useEffect(() => {
        async function load() {
            const res = await fetch("/npb_data_202505.json");
            const json: DayData[] = await res.json();

            const map: Record<number, Game[]> = {};
            for (const entry of json) {
                if (entry.month === 5) {
                    map[entry.date] = entry.games;
                }
            }
            setByDate(map);
        }
        load();
    }, []);

    const weeks = buildCalendar(year, monthIndex);

    // フィルタリング関数
    const filterGames = (games: Game[]) => {
        if (!selectedTeam) return games;
        return games.filter(game => game.team.includes(selectedTeam));
    };

    const getTeamInfo = (code: string) => {
        return ALL_TEAMS.find(t => t.code === code);
    };

    return (
        <div style={{ padding: 20, fontFamily: "system-ui", backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
            <h1 style={{ 
                textAlign: "center", 
                fontSize: 32, 
                marginBottom: 10,
                color: "#1a202c",
                fontWeight: "bold"
            }}>
                ⚾ 2025年5月 NPB 試合カレンダー
            </h1>
            
            {selectedTeam && (
                <div style={{ 
                    textAlign: "center", 
                    fontSize: 16, 
                    marginBottom: 20,
                    color: "#475569"
                }}>
                    <span style={{
                        padding: "6px 16px",
                        backgroundColor: getTeamInfo(selectedTeam)?.color,
                        color: getTeamInfo(selectedTeam)?.textColor,
                        borderRadius: 20,
                        fontWeight: "bold"
                    }}>
                        {getTeamInfo(selectedTeam)?.name} の試合を表示中
                    </span>
                    <button
                        onClick={() => setSelectedTeam(null)}
                        style={{
                            marginLeft: 10,
                            padding: "6px 16px",
                            backgroundColor: "#64748b",
                            color: "white",
                            border: "none",
                            borderRadius: 20,
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        ✕ 解除
                    </button>
                </div>
            )}

            <table
                style={{ 
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    width: "100%", 
                    maxWidth: 1200,
                    margin: "0 auto",
                    backgroundColor: "white",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    borderRadius: 12,
                    overflow: "hidden"
                }}
            >
                <thead>
                <tr>
                    {["日", "月", "火", "水", "木", "金", "土"].map((d, i) => (
                        <th
                            key={d}
                            style={{
                                padding: 16,
                                backgroundColor: i === 0 ? "#ef4444" : i === 6 ? "#3b82f6" : "#475569",
                                color: "white",
                                textAlign: "center",
                                fontWeight: "bold",
                                fontSize: 14
                            }}
                        >
                            {d}
                        </th>
                    ))}
                </tr>
                </thead>

                <tbody>
                {weeks.map((week, wi) => (
                    <tr key={wi}>
                        {week.map((date, di) => {
                            const games = date && byDate[date] ? filterGames(byDate[date]) : [];
                            const hasGames = games.length > 0;
                            
                            return (
                                <td
                                    key={di}
                                    style={{
                                        verticalAlign: "top",
                                        border: "1px solid #e2e8f0",
                                        minHeight: 140,
                                        padding: 12,
                                        backgroundColor: di === 0 ? "#fef2f2" : di === 6 ? "#eff6ff" : "white",
                                        opacity: selectedTeam && date && !hasGames ? 0.3 : 1
                                    }}
                                >
                                    {date && (
                                        <>
                                            <div style={{ 
                                                fontWeight: "bold", 
                                                fontSize: 18,
                                                color: di === 0 ? "#dc2626" : di === 6 ? "#2563eb" : "#1e293b",
                                                marginBottom: 8
                                            }}>
                                                {date}
                                            </div>

                                            <div style={{ fontSize: 12 }}>
                                                {hasGames ? (
                                                    games.map((g, i) => (
                                                        <div 
                                                            key={i} 
                                                            style={{ 
                                                                marginBottom: 6,
                                                                padding: "6px 8px",
                                                                backgroundColor: "white",
                                                                borderRadius: 6,
                                                                border: "1px solid #e2e8f0",
                                                                fontSize: 11,
                                                                lineHeight: 1.4
                                                            }}
                                                        >
                                                            <div style={{ 
                                                                fontWeight: "600",
                                                                color: "#334155",
                                                                marginBottom: 2
                                                            }}>
                                                                {g.team}
                                                            </div>
                                                            <div style={{ 
                                                                color: g.result.includes("中止") ? "#94a3b8" : "#0ea5e9",
                                                                fontWeight: "bold",
                                                                fontSize: 13
                                                            }}>
                                                                {g.result.replace(/\s*-\s*/g, ' - ').replace(/\s+/g, ' ')}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : date && byDate[date] ? (
                                                    <div style={{ 
                                                        color: "#cbd5e1",
                                                        textAlign: "center",
                                                        padding: "20px 0",
                                                        fontSize: 11
                                                    }}>
                                                        フィルタ対象外
                                                    </div>
                                                ) : (
                                                    <div style={{ 
                                                        color: "#cbd5e1",
                                                        textAlign: "center",
                                                        padding: "20px 0",
                                                        fontSize: 11
                                                    }}>
                                                        試合なし
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </td>
                            );
                        })}
                    </tr>
                ))}
                </tbody>
            </table>
            
            <div style={{ 
                maxWidth: 1200, 
                margin: "20px auto",
                padding: "16px 20px",
                backgroundColor: "white",
                borderRadius: 12,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                fontSize: 12,
                color: "#64748b"
            }}>
                💡 球団ロゴをクリックすると、その球団の試合のみを表示できます。
            </div>
            
            <div style={{ 
                maxWidth: 1200, 
                margin: "20px auto",
                padding: "20px",
                backgroundColor: "white",
                borderRadius: 12,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
                <h2 style={{ 
                    fontSize: 18, 
                    fontWeight: "bold", 
                    marginBottom: 16,
                    color: "#1e293b"
                }}>
                    球団選択
                </h2>
                
                <div style={{ marginBottom: 20 }}>
                    <div style={{ 
                        fontSize: 14, 
                        fontWeight: "600", 
                        marginBottom: 10,
                        color: "#475569"
                    }}>
                        セントラル・リーグ
                    </div>
                    <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: 10
                    }}>
                        {CENTRAL_TEAMS.map((team) => (
                            <button
                                key={team.code}
                                onClick={() => setSelectedTeam(selectedTeam === team.code ? null : team.code)}
                                style={{ 
                                    padding: "12px 16px",
                                    borderRadius: 8,
                                    backgroundColor: team.color,
                                    color: team.textColor,
                                    fontSize: 13,
                                    fontWeight: "600",
                                    border: selectedTeam === team.code ? "3px solid #1e293b" : "3px solid transparent",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    boxShadow: selectedTeam === team.code ? "0 4px 8px rgba(0,0,0,0.2)" : "none",
                                    transform: selectedTeam === team.code ? "scale(1.05)" : "scale(1)"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "scale(1.05)";
                                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedTeam !== team.code) {
                                        e.currentTarget.style.transform = "scale(1)";
                                        e.currentTarget.style.boxShadow = "none";
                                    }
                                }}
                            >
                                <div style={{ fontSize: 20, marginBottom: 4 }}>{team.code}</div>
                                <div style={{ fontSize: 11 }}>{team.name}</div>
                            </button>
                        ))}
                    </div>
                </div>
                
                <div>
                    <div style={{ 
                        fontSize: 14, 
                        fontWeight: "600", 
                        marginBottom: 10,
                        color: "#475569"
                    }}>
                        パシフィック・リーグ
                    </div>
                    <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: 10
                    }}>
                        {PACIFIC_TEAMS.map((team) => (
                            <button
                                key={team.code}
                                onClick={() => setSelectedTeam(selectedTeam === team.code ? null : team.code)}
                                style={{ 
                                    padding: "12px 16px",
                                    borderRadius: 8,
                                    backgroundColor: team.color,
                                    color: team.textColor,
                                    fontSize: 13,
                                    fontWeight: "600",
                                    border: selectedTeam === team.code ? "3px solid #1e293b" : "3px solid transparent",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    boxShadow: selectedTeam === team.code ? "0 4px 8px rgba(0,0,0,0.2)" : "none",
                                    transform: selectedTeam === team.code ? "scale(1.05)" : "scale(1)"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "scale(1.05)";
                                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedTeam !== team.code) {
                                        e.currentTarget.style.transform = "scale(1)";
                                        e.currentTarget.style.boxShadow = "none";
                                    }
                                }}
                            >
                                <div style={{ fontSize: 20, marginBottom: 4 }}>{team.code}</div>
                                <div style={{ fontSize: 11 }}>{team.name}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}