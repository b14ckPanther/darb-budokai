/** Fills {name} placeholders in config copy. A missing variable is a bug, so it throws. */
export function format(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{([a-z0-9_-]+)\}/gi, (_, key: string) => {
    if (!(key in vars)) throw new Error(`Copy variable {${key}} missing in "${template}"`);
    return String(vars[key]);
  });
}
