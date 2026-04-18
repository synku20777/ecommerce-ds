export type ClassDictionary = Record<string, boolean | null | undefined>;

export type ClassValue =
  | string
  | boolean
  | null
  | undefined
  | ClassDictionary
  | ClassValue[];

function flattenClassValue(value: ClassValue, output: string[]): void {
  if (!value) {
    return;
  }

  if (typeof value === "string") {
    if (value) {
      output.push(value);
    }
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      flattenClassValue(item, output);
    }
    return;
  }

  if (typeof value === "object") {
    for (const [className, shouldApply] of Object.entries(value)) {
      if (shouldApply) {
        output.push(className);
      }
    }
  }
}

export function classNames(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    flattenClassValue(input, classes);
  }

  return classes.join(" ");
}