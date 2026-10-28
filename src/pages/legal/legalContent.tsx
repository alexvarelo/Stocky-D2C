/* eslint-disable react-refresh/only-export-components -- content module: exports data, not components */
import type { ReactNode } from "react";

// Starting drafts, written for an EU (Spain) operator. They must be reviewed
// by a lawyer before launch. Fill in LEGAL_ENTITY: the bracketed placeholders
// render on the page until you do, so they can't go live unnoticed.
//
// Bump TERMS_VERSION whenever the Terms or Privacy Policy change materially.
// Onboarding stores the accepted version on the user's profile.
export const TERMS_VERSION = "2026-10-27";

export const LEGAL_ENTITY = {
  name: "[Company name, S.L.]",
  taxId: "[NIF]",
  address: "[Registered address, Spain]",
  registry: "[Registro Mercantil details]",
  email: "stockyfolio@gmail.com",
};

export type LegalDocId = "terms" | "privacy" | "disclaimer";

export interface LegalSection {
  heading: string;
  body: ReactNode;
}

export interface LegalDoc {
  title: string;
  summary: string;
  sections: LegalSection[];
}

const E = LEGAL_ENTITY;

export const LEGAL_DOCS: Record<LegalDocId, LegalDoc> = {
  disclaimer: {
    title: "Not investment advice",
    summary:
      "Stockfolio is a portfolio tracker and investing community. Nothing here is a personal recommendation to buy or sell anything.",
    sections: [
      {
        heading: "Information only",
        body: (
          <p>
            Everything on Stockfolio (prices, charts, metrics, articles, AI answers and posts by other
            members) is general information and education. It is not investment, tax or legal advice
            and it does not take your personal circumstances into account. {E.name} is not authorised
            by the CNMV or any other regulator to provide investment services.
          </p>
        ),
      },
      {
        heading: "AI features",
        body: (
          <p>
            Stocky, our assistant, and the articles and market updates marked "AI-generated" are
            produced by artificial intelligence. They can be incomplete, out of date or wrong. Stocky
            is designed not to give personal buy, sell or hold recommendations. Check important
            information against primary sources.
          </p>
        ),
      },
      {
        heading: "Community content",
        body: (
          <p>
            Posts, comments and shared portfolios are the opinions of the members who publish them, not
            of Stockfolio. Members may hold positions in the securities they write about. Never act on a
            post alone, and report anything that looks like a pump-and-dump, an undisclosed promotion or
            a scam.
          </p>
        ),
      },
      {
        heading: "Market data",
        body: (
          <p>
            Prices may be delayed and are provided "as is" by third-party sources without guarantee of
            accuracy or completeness. Past performance is not a reliable indicator of future results.
            Investing involves risk, including the loss of the money you invest.
          </p>
        ),
      },
    ],
  },

  terms: {
    title: "Terms of Service",
    summary: "The rules for using Stockfolio. By creating an account you agree to them.",
    sections: [
      {
        heading: "1. Who we are",
        body: (
          <p>
            Stockfolio is operated by {E.name}, tax ID {E.taxId}, registered at {E.address},{" "}
            {E.registry}. Contact: <a href={`mailto:${E.email}`}>{E.email}</a>.
          </p>
        ),
      },
      {
        heading: "2. The service",
        body: (
          <p>
            Stockfolio lets you record and analyse your investments, follow markets, and share posts and
            portfolios with other members. It is an information tool: we do not provide investment
            advice, execute trades or hold your money or securities. See{" "}
            <a href="/legal/disclaimer">Not investment advice</a>.
          </p>
        ),
      },
      {
        heading: "3. Your account",
        body: (
          <p>
            You must be at least 18 years old. Keep your credentials secure and give accurate
            information. You are responsible for activity on your account. You can delete your account
            at any time from Settings.
          </p>
        ),
      },
      {
        heading: "4. Content you publish",
        body: (
          <>
            <p>You keep ownership of what you post and give us a licence to display it on Stockfolio. You must not:</p>
            <ul>
              <li>Spread false or misleading information to move a security's price, or coordinate buying or selling to do so (market manipulation).</li>
              <li>Promote a security you are paid to promote, or that you hold, without clearly saying so.</li>
              <li>Present posts as personalised investment advice or offer paid "signals" or copy-trading.</li>
              <li>Share inside information, post scams, spam, harassment, hate speech or content that infringes others' rights.</li>
            </ul>
            <p>
              When you recommend a security, disclose any position you hold in it. We may remove content
              and suspend accounts that break these rules, and may report suspected market abuse to the
              authorities. You can report content from the menu on any post.
            </p>
          </>
        ),
      },
      {
        heading: "5. AI features",
        body: (
          <p>
            AI features are clearly labelled and may make mistakes. Do not rely on them as your only
            source of information. Do not use them to generate unlawful content.
          </p>
        ),
      },
      {
        heading: "6. Availability and liability",
        body: (
          <p>
            We aim to keep Stockfolio available and accurate but provide it "as is". To the extent
            permitted by law, we are not liable for investment decisions you make or for losses arising
            from delayed or inaccurate data. Nothing in these terms limits rights you have as a consumer
            under Spanish or EU law.
          </p>
        ),
      },
      {
        heading: "7. Changes and law",
        body: (
          <p>
            We will tell you about material changes to these terms before they take effect. These terms
            are governed by Spanish law. Consumers may also use the courts of their place of residence
            and the EU online dispute resolution platform.
          </p>
        ),
      },
    ],
  },

  privacy: {
    title: "Privacy Policy",
    summary: "What personal data we collect, why, and the rights you have over it under the GDPR.",
    sections: [
      {
        heading: "Controller",
        body: (
          <p>
            {E.name} ({E.taxId}), {E.address}, is responsible for your personal data. Contact:{" "}
            <a href={`mailto:${E.email}`}>{E.email}</a>.
          </p>
        ),
      },
      {
        heading: "What we collect",
        body: (
          <ul>
            <li>Account data: email, username, name, avatar and bio.</li>
            <li>Portfolio data you enter: holdings, transactions and watchlists.</li>
            <li>Content: posts, comments, likes, follows and your conversations with Stocky.</li>
            <li>Technical data: anonymous page analytics and security logs.</li>
          </ul>
        ),
      },
      {
        heading: "Why, and on what legal basis",
        body: (
          <ul>
            <li>To provide the service you signed up for (performance of a contract).</li>
            <li>To keep Stockfolio safe, prevent abuse and moderate content (legitimate interest and legal obligations).</li>
            <li>To improve the product with aggregated, anonymous analytics (legitimate interest).</li>
          </ul>
        ),
      },
      {
        heading: "Who processes it",
        body: (
          <p>
            We use service providers under data processing agreements: Supabase (database and
            authentication, EU region), Google (Gemini, to generate AI answers from the data in your
            request) and Vercel (hosting and analytics). Some providers may process data outside the
            EEA under the European Commission's Standard Contractual Clauses. We never sell your
            personal data.
          </p>
        ),
      },
      {
        heading: "Who can see it",
        body: (
          <p>
            Portfolios are private unless you make them public. Public profiles, posts and public
            portfolios are visible to other members.
          </p>
        ),
      },
      {
        heading: "How long we keep it",
        body: (
          <p>
            While your account is active. When you delete your account, we delete your personal data
            within 30 days, except where the law requires us to keep it longer.
          </p>
        ),
      },
      {
        heading: "Your rights",
        body: (
          <p>
            You can access, correct, delete, restrict or object to the processing of your data, and
            receive a copy of it (portability), by writing to <a href={`mailto:${E.email}`}>{E.email}</a>.
            You can also complain to the Spanish Data Protection Agency (AEPD, aepd.es).
          </p>
        ),
      },
    ],
  },
};
