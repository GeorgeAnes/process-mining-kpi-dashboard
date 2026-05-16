import { useState } from "react";
import { Bot, Send } from "lucide-react";
import { askAssistant } from "../api";
import type { AnalysisResponse, AssistantResponse } from "../types";

interface AssistantPanelProps {
  analysis: AnalysisResponse;
}

const cannedQuestions = [
  "Which activity is the bottleneck?",
  "What drives SLA violations?",
  "What should management improve first?"
];

function AssistantPanel({ analysis }: AssistantPanelProps) {
  const [question, setQuestion] = useState(cannedQuestions[0]);
  const [useLlm, setUseLlm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AssistantResponse | null>(null);

  async function submit() {
    setLoading(true);
    try {
      setResponse(await askAssistant(analysis, question, useLlm));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel compact">
      <div className="panel-header">
        <h2>Executive Insight Assistant</h2>
        <span>{useLlm ? "LLM optional" : "Deterministic"}</span>
      </div>
      <div className="assistant-questions">
        {cannedQuestions.map((item) => (
          <button className="chip" key={item} onClick={() => setQuestion(item)}>
            {item}
          </button>
        ))}
      </div>
      <textarea
        className="assistant-input"
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        aria-label="Assistant question"
      />
      <label className="toggle-row">
        <input type="checkbox" checked={useLlm} onChange={(event) => setUseLlm(event.target.checked)} />
        Use LM Studio/OpenAI-compatible assistant if configured
      </label>
      <button className="primary" onClick={() => void submit()} disabled={loading}>
        <Send size={16} />
        Ask
      </button>
      {response && (
        <div className="assistant-answer">
          <Bot size={18} />
          <p>{response.answer}</p>
        </div>
      )}
    </section>
  );
}

export default AssistantPanel;
