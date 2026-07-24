import React, { useState, useRef } from "react";

const PALETTE = [
  "#E8543E", // tomato
  "#F5B841", // saffron
  "#5C8A4A", // basil
  "#4A5FA5", // blueberry
  "#8A4B94", // eggplant
  "#E85D8A", // watermelon
  "#3F9B8C", // matcha teal
  "#D46A2C", // paprika
  "#5B9BD5", // blue cheese
  "#9C6B3F", // cocoa
];

const DEFAULT_ITEMS = [
  { id: "a1", emoji: "🍕", label: "Pizza" },
  { id: "a2", emoji: "🍔", label: "Burger" },
  { id: "a3", emoji: "🍣", label: "Sushi" },
  { id: "a4", emoji: "🌮", label: "Tacos" },
  { id: "a5", emoji: "🍜", label: "Ramen" },
  { id: "a6", emoji: "🥗", label: "Salad" },
  { id: "a7", emoji: "🍝", label: "Pasta" },
  { id: "a8", emoji: "🍖", label: "BBQ" },
];

const EMOJI_GUESS = [
  ["pizza", "🍕"], ["burger", "🍔"], ["sushi", "🍣"], ["taco", "🌮"],
  ["ramen", "🍜"], ["noodle", "🍜"], ["salad", "🥗"], ["pasta", "🍝"],
  ["bbq", "🍖"], ["rib", "🍖"], ["curry", "🍛"], ["rice", "🍚"],
  ["sandwich", "🥪"], ["soup", "🍲"], ["steak", "🥩"], ["fish", "🐟"],
  ["dumpling", "🥟"], ["fries", "🍟"], ["chicken", "🍗"], ["kebab", "🍢"],
  ["burrito", "🌯"], ["pho", "🍜"], ["pancake", "🥞"], ["waffle", "🧇"],
  ["donut", "🍩"], ["cake", "🍰"], ["icecream", "🍦"], ["dessert", "🍮"],
  ["hotdog", "🌭"], ["wrap", "🌯"],
];

function guessEmoji(label) {
  const l = label.toLowerCase();
  for (const [key, emoji] of EMOJI_GUESS) {
    if (l.includes(key)) return emoji;
  }
  return "🍽️";
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function App() {
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [newLabel, setNewLabel] = useState("");
  const [error, setError] = useState("");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const itemsAtSpinRef = useRef(items);

  const sliceAngle = 360 / items.length;
  const canSpin = items.length >= 2 && !spinning;

  function addItem() {
    const label = newLabel.trim();
    if (!label) {
      setError("Type something to add first.");
      return;
    }
    if (items.some((it) => it.label.toLowerCase() === label.toLowerCase())) {
      setError("That's already on the wheel.");
      return;
    }
    if (items.length >= 16) {
      setError("16 choices is the limit — remove one to add another.");
      return;
    }
    setItems((prev) => [...prev, { id: uid(), emoji: guessEmoji(label), label }]);
    setNewLabel("");
    setError("");
  }

  function removeItem(id) {
    if (spinning) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
    setWinner(null);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") addItem();
  }

  function spin() {
    if (!canSpin) return;
    setWinner(null);
    itemsAtSpinRef.current = items;
    const extraSpins = 5 + Math.floor(Math.random() * 4); // 5-8 full turns
    const randomOffset = Math.random() * 360;
    const nextRotation = rotation + extraSpins * 360 + randomOffset;
    setRotation(nextRotation);
    setSpinning(true);
  }

  function handleTransitionEnd(e) {
    if (e.propertyName !== "transform") return;
    setSpinning(false);
    const list = itemsAtSpinRef.current;
    const slice = 360 / list.length;
    const normalized = (((360 - (rotation % 360)) % 360) + 360) % 360;
    const index = Math.floor(normalized / slice) % list.length;
    setWinner(list[index]);
  }

  const radius = 170;
  const gradientStops = items
    .map((_, i) => {
      const color = PALETTE[i % PALETTE.length];
      return `${color} ${i * sliceAngle}deg ${(i + 1) * sliceAngle}deg`;
    })
    .join(", ");

  const fontSize = items.length > 10 ? 12 : items.length > 6 ? 14 : 16;

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .fw-scrollbar::-webkit-scrollbar { width: 6px; }
        .fw-scrollbar::-webkit-scrollbar-thumb { background: #4a4038; border-radius: 4px; }
        @keyframes fw-pop {
          0% { transform: scale(0.7); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fw-pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(245, 184, 65, 0.55); }
          100% { box-shadow: 0 0 0 18px rgba(245, 184, 65, 0); }
        }
        .fw-winner-pop { animation: fw-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .fw-hub:not(:disabled):hover { transform: translate(-50%, -50%) scale(1.06); }
        .fw-hub:active:not(:disabled) { transform: translate(-50%, -50%) scale(0.97); }
        .fw-chip-remove:hover { background: #E8543E; color: #fff; }
        .fw-add-btn:hover:not(:disabled) { filter: brightness(1.08); }
        .fw-add-btn:active:not(:disabled) { transform: translateY(1px); }
        .fw-input:focus { outline: none; border-color: #F5B841; }
      `}</style>

      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.eyebrow}>SPIN TO DECIDE</div>
          <h1 style={styles.title}>Wheel of Eats</h1>
          <p style={styles.subtitle}>
            Add your options, give it a spin, let the wheel pick dinner.
          </p>
        </header>

        <div style={styles.grid}>
          {/* Wheel column */}
          <div style={styles.wheelCol}>
            <div style={styles.wheelWrap}>
              <div style={styles.pointer} />
              <div
                style={{
                  ...styles.wheel,
                  width: radius * 2,
                  height: radius * 2,
                  background:
                    items.length > 0
                      ? `conic-gradient(from 0deg, ${gradientStops})`
                      : "#3a322c",
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning
                    ? "transform 4.2s cubic-bezier(0.18, 0.7, 0.16, 1)"
                    : "none",
                }}
                onTransitionEnd={handleTransitionEnd}
              >
                {items.map((item, i) => {
                  const mid = i * sliceAngle + sliceAngle / 2;
                  return (
                    <div
                      key={item.id}
                      style={{
                        ...styles.labelOuter,
                        transform: `rotate(${mid}deg)`,
                      }}
                    >
                      <div
                        style={{
                          ...styles.labelInner,
                          transform: `translateY(${-(radius - 34)}px) rotate(90deg)`,
                          fontSize,
                        }}
                      >
                        <span style={{ fontSize: fontSize + 6 }}>{item.emoji}</span>
                        <span style={styles.labelText}>{item.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                className="fw-hub"
                style={{
                  ...styles.hub,
                  animation: !spinning && canSpin ? "fw-pulse-ring 2.2s infinite" : "none",
                  opacity: canSpin ? 1 : 0.5,
                  cursor: canSpin ? "pointer" : "not-allowed",
                }}
                onClick={spin}
                disabled={!canSpin}
              >
                {spinning ? "···" : "SPIN"}
              </button>
            </div>

            <div style={styles.resultArea}>
              {winner ? (
                <div key={winner.id + rotation} className="fw-winner-pop" style={styles.resultCard}>
                  <span style={styles.resultEmoji}>{winner.emoji}</span>
                  <div>
                    <div style={styles.resultLabelSmall}>Tonight it's</div>
                    <div style={styles.resultLabel}>{winner.label}</div>
                  </div>
                </div>
              ) : (
                <div style={styles.resultPlaceholder}>
                  {items.length < 2
                    ? "Add at least 2 choices to spin the wheel"
                    : spinning
                    ? "Spinning…"
                    : "Tap SPIN to pick tonight's meal"}
                </div>
              )}
            </div>
          </div>

          {/* Choices column */}
          <div style={styles.panel}>
            <h2 style={styles.panelTitle}>Choices</h2>

            <div style={styles.addRow}>
              <input
                className="fw-input"
                style={styles.input}
                type="text"
                placeholder="Add a food, e.g. Dumplings"
                value={newLabel}
                onChange={(e) => {
                  setNewLabel(e.target.value);
                  if (error) setError("");
                }}
                onKeyDown={handleKeyDown}
                disabled={spinning}
                maxLength={24}
              />
              <button
                className="fw-add-btn"
                style={styles.addBtn}
                onClick={addItem}
                disabled={spinning}
              >
                Add
              </button>
            </div>
            {error && <div style={styles.errorText}>{error}</div>}

            <div className="fw-scrollbar" style={styles.list}>
              {items.map((item, i) => (
                <div key={item.id} style={styles.chip}>
                  <span
                    style={{
                      ...styles.swatch,
                      background: PALETTE[i % PALETTE.length],
                    }}
                  />
                  <span style={styles.chipEmoji}>{item.emoji}</span>
                  <span style={styles.chipLabel}>{item.label}</span>
                  <button
                    className="fw-chip-remove"
                    style={styles.chipRemove}
                    onClick={() => removeItem(item.id)}
                    disabled={spinning}
                    aria-label={`Remove ${item.label}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div style={styles.footerNote}>
              {items.length} / 16 choices · need at least 2 to spin
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background: "linear-gradient(180deg, #241d18 0%, #1c1612 100%)",
    fontFamily: "'Inter', system-ui, sans-serif",
    color: "#F5EFE6",
    padding: "32px 16px 48px",
    display: "flex",
    justifyContent: "center",
  },
  container: { width: "100%", maxWidth: 960 },
  header: { textAlign: "center", marginBottom: 28 },
  eyebrow: {
    fontSize: 12,
    letterSpacing: "0.18em",
    color: "#F5B841",
    fontWeight: 600,
    marginBottom: 6,
  },
  title: {
    fontFamily: "'Fredoka', system-ui, sans-serif",
    fontSize: "clamp(32px, 6vw, 48px)",
    fontWeight: 700,
    margin: "0 0 8px",
    color: "#FBF6EC",
  },
  subtitle: { color: "#B8ADA0", fontSize: 15, margin: 0 },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 36,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  wheelCol: {
    flex: "1 1 380px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    maxWidth: 420,
  },
  wheelWrap: {
    position: "relative",
    width: 340,
    height: 340,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pointer: {
    position: "absolute",
    top: -6,
    left: "50%",
    transform: "translateX(-50%)",
    width: 0,
    height: 0,
    borderLeft: "14px solid transparent",
    borderRight: "14px solid transparent",
    borderTop: "24px solid #FBF6EC",
    filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.4))",
    zIndex: 3,
  },
  wheel: {
    borderRadius: "50%",
    position: "relative",
    border: "6px solid #2c2620",
    boxShadow: "0 12px 34px rgba(0,0,0,0.45), inset 0 0 0 2px rgba(255,255,255,0.06)",
  },
  labelOuter: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 0,
    height: 0,
  },
  labelInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    width: 90,
    marginLeft: -45,
    color: "#fff",
    textShadow: "0 1px 3px rgba(0,0,0,0.5)",
    fontWeight: 600,
    lineHeight: 1.1,
  },
  labelText: {
    fontFamily: "'Fredoka', system-ui, sans-serif",
    maxWidth: 90,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  hub: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 76,
    height: 76,
    borderRadius: "50%",
    border: "4px solid #FBF6EC",
    background: "linear-gradient(145deg, #F5B841, #E8543E)",
    color: "#2c2620",
    fontFamily: "'Fredoka', system-ui, sans-serif",
    fontWeight: 700,
    fontSize: 15,
    letterSpacing: "0.04em",
    zIndex: 4,
    transition: "transform 0.15s ease",
    boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
  },
  resultArea: { marginTop: 26, minHeight: 68, width: "100%", display: "flex", justifyContent: "center" },
  resultCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "#2c2620",
    border: "1px solid #443a30",
    borderRadius: 16,
    padding: "12px 22px",
  },
  resultEmoji: { fontSize: 34 },
  resultLabelSmall: { fontSize: 12, color: "#B8ADA0" },
  resultLabel: {
    fontFamily: "'Fredoka', system-ui, sans-serif",
    fontSize: 22,
    fontWeight: 600,
    color: "#F5B841",
  },
  resultPlaceholder: { color: "#8a7d70", fontSize: 14, textAlign: "center", paddingTop: 10 },
  panel: {
    flex: "1 1 300px",
    maxWidth: 380,
    background: "#241d18",
    border: "1px solid #3a322c",
    borderRadius: 20,
    padding: 22,
  },
  panelTitle: {
    fontFamily: "'Fredoka', system-ui, sans-serif",
    fontSize: 20,
    margin: "0 0 14px",
    color: "#FBF6EC",
  },
  addRow: { display: "flex", gap: 8, marginBottom: 6 },
  input: {
    flex: 1,
    background: "#1c1612",
    border: "1px solid #443a30",
    borderRadius: 10,
    padding: "10px 12px",
    color: "#F5EFE6",
    fontSize: 14,
  },
  addBtn: {
    background: "#F5B841",
    color: "#2c2620",
    border: "none",
    borderRadius: 10,
    padding: "0 18px",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  errorText: { color: "#E8543E", fontSize: 12, marginBottom: 8 },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    maxHeight: 320,
    overflowY: "auto",
    marginTop: 10,
    paddingRight: 4,
  },
  chip: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#1c1612",
    border: "1px solid #362e27",
    borderRadius: 12,
    padding: "8px 10px",
  },
  swatch: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
  chipEmoji: { fontSize: 16 },
  chipLabel: { flex: 1, fontSize: 14, color: "#F5EFE6" },
  chipRemove: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    border: "none",
    background: "#332b24",
    color: "#B8ADA0",
    fontSize: 15,
    lineHeight: 1,
    cursor: "pointer",
    transition: "background 0.15s ease, color 0.15s ease",
  },
  footerNote: { marginTop: 12, fontSize: 12, color: "#8a7d70", textAlign: "center" },
};
