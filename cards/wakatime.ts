import type { ThemeStyle } from "../lib/theme";
import type { LanguageItem, LanguagesCardOptions } from "./languages";
import { renderLanguages } from "./languages";

export function renderWakaTime(
  style: ThemeStyle,
  username: string,
  langs: LanguageItem[],
  opts: LanguagesCardOptions = {},
) {
  return renderLanguages(style, username, langs, {
    ...opts,
    customTitle: opts.customTitle || "WakaTime",
    subtitle: opts.subtitle || `@${username}`,
  });
}
