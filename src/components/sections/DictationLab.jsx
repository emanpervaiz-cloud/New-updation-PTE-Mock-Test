import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────
// WORD DATA
// ─────────────────────────────────────────────
const wordData = [
  // ACADEMIC
  { word: "accumulate", type: "verb", cat: "academic", meaning: "gather gradually", example: "Toxins can accumulate in the body over years.", difficulty: "medium" },
  { word: "acknowledge", type: "verb", cat: "academic", meaning: "admit or recognize something", example: "Researchers acknowledge the limitations of the study.", difficulty: "easy" },
  { word: "adequate", type: "adjective", cat: "academic", meaning: "sufficient for the purpose", example: "Students need adequate preparation time before the exam.", difficulty: "medium" },
  { word: "ambiguous", type: "adjective", cat: "academic", meaning: "open to more than one interpretation", example: "The data provided ambiguous results.", difficulty: "hard" },
  { word: "approximately", type: "adverb", cat: "academic", meaning: "close to the actual figure", example: "Approximately 500 participants were included in the study.", difficulty: "hard" },
  { word: "assessment", type: "noun", cat: "academic", meaning: "the evaluation of something", example: "The assessment revealed significant improvements.", difficulty: "medium" },
  { word: "assumption", type: "noun", cat: "academic", meaning: "something taken for granted", example: "The model rests on several key assumptions.", difficulty: "hard" },
  { word: "authentic", type: "adjective", cat: "academic", meaning: "genuine and original", example: "The document was found to be authentic.", difficulty: "medium" },
  { word: "capacity", type: "noun", cat: "academic", meaning: "maximum amount that can be contained", example: "The factory is operating at full capacity.", difficulty: "easy" },
  { word: "comprehensive", type: "adjective", cat: "academic", meaning: "covering all aspects", example: "The report provided a comprehensive analysis.", difficulty: "hard" },
  { word: "consequently", type: "adverb", cat: "academic", meaning: "as a result", example: "The budget was cut; consequently, the project was delayed.", difficulty: "hard" },
  { word: "correlation", type: "noun", cat: "academic", meaning: "a mutual relationship between two things", example: "There is a strong correlation between stress and illness.", difficulty: "hard" },
  { word: "demonstrate", type: "verb", cat: "academic", meaning: "clearly show the truth of something", example: "The experiment demonstrates the effect of heat.", difficulty: "medium" },
  { word: "empirical", type: "adjective", cat: "academic", meaning: "based on observation and evidence", example: "Empirical evidence supports the theory.", difficulty: "hard" },
  { word: "fundamental", type: "adjective", cat: "academic", meaning: "forming a necessary base", example: "Clean water is a fundamental human right.", difficulty: "medium" },
  { word: "hypothesis", type: "noun", cat: "academic", meaning: "a proposed explanation requiring testing", example: "Scientists developed a hypothesis to explain the anomaly.", difficulty: "hard" },
  { word: "incorporate", type: "verb", cat: "academic", meaning: "include as part of a whole", example: "The design incorporates renewable materials.", difficulty: "hard" },
  { word: "inevitable", type: "adjective", cat: "academic", meaning: "certain to happen", example: "Some change is inevitable in a growing economy.", difficulty: "medium" },
  { word: "methodology", type: "noun", cat: "academic", meaning: "a system of methods used in a study", example: "The research methodology was clearly explained.", difficulty: "hard" },
  { word: "phenomenon", type: "noun", cat: "academic", meaning: "a fact or event observed to exist", example: "Global warming is a well-documented phenomenon.", difficulty: "hard" },
  // ENVIRONMENT
  { word: "atmosphere", type: "noun", cat: "environment", meaning: "the envelope of gases around Earth", example: "Carbon dioxide builds up in the atmosphere and traps heat.", difficulty: "easy" },
  { word: "biodiversity", type: "noun", cat: "environment", meaning: "variety of life in an ecosystem", example: "Deforestation threatens biodiversity on a massive scale.", difficulty: "hard" },
  { word: "conservation", type: "noun", cat: "environment", meaning: "preservation of natural resources", example: "Conservation efforts have helped tigers recover.", difficulty: "medium" },
  { word: "deforestation", type: "noun", cat: "environment", meaning: "clearing forests on a large scale", example: "Deforestation in the Amazon releases enormous carbon.", difficulty: "hard" },
  { word: "ecosystem", type: "noun", cat: "environment", meaning: "a biological community of organisms", example: "The coral reef ecosystem is highly fragile.", difficulty: "medium" },
  { word: "emissions", type: "noun", cat: "environment", meaning: "gases released into the atmosphere", example: "Countries must reduce carbon emissions significantly.", difficulty: "medium" },
  { word: "endangered", type: "adjective", cat: "environment", meaning: "at risk of extinction", example: "The giant panda is an endangered species.", difficulty: "easy" },
  { word: "erosion", type: "noun", cat: "environment", meaning: "gradual destruction by natural forces", example: "Coastal erosion threatens homes every year.", difficulty: "medium" },
  { word: "extinction", type: "noun", cat: "environment", meaning: "the state of no longer existing", example: "Human activity is accelerating the extinction of species.", difficulty: "medium" },
  { word: "sustainable", type: "adjective", cat: "environment", meaning: "maintained without harming the environment", example: "Sustainable farming protects the soil long term.", difficulty: "easy" },
  // HEALTH
  { word: "cognitive", type: "adjective", cat: "health", meaning: "related to mental processes", example: "Cognitive decline can begin before obvious symptoms appear.", difficulty: "hard" },
  { word: "deteriorate", type: "verb", cat: "health", meaning: "become progressively worse", example: "Without treatment, the condition may rapidly deteriorate.", difficulty: "hard" },
  { word: "diagnosis", type: "noun", cat: "health", meaning: "identifying a disease from symptoms", example: "Early diagnosis significantly improves recovery rates.", difficulty: "medium" },
  { word: "immune", type: "adjective", cat: "health", meaning: "resistant to a disease", example: "A strong immune system fights off infections.", difficulty: "easy" },
  { word: "inflammation", type: "noun", cat: "health", meaning: "body's response to infection or injury", example: "Chronic inflammation is linked to many serious diseases.", difficulty: "hard" },
  { word: "mortality", type: "noun", cat: "health", meaning: "the state of being subject to death", example: "Infant mortality has declined sharply over fifty years.", difficulty: "hard" },
  { word: "nutrition", type: "noun", cat: "health", meaning: "the process of providing food for growth", example: "Good nutrition during childhood affects lifelong health.", difficulty: "easy" },
  { word: "prevalence", type: "noun", cat: "health", meaning: "the fact of being widespread", example: "The prevalence of diabetes is rising globally.", difficulty: "hard" },
  { word: "vaccination", type: "noun", cat: "health", meaning: "treatment with a vaccine for immunity", example: "Mass vaccination campaigns eradicated smallpox.", difficulty: "medium" },
  { word: "vulnerable", type: "adjective", cat: "health", meaning: "susceptible to harm or attack", example: "Elderly people are particularly vulnerable during heatwaves.", difficulty: "medium" },
  // ECONOMICS
  { word: "aggregate", type: "noun", cat: "economics", meaning: "a total formed by combining elements", example: "Aggregate demand fell during the recession.", difficulty: "hard" },
  { word: "allocation", type: "noun", cat: "economics", meaning: "distributing resources for a purpose", example: "The allocation of healthcare funds is critical.", difficulty: "hard" },
  { word: "expenditure", type: "noun", cat: "economics", meaning: "the action of spending money", example: "Government expenditure on education has increased.", difficulty: "hard" },
  { word: "fluctuate", type: "verb", cat: "economics", meaning: "rise and fall irregularly", example: "Oil prices fluctuate with global political events.", difficulty: "medium" },
  { word: "globalization", type: "noun", cat: "economics", meaning: "integration of world economies", example: "Globalization has transformed international trade.", difficulty: "hard" },
  { word: "inflation", type: "noun", cat: "economics", meaning: "a general rise in prices", example: "High inflation reduces consumer purchasing power.", difficulty: "easy" },
  { word: "productivity", type: "noun", cat: "economics", meaning: "effectiveness of productive effort", example: "Technology has dramatically increased worker productivity.", difficulty: "medium" },
  { word: "recession", type: "noun", cat: "economics", meaning: "period of temporary economic decline", example: "The recession caused millions to lose their jobs.", difficulty: "easy" },
  { word: "scarcity", type: "noun", cat: "economics", meaning: "insufficient supply of something", example: "Water scarcity threatens millions in drought-prone regions.", difficulty: "medium" },
  { word: "viable", type: "adjective", cat: "economics", meaning: "capable of working successfully", example: "Solar energy is now a commercially viable alternative.", difficulty: "medium" },
  // SOCIETY
  { word: "discrimination", type: "noun", cat: "society", meaning: "unjust treatment based on group identity", example: "Laws protect workers from racial discrimination.", difficulty: "medium" },
  { word: "diversity", type: "noun", cat: "society", meaning: "the range of different things", example: "Cultural diversity enriches communities.", difficulty: "easy" },
  { word: "governance", type: "noun", cat: "society", meaning: "the way an organization is managed", example: "Good governance is essential for public trust.", difficulty: "hard" },
  { word: "inequality", type: "noun", cat: "society", meaning: "difference in social or economic position", example: "Income inequality has widened over recent decades.", difficulty: "medium" },
  { word: "infrastructure", type: "noun", cat: "society", meaning: "basic systems serving a country", example: "Infrastructure investment creates long-term economic benefits.", difficulty: "hard" },
  { word: "migration", type: "noun", cat: "society", meaning: "movement of people to another place", example: "Climate change is causing increased migration.", difficulty: "easy" },
  { word: "segregation", type: "noun", cat: "society", meaning: "separation of groups within society", example: "Racial segregation was legally enforced in the past.", difficulty: "hard" },
  { word: "surveillance", type: "noun", cat: "society", meaning: "close observation, especially by authorities", example: "Digital surveillance raises serious privacy concerns.", difficulty: "hard" },
  { word: "urbanization", type: "noun", cat: "society", meaning: "process of becoming more urban", example: "Rapid urbanization is straining city infrastructure.", difficulty: "hard" },
  { word: "welfare", type: "noun", cat: "society", meaning: "health, happiness, and social support", example: "Child welfare must be the top priority.", difficulty: "easy" },
];

// ─────────────────────────────────────────────
// SENTENCE DATA
// ─────────────────────────────────────────────
const sentenceData = [
  "There is growing evidence that air pollution significantly affects cognitive development in children.",
  "The rapid acceleration of climate change poses unprecedented challenges to global biodiversity.",
  "Researchers have demonstrated a strong correlation between sleep deprivation and increased mortality rates.",
  "Economic globalization has fundamentally transformed the way nations interact and compete in world markets.",
  "Adequate nutrition during the first thousand days of life is crucial for long-term cognitive development.",
  "The government must implement comprehensive measures to address rising inequality and urban poverty.",
  "Fossil fuel combustion releases enormous quantities of carbon dioxide into the atmosphere each year.",
  "The prevalence of antibiotic-resistant bacteria is an increasingly serious global public health crisis.",
  "Conservation efforts require sustained international cooperation to protect endangered ecosystems from extinction.",
  "Technological innovation is the primary driver of economic productivity and competitiveness in modern societies.",
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function calcCharAccuracy(user, correct) {
  if (!user) return 0;
  let matches = 0;
  const min = Math.min(user.length, correct.length);
  for (let i = 0; i < min; i++) if (user[i] === correct[i]) matches++;
  return Math.round((matches / correct.length) * 100);
}

function calcWordAccuracy(userStr, correctStr) {
  const u = userStr.toLowerCase().split(/\s+/);
  const c = correctStr.toLowerCase().replace(/[.,!?]/g, "").split(/\s+/);
  let matched = 0;
  c.forEach((w, i) => { if ((u[i] || "").replace(/[.,!?]/g, "") === w) matched++; });
  return { pct: Math.round((matched / c.length) * 100), matched, total: c.length };
}

function speak(text, rate = 1.0, onEnd) {
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = rate;
  utter.pitch = 1;
  utter.volume = 1;
  const voices = window.speechSynthesis.getVoices();
  const v =
    voices.find(v => v.lang.startsWith("en") && /Google|Natural|Premium/i.test(v.name)) ||
    voices.find(v => v.lang.startsWith("en")) ||
    voices[0];
  if (v) utter.voice = v;
  if (onEnd) utter.onend = onEnd;
  window.speechSynthesis.speak(utter);
}

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

/** Animated waveform bars */
function Waveform({ active, onClick }) {
  const heights = [8, 14, 22, 18, 35, 25, 40, 30, 45, 28, 38, 22, 16, 10, 6];
  return (
    <div
      onClick={onClick}
      style={{
        height: 60, display: "flex", alignItems: "center", justifyContent: "center",
        gap: 3, cursor: "pointer", borderRadius: 10,
        background: 'var(--primary-color)', border: `1px solid ${active ? 'var(--secondary-color)' : 'transparent'}`,
        padding: "0 16px", transition: "border-color .2s", marginBottom: 16,
      }}
    >
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            width: 3, borderRadius: 2,
            background: active ? 'var(--secondary-color)' : 'rgba(255, 255, 255, 0.3)',
            height: active ? undefined : h,
            animation: active ? `wave${i % 5} 0.6s ease-in-out ${i * 0.05}s infinite alternate` : "none",
            ...(active ? { height: h } : {}),
          }}
        />
      ))}
      <style>{`
        @keyframes wave0{from{height:4px}to{height:30px}}
        @keyframes wave1{from{height:4px}to{height:20px}}
        @keyframes wave2{from{height:4px}to{height:45px}}
        @keyframes wave3{from{height:4px}to{height:35px}}
        @keyframes wave4{from{height:4px}to{height:25px}}
      `}</style>
    </div>
  );
}

/** Difficulty badge */
function DiffBadge({ level }) {
  const map = {
    easy: { bg: "rgba(16,185,129,.15)", color: "#10b981", border: "rgba(16,185,129,.3)" },
    medium: { bg: "rgba(245,158,11,.15)", color: "#f59e0b", border: "rgba(245,158,11,.3)" },
    hard: { bg: "rgba(239,68,68,.15)", color: "#ef4444", border: "rgba(239,68,68,.3)" },
  };
  const s = map[level] || map.medium;
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 100, fontSize: 11, fontFamily: "monospace",
      fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {level}
    </span>
  );
}

/** Score card */
function ScoreCard({ value, label, color }) {
  return (
    <div style={{
      background: 'var(--bg-color)', border: "1px solid var(--accent-color)", borderRadius: 12,
      padding: "14px 16px", textAlign: "center", flex: 1,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "monospace", color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginTop: 4, fontFamily: "monospace" }}>{label}</div>
    </div>
  );
}

/** Button */
function Btn({ children, onClick, variant = "primary", disabled = false, style: extraStyle = {} }) {
  const base = {
    padding: "13px 18px", borderRadius: 10, fontWeight: 700, fontSize: 14,
    cursor: disabled ? "not-allowed" : "pointer", border: "none",
    transition: "all .2s", opacity: disabled ? 0.4 : 1, ...extraStyle,
  };
  const variants = {
    primary: { background: 'var(--secondary-color)', color: 'var(--primary-color)' },
    secondary: { background: 'var(--bg-color)', border: "1px solid var(--accent-color)", color: 'var(--primary-color)' },
    ghost: { background: "transparent", border: "1px solid var(--accent-color)", color: 'var(--text-secondary)' },
  };
  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────
// TAB: DICTATION
// ─────────────────────────────────────────────
function DictationTab({ scores, setScores }) {
  const [category, setCategory] = useState("all");
  const [speed, setSpeed] = useState(1.0);
  const [deck, setDeck] = useState(() => shuffle(wordData));
  const [idx, setIdx] = useState(0);
  const [playsLeft, setPlaysLeft] = useState(3);
  const [playing, setPlaying] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null); // null | { correct, accuracy, word }
  const inputRef = useRef(null);

  const filteredDeck = category === "all" ? deck : deck.filter(w => w.cat === category);
  const current = filteredDeck[idx % Math.max(filteredDeck.length, 1)];
  const total = Math.min(filteredDeck.length, 20);
  const progress = total > 0 ? ((idx % total) / total) * 100 : 0;

  function resetCard() {
    setInput(""); setResult(null); setAnswered(false); setPlaysLeft(3); setPlaying(false);
    window.speechSynthesis.cancel();
  }

  function changeCategory(cat) {
    setCategory(cat);
    setDeck(shuffle(wordData));
    setIdx(0); resetCard();
  }

  function playWord() {
    if (!current) return;
    if (playsLeft <= 0) return;
    setPlaysLeft(p => p - 1);
    setPlaying(true);
    speak(current.word, speed, () => { setPlaying(false); inputRef.current?.focus(); });
  }

  function checkAnswer() {
    if (answered || !input.trim()) return;
    const userAns = input.trim().toLowerCase();
    const correct = current.word.toLowerCase();
    const isCorrect = userAns === correct;
    const accuracy = calcCharAccuracy(userAns, correct);
    setAnswered(true);
    setResult({ isCorrect, accuracy, word: current });
    setScores(s => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      wrong: s.wrong + (isCorrect ? 0 : 1),
      streak: isCorrect ? s.streak + 1 : 0,
    }));
    setTimeout(() => speak(current.word, 0.8), 300);
  }

  function nextWord() {
    setIdx(i => i + 1);
    resetCard();
    if ((idx + 1) >= filteredDeck.length) {
      setDeck(shuffle(wordData)); setIdx(0);
    }
  }

  const categories = ["all", "academic", "environment", "health", "economics", "society"];

  return (
    <div>
      {/* Category pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => changeCategory(cat)} style={{
            padding: "6px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600,
            fontFamily: "monospace", cursor: "pointer", transition: "all .2s",
            background: category === cat ? 'rgba(13, 59, 102, 0.1)' : 'var(--bg-color)',
            color: category === cat ? 'var(--primary-color)' : 'var(--text-secondary)',
            border: `1px solid ${category === cat ? 'var(--primary-color)' : 'var(--accent-color)'}`,
          }}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div style={{ height: 3, background: "#0e1520", borderRadius: 3, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#00d4ff,#7c3aed)", borderRadius: 3, transition: "width .4s" }} />
      </div>

      {/* Player card */}
      <div style={{
        background: 'var(--bg-color)', border: `1px solid ${playing ? 'var(--primary-color)' : 'var(--accent-color)'}`,
        borderRadius: 16, padding: 24, position: "relative", overflow: "hidden",
        transition: "border-color .3s",
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}>
        {playing && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#00d4ff,#7c3aed)" }} />
        )}

        {/* Counter row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontFamily: "monospace", fontSize: 12, color: "#64748b" }}>
            Word <span style={{ color: "#00d4ff" }}>{(idx % Math.max(total, 1)) + 1}</span> of {total}
          </span>
          {current && <DiffBadge level={current.difficulty} />}
        </div>

        {/* Waveform */}
        <Waveform active={playing} onClick={playWord} />

        {/* Status */}
        <div style={{ textAlign: "center", fontFamily: "monospace", fontSize: 12, color: playing ? "#00d4ff" : "#64748b", marginBottom: 16, height: 18 }}>
          {playing ? "🔊 Playing..." : answered ? "✔ Check your answer below" : "Click waveform or ▶ to listen"}
        </div>

        {/* Controls row */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
          {/* Big play button */}
          <button onClick={playWord} disabled={playsLeft <= 0} style={{
            width: 52, height: 52, borderRadius: "50%", background: 'var(--secondary-color)', border: "none",
            cursor: playsLeft > 0 ? "pointer" : "not-allowed", opacity: playsLeft > 0 ? 1 : 0.4,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            boxShadow: "0 4px 12px rgba(250, 169, 22, 0.3)", transition: "transform .15s",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--primary-color)"><path d="M8 5v14l11-7z" /></svg>
          </button>
          <button onClick={playWord} style={{ flex: 1, padding: "13px 0", borderRadius: 10, background: "#141d2e", border: "1px solid #1e2d45", color: "#e2e8f0", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            ↩ Replay
          </button>
          <button onClick={nextWord} style={{ flex: 1, padding: "13px 0", borderRadius: 10, background: "#141d2e", border: "1px solid #1e2d45", color: "#e2e8f0", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            ⏭ Skip
          </button>
        </div>

        {/* Speed + plays left */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>Speed:</span>
          {[0.7, 1.0, 1.2].map(s => (
            <button key={s} onClick={() => setSpeed(s)} style={{
              padding: "4px 11px", borderRadius: 6, fontSize: 12, fontFamily: "monospace",
              cursor: "pointer", transition: "all .2s",
              background: speed === s ? 'rgba(13, 59, 102, 0.1)' : "transparent",
              color: speed === s ? 'var(--primary-color)' : 'var(--text-secondary)',
              border: `1px solid ${speed === s ? 'var(--primary-color)' : 'var(--accent-color)'}`,
            }}>{s}×</button>
          ))}
          <span style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: 11, color: "#64748b" }}>
            Plays: <span style={{ color: "#f59e0b", fontWeight: 700 }}>{playsLeft}</span>/3
          </span>
        </div>

        {/* Input */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
            Type What You Hear
          </div>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && checkAnswer()}
            disabled={answered}
            placeholder="Type the word here…"
            autoComplete="off" autoCorrect="off" spellCheck={false}
            style={{
              width: "100%", background: "#141d2e", border: `1px solid ${answered ? "#1e2d45" : "#1e2d45"}`,
              borderRadius: 10, padding: "13px 16px", color: "#e2e8f0",
              fontFamily: "monospace", fontSize: 15, outline: "none", boxSizing: "border-box",
              opacity: answered ? 0.6 : 1,
            }}
          />
        </div>

        {/* Hint box */}
        <div style={{ display: "flex", gap: 10, padding: "9px 13px", background: "rgba(245,158,11,.08)", border: "1px solid rgba(245,158,11,.2)", borderRadius: 8, marginBottom: 14 }}>
          <span>💡</span>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "#f59e0b", lineHeight: 1.5 }}>
            PTE Tip: Spelling must be 100% correct. Both British &amp; American spelling accepted.
          </span>
        </div>

        {/* Submit */}
        <button
          onClick={checkAnswer}
          disabled={answered || !input.trim()}
          style={{
            width: "100%", padding: 15, borderRadius: 12, border: "none",
            background: 'var(--primary-color)', color: "#fff",
            fontWeight: 700, fontSize: 15, cursor: answered ? "not-allowed" : "pointer",
            opacity: answered || !input.trim() ? 0.4 : 1, marginBottom: 12,
          }}
        >
          Check Answer ✓
        </button>

        {/* Result */}
        {result && (
          <div style={{
            borderRadius: 12, padding: "15px 18px",
            background: result.isCorrect ? "rgba(16,185,129,.1)" : "rgba(239,68,68,.08)",
            border: `1px solid ${result.isCorrect ? "rgba(16,185,129,.3)" : "rgba(239,68,68,.25)"}`,
            animation: "fadeUp .3s ease",
          }}>
            <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, marginBottom: 10, fontSize: 14 }}>
              <span style={{ fontSize: 18 }}>{result.isCorrect ? "✅" : "❌"}</span>
              <span style={{ color: result.isCorrect ? "#10b981" : "#ef4444" }}>
                {result.isCorrect ? "Correct! Perfect spelling!" : "Not quite — check the spelling"}
              </span>
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 1.8 }}>
              {result.isCorrect
                ? <span style={{ color: "#10b981" }}>{result.word.word} ✓</span>
                : <>
                  <span style={{ color: "#94a3b8" }}>Your answer: </span>
                  <span style={{ color: "#ef4444", textDecoration: "line-through" }}>{input}</span>
                  <br />
                  <span style={{ color: "#94a3b8" }}>Correct: </span>
                  <span style={{ color: "#10b981", fontWeight: 700 }}>{result.word.word}</span>
                </>
              }
            </div>
            <div style={{ marginTop: 8, padding: "8px 0 0", borderTop: "1px solid #1e2d45", fontFamily: "monospace", fontSize: 12, color: "#64748b" }}>
              📖 {result.word.meaning}
            </div>
            {/* Accuracy bar */}
            <div style={{ height: 4, background: "#141d2e", borderRadius: 4, overflow: "hidden", marginTop: 10 }}>
              <div style={{ height: "100%", width: `${result.accuracy}%`, background: "#10b981", borderRadius: 4, transition: "width .5s" }} />
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 11, color: "#64748b", marginTop: 4, textAlign: "right" }}>
              Character accuracy: {result.accuracy}%
            </div>
          </div>
        )}

        {/* Next */}
        {result && (
          <button onClick={nextWord} style={{
            width: "100%", marginTop: 12, padding: 13, borderRadius: 12,
            background: "#141d2e", border: "1px solid #1e2d45", color: "#e2e8f0",
            fontWeight: 600, fontSize: 14, cursor: "pointer",
          }}>
            Next Word →
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB: SENTENCES
// ─────────────────────────────────────────────
function SentenceTab({ scores, setScores }) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [input, setInput] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState(null);
  const [speed] = useState(0.9);

  const sentence = sentenceData[idx];

  function playSent() {
    setPlaying(true);
    speak(sentence, speed, () => setPlaying(false));
  }

  function checkSentence() {
    if (!input.trim()) return;
    const { pct, matched, total } = calcWordAccuracy(input, sentence);
    const isGood = pct >= 70;
    setResult({ pct, matched, total, isGood });
    setRevealed(true);
    setScores(s => ({
      correct: s.correct + (isGood ? 1 : 0),
      wrong: s.wrong + (isGood ? 0 : 1),
      streak: isGood ? s.streak + 1 : 0,
    }));
  }

  function nextSentence() {
    setIdx(i => (i + 1) % sentenceData.length);
    setInput(""); setResult(null); setRevealed(false); setPlaying(false);
    window.speechSynthesis.cancel();
  }

  // Diff highlighting
  function renderDiff() {
    const userWords = input.toLowerCase().split(/\s+/);
    const correctWords = sentence.toLowerCase().replace(/[.,!?]/g, "").split(/\s+/);
    return correctWords.map((w, i) => {
      const u = (userWords[i] || "").replace(/[.,!?]/g, "");
      if (u === w) return <span key={i} style={{ color: "#10b981", marginRight: 4 }}>{w}</span>;
      if (u) return <span key={i} style={{ color: "#ef4444", textDecoration: "line-through", marginRight: 4 }}>{u}</span>;
      return <span key={i} style={{ color: "#f59e0b", fontStyle: "italic", marginRight: 4 }}>[{w}]</span>;
    });
  }

  return (
    <div>
      <div style={{ background: "#0e1520", border: "1px solid #1e2d45", borderRadius: 16, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontFamily: "monospace", fontSize: 12, color: "#64748b" }}>
            Sentence <span style={{ color: "#00d4ff" }}>{idx + 1}</span> of {sentenceData.length}
          </span>
          <span style={{ padding: "3px 10px", borderRadius: 100, fontSize: 11, fontFamily: "monospace", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", background: "rgba(239,68,68,.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,.3)" }}>HARD</span>
        </div>

        <Waveform active={playing} onClick={playSent} />

        <div style={{ textAlign: "center", fontFamily: "monospace", fontSize: 12, color: playing ? "#00d4ff" : "#64748b", marginBottom: 16, height: 18 }}>
          {playing ? "🔊 Playing sentence..." : "Click to listen to the full sentence"}
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <button onClick={playSent} style={{ width: 52, height: 52, borderRadius: "50%", background: "#00d4ff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 20px rgba(0,212,255,.3)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#000"><path d="M8 5v14l11-7z" /></svg>
          </button>
          <button onClick={playSent} style={{ flex: 1, padding: 13, borderRadius: 10, background: "#141d2e", border: "1px solid #1e2d45", color: "#e2e8f0", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>↩ Replay</button>
          <button onClick={() => setRevealed(r => !r)} style={{ flex: 1, padding: 13, borderRadius: 10, background: "#141d2e", border: "1px solid #1e2d45", color: "#e2e8f0", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>👁 {revealed ? "Hide" : "Reveal"}</button>
        </div>

        {/* Sentence reveal */}
        <div style={{
          background: "#141d2e", border: "1px solid #1e2d45", borderRadius: 10,
          padding: 16, marginBottom: 14, fontFamily: "monospace", fontSize: 13,
          lineHeight: 1.8, color: revealed ? "#94a3b8" : "#141d2e", minHeight: 56,
          display: "flex", alignItems: "center", justifyContent: "center",
          textAlign: "center", transition: "color .3s",
          userSelect: revealed ? "text" : "none",
        }}>
          {sentence}
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Write The Full Sentence</div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Write every word you heard exactly as spoken…"
            rows={3}
            autoCorrect="off" spellCheck={false}
            style={{ width: "100%", background: "#141d2e", border: "1px solid #1e2d45", borderRadius: 10, padding: "13px 16px", color: "#e2e8f0", fontFamily: "monospace", fontSize: 14, resize: "none", outline: "none", boxSizing: "border-box", lineHeight: 1.6 }}
          />
        </div>

        <button onClick={checkSentence} disabled={!input.trim()} style={{ width: "100%", padding: 15, borderRadius: 12, border: "none", background: "linear-gradient(135deg,#00d4ff,#7c3aed)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: input.trim() ? "pointer" : "not-allowed", opacity: input.trim() ? 1 : 0.4, marginBottom: 12 }}>
          Check Full Sentence ✓
        </button>

        {result && (
          <div style={{ borderRadius: 12, padding: "15px 18px", background: result.isGood ? "rgba(16,185,129,.1)" : "rgba(239,68,68,.08)", border: `1px solid ${result.isGood ? "rgba(16,185,129,.3)" : "rgba(239,68,68,.25)"}`, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, marginBottom: 10, fontSize: 14 }}>
              <span style={{ fontSize: 18 }}>{result.isGood ? "✅" : "⚠️"}</span>
              <span style={{ color: result.isGood ? "#10b981" : "#f59e0b" }}>
                {result.isGood ? `Excellent! ${result.pct}% correct` : `${result.pct}% correct — keep practicing!`}
              </span>
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 2 }}>{renderDiff()}</div>
            <div style={{ height: 4, background: "#141d2e", borderRadius: 4, overflow: "hidden", marginTop: 10 }}>
              <div style={{ height: "100%", width: `${result.pct}%`, background: "#10b981", borderRadius: 4 }} />
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 11, color: "#64748b", marginTop: 4, textAlign: "right" }}>
              Word accuracy: {result.pct}% ({result.matched}/{result.total} words)
            </div>
          </div>
        )}

        <button onClick={nextSentence} style={{ width: "100%", padding: 13, borderRadius: 12, background: "#141d2e", border: "1px solid #1e2d45", color: "#e2e8f0", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          Next Sentence →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB: WORD BANK
// ─────────────────────────────────────────────
function WordBankTab() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  const filtered = wordData.filter(w => {
    const matchCat = category === "all" || w.cat === category;
    const matchSearch = !search || w.word.includes(search.toLowerCase()) || w.meaning.includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  function toggleCard(i) {
    const word = filtered[i];
    if (expanded === i) { setExpanded(null); return; }
    setExpanded(i);
    speak(word.word, 0.85);
  }

  const catColors = { academic: "#00d4ff", environment: "#10b981", health: "#f59e0b", economics: "#7c3aed", society: "#ec4899" };
  const categories = ["all", "academic", "environment", "health", "economics", "society"];

  return (
    <div>
      {/* Search */}
      <div style={{ position: "relative", marginBottom: 14 }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search words or meanings…"
          style={{ width: "100%", background: "#0e1520", border: "1px solid #1e2d45", borderRadius: 10, padding: "12px 14px 12px 42px", color: "#e2e8f0", fontFamily: "monospace", fontSize: 14, outline: "none", boxSizing: "border-box" }}
        />
      </div>

      {/* Category pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} style={{
            padding: "5px 13px", borderRadius: 100, fontSize: 12, fontWeight: 600, fontFamily: "monospace", cursor: "pointer",
            background: category === cat ? "rgba(124,58,237,.15)" : "#0e1520",
            color: category === cat ? "#a78bfa" : "#64748b",
            border: `1px solid ${category === cat ? "#7c3aed" : "#1e2d45"}`,
          }}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</button>
        ))}
      </div>

      <div style={{ fontFamily: "monospace", fontSize: 11, color: "#64748b", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>
        Showing {filtered.length} words — click to hear & expand
      </div>

      <div style={{ maxHeight: 520, overflowY: "auto", paddingRight: 4 }}>
        {filtered.map((w, i) => (
          <div key={w.word} onClick={() => toggleCard(i)} style={{
            background: "#0e1520", border: `1px solid ${expanded === i ? catColors[w.cat] || "#1e2d45" : "#1e2d45"}`,
            borderRadius: 14, padding: "16px 20px", marginBottom: 10, cursor: "pointer",
            transition: "border-color .2s, transform .15s",
            transform: expanded === i ? "scale(1.01)" : "scale(1)",
            position: "relative",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: catColors[w.cat] || "#00d4ff", fontFamily: "monospace", marginBottom: 4 }}>{w.word}</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <span style={{ padding: "1px 8px", borderRadius: 4, fontSize: 10, fontFamily: "monospace", background: "rgba(124,58,237,.2)", color: "#a78bfa", textTransform: "uppercase" }}>{w.type}</span>
                  <span style={{ padding: "1px 8px", borderRadius: 4, fontSize: 10, fontFamily: "monospace", background: "rgba(100,116,139,.15)", color: "#64748b", textTransform: "uppercase" }}>{w.cat}</span>
                  <DiffBadge level={w.difficulty} />
                </div>
                <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>{w.meaning}</div>
              </div>
              <span style={{ color: expanded === i ? catColors[w.cat] || "#00d4ff" : "#64748b", fontSize: 12, marginLeft: 12, flexShrink: 0 }}>{expanded === i ? "▼" : "▶"}</span>
            </div>

            {expanded === i && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1e2d45" }}>
                <div style={{ fontFamily: "monospace", fontSize: 13, color: "#94a3b8", fontStyle: "italic", lineHeight: 1.6, marginBottom: 8 }}>
                  💬 "{w.example}"
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={e => { e.stopPropagation(); speak(w.example, 0.9); }} style={{ padding: "5px 12px", borderRadius: 8, background: "rgba(0,212,255,.1)", border: "1px solid rgba(0,212,255,.2)", color: "#00d4ff", fontSize: 12, fontFamily: "monospace", cursor: "pointer" }}>
                    🔊 Hear Example
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function DictationLab() {
  const [tab, setTab] = useState("dictation");
  const [scores, setScores] = useState({ correct: 0, wrong: 0, streak: 0 });

  // Load voices on mount
  useEffect(() => {
    if (window.speechSynthesis) window.speechSynthesis.getVoices();
  }, []);

  const tabs = [
    { id: "dictation", label: "🎙 Dictation" },
    { id: "sentence", label: "📝 Sentences" },
    { id: "wordbank", label: "📚 Word Bank" },
  ];

  return (
    <div style={{ background: 'var(--bg-color)', minHeight: "100vh", color: 'var(--text-main)', fontFamily: "'Inter', sans-serif" }}>
      {/* Grid bg */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(0,212,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.025) 1px,transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto", padding: "20px 16px 60px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", padding: "28px 0 22px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,212,255,.08)", border: "1px solid rgba(0,212,255,.2)", borderRadius: 100, padding: "5px 16px", fontFamily: "monospace", fontSize: 11, color: "#00d4ff", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d4ff", animation: "pulse 1.5s infinite" }} />
            PTE MASTER PRO
            <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}`}</style>
          </div>
          <h1 style={{ fontSize: "clamp(24px,5vw,40px)", fontWeight: 800, letterSpacing: -1, lineHeight: 1.1, background: "linear-gradient(135deg,#fff 0%,#00d4ff 60%,#7c3aed 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: 8 }}>
            🎧 Audio Dictation Lab
          </h1>
          <div style={{ fontFamily: "monospace", fontSize: 13, color: "#64748b" }}>
            High-Frequency PTE Words · Premium Study Tools
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, background: 'var(--accent-color)', border: "1px solid var(--accent-color)", borderRadius: 12, padding: 6, marginBottom: 20 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "10px 8px", borderRadius: 8, border: "none",
              background: tab === t.id ? 'var(--primary-color)' : "transparent",
              color: tab === t.id ? "#fff" : 'var(--text-secondary)',
              fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all .2s",
              boxShadow: tab === t.id ? "0 4px 12px rgba(13, 59, 102, 0.2)" : "none",
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Scores */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <ScoreCard value={scores.correct} label="Correct" color="#10b981" />
          <ScoreCard value={scores.wrong} label="Wrong" color="#ef4444" />
          <ScoreCard value={scores.streak} label="🔥 Streak" color="#00d4ff" />
        </div>

        {/* Panels */}
        {tab === "dictation" && <DictationTab scores={scores} setScores={setScores} />}
        {tab === "sentence" && <SentenceTab scores={scores} setScores={setScores} />}
        {tab === "wordbank" && <WordBankTab />}
      </div>
    </div>
  );
}
