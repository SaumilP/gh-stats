"use client";
import { useTheme } from "next-themes";
import { Icon } from "./Icon";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return <button className="icon-button theme-toggle" aria-label="Toggle light and dark appearance" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}><span className="dark-icon"><Icon name="sun" size={18} /></span><span className="light-icon"><Icon name="moon" size={18} /></span></button>;
}
