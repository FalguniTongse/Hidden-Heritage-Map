import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function Quiz({ quizId, onDone }) {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api.get('/quizzes/' + quizId).then(setQuiz).catch((e) => setErr(e.message)); }, [quizId]);
  if (err) return <p className="text-lac">{err}</p>;
  if (!quiz) return <p>Loading quiz…</p>;
  const submit = async () => {
    try { const r = await api.post(`/quizzes/${quizId}/answer`, { answers }); setResult(r); onDone?.(r); } catch (e) { setErr(e.message); }
  };
  return (
    <div className="panel space-y-4">
      {quiz.questions.map((q, i) => (
        <fieldset key={i}>
          <legend className="font-semibold">{i + 1}. {q.q}</legend>
          {q.options.map((o, j) => (
            <label key={j} className="mt-1 flex items-center gap-2 text-sm">
              <input type="radio" name={`q${i}`} disabled={!!result} checked={answers[i] === j} onChange={() => setAnswers((a) => { const n = [...a]; n[i] = j; return n; })} />
              {o}
              {result && result.correct[i] === j && <span className="text-leaf font-bold">✓ correct</span>}
            </label>
          ))}
        </fieldset>
      ))}
      {!result && <button className="btn" onClick={submit} disabled={!user || answers.filter((a) => a !== undefined).length < quiz.questions.length}>Submit answers</button>}
      {!user && <p className="text-sm text-slate2">Log in (top right) to earn Heritage XP.</p>}
      {result && <p className="font-semibold">{result.passed ? `All correct! +${result.gained} XP` : `Score ${result.score}/${result.total}. Re-read the story and try again.`}</p>}
    </div>
  );
}
