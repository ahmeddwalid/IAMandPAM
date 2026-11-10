import React, { useState } from 'react';

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface KnowledgeCheckProps {
  question: string;
  options: Option[];
  takeaway?: string;
}

export default function KnowledgeCheck({ question, options, takeaway }: KnowledgeCheckProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSelect = (id: string) => {
    if (!submitted) {
      setSelectedOption(id);
    }
  };

  const handleSubmit = () => {
    if (selectedOption) {
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setSubmitted(false);
  };

  const chosen = options.find((o) => o.id === selectedOption);

  return (
    <div
      style={{
        margin: '2rem 0',
        padding: '1.25rem 1.5rem',
        background: 'var(--warm-1)',
        border: '1px solid var(--warm-3)',
        borderRadius: '4px',
        boxShadow: 'var(--ifm-global-shadow-lw)',
      }}
    >
      <div
        style={{
          display: 'inline-block',
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--accent-600)',
          marginBottom: '0.5rem',
        }}
      >
        Knowledge Check
      </div>
      <h4
        style={{
          margin: '0 0 1rem',
          fontSize: '1.125rem',
          fontFamily: 'var(--ifm-heading-font-family)',
          color: 'var(--ink-1)',
        }}
      >
        {question}
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {options.map((opt) => {
          const isSelected = selectedOption === opt.id;
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
              onClick={() => handleSelect(opt.id)}
              disabled={submitted}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                textAlign: 'inherit',
                width: '100%',
                padding: '0.75rem 1rem',
                border: `1px solid ${borderColor}`,
                background: bgColor,
                borderRadius: '4px',
                cursor: submitted ? 'default' : 'pointer',
                color: 'var(--ink-1)',
                fontSize: '0.9375rem',
                lineHeight: 1.5,
                transition: 'all 120ms ease',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  marginRight: '0.75rem',
                  marginLeft: '0.25rem',
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

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {!submitted ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedOption}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--accent-600)',
              background: selectedOption ? 'var(--accent-500)' : 'var(--warm-2)',
              color: selectedOption ? '#ffffff' : 'var(--ink-3)',
              cursor: selectedOption ? 'pointer' : 'not-allowed',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            Check Answer
          </button>
        ) : (
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--warm-3)',
              background: 'var(--warm-0)',
              color: 'var(--ink-1)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.875rem',
            }}
          >
            Retry
          </button>
        )}
      </div>

      {submitted && chosen && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.875rem 1rem',
            background: chosen.isCorrect ? 'rgba(44, 122, 74, 0.08)' : 'rgba(192, 57, 43, 0.08)',
            borderLeft: `3px solid ${chosen.isCorrect ? 'var(--sem-success)' : 'var(--sem-danger)'}`,
            borderRadius: '2px',
            fontSize: '0.9rem',
            color: 'var(--ink-1)',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
            {chosen.isCorrect ? 'Correct' : 'Incorrect'}
          </div>
          <div>{chosen.explanation}</div>
          {takeaway && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--ink-2)' }}>
              <strong>Operational rule:</strong> {takeaway}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
