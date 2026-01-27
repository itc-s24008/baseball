"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

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
    const [selectedGame, setSelectedGame] = useState<{ game: Game; date: number } | null>(null);
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

    const filterGames = (games: Game[]) => {
        if (!selectedTeam) return games;
        return games.filter(game => game.team.includes(selectedTeam));
    };

    const getTeamInfo = (code: string) => {
        return ALL_TEAMS.find(t => t.code === code);
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>
                ⚾ 2025年5月 NPB 試合カレンダー
            </h1>
            
            {selectedTeam && (
                <div className={styles.filterBadge}>
                    <span 
                        className={styles.teamBadge}
                        style={{
                            backgroundColor: getTeamInfo(selectedTeam)?.color,
                            color: getTeamInfo(selectedTeam)?.textColor,
                        }}
                    >
                        {getTeamInfo(selectedTeam)?.name} の試合を表示中
                    </span>
                    <button
                        onClick={() => setSelectedTeam(null)}
                        className={styles.clearButton}
                    >
                        ✕ 解除
                    </button>
                </div>
            )}

            <table className={styles.calendar}>
                <thead>
                <tr>
                    {["日", "月", "火", "水", "木", "金", "土"].map((d, i) => (
                        <th
                            key={d}
                            className={`${styles.headerCell} ${
                                i === 0 ? styles.headerSunday : 
                                i === 6 ? styles.headerSaturday : 
                                styles.headerWeekday
                            }`}
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
                                    className={`${styles.calendarCell} ${
                                        di === 0 ? styles.cellSunday : 
                                        di === 6 ? styles.cellSaturday : 
                                        styles.cellWeekday
                                    } ${selectedTeam && date && !hasGames ? styles.cellFiltered : ''}`}
                                >
                                    {date && (
                                        <>
                                            <div className={`${styles.dateNumber} ${
                                                di === 0 ? styles.dateSunday : 
                                                di === 6 ? styles.dateSaturday : 
                                                styles.dateWeekday
                                            }`}>
                                                {date}
                                            </div>

                                            <div className={styles.gamesContainer}>
                                                {hasGames ? (
                                                    games.map((g, i) => (
                                                        <div 
                                                            key={i} 
                                                            onClick={() => setSelectedGame({ game: g, date: date })}
                                                            className={styles.gameCard}
                                                        >
                                                            <div className={styles.gameTeam}>
                                                                {g.team}
                                                            </div>
                                                            <div className={`${styles.gameResult} ${
                                                                g.result.includes("中止") ? styles.gameResultCancelled : styles.gameResultActive
                                                            }`}>
                                                                {g.result.replace(/\s*-\s*/g, ' - ').replace(/\s+/g, ' ')}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : date && byDate[date] ? (
                                                    <div className={styles.noGamesFiltered}>
                                                        フィルタ対象外
                                                    </div>
                                                ) : (
                                                    <div className={styles.noGames}>
                                                        <div className={styles.noGamesIcon}>
                                                            ⚾
                                                        </div>
                                                        <div className={styles.noGamesText}>
                                                            試合なし
                                                        </div>
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
            
            {selectedGame && (
                <div 
                    onClick={() => setSelectedGame(null)}
                    className={styles.modalOverlay}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        className={styles.modalContent}
                    >
                        <button
                            onClick={() => setSelectedGame(null)}
                            className={styles.modalClose}
                        >
                            ✕
                        </button>
                        
                        <h2 className={styles.modalTitle}>
                            試合詳細
                        </h2>
                        
                        <div className={styles.modalDate}>
                            {year}年{monthIndex + 1}月{selectedGame.date}日
                        </div>
                        
                        {(() => {
                            const teams = selectedGame.game.team.includes(" vs ")
                                ? selectedGame.game.team.split(" vs ")
                                : selectedGame.game.team.split("vs");
                            const homeTeam = teams[0]?.trim();
                            const awayTeam = teams[1]?.trim();
                            const homeInfo = ALL_TEAMS.find(t => t.code === homeTeam);
                            const awayInfo = ALL_TEAMS.find(t => t.code === awayTeam);
                            
                            const isCancelled = selectedGame.game.result.includes("中止") || selectedGame.game.result.includes("未定");
                            const scores = !isCancelled ? selectedGame.game.result.split("-").map(s => s.trim()) : [];
                            const homeScore = scores[0] ? parseInt(scores[0]) : null;
                            const awayScore = scores[1] ? parseInt(scores[1]) : null;
                            const homeWon = homeScore !== null && awayScore !== null && homeScore > awayScore;
                            const awayWon = homeScore !== null && awayScore !== null && awayScore > homeScore;
                            
                            return (
                                <>
                                    <div className={styles.matchupContainer}>
                                        <div className={styles.teamContainer}>
                                            <div 
                                                className={`${styles.teamLogo} ${
                                                    isCancelled ? styles.teamLogoCancelled : 
                                                    homeWon ? styles.teamLogoWinner : styles.teamLogoLoser
                                                }`}
                                                style={{
                                                    backgroundColor: homeInfo?.color || "#999",
                                                    color: homeInfo?.textColor || "#FFF",
                                                }}
                                            >
                                                {homeTeam}
                                            </div>
                                            <div className={styles.teamName}>
                                                {homeInfo?.name || homeTeam}
                                            </div>
                                            {!isCancelled && (
                                                <div className={`${styles.teamScore} ${
                                                    homeWon ? styles.scoreWinner : styles.scoreNeutral
                                                }`}>
                                                    {homeScore}
                                                </div>
                                            )}
                                            {homeWon && <div className={styles.winnerLabel}>勝利</div>}
                                        </div>
                                        
                                        <div className={styles.vsText}>
                                            VS
                                        </div>
                                        
                                        <div className={styles.teamContainer}>
                                            <div 
                                                className={`${styles.teamLogo} ${
                                                    isCancelled ? styles.teamLogoCancelled : 
                                                    awayWon ? styles.teamLogoWinner : styles.teamLogoLoser
                                                }`}
                                                style={{
                                                    backgroundColor: awayInfo?.color || "#999",
                                                    color: awayInfo?.textColor || "#FFF",
                                                }}
                                            >
                                                {awayTeam}
                                            </div>
                                            <div className={styles.teamName}>
                                                {awayInfo?.name || awayTeam}
                                            </div>
                                            {!isCancelled && (
                                                <div className={`${styles.teamScore} ${
                                                    awayWon ? styles.scoreWinner : styles.scoreNeutral
                                                }`}>
                                                    {awayScore}
                                                </div>
                                            )}
                                            {awayWon && <div className={styles.winnerLabel}>勝利</div>}
                                        </div>
                                    </div>
                                    
                                    {isCancelled && (
                                        <div className={styles.cancelledNotice}>
                                            ⚠️ この試合は中止または未定です
                                        </div>
                                    )}
                                    
                                    {!isCancelled && homeScore === awayScore && (
                                        <div className={styles.drawNotice}>
                                            引き分け
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}
            
            <div className={styles.hint}>
                💡 球団ロゴをクリックすると、その球団の試合のみを表示できます。
            </div>
            
            <div className={styles.teamSelection}>
                <h2 className={styles.selectionTitle}>
                    📋 球団選択
                </h2>
                
                <div className={styles.leagueSection}>
                    <div className={styles.leagueTitle}>
                        セントラル・リーグ
                    </div>
                    <div className={styles.teamGrid}>
                        {CENTRAL_TEAMS.map((team) => (
                            <button
                                key={team.code}
                                onClick={() => setSelectedTeam(selectedTeam === team.code ? null : team.code)}
                                className={`${styles.teamButton} ${selectedTeam === team.code ? styles.teamButtonSelected : ''}`}
                                style={{ 
                                    backgroundColor: team.color,
                                    color: team.textColor,
                                }}
                            >
                                <div className={styles.teamButtonCode}>{team.code}</div>
                                <div className={styles.teamButtonName}>{team.name}</div>
                            </button>
                        ))}
                    </div>
                </div>
                
                <div>
                    <div className={styles.leagueTitle}>
                        パシフィック・リーグ
                    </div>
                    <div className={styles.teamGrid}>
                        {PACIFIC_TEAMS.map((team) => (
                            <button
                                key={team.code}
                                onClick={() => setSelectedTeam(selectedTeam === team.code ? null : team.code)}
                                className={`${styles.teamButton} ${selectedTeam === team.code ? styles.teamButtonSelected : ''}`}
                                style={{ 
                                    backgroundColor: team.color,
                                    color: team.textColor,
                                }}
                            >
                                <div className={styles.teamButtonCode}>{team.code}</div>
                                <div className={styles.teamButtonName}>{team.name}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}