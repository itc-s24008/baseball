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

function buildCalendar(year = 2025, monthIndex = 4) {
    const firstDay = new Date(year, monthIndex, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const weeks: (number | null)[][] = [];
    let week = new Array(7).fill(null);

    let day = 1;

    // 最初の週
    for (let i = firstDay; i < 7; i++) {
        week[i] = day++;
    }
    weeks.push(week);

    // 2週目以降
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
    const year = 2025;
    const monthIndex = 4; // May

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

    return (
        <div style={{ padding: 20, fontFamily: "system-ui" }}>
            <h1>2025年5月 – NPB 試合カレンダー</h1>

            <table
                style={{ borderCollapse: "collapse", width: "100%", maxWidth: 900 }}
            >
                <thead>
                <tr>
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                        <th
                            key={d}
                            style={{
                                padding: 8,
                                border: "1px solid #ddd",
                                textAlign: "center",
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
                        {week.map((date, di) => (
                            <td
                                key={di}
                                style={{
                                    verticalAlign: "top",
                                    border: "1px solid #eee",
                                    minHeight: 120,
                                    padding: 8,
                                }}
                            >
                                {date && (
                                    <>
                                        <div style={{ fontWeight: "bold" }}>{date}日</div>

                                        {/* 試合データ */}
                                        <div style={{ fontSize: 13, marginTop: 6 }}>
                                            {byDate[date] ? (
                                                byDate[date].map((g, i) => (
                                                    <div key={i} style={{ marginBottom: 4 }}>
                              <span
                                  style={{
                                      display: "inline-block",
                                      width: 120,
                                  }}
                              >
                                {g.team}
                              </span>
                                                        <span>{g.result}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{ color: "#999" }}>試合なし</div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
