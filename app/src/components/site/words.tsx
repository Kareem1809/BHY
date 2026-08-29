// Splits a headline into masked word spans for the per-word scroll rise.
// Word-level splitting is safe for Hebrew and Arabic (letter joining and word
// order are preserved); the spans render server-side so the text is always
// present without JavaScript.
export function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span key={`${word}-${i}`} className="bhy-w">
          <span className="bhy-w-inner">{word}</span>
        </span>
      ))}
    </>
  );
}
