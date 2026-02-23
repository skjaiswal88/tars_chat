"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export function useTheme() {
    const [theme, setTheme] = useState<Theme>("dark");

    // Load saved theme on mount
    useEffect(() => {
        const saved = (localStorage.getItem("tars-theme") as Theme) ?? "dark";
        setTheme(saved);
        document.documentElement.classList.toggle("light", saved === "light");
    }, []);

    const toggleTheme = () => {
        const next: Theme = theme === "dark" ? "light" : "dark";
        setTheme(next);
        localStorage.setItem("tars-theme", next);
        document.documentElement.classList.toggle("light", next === "light");
    };

    return { theme, toggleTheme };
}
