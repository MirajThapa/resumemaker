// 職務経歴書 (career history) form + printable sheet. Used by RirekishoMaker.jsx.
const PHASES = ["要件定義", "基本設計", "詳細設計", "実装", "テスト", "運用保守"];
const LEVELS = ["実務経験", "基礎知識", "学習中"];
const blankProj = () => ({ period: "", title: "", overview: "", phases: [], duties: "", lang: "", os: "", db: "", tools: "", scale: "" });
const blankCo = () => ({ period: "", name: "", biz: "", capital: "", staff: "", type: "正社員", projects: [blankProj()] });
const blankTech = () => ({ cat: "", name: "", period: "", level: "実務経験" });

export const shokumuInitial = () => ({ sum: "", skills: "", cos: [blankCo()], tech: [blankTech()], quals: "", pr: "" });

export const shokumuSample = {
  sum: "システムエンジニアとしてJavaを用いたAndroidアプリケーション開発を中心に従事してまいりました。MVVMアーキテクチャを採用し、品質・保守性・拡張性を意識した開発を心掛けています。",
  skills: "Androidアプリケーション開発（Java、MVVM）\nREST API連携・JSONデータ処理\nGit / GitHub\nMySQL・SQLiteを用いたデータベース設計",
  cos: [{
    period: "2023年04月～現在", name: "株式会社〇〇", biz: "業務システム・ソフトウェア開発", capital: "1000万円", staff: "56人", type: "正社員",
    projects: [{
      period: "2025年07月～現在", title: "商品管理アプリ", overview: "商品をスキャンしてデータをクラウドに保存するAndroidアプリ。",
      phases: ["詳細設計", "実装", "テスト", "運用保守"],
      duties: "Javaを用いたAndroidアプリの設計・開発\nバーコード・QRコード読取機能の実装\nGitを用いたチーム開発",
      lang: "Java, JavaScript", os: "Android, Windows", db: "SQLite", tools: "Android Studio, Git", scale: "全2名\nリーダー1名",
    }],
  }],
  tech: [
    { cat: "OS", name: "Android", period: "4年0カ月", level: "実務経験" },
    { cat: "言語", name: "Java", period: "3年6カ月", level: "実務経験" },
    { cat: "言語", name: "Python", period: "1年0カ月", level: "基礎知識" },
  ],
  quals: "なし",
  pr: "Javaを用いたAndroidアプリケーション開発を中心に、MVVMによる設計・実装やREST API連携の経験があります。これまでの経験を活かし、貴社のサービス開発に貢献したいと考えております。",
};

const lines = (t) => (t || "").split("\n").map((x) => x.trim()).filter(Boolean);
const bullet = (x) => (x.startsWith("・") ? x : "・" + x);

function In({ label, value, onChange, ...p }) {
  return (
    <label className="fld"><span>{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} {...p} />
    </label>
  );
}
function Ta({ label, value, onChange, min = 70, ph }) {
  return (
    <label className="fld"><span>{label}</span>
      <textarea style={{ minHeight: min }} value={value} placeholder={ph} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export function ShokumuForm({ s, setS }) {
  const set = (k, v) => setS((p) => ({ ...p, [k]: v }));
  const setCo = (i, patch) => set("cos", s.cos.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const setPj = (i, j, patch) => setCo(i, { projects: s.cos[i].projects.map((p, k) => (k === j ? { ...p, ...patch } : p)) });
  const delCo = (i) => set("cos", s.cos.length > 1 ? s.cos.filter((_, j) => j !== i) : [blankCo()]);
  const delPj = (i, j) => {
    const ps = s.cos[i].projects.filter((_, k) => k !== j);
    setCo(i, { projects: ps.length ? ps : [blankProj()] });
  };
  const setTech = (i, patch) => set("tech", s.tech.map((t, j) => (j === i ? { ...t, ...patch } : t)));
  const delTech = (i) => set("tech", s.tech.length > 1 ? s.tech.filter((_, j) => j !== i) : [blankTech()]);
  const togglePhase = (i, j, ph) => {
    const cur = s.cos[i].projects[j].phases;
    setPj(i, j, { phases: cur.includes(ph) ? cur.filter((x) => x !== ph) : [...cur, ph] });
  };

  return (
    <>
      <p className="sub">Your name and document date come from Part 1.</p>
      <h2>Career summary (職務要約)</h2>
      <Ta label="Summary" value={s.sum} onChange={(v) => set("sum", v)} min={110} />
      <h2>Skills and experience (活かせる経験・知識・技術)</h2>
      <Ta label="One item per line" value={s.skills} onChange={(v) => set("skills", v)} />

      <h2>Work history (職務経歴)</h2>
      {s.cos.map((c, i) => (
        <div className="card" key={i}>
          <In label="Period (e.g. 2025年04月～現在)" value={c.period} onChange={(v) => setCo(i, { period: v })} />
          <In label="Company name" value={c.name} onChange={(v) => setCo(i, { name: v })} />
          <In label="Business description (事業内容)" value={c.biz} onChange={(v) => setCo(i, { biz: v })} />
          <div className="r2">
            <In label="Capital (資本金)" value={c.capital} onChange={(v) => setCo(i, { capital: v })} />
            <In label="Employees (従業員数)" value={c.staff} onChange={(v) => setCo(i, { staff: v })} />
          </div>
          <In label="Employment type" value={c.type} onChange={(v) => setCo(i, { type: v })} />

          {c.projects.map((p, j) => (
            <div className="card" key={j}>
              <In label="Project period" value={p.period} onChange={(v) => setPj(i, j, { period: v })} />
              <In label="Project name" value={p.title} onChange={(v) => setPj(i, j, { title: v })} />
              <Ta label="Overview (プロジェクト概要)" value={p.overview} onChange={(v) => setPj(i, j, { overview: v })} />
              <div className="fld"><span>Phases (担当フェーズ)</span>
                <div className="chk">
                  {PHASES.map((ph) => (
                    <label key={ph}><input type="checkbox" checked={p.phases.includes(ph)} onChange={() => togglePhase(i, j, ph)} /> {ph}</label>
                  ))}
                </div>
              </div>
              <Ta label="Duties, one per line (業務内容)" value={p.duties} onChange={(v) => setPj(i, j, { duties: v })} min={100} />
              <div className="r2">
                <In label="Languages (言語)" value={p.lang} onChange={(v) => setPj(i, j, { lang: v })} />
                <In label="OS" value={p.os} onChange={(v) => setPj(i, j, { os: v })} />
                <In label="Database (DB)" value={p.db} onChange={(v) => setPj(i, j, { db: v })} />
                <In label="Tools (ツール)" value={p.tools} onChange={(v) => setPj(i, j, { tools: v })} />
              </div>
              <Ta label="Team size and role (規模・役割)" value={p.scale} onChange={(v) => setPj(i, j, { scale: v })} min={44} ph={"全2名\nリーダー1名"} />
              <button type="button" className="ghost" onClick={() => delPj(i, j)}>Delete project</button>
            </div>
          ))}
          <div className="bar">
            <button type="button" onClick={() => setCo(i, { projects: [...c.projects, blankProj()] })}>+ Add project</button>
            <button type="button" className="ghost" onClick={() => delCo(i)}>Delete company</button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => set("cos", [...s.cos, blankCo()])}>+ Add company</button>

      <h2>Technical skills (テクニカルスキル)</h2>
      {s.tech.map((t, i) => (
        <div className="row t4" key={i}>
          <input placeholder="Type (言語)" value={t.cat} onChange={(e) => setTech(i, { cat: e.target.value })} />
          <input placeholder="Name" value={t.name} onChange={(e) => setTech(i, { name: e.target.value })} />
          <input placeholder="3年6カ月" value={t.period} onChange={(e) => setTech(i, { period: e.target.value })} />
          <select value={t.level} onChange={(e) => setTech(i, { level: e.target.value })}>
            {LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
          <button type="button" aria-label="Delete row" onClick={() => delTech(i)}>×</button>
        </div>
      ))}
      <button type="button" className="ghost" onClick={() => set("tech", [...s.tech, blankTech()])}>+ Add row</button>

      <h2>Qualifications (資格)</h2>
      <Ta label="One per line, or なし" value={s.quals} onChange={(v) => set("quals", v)} min={50} />
      <h2>Self-PR (自己PR)</h2>
      <Ta label="Self-PR" value={s.pr} onChange={(v) => set("pr", v)} min={110} />
    </>
  );
}

export function ShokumuSheet({ s }) {
  const d = s.date ? s.date.split("-").map(Number) : null;
  const pad = (n) => String(n).padStart(2, "0");
  const env = (p) => [["言語", p.lang], ["OS", p.os], ["DB", p.db], ["ツール", p.tools]].filter((x) => x[1]);
  return (
    <div className="sheet sk">
      <h3>職 務 経 歴 書</h3>
      <div className="dt">{d ? `${d[0]}年${pad(d[1])}月${pad(d[2])}日現在` : "年月日現在"}</div>
      <div className="nm">氏名　{s.name}</div>

      {s.sum && (<><h4>■職務要約</h4><p className="pre">{s.sum}</p></>)}
      {lines(s.skills).length > 0 && (
        <><h4>■活かせる経験・知識・技術</h4>
          <p className="pre">{lines(s.skills).map(bullet).join("\n")}</p></>
      )}

      <h4>■職務経歴</h4>
      {s.cos.map((c, i) => (
        <div key={i}>
          <div className="coh">{c.period}　　{c.name}</div>
          <table><tbody>
            <tr><th style={{ width: "22%" }}>事業内容</th><td>{c.biz}</td></tr>
            <tr><th>資本金</th><td>{c.capital}</td></tr>
            <tr><th>従業員数</th><td>{c.staff}　　{c.type && `${c.type}として勤務`}</td></tr>
          </tbody></table>
          {c.projects.filter((p) => p.title || p.overview || p.duties).map((p, j) => (
            <table className="pj" key={j}>
              <colgroup><col style={{ width: "58%" }} /><col style={{ width: "24%" }} /><col style={{ width: "18%" }} /></colgroup>
              <thead><tr><th>{p.period}　／　{p.title}</th><th>開発環境</th><th>規模・役割</th></tr></thead>
              <tbody><tr>
                <td>
                  {p.overview && <><b>【プロジェクト概要】</b><div className="pre">{p.overview}</div></>}
                  {p.phases.length > 0 && <><b>【担当フェーズ】</b><div>{PHASES.filter((x) => p.phases.includes(x)).join(" ／ ")}</div></>}
                  {lines(p.duties).length > 0 && <><b>【業務内容】</b><div className="pre">{lines(p.duties).map(bullet).join("\n")}</div></>}
                </td>
                <td>{env(p).map(([k, v]) => <div key={k}><b>【{k}】</b><br />{v}</div>)}</td>
                <td className="pre">{p.scale}</td>
              </tr></tbody>
            </table>
          ))}
        </div>
      ))}

      {s.tech.some((t) => t.name) && (
        <>
          <h4>■テクニカルスキル</h4>
          <table><thead><tr><th>種類</th><th>名称</th><th>使用期間</th><th>レベル</th></tr></thead>
            <tbody>
              {s.tech.filter((t) => t.name).map((t, i) => (
                <tr key={i}><td>{t.cat}</td><td>{t.name}</td><td>{t.period}</td><td>{t.level}</td></tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {s.quals && (<><h4>■資格</h4><p className="pre">{s.quals}</p></>)}
      {s.pr && (<><h4>■自己PR</h4><p className="pre">{s.pr}</p></>)}
      <div className="end">以上</div>
    </div>
  );
}

export const SHOKUMU_CSS = `
.form h2.part{font-size:16px;margin-top:28px;border-bottom-width:3px}
.form button:disabled{opacity:.6;cursor:wait}
.pv>div+div{margin-top:16px}
.card{border:1px solid var(--bd);border-radius:4px;padding:10px;margin:8px 0}
.chk{display:flex;gap:10px;flex-wrap:wrap;font-size:12px}
.chk label{display:flex;align-items:center;gap:4px}
.chk input{width:auto}
.row.t4{grid-template-columns:1fr 1fr 80px 92px 30px}
.sheet.sk h3{margin-bottom:2mm}
.sk .nm{margin:0 0 3mm}
.sk h4{font-size:11pt;margin:5mm 0 2mm;padding-bottom:1mm;border-bottom:1.5px solid #000;font-weight:600}
.sk .coh{font-weight:600;margin:3mm 0 1mm}
.sk table{margin-bottom:2mm}
.sk td,.sk th{border:1px solid #000;padding:1.5mm 2mm;vertical-align:top;font-size:9pt;text-align:left}
.sk th{background:#f3f3f3;font-weight:600}
.sk .pre{white-space:pre-wrap;line-height:1.7;font-size:9.5pt;margin:0 0 1mm}
.sk .pj{break-inside:avoid;margin-top:3mm}
.sk .end{text-align:right;margin-top:6mm}
`;
