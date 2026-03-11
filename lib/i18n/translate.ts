import type { Dictionary } from "./dictionaries";

type DictionaryNode = string | DictionaryBranch;

type DictionaryBranch = {
  [key: string]: DictionaryNode;
};

export function t(
  dictionary: Dictionary,
  key: string,
  fallback?: string,
): string {
  const value = getValueByPath(dictionary as DictionaryBranch, key);
  if (typeof value === "string") {
    return value;
  }

  return fallback ?? key;
}

function getValueByPath(root: DictionaryBranch, path: string): DictionaryNode | undefined {
  return path.split(".").reduce<DictionaryNode | undefined>((current, segment) => {
    if (!current || typeof current === "string") {
      return undefined;
    }

    return current[segment];
  }, root);
}
