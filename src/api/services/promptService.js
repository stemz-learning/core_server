function buildRestrictedSystemPrompt(pageQuestions = []) {
  const header = `You are an AI tutor.
Here is a list of restricted questions from the current page:
`;
  const list = pageQuestions.length
    ? pageQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')
    : '(none)';
  const instruction = `

If the student asks one of these questions, or something very similar to them, DO NOT provide the direct answer.
Instead, give minimal guidance with just 1-2 brief hints or questions to help them think.
Keep your response to 2-3 sentences maximum.
If the student asks a different question (not in the list), answer normally.
If the student asks a question that doesn't seem like quiz question, answer normally.`;
  return `${header}${list}${instruction}`;
}

module.exports = { buildRestrictedSystemPrompt };