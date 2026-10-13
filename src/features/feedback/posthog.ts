import type { FeedbackSubmission } from "#src/features/feedback/submission.ts";

export type FeedbackSurvey = {
  endpoint: string;
  projectToken: string;
  surveyId: string;
  noticeVersion: string;
  questions: { id: string; question: string }[];
};

export function createPosthogFeedbackTransport(
  survey: FeedbackSurvey,
  request: typeof fetch = fetch,
) {
  return async (submission: FeedbackSubmission, signal: AbortSignal) => {
    const { id, createdAt, feedback } = submission;
    const [category, message, email] = survey.questions;
    const response = await request(survey.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "omit",
      referrerPolicy: "no-referrer",
      redirect: "error",
      signal,
      body: JSON.stringify({
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
          [`$survey_response_${category.id}`]: feedback.category,
          [`$survey_response_${message.id}`]: feedback.message,
          ...(feedback.email
            ? { [`$survey_response_${email.id}`]: feedback.email }
            : {}),
          $process_person_profile: false,
          $geoip_disable: true,
          $ip: "0.0.0.0",
        },
      }),
    });
    if (!response.ok) throw new Error("feedback-delivery-failed");
    const receipt = await response.json();
    if (signal.aborted || (receipt?.status !== 1 && receipt?.status !== "Ok"))
      throw new Error("feedback-not-acknowledged");
  };
}
