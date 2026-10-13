import assert from "node:assert/strict";
import test from "node:test";

import {
  createPosthogFeedbackTransport,
  type FeedbackSurvey,
} from "#src/features/feedback/posthog.ts";
import {
  createFeedbackSender,
  FeedbackValidationError,
  type FeedbackDraft,
  type FeedbackSubmission,
} from "#src/features/feedback/submission.ts";

const draft: FeedbackDraft = {
  category: "Sugestão",
  message: "A pausa poderia ter mais sons.",
  email: "",
};
const createdAt = "2026-10-12T13:30:00.000Z";
const id = "3d608c88-ae7b-4c07-920d-d7dfaf423c47";
const survey: FeedbackSurvey = {
  endpoint: "https://us.i.posthog.com/i/v0/e/",
  projectToken: "public-project-token",
  surveyId: "feedback-survey",
  noticeVersion: "2026-10-12",
  questions: [
    { id: "category", question: "Tipo de feedback" },
    { id: "message", question: "Sua mensagem" },
    { id: "email", question: "E-mail para resposta (opcional)" },
  ],
};

test("feedback trims input, allows no contact and discards account/history fields", async () => {
  let sent: FeedbackSubmission | undefined;
  const sender = createFeedbackSender({
    id: () => id,
    now: () => createdAt,
    send: async (submission) => {
      sent = submission;
    },
  });
  const input = {
    ...draft,
    message: `  ${draft.message}  `,
    email: "   ",
    uid: "another-account",
    sessions: ["private history"],
    diagnostic: "private log",
  };
  assert.equal(await sender.submit(input), true);
  assert.deepEqual(sent, { id, createdAt, feedback: draft });
});

test("invalid feedback never reaches the transport and can be corrected", async () => {
  let calls = 0;
  const sender = createFeedbackSender({
    send: async () => {
      calls++;
    },
  });
  for (const invalid of [
    { ...draft, message: "  " },
    { ...draft, message: "a".repeat(1001) },
    { ...draft, email: "wrong contact" },
    { ...draft, email: `${"a".repeat(250)}@example.org` },
    { ...draft, category: "Unknown" } as unknown as FeedbackDraft,
  ])
    await assert.rejects(sender.submit(invalid), FeedbackValidationError);
  assert.equal(calls, 0);
  assert.equal(sender.busy(), false);
  assert.equal(
    await sender.submit({ ...draft, email: "test@example.invalid" }),
    true,
  );
  assert.equal(calls, 1);
});

test("feedback blocks simultaneous submissions until acknowledgement", async () => {
  let finish = () => {};
  let calls = 0;
  const sender = createFeedbackSender({
    send: () => {
      calls++;
      return new Promise<void>((resolve) => {
        finish = resolve;
      });
    },
  });
  const submission = sender.submit(draft);
  assert.equal(sender.busy(), true);
  assert.equal(await sender.submit(draft), false);
  assert.equal(calls, 1);
  finish();
  assert.equal(await submission, true);
  assert.equal(sender.busy(), false);
});

test("retry preserves UUID, identity, timestamp and content; edits get a new submission", async () => {
  const attempts: FeedbackSubmission[] = [];
  let counter = 0;
  const sender = createFeedbackSender({
    id: () => `submission-${++counter}`,
    now: () => createdAt,
    send: async (submission) => {
      attempts.push(submission);
      if (attempts.length < 3) throw Error("network failure");
    },
  });
  await assert.rejects(sender.submit(draft));
  await assert.rejects(
    sender.submit({ ...draft, message: ` ${draft.message} ` }),
  );
  assert.deepEqual(attempts[0], attempts[1]);
  assert.equal(
    await sender.submit({ ...draft, email: "test@example.invalid" }),
    true,
  );
  assert.notEqual(attempts[2].id, attempts[0].id);
  assert.equal(await sender.submit(draft), true);
  assert.notEqual(attempts[3].id, attempts[0].id);
});

test("a timed out transport aborts and releases the form without losing retry identity", async () => {
  let signal: AbortSignal | undefined;
  const attempts: FeedbackSubmission[] = [];
  const sender = createFeedbackSender({
    timeoutMs: 5,
    send: (submission, abort) => {
      attempts.push(submission);
      signal = abort;
      return attempts.length === 1
        ? new Promise<void>(() => {})
        : Promise.resolve();
    },
  });
  await assert.rejects(sender.submit(draft), /feedback-timeout/);
  assert.equal(signal?.aborted, true);
  assert.equal(sender.busy(), false);
  assert.equal(await sender.submit(draft), true);
  assert.deepEqual(attempts[0], attempts[1]);
});

test("unmount cancellation aborts and prevents a late success confirmation", async () => {
  let finish = () => {};
  let signal: AbortSignal | undefined;
  const sender = createFeedbackSender({
    send: (_, abort) => {
      signal = abort;
      return new Promise<void>((resolve) => {
        finish = resolve;
      });
    },
  });
  const submission = sender.submit(draft);
  sender.cancel();
  assert.equal(signal?.aborted, true);
  finish();
  assert.equal(await submission, false);
  assert.equal(sender.busy(), false);
});

test("HTTP feedback sends only final answers with no account, profile, cookies or location", async () => {
  const bodies: { properties: Record<string, unknown> }[] = [];
  let options: RequestInit | undefined;
  const transport = createPosthogFeedbackTransport(
    survey,
    async (url, init) => {
      assert.equal(url, survey.endpoint);
      options = init;
      bodies.push(JSON.parse(String(init?.body)));
      return Response.json({ status: 1 });
    },
  );
  await transport(
    { id, createdAt, feedback: draft },
    new AbortController().signal,
  );
  assert.equal(options?.credentials, "omit");
  assert.equal(options?.referrerPolicy, "no-referrer");
  assert.equal(options?.redirect, "error");
  assert.deepEqual(bodies[0], {
    api_key: survey.projectToken,
    event: "survey sent",
    uuid: id,
    distinct_id: `feedback:${id}`,
    timestamp: createdAt,
    properties: {
      $survey_id: survey.surveyId,
      $survey_submission_id: id,
      $survey_completed: true,
      feedback_notice_version: survey.noticeVersion,
      $survey_questions: survey.questions,
      $survey_response_category: draft.category,
      $survey_response_message: draft.message,
      $process_person_profile: false,
      $geoip_disable: true,
      $ip: "0.0.0.0",
    },
  });
  await transport(
    { id, createdAt, feedback: { ...draft, email: "test@example.invalid" } },
    new AbortController().signal,
  );
  assert.equal(
    bodies[1].properties.$survey_response_email,
    "test@example.invalid",
  );
});

test("HTTP errors, malformed acknowledgements and aborted responses never count as success", async () => {
  for (const reply of [
    () => Response.json({ status: 1 }, { status: 400 }),
    () => Response.json({ status: 0 }),
    () => Response.json({ status: "Error" }),
    () => Response.json({}),
    () => new Response("not json"),
  ]) {
    const transport = createPosthogFeedbackTransport(survey, async () =>
      reply(),
    );
    await assert.rejects(
      transport(
        { id, createdAt, feedback: draft },
        new AbortController().signal,
      ),
    );
  }
  const controller = new AbortController();
  controller.abort();
  const transport = createPosthogFeedbackTransport(survey, async () =>
    Response.json({ status: 1 }),
  );
  await assert.rejects(
    transport({ id, createdAt, feedback: draft }, controller.signal),
  );
});

test("HTTP feedback accepts current Ok receipts and legacy numeric acknowledgements", async () => {
  for (const status of ["Ok", 1]) {
    const transport = createPosthogFeedbackTransport(survey, async () =>
      Response.json({ status }),
    );
    await transport(
      { id, createdAt, feedback: draft },
      new AbortController().signal,
    );
  }
});
