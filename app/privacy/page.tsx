import { LegalShell, LEGAL_CONTACT } from "../legal-shell";

export const metadata = { title: "Privacy — Closer Clinic" };

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy">
      <section>
        <h2>What Closer Clinic is</h2>
        <p>
          Closer Clinic is a training simulator: healthcare providers practice case-acceptance
          conversations against <strong>fictional, AI-generated patients</strong>. It is not a
          medical record system, it is not used in patient care, and no real patient should ever
          be described in it.
        </p>
      </section>
      <section>
        <h2>What we collect</h2>
        <ul>
          <li><strong>Account:</strong> your email, name, and chosen specialty.</li>
          <li>
            <strong>Practice content you add:</strong> your services and prices, custom training
            stations, and pages we read from your own website when you use the import feature.
          </li>
          <li>
            <strong>Training activity:</strong> roleplay transcripts (what you say or type, and the
            AI patient&apos;s replies), grades and feedback, drill and quiz results, and the
            consult outcomes you choose to log (including estimated revenue figures you enter).
          </li>
          <li>
            <strong>Voice:</strong> when you use press-to-talk, your audio clip is sent to our
            speech-to-text processor to produce a transcript. We keep the transcript; we do not
            store the audio.
          </li>
          <li><strong>Technical:</strong> authentication cookies and basic request logs. No advertising trackers.</li>
        </ul>
      </section>
      <section>
        <h2>No real patient information</h2>
        <p>
          You agree not to enter information about real, identifiable patients. The product
          includes automatic checks that reject obvious identifiers (names, dates of birth,
          record numbers), but those checks are a safety net, not a substitute for your judgment.
          Closer Clinic is not a HIPAA business associate and does not offer BAAs.
        </p>
      </section>
      <section>
        <h2>Who processes your data</h2>
        <p>To run the product, your content is processed by these subprocessors:</p>
        <ul>
          <li><strong>Anthropic</strong> — generates the AI patient&apos;s dialogue and your grades.</li>
          <li><strong>ElevenLabs</strong> — synthesizes the patient&apos;s voice.</li>
          <li><strong>Deepgram</strong> — transcribes your spoken lines.</li>
          <li><strong>Supabase</strong> — database and authentication.</li>
          <li><strong>Vercel</strong> — application hosting.</li>
        </ul>
        <p>We do not sell your data, and we do not use it for advertising.</p>
      </section>
      <section>
        <h2>Teams</h2>
        <p>
          If you join a clinic team, your clinic&apos;s admin can see your training activity for
          that clinic: assignment progress, rep counts, and grades.
        </p>
      </section>
      <section>
        <h2>Retention and deletion</h2>
        <p>
          We keep your data while your account is active. Email{" "}
          <a href={`mailto:${LEGAL_CONTACT}`} className="underline">{LEGAL_CONTACT}</a> to request
          an export or deletion of your account and its data, and we will complete it within 30 days.
        </p>
      </section>
      <section>
        <h2>Changes</h2>
        <p>
          If this policy changes materially, we will note the new effective date here and flag it
          in the app.
        </p>
      </section>
    </LegalShell>
  );
}
