export type Theme = "light" | "dark"

export function getTheme(): Theme {
  if (typeof window === "undefined") return "light"
  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

export function setTheme(t: Theme) {
  document.documentElement.classList.toggle("dark", t === "dark")
  localStorage.setItem("theme", t)
  window.dispatchEvent(new Event("themechange"))
}

export function toggleTheme() {
  setTheme(getTheme() === "dark" ? "light" : "dark")
}
