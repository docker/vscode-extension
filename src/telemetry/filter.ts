function redactFilePath(path: string): string {
  const split = path.split(/[/\\]/);
  if (split.length < 2) {
    return path;
  }
  const redacted = split.pop();
  if (redacted === undefined) {
    return '';
  }
  return `REDACTED/${redacted}`;
}

export function redact(s: string): string {
  const words = s.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    words[i] = redactFilePath(words[i]);
  }
  return words.join(' ');
}
