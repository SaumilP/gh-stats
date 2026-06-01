export type Theme = "auto" | "dark" | "light";

export type CardType = "stats" | "languages" | "repos" | "streak";

export interface PreviewState {
  username: string;
  theme: Theme;
}

export interface CardPreview {
  type: CardType;
  src: string;
  alt: string;
}

export interface EmbedOptions {
  username: string;
  domain: string;
  theme: Theme;
}
