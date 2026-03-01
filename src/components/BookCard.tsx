import Image from "next/image";
import Link from "next/link";
import type { BookCardProps } from "@/../types";

export default function BookCard({
  title,
  author,
  coverURL,
  slug,
}: BookCardProps) {
  return (
    <Link href={`/documents/${slug}`} className="group book-card">
      <div className="book-card-3d book-card-3d-hover">
        <div className="book-card-spine" />
        <div className="book-card-cover-wrapper">
          <Image
            src={coverURL}
            alt={title}
            width={200}
            height={200}
            className="book-card-cover"
          />
        </div>
      </div>
      <div className="book-card-meta">
        <h3 className="book-card-title">{title}</h3>
        <p className="book-card-author">{author}</p>
      </div>
    </Link>
  );
}
