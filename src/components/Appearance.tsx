import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

type Appearance = "system" | "light" | "dark";
export function Appearance() {
  const [choice, setChoice] = useState<Appearance>("system");
  useEffect(() => {
    let current: Appearance = "system";
    try {
      const saved = localStorage.getItem("contextlumen-theme");
      if (saved === "light" || saved === "dark") current = saved;
    } catch {
      /* System is a usable default when storage is unavailable. */
    }
    setChoice(current);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const theme =
        current === "system" ? (media.matches ? "dark" : "light") : current;
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", theme === "dark" ? "#101f1b" : "#f8f7f2");
    };
    const storage = (event: StorageEvent) => {
      if (event.key !== "contextlumen-theme") return;
      current =
        event.newValue === "light" || event.newValue === "dark"
          ? event.newValue
          : "system";
      setChoice(current);
      apply();
    };
    const changed = (event: Event) => {
      current = (event as CustomEvent<Appearance>).detail;
      apply();
    };
    apply();
    media.addEventListener("change", apply);
    window.addEventListener("storage", storage);
    window.addEventListener("appearance-change", changed);
    return () => {
      media.removeEventListener("change", apply);
      window.removeEventListener("storage", storage);
      window.removeEventListener("appearance-change", changed);
    };
  }, []);
  const Icon = choice === "system" ? Monitor : choice === "dark" ? Moon : Sun;
  return (
    <label className="appearance-control">
      <Icon size={16} aria-hidden="true" />
      <span className="sr-only">Appearance</span>
      <select
        aria-label="Appearance"
        value={choice}
        onChange={(event) => {
          const value = event.target.value as Appearance;
          setChoice(value);
          try {
            localStorage.setItem("contextlumen-theme", value);
          } catch {
            /* Choice still applies to this page. */
          }
          window.dispatchEvent(
            new CustomEvent("appearance-change", { detail: value }),
          );
        }}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
