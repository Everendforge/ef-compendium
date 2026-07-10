import { BookOpen } from "lucide-react";

export function BookComingSoon() {
  return (
    <div className="book-coming-soon">
      <div>
        <BookOpen size={44} aria-hidden="true" />
        <p className="chapter">Book mode</p>
        <h1>Coming soon</h1>
        <p>
          A paginated, chapter-by-chapter edition of your universe is on its way.
          Until then, the Web mode remains the full reading experience.
        </p>
      </div>
    </div>
  );
}
