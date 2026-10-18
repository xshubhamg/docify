import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — Docify",
  description: "What Docify collects, where it is stored, and how to delete it.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="October 19, 2026">
      <LegalSection title="1. What we collect">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-(--text-primary)">Account data:</strong> name, email,
            profile image, and authentication provider.
          </li>
          <li>
            <strong className="text-(--text-primary)">Document data:</strong> the PDF and
            optional cover image you upload, plus extracted text segments.
          </li>
          <li>
            <strong className="text-(--text-primary)">Usage data:</strong> voice session
            start/end times and duration.
          </li>
          <li>
            <strong className="text-(--text-primary)">Technical data:</strong> standard
            request logs from our hosting provider.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. How we use it">
        <p>
          We use your data only to provide the service: authenticating you, storing and
          rendering your document, retrieving relevant passages, grounding voice
          conversations, and showing your session history. We do not sell your data.
        </p>
      </LegalSection>

      <LegalSection title="3. Where it is stored">
        <p>
          Account and document metadata live in a PostgreSQL database. Files are stored in
          Vercel Blob with <strong className="text-(--text-primary)">private</strong>{" "}
          access and are streamed to you through authenticated routes. Raw blob URLs are
          never exposed.
        </p>
      </LegalSection>

      <LegalSection title="4. Third parties">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-(--text-primary)">Vercel</strong> — hosting, database
            connectivity, and blob storage.
          </li>
          <li>
            <strong className="text-(--text-primary)">VAPI and ElevenLabs</strong> —
            real-time voice conversation and speech synthesis. Audio and the grounded
            context are sent to these providers during a call.
          </li>
          <li>
            <strong className="text-(--text-primary)">Google</strong> — optional OAuth
            sign-in.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Cookies">
        <p>
          Docify sets a session cookie to keep you signed in. It is httpOnly and is not
          used for advertising.
        </p>
      </LegalSection>

      <LegalSection title="6. Retention and deletion">
        <p>
          Documents and voice-session history are kept until you delete them. Deleting a
          document removes its database rows (segments and sessions cascade) and
          best-effort deletes its stored files. Deleting your account removes your data
          through the same cascade.
        </p>
      </LegalSection>

      <LegalSection title="7. Your choices">
        <p>
          You can edit your profile, delete documents, and delete your account from the
          app. For any other request, contact the maintainer through the project&apos;s
          GitHub repository.
        </p>
      </LegalSection>

      <LegalSection title="8. Changes">
        <p>
          If this policy changes materially, the &ldquo;last updated&rdquo; date above
          will change and the update will be noted in the repository.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
