'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

const notes = [
  {
    title: 'Projects',
    body: 'Group the work into projects and keep each one easy to find.',
  },
  {
    title: 'Notes and links',
    body: 'Hold the details, points, images, and links next to the task.',
  },
  {
    title: 'A clear status',
    body: 'See what is waiting, in progress, or finished without digging.',
  },
];

export default function Home() {
  const { status } = useSession();
  const signedIn = status === 'authenticated';

  return (
    <div className="landing">
      <section className="landing-hero">
        <p className="landing-kicker">Knnote</p>
        <h1 className="landing-title">A quiet place for the work in front of you.</h1>
        <p className="landing-lead">
          Keep projects, notes, dates, and status together. Open the workspace when you are ready to write.
        </p>
        <div className="landing-actions">
          {signedIn ? (
            <Link href="/workspace" className="btn-primary">
              Open workspace
            </Link>
          ) : (
            <>
              <Link href="/auth/signin" className="btn-primary">
                Sign in
              </Link>
              <Link href="/auth/register" className="btn-secondary">
                Create an account
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="landing-grid" aria-label="What Knnote holds">
        {notes.map((note) => (
          <article key={note.title} className="panel landing-card">
            <h2 className="panel-title">{note.title}</h2>
            <p className="help">{note.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
