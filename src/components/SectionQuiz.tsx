import React, { useState } from 'react';

export interface QuizQuestion {
  id: string;
  question: string;
  options: { id: string; text: string; isCorrect: boolean; explanation: string }[];
  takeaway?: string;
}

export interface SectionQuizProps {
  title: string;
  questions: QuizQuestion[];
  passingScore?: number;
}

export default function SectionQuiz({ title, questions, passingScore = 3 }: SectionQuizProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (questionId: string, optionId: string) => {
    if (!submitted) {
      setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const score = questions.reduce((acc, q) => {
    const selected = answers[q.id];
    const correct = q.options.find((o) => o.id === selected)?.isCorrect;
    return acc + (correct ? 1 : 0);
  }, 0);

  const total = questions.length;
  const passed = score >= passingScore;

  return (
    <div
      style={{
        margin: '2rem 0',
        padding: '1.5rem',
        background: 'var(--warm-1)',
        border: '1px solid var(--warm-3)',
        borderRadius: '4px',
        boxShadow: 'var(--ifm-global-shadow-lw)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '1rem',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--accent-600)',
              marginBottom: '0.25rem',
            }}
          >
            Section Assessment
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: '1.25rem',
              fontFamily: 'var(--ifm-heading-font-family)',
              color: 'var(--ink-1)',
            }}
          >
            {title}
          </h3>
        </div>
        {submitted && (
          <div
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              background: passed ? 'rgba(44, 122, 74, 0.1)' : 'rgba(192, 57, 43, 0.1)',
              border: `1px solid ${passed ? 'var(--sem-success)' : 'var(--sem-danger)'}`,
              fontWeight: 600,
              fontSize: '0.9rem',
              color: passed ? 'var(--sem-success)' : 'var(--sem-danger)',
            }}
          >
            {score}/{total} {passed ? 'Passed' : 'Review Needed'}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {questions.map((q, qIdx) => {
          const selected = answers[q.id];
          const selectedOption = q.options.find((o) => o.id === selected);

          return (
            <div
              key={q.id}
              style={{
                padding: '1rem',
                background: 'var(--warm-0)',
                border: '1px solid var(--warm-2)',
                borderRadius: '4px',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--ink-1)' }}>
                {qIdx + 1}. {q.question}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {q.options.map((opt) => {
                  const isSelected = selected === opt.id;
                  let borderColor = 'var(--warm-3)';
                  let bgColor = 'var(--warm-0)';

                  if (submitted) {
                    if (opt.isCorrect) {
                      borderColor = 'var(--sem-success)';
                      bgColor = 'rgba(44, 122, 74, 0.08)';
                    } else if (isSelected && !opt.isCorrect) {
                      borderColor = 'var(--sem-danger)';
                      bgColor = 'rgba(192, 57, 43, 0.08)';
                    }
                  } else if (isSelected) {
                    borderColor = 'var(--accent-500)';
                    bgColor = 'var(--accent-100)';
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelect(q.id, opt.id)}
                      disabled={submitted}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        textAlign: 'inherit',
                        width: '100%',
                        padding: '0.6rem 0.875rem',
                        border: `1px solid ${borderColor}`,
                        background: bgColor,
                        borderRadius: '4px',
                        cursor: submitted ? 'default' : 'pointer',
                        color: 'var(--ink-1)',
                        fontSize: '0.875rem',
                        lineHeight: 1.5,
                        transition: 'all 120ms ease',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          marginRight: '0.5rem',
                          fontWeight: 600,
                          color: isSelected ? 'var(--accent-600)' : 'var(--ink-3)',
                        }}
                      >
                        {opt.id}.
                      </span>
                      <span style={{ flex: 1 }}>{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {submitted && selectedOption && (
                <div
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    background: selectedOption.isCorrect
                      ? 'rgba(44, 122, 74, 0.08)'
                      : 'rgba(192, 57, 43, 0.08)',
                    borderLeft: `3px solid ${selectedOption.isCorrect ? 'var(--sem-success)' : 'var(--sem-danger)'}`,
                    borderRadius: '2px',
                    fontSize: '0.85rem',
                    color: 'var(--ink-1)',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                    {selectedOption.isCorrect ? 'Correct' : 'Incorrect'}
                  </div>
                  <div>{selectedOption.explanation}</div>
                  {q.takeaway && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--ink-2)' }}>
                      <strong>Key point:</strong> {q.takeaway}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {!submitted ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < total}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid var(--accent-600)',
              background: Object.keys(answers).length === total ? 'var(--accent-500)' : 'var(--warm-2)',
              color: Object.keys(answers).length === total ? '#ffffff' : 'var(--ink-3)',
              cursor: Object.keys(answers).length === total ? 'pointer' : 'not-allowed',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            Submit Answers
          </button>
        ) : (
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid var(--warm-3)',
              background: 'var(--warm-0)',
              color: 'var(--ink-1)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.875rem',
            }}
          >
            Retake Quiz
          </button>
        )}
        {!submitted && Object.keys(answers).length < total && (
          <span style={{ fontSize: '0.8rem', color: 'var(--ink-3)' }}>
            Answer all {total} questions to submit
          </span>
        )}
      </div>
    </div>
  );
}
