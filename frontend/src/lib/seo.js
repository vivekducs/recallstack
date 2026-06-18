// frontend/src/lib/seo.js

export const SITE_NAME = 'RecallStack';
export const SITE_TAGLINE = 'Learn Once. Recall Anytime.';

export function getHomepageTitle() {
  return `${SITE_NAME} — ${SITE_TAGLINE}`;
}

export function getSubjectTitle(subjectName) {
  return `${subjectName} — ${SITE_NAME}`;
}

export function getTopicTitle(topicName, subjectName) {
  return `${topicName} — ${subjectName} — ${SITE_NAME}`;
}

export function getNoteTitle(noteTitle, topicName) {
  return `${noteTitle} — ${topicName} — ${SITE_NAME}`;
}
