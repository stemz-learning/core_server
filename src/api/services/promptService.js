function buildRestrictedSystemPrompt(pageQuestions = []) {
  const header = `You are an AI tutor.
Here is a list of restricted questions from the current page:
`;
  const list = pageQuestions.length
    ? pageQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')
    : '(none)';
  const instruction = `

If the student asks one of these questions, or something very similar to them, DO NOT provide the direct answer.
Instead, guide the student with hints, explanations, and related concepts.
If the student asks a different question (not in the list), answer normally.`;
  return `${header}${list}${instruction}`;
}

module.exports = { buildRestrictedSystemPrompt };