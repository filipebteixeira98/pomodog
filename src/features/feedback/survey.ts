import type { FeedbackSurvey } from "#src/features/feedback/posthog.ts";

// Public, write-only project token. Administrative PostHog credentials stay outside the app.
export const feedbackSurvey: FeedbackSurvey = {
  endpoint: "https://us.i.posthog.com/i/v0/e/",
  projectToken: "phc_CWeT35Q2XhPTgtzjBuWyqGnph2XHApE5iwCAxyspzhmh",
  surveyId: "01a1304a-a37b-0000-f7b0-7c0260bb419d",
  noticeVersion: "2026-10-12",
  questions: [
    {
      id: "b9aedf62-cde0-407f-9ab0-b506f930fb60",
      question: "Tipo de feedback",
    },
    { id: "5c6f6fc0-22b2-46a0-8bce-63fee6d2e08e", question: "Sua mensagem" },
    {
      id: "49778d08-3e7e-4972-aa93-5cc3baaab6fd",
      question: "E-mail para resposta (opcional)",
    },
  ],
};
