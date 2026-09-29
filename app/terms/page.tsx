import { LegalShell, LEGAL_CONTACT, LEGAL_ENTITY } from "../legal-shell";

export const metadata = { title: "Terms — Closer Clinic" };

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service">
      <section>
        <h2>The service</h2>
        <p>
          Closer Clinic, provided by {LEGAL_ENTITY}, is a practice simulator for case-acceptance
          conversations. AI-generated patients, grades, rewrites, and coaching content are
          produced by machine-learning models and can be imperfect, incomplete, or wrong.
        </p>
      </section>
      <section>
        <h2>Not medical advice</h2>
        <p>
          Closer Clinic is a communication-training tool. It does not provide medical advice,
          clinical guidance, or billing/legal advice, and using it creates no doctor-patient
          relationship of any kind. You remain solely responsible for your actual patient care,
          your pricing, your marketing claims, and your compliance with the laws and professional
          rules that apply to your practice.
        </p>
      </section>
      <section>
        <h2>Your account and acceptable use</h2>
        <ul>
          <li>Keep your credentials to yourself and tell us about any suspected breach.</li>
          <li><strong>Never enter information about real, identifiable patients.</strong></li>
          <li>No probing, scraping, reselling, or disrupting the service.</li>
          <li>We may suspend accounts that break these rules.</li>
        </ul>
      </section>
      <section>
        <h2>Your content</h2>
        <p>
          Your practice content (services, prices, custom stations, logged outcomes) stays yours.
          You give us the license needed to store and process it to run the product — including
          sending it to the AI subprocessors named in the Privacy Policy — and nothing more.
        </p>
      </section>
      <section>
        <h2>Pricing</h2>
        <p>
          Closer Clinic is currently in a beta period. When paid subscriptions launch, pricing and
          billing terms will be presented before you are charged anything.
        </p>
      </section>
      <section>
        <h2>Warranty and liability</h2>
        <p>
          The service is provided &quot;as is,&quot; without warranties of any kind. To the fullest
          extent the law allows, {LEGAL_ENTITY} is not liable for indirect, incidental, or
          consequential damages, and our total liability for any claim is limited to the amount
          you paid us in the twelve months before the claim (or $100 if you paid nothing).
        </p>
      </section>
      <section>
        <h2>Ending things</h2>
        <p>
          You can stop using Closer Clinic and request deletion at any time. We can suspend or end
          the service for abuse or non-payment. Sections that by their nature survive (your
          content rights, liability limits) survive termination.
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>
          Questions: <a href={`mailto:${LEGAL_CONTACT}`} className="underline">{LEGAL_CONTACT}</a>.
        </p>
      </section>
    </LegalShell>
  );
}
