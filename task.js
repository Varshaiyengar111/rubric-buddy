// What Rubric Buddy asks the AI to do, and the built-in example used in demo mode.
// The example question, rubric and student answer are made up for this demo.

const sample = {
  question: "Explain how plants make their own food. (Class 7 Science, 5 marks)",
  rubric: `1. Names the process as photosynthesis (1 mark)
2. Says that sunlight provides the energy (1 mark)
3. Mentions carbon dioxide from the air and water from the roots (1 mark)
4. Says chlorophyll in the leaves captures sunlight (1 mark)
5. Says oxygen is released and food is made as glucose/starch (1 mark)`,
  answer: `Plants make food by photosynthesis. They take water from the roots and also take air through the leaves. The sun gives them energy. The green colour in leaves helps them. Then they make food and give out oxygen which we breathe.`,
};

export default {
  name: "Rubric Buddy",
  port: 3003,
  sampleInput: sample,

  validate(input) {
    for (const k of ["question", "rubric", "answer"]) {
      if (typeof input[k] !== "string" || input[k].trim().length < 5) return `Please fill in the ${k}.`;
      if (input[k].length > 6000) return `The ${k} is too long (6,000 characters max).`;
    }
    return null;
  },

  system: `You help school teachers in India mark written answers against their own rubric.
You suggest; the teacher decides the final mark.

Rules:
- Assess each rubric criterion separately, in the order given. Do not invent criteria.
- For each criterion, quote the exact words from the student's answer that you relied on in "evidence". If there is none, use an empty string.
- "status" is "met", "partly" or "not_met". Award marks only as the rubric allows. If the rubric gives 1 mark, a "partly" can get 0 or 0.5. Say which in "suggested_marks".
- Judge understanding, not spelling or grammar, unless the rubric asks for it.
- "feedback_to_student" is warm, specific and short: one thing done well and one thing to improve, in simple English a student of that class can read.
- If you are unsure about a criterion, say why in "teacher_note". Never guess silently.`,

  userMessage(input) {
    return `<question>\n${input.question}\n</question>\n\n<rubric>\n${input.rubric}\n</rubric>\n\n<student_answer>\n${input.answer}\n</student_answer>`;
  },

  schema: {
    type: "object",
    additionalProperties: false,
    required: ["criteria", "suggested_total", "max_total", "feedback_to_student"],
    properties: {
      criteria: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["criterion", "status", "evidence", "suggested_marks", "max_marks", "teacher_note"],
          properties: {
            criterion: { type: "string" },
            status: { type: "string", enum: ["met", "partly", "not_met"] },
            evidence: { type: "string" },
            suggested_marks: { type: "number" },
            max_marks: { type: "number" },
            teacher_note: { type: "string" },
          },
        },
      },
      suggested_total: { type: "number" },
      max_total: { type: "number" },
      feedback_to_student: { type: "string" },
    },
  },

  // Plain-code checks: evidence must really be in the answer, and totals must add up.
  postCheck(input, result) {
    const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();
    const answer = norm(input.answer);
    for (const c of result.criteria) {
      c.evidence_found = c.evidence ? answer.includes(norm(c.evidence)) : null;
    }
    const sum = result.criteria.reduce((t, c) => t + c.suggested_marks, 0);
    result.total_matches = Math.abs(sum - result.suggested_total) < 0.01;
    result.suggested_total = sum;
    return result;
  },

  demoOutput: {
    criteria: [
      { criterion: "Names the process as photosynthesis", status: "met", evidence: "Plants make food by photosynthesis.", suggested_marks: 1, max_marks: 1, teacher_note: "" },
      { criterion: "Says that sunlight provides the energy", status: "met", evidence: "The sun gives them energy.", suggested_marks: 1, max_marks: 1, teacher_note: "" },
      { criterion: "Mentions carbon dioxide from the air and water from the roots", status: "partly", evidence: "They take water from the roots and also take air through the leaves.", suggested_marks: 0.5, max_marks: 1, teacher_note: "Says 'air' but not carbon dioxide. Your call whether 'air' is enough at this level." },
      { criterion: "Says chlorophyll in the leaves captures sunlight", status: "partly", evidence: "The green colour in leaves helps them.", suggested_marks: 0.5, max_marks: 1, teacher_note: "Describes chlorophyll without naming it, and doesn't say it captures sunlight." },
      { criterion: "Says oxygen is released and food is made as glucose/starch", status: "partly", evidence: "Then they make food and give out oxygen which we breathe.", suggested_marks: 0.5, max_marks: 1, teacher_note: "Oxygen is correct; the type of food (glucose or starch) is missing." },
    ],
    suggested_total: 3.5,
    max_total: 5,
    feedback_to_student: "Good work: you named photosynthesis and explained that the sun gives plants energy. To improve, use the science words: say the leaves take in carbon dioxide, the green colour is called chlorophyll, and the food made is glucose.",
  },
};
