import { useEffect, useRef, useState } from 'react';
import Frame from './components/Frame';
import './App.css';

const devMode = !window.invokeNative;
const starters = ['Help me plan my day', 'Help me write a message', 'Tell me something interesting'];

function App() {
    const [theme, setTheme] = useState('dark');
    const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hey! What can I help you with?' }]);
    const [input, setInput] = useState('');
    const [busy, setBusy] = useState(false);
    const endRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (devMode) {
            document.documentElement.style.visibility = 'visible';
            document.body.style.visibility = 'visible';
            return;
        }
        window.getSettings?.().then((settings) => setTheme(settings?.display?.theme || 'dark'));
        window.onSettingsChange?.((settings) => setTheme(settings?.display?.theme || 'dark'));
    }, []);

    useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), [messages, busy]);

    const send = async (text = input) => {
        const prompt = text.trim();
        if (!prompt || busy) return;
        setInput('');
        setMessages((items) => [...items, { role: 'user', content: prompt }]);
        setBusy(true);
        try {
            let answer;
            if (devMode) {
                await new Promise((resolve) => setTimeout(resolve, 700));
                answer = 'Sounds good. I can help you think it through or come up with a few ideas.';
            } else {
                const result = await window.fetchNui('askAI', { prompt });
                if (!result?.success) throw new Error(result?.error || 'Couldn’t get a reply just now.');
                answer = result.answer;
            }
            setMessages((items) => [...items, { role: 'assistant', content: answer }]);
        } catch (error) {
            setMessages((items) => [...items, { role: 'assistant', content: `Sorry, ${error.message || 'something went wrong.'}`, error: true }]);
        } finally {
            setBusy(false);
            inputRef.current?.focus();
        }
    };

    const clearChat = () => {
        setMessages([{ role: 'assistant', content: 'New chat. What’s on your mind?' }]);
    };

    return <AppProvider>
        <main className="app" data-theme={theme}>
            <header className="topbar">
                <div className="brand-mark"><span className="sparkle">✦</span></div>
                <div className="brand-copy"><strong>Oshy</strong><span>Here when you need a hand</span></div>
                <button className="clear-button" aria-label="Start a new chat" onClick={clearChat} title="New chat"><span>＋</span></button>
            </header>
            <section className="chat" aria-live="polite">
                {messages.length === 1 && <div className="welcome"><div className="welcome-orb"><span>✦</span></div><h1>What’s on your mind?</h1><p>Ask a question, get a second opinion, or just explore an idea.</p><div className="starters">{starters.map((item) => <button key={item} onClick={() => send(item)}>{item}<span>↗</span></button>)}</div></div>}
                {messages.map((message, index) => <div className={`message-row ${message.role}`} key={index}>
                    {message.role === 'assistant' && <div className="avatar">✦</div>}
                    <div className={`bubble ${message.error ? 'error' : ''}`}>{message.content}</div>
                </div>)}
                {busy && <div className="message-row assistant"><div className="avatar">✦</div><div className="bubble typing"><i></i><i></i><i></i></div></div>}
                <div ref={endRef} />
            </section>
            <footer className="composer-area">
                <form className="composer" onSubmit={(event) => { event.preventDefault(); send(); }}>
                    <input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Write a message..." aria-label="Write a message" maxLength={2000} />
                    <button type="submit" disabled={!input.trim() || busy} aria-label="Send message"><span>↑</span></button>
                </form>
                <p className="caption">Made by <b>OshyDev</b></p>
            </footer>
        </main>
    </AppProvider>;
}

function AppProvider({ children }) {
    return devMode ? <div className="dev-wrapper"><Frame>{children}</Frame></div> : children;
}

export default App;
