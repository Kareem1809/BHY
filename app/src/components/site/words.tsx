// Splits a headline into masked word spans for the per-word scroll rise.
// Word-level splitting is safe for Hebrew and Arabic (letter joining and word
// order are preserved); the spans render server-side so the text is always
// present without JavaScript.
// The spaces between the spans are REAL space characters, not margins: with
// margins alone the words looked separated but every reader that consumes the
// text — a screen reader, a copy-paste, a search engine indexing the page —
// received one run-on word ("מרעיוןלבית").
export function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span key={`${word}-${i}`}>
          {i > 0 ? " " : null}
          <span className="bhy-w">
            <span className="bhy-w-inner">{word}</span>
          </span>
        </span>
      ))}
    </>
  );
}
