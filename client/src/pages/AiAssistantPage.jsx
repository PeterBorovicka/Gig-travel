import { useState, useEffect, useRef } from 'react';
import { chatWithAssistant, getAiStatus } from '../api';

const SUGGESTED_PROMPTS = [
  '🎸 Find me a rock concert in London',
  '🏨 Hotels near Madison Square Garden',
  '🎵 What events are coming up in Amsterdam?',
  '🗓️ Plan a weekend trip to Berlin for a concert',
  '💰 What are the cheapest upcoming events?',
];

export default function AiAssistantPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    getAiStatus()
      .then((data) => setAvailable(data.available))
      .catch(() => setAvailable(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(text) {
    const trimmed = (text ?? input).trim();
    if (!trimmed || loading) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = newMessages.slice(0, -1);
      const data = await chatWithAssistant(trimmed, history);
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: `Sorry, something went wrong: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage();
  }

  return (
    <>
      <div className="detail-header">
        <div className="container">
          <h1>🤖 AI Travel Assistant</h1>
          <p className="text-muted">
            Ask me anything — I'll help you find events, plan your trip, and book accommodation.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: '760px' }}>

          {available === false && (
            <div className="ai-notice">
              <strong>⚠️ AI Assistant not configured.</strong> Set the{' '}
              <code>OPENAI_API_KEY</code> environment variable on the server to enable this
              feature. See <code>docs/llm-cost-analysis.md</code> for setup details.
            </div>
          )}

          <div className="ai-chat-window">
            {messages.length === 0 && !loading && (
              <div className="ai-empty">
                <div className="ai-empty-icon">🎵</div>
                <p>Ask me to help plan your next gig trip!</p>
                <div className="ai-suggestions">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      className="ai-suggestion-chip"
                      onClick={() => sendMessage(prompt)}
                      disabled={available === false}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`ai-message ai-message--${msg.role}`}>
                <span className="ai-message-avatar">
                  {msg.role === 'user' ? '👤' : '🤖'}
                </span>
                <div className="ai-message-bubble">{msg.content}</div>
              </div>
            ))}

            {loading && (
              <div className="ai-message ai-message--assistant">
                <span className="ai-message-avatar">🤖</span>
                <div className="ai-message-bubble ai-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <form className="ai-input-form" onSubmit={handleSubmit}>
            <input
              type="text"
              className="form-input"
              placeholder={
                available === false
                  ? 'AI assistant not configured…'
                  : 'Ask about events, venues, or accommodation…'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading || available === false}
              maxLength={1000}
              autoFocus
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !input.trim() || available === false}
            >
              {loading ? '…' : 'Send'}
            </button>
          </form>

        </div>
      </section>
    </>
  );
}
