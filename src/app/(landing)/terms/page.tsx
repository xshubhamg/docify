import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service — Docify",
  description: "The terms that apply when you use Docify.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="October 19, 2026">
      <LegalSection title="1. What Docify is">
        <p>
          Docify is an independent project that lets you upload a PDF and hold a voice
          conversation grounded in its text. It is provided as-is, without a service-level
          agreement.
        </p>
      </LegalSection>

      <LegalSection title="2. Your account">
        <p>
          You are responsible for the activity on your account and for keeping your
          credentials secure. You must be old enough to enter a binding agreement in your
          jurisdiction.
        </p>
      </LegalSection>

      <LegalSection title="3. Your content">
        <p>
          You retain ownership of the documents you upload. By uploading, you grant Docify
          permission to store, process, and display that content solely to provide the
          service — extraction, search, and voice grounding.
        </p>
        <p>
          You must have the right to upload the document. Do not upload content that is
          illegal, infringing, or that you are not permitted to share.
        </p>
      </LegalSection>

      <LegalSection title="4. Acceptable use">
        <p>Do not attempt to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>access another user&apos;s documents or account;</li>
          <li>overload, scrape, or reverse-engineer the service;</li>
          <li>use the service to build a competing dataset; or</li>
          <li>upload malware or content that violates applicable law.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Third-party services">
        <p>
          Voice calls are processed by VAPI and ElevenLabs. Authentication may use Google
          OAuth. Storage and hosting run on Vercel. Your use of those services is also
          subject to their terms.
        </p>
      </LegalSection>

      <LegalSection title="6. Availability and changes">
        <p>
          Features may change or be removed while Docify is in beta. We may suspend the
          service for maintenance or if these terms are violated.
        </p>
      </LegalSection>

      <LegalSection title="7. Disclaimer">
        <p>
          Docify is provided &ldquo;as is&rdquo; without warranties of any kind. To the
          maximum extent permitted by law, the maintainers are not liable for indirect,
          incidental, or consequential damages arising from your use of the service.
        </p>
      </LegalSection>

      <LegalSection title="8. Contact">
        <p>
          Questions about these terms? Open an issue on the project&apos;s GitHub
          repository.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
