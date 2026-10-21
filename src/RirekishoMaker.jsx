import { useState, useEffect, useRef } from "react";
import { sheetToPdf, saveBlob } from "./exportPdf";
import { ShokumuForm, ShokumuSheet, shokumuInitial, shokumuSample, SHOKUMU_CSS } from "./Shokumu";

const KEY = "rirekisho-v1";
const blankRow = () => ({ y: "", m: "", t: "" });
const today = () => new Date().toISOString().slice(0, 10);
const initial = () => ({
  date: today(), kana: "", name: "", birth: "", gender: "", photo: "",
  addrKana: "", addr: "", tel: "", email: "", cAddr: "", cTel: "", cEmail: "",
  motive: "", wish: "", edu: [blankRow()], work: [blankRow()], lic: [blankRow()],
  ...shokumuInitial(),
});

const SAMPLE = {
  date: "2026-07-24", kana: "ヤマダ タロウ", name: "山田 太郎", birth: "2000-04-01", gender: "男",
  addrKana: "トウキョウト シブヤク", addr: "〒150-0000 東京都渋谷区1-2-3", tel: "090-0000-0000", email: "taro@example.com",
  motive: "Javaを用いたバックエンド開発の経験を活かし、貴社のサービス開発に貢献したいと考えております。",
  wish: "貴社規定に従います。",
  edu: [{ y: "2019", m: "3", t: "〇〇高等学校 卒業" }, { y: "2019", m: "4", t: "〇〇大学 工学部 入学" }, { y: "2023", m: "3", t: "同大学 卒業" }],
  work: [{ y: "2023", m: "4", t: "株式会社〇〇 入社 システムエンジニア" }, { y: "", m: "", t: "現在に至る" }],
  lic: [{ y: "2022", m: "12", t: "基本情報技術者試験 合格" }],
};

function calcAge(birth, date) {
  if (!birth || !date) return "";
  const b = new Date(birth), d = new Date(date);
  let a = d.getFullYear() - b.getFullYear();
  const m = d.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && d.getDate() < b.getDate())) a--;
  return a >= 0 ? a : "";
}
const ymd = (s) => (s ? s.split("-").map(Number) : null);
const filled = (a) => a.filter((r) => r.y || r.m || r.t);

function Field({ label, children }) {
  return (
    <label className="fld">
      <span>{label}</span>
      {children}
    </label>
  );
}

function RowEditor({ rows, onChange }) {
  const set = (i, k, v) => onChange(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const del = (i) => {
    const next = rows.filter((_, j) => j !== i);
    onChange(next.length ? next : [blankRow()]);
  };
  return (
    <>
      {rows.map((r, i) => (
        <div className="row" key={i}>
          <input placeholder="Year" inputMode="numeric" value={r.y} onChange={(e) => set(i, "y", e.target.value)} />
          <input placeholder="Month" inputMode="numeric" value={r.m} onChange={(e) => set(i, "m", e.target.value)} />
          <input placeholder="Description" value={r.t} onChange={(e) => set(i, "t", e.target.value)} />
          <button type="button" aria-label="Delete row" onClick={() => del(i)}>×</button>
        </div>
      ))}
      <button type="button" className="ghost" onClick={() => onChange([...rows, blankRow()])}>+ Add row</button>
    </>
  );
}

const Rows = ({ rows }) =>
  filled(rows).map((r, i) => (
    <tr className="h" key={i}>
      <td className="c" style={{ width: "16mm" }}>{r.y}</td>
      <td className="c" style={{ width: "11mm" }}>{r.m}</td>
      <td>{r.t}</td>
    </tr>
  ));
const Pad = ({ n }) =>
  Array.from({ length: Math.max(0, n) }, (_, i) => (
    <tr className="h" key={i}><td /><td /><td /></tr>
  ));

function Sheet({ s }) {
  const d = ymd(s.date), b = ymd(s.birth), age = calcAge(s.birth, s.date);
  const used = filled(s.edu).length + filled(s.work).length;
  return (
    <div className="sheet">
      <h3>履 歴 書</h3>
      <div className="dt">{d ? `${d[0]} 年 ${d[1]} 月 ${d[2]} 日 現在` : "年 月 日 現在"}</div>

      <table>
        <tbody>
          <tr>
            <td style={{ width: "150mm", padding: 0 }}>
              <table><tbody>
                <tr><td className="k nb">フリガナ　{s.kana}</td></tr>
                <tr><td className="big nb">氏　名　{s.name}</td></tr>
                <tr><td className="nb">
                  {b ? `${b[0]} 年 ${b[1]} 月 ${b[2]} 日生${age !== "" ? `（満 ${age} 歳）` : ""}` : "年 月 日生"}　　性別 {s.gender}
                </td></tr>
              </tbody></table>
            </td>
            <td style={{ border: 0, padding: "0 0 0 2mm" }}>
              <div className="ph">
                {s.photo ? <img src={s.photo} alt="" /> : <span>写真をはる位置<br />縦 40mm × 横 30mm</span>}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <table style={{ marginTop: -1 }}>
        <tbody>
          <tr><td className="k" style={{ width: "150mm" }}>フリガナ　{s.addrKana}</td><td className="k">電話　{s.tel}</td></tr>
          <tr><td style={{ height: "14mm", verticalAlign: "top" }}>現住所　{s.addr}</td><td className="sm">メール<br />{s.email}</td></tr>
          <tr><td className="k">連絡先（現住所以外に連絡を希望する場合のみ記入）　電話 {s.cTel}</td><td className="k">メール</td></tr>
          <tr><td style={{ height: "11mm", verticalAlign: "top" }}>〒　{s.cAddr}</td><td className="sm">{s.cEmail}</td></tr>
        </tbody>
      </table>

      <table style={{ marginTop: "3mm" }}>
        <tbody>
          <tr className="h"><td className="c" style={{ width: "16mm" }}>年</td><td className="c" style={{ width: "11mm" }}>月</td><td className="c">学歴・職歴（各別にまとめて書く）</td></tr>
          <tr className="h"><td /><td /><td className="hd">学　歴</td></tr>
          <Rows rows={s.edu} />
          <tr className="h"><td /><td /><td className="hd">職　歴</td></tr>
          <Rows rows={s.work} />
          <tr className="h"><td /><td /><td style={{ textAlign: "right" }}>以上</td></tr>
          <Pad n={14 - used - 4} />
        </tbody>
      </table>

      <table style={{ marginTop: "3mm" }}>
        <tbody>
          <tr className="h"><td className="c" style={{ width: "16mm" }}>年</td><td className="c" style={{ width: "11mm" }}>月</td><td className="c">免許・資格</td></tr>
          <Rows rows={s.lic} />
          <Pad n={Math.max(1, 4 - filled(s.lic).length)} />
        </tbody>
      </table>

      <table style={{ marginTop: "3mm" }}>
        <tbody><tr><td className="free" style={{ height: "60mm" }}><div className="k nb">志望の動機、特技、自己PRなど</div>{s.motive}</td></tr></tbody>
      </table>
      <table style={{ marginTop: "3mm" }}>
        <tbody><tr><td className="free" style={{ height: "24mm" }}><div className="k nb">本人希望記入欄（特に給料、職種、勤務時間、勤務地、その他についての希望などがあれば記入）</div>{s.wish}</td></tr></tbody>
      </table>
    </div>
  );
}

export default function RirekishoMaker() {
  const rRef = useRef(null);
  const kRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [s, setS] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY);
      return saved ? { ...initial(), ...JSON.parse(saved) } : initial();
    } catch { return initial(); }
  });
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage unavailable */ }
  }, [s]);

  const up = (k) => (e) => setS((p) => ({ ...p, [k]: e.target.value }));
  const setRows = (k) => (rows) => setS((p) => ({ ...p, [k]: rows }));
  const onPhoto = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setS((p) => ({ ...p, photo: r.result }));
    r.readAsDataURL(f);
  };
  // Build every PDF first, then save them one after another.
  const run = async (jobs) => {
    setBusy(true);
    try {
      const n = s.name.replace(/[\s/\\:*?"<>|()（）]/g, "") || "resume";
      const files = [];
      for (const [ref, prefix] of jobs) files.push([await sheetToPdf(ref.current), `${prefix}_${n}.pdf`]);
      files.forEach(([blob, name], i) => setTimeout(() => saveBlob(blob, name), i * 700));
    } catch (e) {
      alert("Could not create the PDFs: " + e.message);
    } finally {
      setBusy(false);
    }
  };
  const downloadBoth = () => run([[rRef, "履歴書"], [kRef, "職務経歴書"]]);
  const clearAll = () => window.confirm("Clear everything you entered?") && setS(initial());

  return (
    <div className="app">
      <style>{CSS + SHOKUMU_CSS}</style>
      <aside className="form">
        <h1>Japanese Résumé Maker</h1>

        <p className="sub">Fill in both parts once. The 履歴書 and 職務経歴書 previews update live, and one button creates both PDFs. Press Save as PDF when done. Enter Japanese text in the Japanese fields.</p>
        <div className="bar">
          <button type="button" className="p" disabled={busy} onClick={downloadBoth}>{busy ? "Creating PDFs…" : "Download both PDFs"}</button>
          <button type="button" disabled={busy} onClick={() => run([[rRef, "履歴書"]])}>履歴書 only</button>
          <button type="button" disabled={busy} onClick={() => run([[kRef, "職務経歴書"]])}>職務経歴書 only</button>
          <button type="button" className="ghost" onClick={() => setS({ ...initial(), ...SAMPLE, ...shokumuSample })}>Load sample</button>
          <button type="button" className="ghost" onClick={clearAll}>Clear all</button>
        </div>

        <h2 className="part">Part 1: 履歴書 (Rirekisho)</h2>
        <h2>Basic information</h2>
        <Field label="Date of document"><input type="date" value={s.date} onChange={up("date")} /></Field>
        <div className="r2">
          <Field label="Name in katakana (フリガナ)"><input value={s.kana} onChange={up("kana")} placeholder="ヤマダ タロウ" /></Field>
          <Field label="Full name (氏名)"><input value={s.name} onChange={up("name")} placeholder="山田 太郎" /></Field>
        </div>
        <div className="r2">
          <Field label="Date of birth"><input type="date" value={s.birth} onChange={up("birth")} /></Field>
          <Field label="Gender">
            <select value={s.gender} onChange={up("gender")}>
              <option value="">Not specified</option><option value="男">Male (男)</option>
              <option value="女">Female (女)</option><option value="その他">Other (その他)</option>
            </select>
          </Field>
        </div>
        <Field label="ID photo (3 × 4 cm)"><input type="file" accept="image/*" onChange={onPhoto} /></Field>
        <Field label="Address in katakana"><input value={s.addrKana} onChange={up("addrKana")} /></Field>
        <Field label="Current address (include postal code)"><input value={s.addr} onChange={up("addr")} placeholder="〒792-0000 愛媛県新居浜市…" /></Field>
        <div className="r2">
          <Field label="Phone"><input value={s.tel} onChange={up("tel")} /></Field>
          <Field label="Email"><input type="email" value={s.email} onChange={up("email")} /></Field>
        </div>
        <Field label="Contact address (only if different from current)"><input value={s.cAddr} onChange={up("cAddr")} /></Field>
        <div className="r2">
          <Field label="Contact phone"><input value={s.cTel} onChange={up("cTel")} /></Field>
          <Field label="Contact email"><input value={s.cEmail} onChange={up("cEmail")} /></Field>
        </div>

        <h2>Education (学歴)</h2>
        <RowEditor rows={s.edu} onChange={setRows("edu")} />
        <h2>Work history (職歴)</h2>
        <RowEditor rows={s.work} onChange={setRows("work")} />
        <h2>Licenses and qualifications (免許・資格)</h2>
        <RowEditor rows={s.lic} onChange={setRows("lic")} />

        <h2>Motivation, skills, self-PR</h2>
        <textarea value={s.motive} onChange={up("motive")} />
        <h2>Personal requests (本人希望記入欄)</h2>
        <textarea style={{ minHeight: 60 }} value={s.wish} onChange={up("wish")} placeholder="e.g. 希望年収：400万円～500万円" />
        <h2 className="part">Part 2: 職務経歴書 (Career history)</h2>
        <ShokumuForm s={s} setS={setS} />
        <div className="bar"><button type="button" className="p" disabled={busy} onClick={downloadBoth}>{busy ? "Creating PDFs…" : "Download both PDFs"}</button>
          <button type="button" disabled={busy} onClick={() => run([[rRef, "履歴書"]])}>履歴書 only</button>
          <button type="button" disabled={busy} onClick={() => run([[kRef, "職務経歴書"]])}>職務経歴書 only</button></div>
      </aside>

      <main className="pv">
        <div ref={rRef}><Sheet s={s} /></div>
        <div ref={kRef}><ShokumuSheet s={s} /></div>
      </main>
    </div>
  );
}

const CSS = `
.app{--bg:#eef1ee;--pn:#fff;--tx:#1b2a24;--mu:#5d6b64;--ac:#1f5f4a;--bd:#c9d2cc;--in:#f7f9f7;
display:grid;grid-template-columns:minmax(320px,440px) 1fr;gap:20px;padding:16px;min-height:100vh;
background:var(--bg);color:var(--tx);font:14px "Noto Sans JP","Hiragino Sans","Yu Gothic",Meiryo,sans-serif;box-sizing:border-box}
@media(prefers-color-scheme:dark){.app{--bg:#121815;--pn:#1b2420;--tx:#e6ece8;--mu:#93a39a;--ac:#6fc3a3;--bd:#34423b;--in:#222d28}}
@media(max-width:900px){.app{grid-template-columns:1fr}}
.app *{box-sizing:border-box}
.form{background:var(--pn);border:1px solid var(--bd);border-radius:6px;padding:16px;align-self:start}
.form h1{font-size:20px;margin:0 0 4px;color:var(--ac)}
.sub{color:var(--mu);margin:0 0 12px;font-size:12px}
.form h2{font-size:14px;margin:18px 0 8px;padding-bottom:4px;border-bottom:2px solid var(--ac)}
.fld{display:block;margin:8px 0 2px}.fld span{display:block;font-size:12px;color:var(--mu);margin-bottom:2px}
.form input,.form textarea,.form select{width:100%;padding:7px 8px;border:1px solid var(--bd);border-radius:4px;background:var(--in);color:var(--tx);font:inherit}
.form textarea{min-height:110px;resize:vertical}
.form :focus-visible{outline:2px solid var(--ac);outline-offset:1px}
.r2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.row{display:grid;grid-template-columns:70px 64px 1fr 30px;gap:6px;margin-bottom:6px}
.form button{font:inherit;cursor:pointer;border:1px solid var(--ac);border-radius:4px;padding:6px 10px;background:transparent;color:var(--ac)}
.form button.p{background:var(--ac);color:var(--pn)}
.row button{padding:0;border-color:var(--bd);color:var(--mu)}
.bar{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
.pv{overflow-x:auto}
.sheet{width:210mm;min-height:297mm;background:#fff;color:#000;padding:12mm 13mm;margin:0 auto;font:10pt "Noto Serif JP","Hiragino Mincho ProN","Yu Mincho",serif;box-shadow:0 2px 12px rgba(0,0,0,.2)}
.sheet h3{text-align:center;font-size:20pt;letter-spacing:.6em;margin:0 0 2mm;font-weight:500}
.dt{text-align:right;font-size:9pt;margin-bottom:2mm}
.sheet table{width:100%;border-collapse:collapse;table-layout:fixed}
.sheet td{border:1px solid #000;padding:1mm 2mm;vertical-align:middle;word-break:break-all}
.sheet td.nb{border:0;border-bottom:1px solid #000}
.sheet .k{font-size:7.5pt;border-bottom:1px dotted #000}
.sheet .big{font-size:17pt;height:13mm}
.sm{font-size:8.5pt;vertical-align:top!important}
.ph{width:30mm;height:40mm;border:1px solid #000;font-size:7pt;text-align:center;display:flex;align-items:center;justify-content:center;margin-left:auto;overflow:hidden}
.ph img{width:100%;height:100%;object-fit:cover}
.c{text-align:center}.h{height:7.5mm}
.hd{text-align:center;letter-spacing:1em;background:#f3f3f3}
.free{white-space:pre-wrap;vertical-align:top!important;line-height:1.7;font-size:9.5pt}
@page{size:A4;margin:12mm 13mm}
@media print{.form{display:none}.app{display:block;padding:0;background:#fff}.sheet{box-shadow:none;margin:0;width:auto;min-height:0;padding:0}.pv{overflow:visible}}
`;
