export function splitPassageParagraphs(content) {
  const normalized = String(content || "")
    .replace(/\r\n?/g, "\n")
    .trim();

  if (!normalized) {
    return [];
  }

  const explicitParagraphs = normalized
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (explicitParagraphs.length > 1) {
    return explicitParagraphs;
  }

  const sentences = normalized
    .match(/[^.!?]+(?:[.!?]+|$)/g)
    ?.map((sentence) => sentence.trim())
    .filter(Boolean) || [normalized];

  if (sentences.length < 4 || normalized.length < 500) {
    return [normalized];
  }

  const paragraphCount = Math.min(5, Math.max(3, Math.round(normalized.length / 400)));
  const sentencesPerParagraph = Math.ceil(sentences.length / paragraphCount);
  const paragraphs = [];

  for (let index = 0; index < sentences.length; index += sentencesPerParagraph) {
    paragraphs.push(sentences.slice(index, index + sentencesPerParagraph).join(" "));
  }

  return paragraphs;
}
