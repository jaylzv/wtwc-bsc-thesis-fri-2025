import path from "path";

export const EXTENSIONS = [
  "uBlockOrigin",
  "PrivacyBadger",
  "Ghostery",
  "CanvasBlocker",
  "ClearURLs",
];
export type ExtensionType = (typeof EXTENSIONS)[number];
export const EXTENSION_PATHS: Map<ExtensionType, string> = new Map(
  EXTENSIONS.map((extension) => [
    extension,
    path.join(__dirname, `../../../extensions/${extension}/`),
  ])
);
