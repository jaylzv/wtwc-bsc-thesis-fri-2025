import path from "path";
import { getExtensionCombinations } from "./utils";

export const EXTENSIONS = [
  "uBlockOrigin",
  "PrivacyBadger",
  "Ghostery",
  "CanvasBlocker",
  "ClearURLs",
] as const;
export type ExtensionType = (typeof EXTENSIONS)[number];
export const EXTENSION_PATHS: Map<ExtensionType, string> = new Map(
  EXTENSIONS.map((extension) => [
    extension,
    path.join(__dirname, `../../../extensions/${extension}/`),
  ])
);
export const EXTENSION_COMBINATIONS: ReadonlyArray<
  ReadonlyArray<ExtensionType>
> = getExtensionCombinations();
