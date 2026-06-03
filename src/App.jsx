import { useState, useMemo } from "react";

const DIODE_DROP = 0.7;
const STAGE_COLORS = ["#00ff88", "#00ccff", "#ffd700", "#ff6b35", "#cc88ff"];

function calcSystem(vin, stages, capUF, freqHz, loadMA) {
  const vp = vin * Math.sqrt(2);
  const voutIdeal = 2 * stages * vp;
  const diodeLoss = DIODE_DROP * 2 * stages;
  const capF = capUF * 1e-6;
  const I = loadMA / 1000;
  const n = stages;
  const droop = ((I / (freqHz * capF)) * (n * (2 * n * n + 1))) / 3;
  const voutReal = Math.max(0, voutIdeal - diodeLoss - droop);
  const totalCaps = stages * 2;
  const energyPerCap = 0.5 * capF * voutReal * voutReal;
  const totalEnergy = energyPerCap * totalCaps * 1000;
  const peakPower = totalEnergy / 1000 / 0.001;
  const powerOut = voutReal * I;
  return {
    vp: vp.toFixed(2),
    voutIdeal: voutIdeal.toFixed(1),
    voutReal: voutReal.toFixed(2),
    diodeLoss: diodeLoss.toFixed(1),
    droop: droop.toFixed(2),
    totalCaps,
    totalEnergy: totalEnergy.toFixed(3),
    peakPower: peakPower.toFixed(0),
    powerOut: powerOut.toFixed(3),
    n,
  };
}

function CircuitDiagram({ stages, vin, voutReal }) {
  const stageW = 110;
  const W = 90 + stages * stageW + 70;
  const H = 300;
  const topY = 70;
  const botY = 230;
  const midY = (topY + botY) / 2;
  const srcX = 44;
  const vp = (vin * Math.sqrt(2)).toFixed(1);
  const els = [];

  els.push(
    <line
      key="gnd"
      x1={srcX}
      y1={botY}
      x2={W - 20}
      y2={botY}
      stroke="#222"
      strokeWidth="1.5"
    />,
  );
  els.push(
    <line
      key="top"
      x1={srcX}
      y1={topY}
      x2={W - 20}
      y2={topY}
      stroke="#222"
      strokeWidth="1.5"
    />,
  );
  els.push(
    <g key="src">
      <line
        x1={srcX}
        y1={topY}
        x2={srcX}
        y2={topY + 26}
        stroke="#00ff88"
        strokeWidth="1.5"
      />
      <circle
        cx={srcX}
        cy={midY}
        r={22}
        fill="#0d1a0d"
        stroke="#00ff88"
        strokeWidth="1.5"
      />
      <text
        x={srcX}
        y={midY - 3}
        textAnchor="middle"
        fill="#00ff88"
        fontSize="15"
      >
        ~
      </text>
      <text
        x={srcX}
        y={midY + 13}
        textAnchor="middle"
        fill="#00ff88"
        fontSize="8"
      >
        AC
      </text>
      <line
        x1={srcX}
        y1={midY + 22}
        x2={srcX}
        y2={botY}
        stroke="#00ff88"
        strokeWidth="1.5"
      />
      <text
        x={srcX}
        y={topY - 10}
        textAnchor="middle"
        fill="#00ff88"
        fontSize="9"
      >
        {vin}V
      </text>
    </g>,
  );

  for (let i = 0; i < stages; i++) {
    const x0 = srcX + 34 + i * stageW;
    const col = STAGE_COLORS[i % STAGE_COLORS.length];
    const vStage = Math.max(
      0,
      2 * (i + 1) * parseFloat(vp) - DIODE_DROP * 2 * (i + 1),
    ).toFixed(0);
    els.push(
      <line
        key={`vc${i}`}
        x1={x0}
        y1={topY}
        x2={x0}
        y2={botY}
        stroke={col}
        strokeWidth="1"
        strokeDasharray="3,3"
        opacity="0.15"
      />,
    );
    // Top cap
    const cTX = x0 + 18,
      cTMY = topY + (midY - topY) * 0.45;
    els.push(
      <g key={`ct${i}`}>
        <line
          x1={cTX}
          y1={topY}
          x2={cTX}
          y2={cTMY - 7}
          stroke={col}
          strokeWidth="1.5"
        />
        <line
          x1={cTX - 11}
          y1={cTMY - 7}
          x2={cTX + 11}
          y2={cTMY - 7}
          stroke={col}
          strokeWidth="3"
        />
        <line
          x1={cTX - 11}
          y1={cTMY - 1}
          x2={cTX + 11}
          y2={cTMY - 1}
          stroke={col}
          strokeWidth="3"
        />
        <line
          x1={cTX}
          y1={cTMY - 1}
          x2={cTX}
          y2={midY}
          stroke={col}
          strokeWidth="1.5"
        />
        <text
          x={cTX - 14}
          y={cTMY + 2}
          textAnchor="end"
          fill={col}
          fontSize="8"
          fontFamily="monospace"
        >
          C{i * 2 + 1}
        </text>
      </g>,
    );
    // Bot cap
    const cBX = x0 + 78,
      cBMY = midY + (botY - midY) * 0.52;
    els.push(
      <g key={`cb${i}`}>
        <line
          x1={cBX}
          y1={midY}
          x2={cBX}
          y2={cBMY - 7}
          stroke={col}
          strokeWidth="1.5"
        />
        <line
          x1={cBX - 11}
          y1={cBMY - 7}
          x2={cBX + 11}
          y2={cBMY - 7}
          stroke={col}
          strokeWidth="3"
        />
        <line
          x1={cBX - 11}
          y1={cBMY - 1}
          x2={cBX + 11}
          y2={cBMY - 1}
          stroke={col}
          strokeWidth="3"
        />
        <line
          x1={cBX}
          y1={cBMY - 1}
          x2={cBX}
          y2={botY}
          stroke={col}
          strokeWidth="1.5"
        />
        <text
          x={cBX + 14}
          y={cBMY + 2}
          fill={col}
          fontSize="8"
          fontFamily="monospace"
        >
          C{i * 2 + 2}
        </text>
      </g>,
    );
    // Top diode
    const dTX = x0 + 50;
    els.push(
      <g key={`dt${i}`}>
        <polygon
          points={`${dTX},${topY - 6} ${dTX + 13},${topY} ${dTX},${topY + 6}`}
          fill={col}
          opacity="0.9"
        />
        <line
          x1={dTX + 13}
          y1={topY - 6}
          x2={dTX + 13}
          y2={topY + 6}
          stroke={col}
          strokeWidth="2"
        />
        <text
          x={dTX + 5}
          y={topY - 10}
          textAnchor="middle"
          fill={col}
          fontSize="8"
          fontFamily="monospace"
        >
          D{i * 2 + 1}
        </text>
      </g>,
    );
    // Bot diode
    const dBX = x0 + 4;
    els.push(
      <g key={`db${i}`}>
        <polygon
          points={`${dBX},${botY - 6} ${dBX + 13},${botY} ${dBX},${botY + 6}`}
          fill={col}
          opacity="0.9"
        />
        <line
          x1={dBX + 13}
          y1={botY - 6}
          x2={dBX + 13}
          y2={botY + 6}
          stroke={col}
          strokeWidth="2"
        />
        <text
          x={dBX + 5}
          y={botY + 18}
          textAnchor="middle"
          fill={col}
          fontSize="8"
          fontFamily="monospace"
        >
          D{i * 2 + 2}
        </text>
      </g>,
    );
    // Stage label — boxed above, with connecting line
    els.push(
      <g key={`sl${i}`}>
        <rect
          x={x0 + 28}
          y={topY - 52}
          width={54}
          height={28}
          rx={3}
          fill="#0a0a0a"
          stroke={col}
          strokeWidth="0.5"
        />
        <text
          x={x0 + 55}
          y={topY - 38}
          textAnchor="middle"
          fill={col}
          fontSize="8"
          fontFamily="monospace"
          opacity="0.7"
        >
          S{i + 1}
        </text>
        <text
          x={x0 + 55}
          y={topY - 24}
          textAnchor="middle"
          fill={col}
          fontSize="10"
          fontFamily="monospace"
          fontWeight="bold"
        >
          ~{vStage}V
        </text>
        <line
          x1={x0 + 55}
          y1={topY - 20}
          x2={x0 + 55}
          y2={topY}
          stroke={col}
          strokeWidth="0.5"
          strokeDasharray="2,2"
          opacity="0.4"
        />
      </g>,
    );
  }

  const outX = srcX + 34 + stages * stageW;
  els.push(
    <g key="out">
      <line
        x1={outX}
        y1={topY}
        x2={outX}
        y2={topY + 28}
        stroke="#00ff88"
        strokeWidth="2"
      />
      <circle cx={outX} cy={topY + 34} r={7} fill="#00ff88" opacity="0.85" />
      <text
        x={outX}
        y={topY + 38}
        textAnchor="middle"
        fill="#000"
        fontSize="10"
        fontWeight="bold"
      >
        +
      </text>
      <line
        x1={outX}
        y1={botY - 28}
        x2={outX}
        y2={botY}
        stroke="#555"
        strokeWidth="2"
      />
      <circle cx={outX} cy={botY - 34} r={7} fill="#333" />
      <text
        x={outX}
        y={botY - 30}
        textAnchor="middle"
        fill="#aaa"
        fontSize="10"
        fontWeight="bold"
      >
        −
      </text>
      <rect
        x={outX - 36}
        y={H - 26}
        width={74}
        height={20}
        rx={4}
        fill="#00ff8818"
      />
      <text
        x={outX + 1}
        y={H - 11}
        textAnchor="middle"
        fill="#00ff88"
        fontSize="11"
        fontFamily="monospace"
        fontWeight="bold"
      >
        {voutReal}V DC
      </text>
    </g>,
  );

  return (
    <div style={{ overflowX: "auto" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ minWidth: W, height: H, display: "block" }}
      >
        <rect width={W} height={H} fill="#060606" rx="6" />
        {els}
      </svg>
    </div>
  );
}

const CAP_PRESETS = [10, 47, 100, 220, 470, 1000, 2200];

function StatCard({ label, val, sub, col }) {
  return (
    <div
      style={{
        background: "#0f0f0f",
        border: "1px solid #1a1a1a",
        borderLeft: `2px solid ${col}`,
        borderRadius: 6,
        padding: "10px 12px",
      }}
    >
      <div style={{ fontSize: 10, color: "#555", marginBottom: 3 }}>
        {label}
      </div>
      <div
        style={{ fontSize: 15, color: col, fontWeight: 700, marginBottom: 2 }}
      >
        {val}
      </div>
      <div style={{ fontSize: 9, color: "#3a3a3a" }}>{sub}</div>
    </div>
  );
}

export default function App() {
  const [vin, setVin] = useState(0);
  const [stages, setStages] = useState(0);
  const [capUF, setCapUF] = useState(0);
  const [freqHz, setFreqHz] = useState(0);
  const [loadMA, setLoadMA] = useState(0);

  const r = useMemo(
    () => calcSystem(vin, stages, capUF, freqHz, loadMA),
    [vin, stages, capUF, freqHz, loadMA],
  );

  const stageRows = useMemo(
    () =>
      Array.from({ length: stages }, (_, i) => {
        const n = i + 1;
        const vp = vin * Math.sqrt(2);
        const capF = capUF * 1e-6;
        const I = loadMA / 1000;
        const vIdeal = 2 * n * vp;
        const dLoss = DIODE_DROP * 2 * n;
        const droop = ((I / (freqHz * capF)) * (n * (2 * n * n + 1))) / 3;
        const vReal = Math.max(0, vIdeal - dLoss - droop);
        const e = (0.5 * capF * vReal * vReal * n * 2 * 1000).toFixed(2);
        return {
          n,
          vReal: vReal.toFixed(1),
          caps: n * 2,
          e,
          droop: droop.toFixed(1),
        };
      }),
    [vin, stages, capUF, freqHz, loadMA],
  );

  const droopPct =
    r.voutIdeal > 0
      ? ((parseFloat(r.droop) / parseFloat(r.voutIdeal)) * 100).toFixed(1)
      : "0";
  const sec = {
    background: "#0f0f0f",
    border: "1px solid #1a1a1a",
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
  };
  const secT = {
    fontSize: 9,
    color: "#333",
    letterSpacing: 3,
    marginBottom: 12,
  };

  return (
    <div
      style={{
        background: "#080808",
        minHeight: "100vh",
        color: "#ccc",
        fontFamily: "'Courier New', monospace",
        padding: "20px 14px",
        // maxWidth: 560,
        // margin: "0 auto",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#fff" }}>
          ឧបករណ៍<span style={{ color: "#00ff88" }}>ពង្រីកវ៉ុល</span>
        </h1>
      </div>

      {/* Controls */}
      <div style={sec}>
        <div style={secT}>ប៉ារ៉ាម៉ែត្រ</div>

        {/* Vin slider */}
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 5,
            }}
          >
            <span style={{ fontSize: 11, color: "#777" }}>វ៉ុលបញ្ចូល</span>
            <span style={{ fontSize: 13, color: "#00ff88", fontWeight: 700 }}>
              {vin}V → {r.vp}Vp
            </span>
          </div>
          <input
            type="range"
            min={3}
            max={48}
            value={vin}
            onChange={(e) => setVin(+e.target.value)}
            style={{ width: "100%", accentColor: "#00ff88" }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 9,
              color: "#2a2a2a",
              marginTop: 2,
            }}
          >
            <span>3V</span>
            <span>48V</span>
          </div>
        </div>

        {/* Stages */}
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 11, color: "#777" }}>ចំនួនដំណាក់កាល</span>
            <span style={{ fontSize: 11, color: "#555" }}>
              {r.totalCaps} caps · {r.totalCaps} diodes
            </span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setStages(s)}
                style={{
                  flex: 1,
                  padding: "9px 0",
                  background: stages === s ? "#141414" : "#0a0a0a",
                  border:
                    stages === s
                      ? `1px solid ${STAGE_COLORS[s - 1]}`
                      : "1px solid #1a1a1a",
                  borderRadius: 5,
                  color: stages === s ? STAGE_COLORS[s - 1] : "#333",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "monospace",
                  transition: "all 0.15s",
                }}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>

        {/* Cap presets */}
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 11, color: "#777" }}>ទំហំ Capacitor</span>
            <span style={{ fontSize: 13, color: "#ffd700", fontWeight: 700 }}>
              {capUF}µF
            </span>
          </div>
          <div
            style={{
              display: "flex",
              gap: 5,
              flexWrap: "wrap",
              marginBottom: 8,
            }}
          >
            {CAP_PRESETS.map((c) => (
              <button
                key={c}
                onClick={() => setCapUF(c)}
                style={{
                  padding: "5px 9px",
                  background: capUF === c ? "#161610" : "#0a0a0a",
                  border:
                    capUF === c ? "1px solid #ffd700" : "1px solid #1a1a1a",
                  borderRadius: 4,
                  color: capUF === c ? "#ffd700" : "#333",
                  cursor: "pointer",
                  fontSize: 10,
                  fontFamily: "monospace",
                  transition: "all 0.15s",
                }}
              >
                {c >= 1000 ? `${c / 1000}mF` : `${c}µ`}
              </button>
            ))}
          </div>
          <input
            type="range"
            min={1}
            max={4700}
            step={1}
            value={capUF}
            onChange={(e) => setCapUF(+e.target.value)}
            style={{ width: "100%", accentColor: "#ffd700" }}
          />
        </div>

        {/* Frequency */}
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 5,
            }}
          >
            <span style={{ fontSize: 11, color: "#777" }}>
              ប្រេកង់ Oscillator
            </span>
            <span style={{ fontSize: 13, color: "#00ccff", fontWeight: 700 }}>
              {freqHz} Hz
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={10000}
            step={10}
            value={freqHz}
            onChange={(e) => setFreqHz(+e.target.value)}
            style={{ width: "100%", accentColor: "#00ccff" }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 9,
              color: "#2a2a2a",
              marginTop: 2,
            }}
          >
            <span>10 Hz (យឺត)</span>
            <span>10 kHz (លឿន)</span>
          </div>
        </div>

        {/* Load */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 5,
            }}
          >
            <span style={{ fontSize: 11, color: "#777" }}>ចរន្តផ្ទុក</span>
            <span style={{ fontSize: 13, color: "#ff6b35", fontWeight: 700 }}>
              {loadMA} mA
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={500}
            step={1}
            value={loadMA}
            onChange={(e) => setLoadMA(+e.target.value)}
            style={{ width: "100%", accentColor: "#ff6b35" }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 9,
              color: "#2a2a2a",
              marginTop: 2,
            }}
          >
            <span>0 mA (គ្មានផ្ទុក)</span>
            <span>500 mA</span>
          </div>
        </div>
      </div>

      {/* Circuit */}
      <div
        style={{
          background: "#060606",
          border: "1px solid #1a1a1a",
          borderRadius: 8,
          padding: 12,
          marginBottom: 14,
        }}
      >
        <div style={secT}>គំនូសសៀគ្វី</div>
        <CircuitDiagram
          stages={stages}
          capUF={capUF}
          vin={vin}
          voutReal={r.voutReal}
        />
        <div
          style={{ display: "flex", gap: 14, marginTop: 10, flexWrap: "wrap" }}
        >
          {[
            { col: "#ffd700", lbl: "Capacitor (រក្សាថ្មពន្លឺ)" },
            { col: "#00ccff", lbl: "Diode (ទិសមួយ)" },
            { col: "#00ff88", lbl: "លទ្ធផល DC" },
          ].map((l) => (
            <div
              key={l.lbl}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  background: l.col,
                  borderRadius: 2,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 9, color: "#555" }}>{l.lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stage table */}
      <div style={sec}>
        <div style={secT}>ដំណាក់កាលម្តងមួយៗ</div>
        {/* Header */}
        <div
          style={{
            display: "flex",
            paddingBottom: 6,
            marginBottom: 4,
            borderBottom: "1px solid #161616",
          }}
        >
          <div style={{ width: 32, fontSize: 8, color: "#3a3a3a" }}>ដំ.</div>
          <div style={{ flex: 1, fontSize: 8, color: "#3a3a3a" }}>វ៉ុល DC</div>
          <div
            style={{
              width: 44,
              fontSize: 8,
              color: "#3a3a3a",
              textAlign: "center",
            }}
          >
            Caps
          </div>
          <div
            style={{
              width: 58,
              fontSize: 8,
              color: "#3a3a3a",
              textAlign: "center",
            }}
          >
            ថាមពល
          </div>
          <div
            style={{
              width: 52,
              fontSize: 8,
              color: "#3a3a3a",
              textAlign: "right",
            }}
          >
            Droop
          </div>
        </div>
        {stageRows.map((row, i) => {
          const col = STAGE_COLORS[i % STAGE_COLORS.length];
          const barW = Math.min(
            (parseFloat(row.vReal) / (parseFloat(r.voutIdeal) || 1)) * 100,
            100,
          );
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "7px 0",
                borderBottom: "1px solid #111",
              }}
            >
              <div
                style={{ width: 32, fontSize: 11, color: col, fontWeight: 700 }}
              >
                S{row.n}
              </div>
              <div style={{ flex: 1, paddingRight: 8 }}>
                <div
                  style={{
                    background: "#1a1a1a",
                    borderRadius: 2,
                    height: 4,
                    marginBottom: 3,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${barW}%`,
                      height: "100%",
                      background: col,
                      transition: "width 0.3s",
                      boxShadow: `0 0 4px ${col}55`,
                    }}
                  />
                </div>
                <span style={{ fontSize: 10, color: col }}>{row.vReal}V</span>
              </div>
              <div
                style={{
                  width: 44,
                  fontSize: 10,
                  color: "#666",
                  textAlign: "center",
                }}
              >
                {row.caps}
              </div>
              <div
                style={{
                  width: 58,
                  fontSize: 10,
                  color: "#ffd700",
                  textAlign: "center",
                }}
              >
                {row.e}mJ
              </div>
              <div
                style={{
                  width: 52,
                  fontSize: 10,
                  color: "#ff4444",
                  textAlign: "right",
                }}
              >
                −{row.droop}V
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <StatCard
          label="វ៉ុលល្អឥតខ្ចោះ"
          val={`${r.voutIdeal}V`}
          sub={`2×${stages}×${r.vp}Vp`}
          col="#555"
        />
        <StatCard
          label="វ៉ុលពិតប្រាកដ"
          val={`${r.voutReal}V`}
          sub="បន្ទាប់ពីការបាត់បង់"
          col="#00ff88"
        />
        <StatCard
          label="ការធ្លាក់វ៉ុល (Droop)"
          val={`−${r.droop}V`}
          sub={`${droopPct}% នៃល្អឥតខ្ចោះ`}
          col={parseFloat(droopPct) > 20 ? "#ff4444" : "#ff6b35"}
        />
        <StatCard
          label="ការបាត់បង់ Diode"
          val={`−${r.diodeLoss}V`}
          sub={`${r.totalCaps} × 0.7V`}
          col="#ff4444"
        />
        <StatCard
          label="ថាមពលរក្សាទុក"
          val={`${r.totalEnergy}mJ`}
          sub={`E = ½CV² × ${r.totalCaps}`}
          col="#ffd700"
        />
        <StatCard
          label="ថាមពលទៅផ្ទុក"
          val={`${r.powerOut}W`}
          sub={`${r.voutReal}V × ${loadMA}mA`}
          col="#cc88ff"
        />
      </div>

      {/* Live formula */}
      <div style={sec}>
        <div style={secT}>រូបមន្តផ្ទាល់</div>
        {[
          { lhs: `Vp = ${vin} × √2`, rhs: `${r.vp}V`, col: "#00ff88" },
          {
            lhs: `Vout_ideal = 2 × ${stages} × ${r.vp}`,
            rhs: `${r.voutIdeal}V`,
            col: "#00ccff",
          },
          {
            lhs: `Diode loss = 0.7 × ${r.totalCaps}`,
            rhs: `−${r.diodeLoss}V`,
            col: "#ff4444",
          },
          {
            lhs: `ΔV = (${loadMA}mA ÷ ${freqHz}Hz×${capUF}µF) × n(2n²+1)÷3`,
            rhs: `−${r.droop}V`,
            col: "#ff6b35",
          },
          {
            lhs: `Vout_real = ${r.voutIdeal} − ${r.diodeLoss} − ${r.droop}`,
            rhs: `${r.voutReal}V`,
            col: "#ffd700",
          },
          {
            lhs: `E = ½ × ${capUF}µF × ${r.voutReal}² × ${r.totalCaps}`,
            rhs: `${r.totalEnergy}mJ`,
            col: "#cc88ff",
          },
        ].map((row, i) => (
          <div
            key={i}
            style={{
              padding: "7px 0",
              borderBottom: i < 5 ? "1px solid #111" : "none",
            }}
          >
            <code
              style={{
                fontSize: 9,
                color: "#444",
                display: "block",
                marginBottom: 3,
                overflowWrap: "break-word",
                wordBreak: "break-all",
              }}
            >
              {row.lhs}
            </code>
            <code style={{ fontSize: 12, color: row.col, fontWeight: 700 }}>
              = {row.rhs}
            </code>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", fontSize: 9, color: "#1a1a1a" }}>
        Cockcroft-Walton · ΔV = (I/fC)×n(2n²+1)/3 · diode 0.7V
      </div>
    </div>
  );
}
