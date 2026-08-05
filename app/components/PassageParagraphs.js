import { splitPassageParagraphs } from "../lib/passageText";

export function PassageParagraphs({ content, className }) {
  const paragraphs = splitPassageParagraphs(content);

  return (
    <div className={className}>
      {paragraphs.map((paragraph, index) => (
        <p key={`passage-paragraph-${index}`}>{paragraph}</p>
      ))}
    </div>
  );
}

