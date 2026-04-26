import React, { useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import * as XLSX from 'xlsx';
import pptxgen from 'pptxgenjs';
import { Download, FileSpreadsheet, Presentation, Users, Trophy, Pencil, Trash2, Save, X, QrCode, RefreshCcw } from 'lucide-react';
import { hasSupabase, supabase } from './lib/supabase';

const APP_URL = 'https://autobacs-pr-training-app.vercel.app/';
const ORANGE = '#f58220';
const COLORS = ['#f58220', '#ffb168', '#ffd0a3', '#7a3b00'];
const POSITION_OPTIONS = ['ผู้จัดการร้าน', 'ที่ปรึกษาการขาย (SA)', 'อื่นๆ'];
const LOCAL_KEY = 'autobacs_pr_training_rows_v2';

const questions = [
  ['ความหมายของคำว่า PR (Public Relations) ตามที่ Autobacs ต้องการสื่อสารกับพนักงานคืออะไร?', ['การแสดงความสัมพันธ์ที่ดีกับลูกค้าในที่สาธารณะและทุกที่ที่มีโอกาส', 'การจัดกิจกรรมส่งเสริมการขายเพื่อเพิ่มยอดขายในระยะสั้น', 'การจัดการข้อร้องเรียนของลูกค้าผ่านทางอีเมลเท่านั้น', 'การซื้อพื้นที่โฆษณาในหนังสือพิมพ์และโทรทัศน์เพื่อให้คนรู้จักแบรนด์'], 0],
  ['ข้อใดจัดอยู่ในกลุ่ม Owned Media หรือสื่อที่แบรนด์เป็นเจ้าของเอง?', ['การจ้าง Influencer ชื่อดังมารีวิวสินค้าที่หน้าร้าน', 'การที่ลูกค้าโพสต์ชมเชยการบริการลงใน Facebook ส่วนตัว', 'โฆษณาบนป้ายบิลบอร์ดขนาดใหญ่ริมทางด่วน', 'หน้าแฟนเพจ Facebook และช่อง TikTok ของทางสาขา'], 3],
  ['สื่อประเภทใดที่มีความน่าเชื่อถือสูงสุด เนื่องจากเป็นการบอกต่อจากผู้ใช้งานจริง?', ['Paid Media', 'Earned Media', 'Google Ads', 'Owned Media'], 1],
  ['ในฐานะวัยรุ่น Autobacs หรือทหารราบ หน้าที่หลักของคุณที่ส่งผลต่อ Owned Media คืออะไร?', ['การซื้อโฆษณา Meta Ads เพื่อยิงไปยังกลุ่มเป้าหมาย', 'การอนุมัติงบประมาณการตลาดประจำปี', 'การซ่อมบำรุงเครื่องจักรในโรงงานผลิตยาง', 'การสร้างประสบการณ์ที่ดีให้ลูกค้า เพื่อให้เกิดการบอกต่อ'], 3],
  ['ตัวอย่างของ Earned Media ที่เห็นได้ชัดเจนที่สุดตามตารางข้อมูลคือข้อใด?', ['การแชร์คอนเทนต์แบบ Viral โดยที่ไม่ได้จ้าง', 'การส่ง Newsletter ทางอีเมลหาลูกค้า', 'การติดป้ายโฆษณาหน้าร้านและบนบรรจุภัณฑ์', 'การทำ SEO เพื่อให้เว็บไซต์ติดอันดับการค้นหา'], 0],
  ['ข้อดีของ Owned Media เมื่อเทียบกับ Paid Media ในระยะยาวคืออะไร?', ['ไม่ต้องใช้บุคลากรในการดูแลจัดการเนื้อหา', 'สามารถกำหนดกลุ่มเป้าหมายได้แม่นยำ 100% ตั้งแต่วันแรก', 'สามารถเข้าถึงกลุ่มเป้าหมายใหม่ได้รวดเร็วกว่า', 'มีต้นทุนในการดำเนินงานในระยะยาวต่ำกว่า'], 3],
  ['คำว่า Public Relations ตามรากศัพท์ที่อธิบายในบทเรียนประกอบด้วยคำว่าอะไรบ้าง?', ['Public (สาธารณะ) + Reporting (การรายงาน)', 'Public (สาธารณะ) + Relations (ความสัมพันธ์)', 'Promotion (โปรโมชั่น) + Relations (ความสัมพันธ์)', 'Personal (ส่วนตัว) + Relations (ความสัมพันธ์)'], 1],
  ['ข้อใดคือตัวอย่างของงานหลังบ้านที่ดีที่สามารถนำมาทำคอนเทนต์ PR ได้?', ['การแสดงความรู้ที่ถูกต้องเรื่องเทคนิคของช่างและผลิตภัณฑ์', 'การจัดโปรโมชั่นลดราคายาง 50% ตลอดทั้งปี', 'การแจกใบปลิวโฆษณาตามหมู่บ้าน', 'การตกแต่งห้องรับรองลูกค้าให้ดูหรูหรา'], 0],
  ['UGC หรือ User Generated Content มีความหมายตรงกับข้อใด?', ['เนื้อหาที่กราฟิกดีไซน์เนอร์ของบริษัทออกแบบ', 'เนื้อหาที่เป็นความลับทางการค้าของบริษัท', 'เนื้อหาที่ลูกค้าหรือผู้ใช้งานเป็นคนสร้างขึ้นเอง', 'เนื้อหาที่ได้จากการซื้อโฆษณาในหนังสือพิมพ์'], 2],
  ['เมื่อลูกค้าเกิดความภักดีและบอกต่อ (Loyalty & Advocacy) จะส่งผลให้เกิดสื่อประเภทใดมากที่สุด?', ['Paid Media', 'Earned Media', 'Owned Media', 'Sponsorship'], 1]
].map(([text, choices, answer]) => ({ text, choices, answer }));

const demoRows = [
  { id: 1, batch: 'PR รุ่น 1/2026', fullName: 'สมชาย Autobacs', position: 'ที่ปรึกษาการขาย (SA)', branch: 'ศรีนครินทร์', phase: 'ก่อนอบรม', score: 5, submittedAt: 'Demo' },
  { id: 2, batch: 'PR รุ่น 1/2026', fullName: 'สมชาย Autobacs', position: 'ที่ปรึกษาการขาย (SA)', branch: 'ศรีนครินทร์', phase: 'หลังอบรม', score: 9, submittedAt: 'Demo' }
];

const blankForm = { batch: 'PR รุ่น 1/2026', fullName: '', position: '', otherPosition: '', branch: '', phase: 'ก่อนอบรม', answers: Array(10).fill('') };
const average = rows => rows.length ? Number((rows.reduce((sum, row) => sum + Number(row.score || 0), 0) / rows.length).toFixed(2)) : 0;
const scoreAnswers = answers => questions.reduce((sum, q, i) => sum + (Number(answers[i]) === q.answer ? 1 : 0), 0);
const fromDb = row => ({ id: row.id, batch: row.batch || 'ไม่ระบุรุ่น', fullName: row.full_name || row.fullName, position: row.position, branch: row.branch, phase: row.phase, score: row.score, submittedAt: row.created_at || row.submittedAt });
const toDb = row => ({ batch: row.batch, full_name: row.fullName, position: row.position, branch: row.branch, phase: row.phase, score: row.score });

export default function App() {
  const [rows, setRows] = useState(demoRows);
  const [form, setForm] = useState(blankForm);
  const [selectedBatch, setSelectedBatch] = useState('ทั้งหมด');
  const [chartType, setChartType] = useState('bar');
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [status, setStatus] = useState(hasSupabase ? 'online' : 'demo');
  const score = scoreAnswers(form.answers);

  async function loadRows() {
    if (hasSupabase) {
      const { data, error } = await supabase.from('surveys').select('*').order('id', { ascending: false });
      if (!error && data) {
        setRows(data.map(fromDb));
        setStatus('online');
        return;
      }
      setStatus('error');
    }
    const local = localStorage.getItem(LOCAL_KEY);
    if (local) setRows(JSON.parse(local));
    else setRows(demoRows);
  }

  useEffect(() => {
    loadRows();
    const timer = setInterval(loadRows, 10000);
    return () => clearInterval(timer);
  }, []);

  const batches = useMemo(() => ['ทั้งหมด', ...Array.from(new Set(rows.map(r => r.batch))).filter(Boolean)], [rows]);
  const filteredRows = selectedBatch === 'ทั้งหมด' ? rows : rows.filter(r => r.batch === selectedBatch);
  const preRows = filteredRows.filter(r => r.phase === 'ก่อนอบรม');
  const postRows = filteredRows.filter(r => r.phase === 'หลังอบรม');
  const summary = { total: filteredRows.length, preAvg: average(preRows), postAvg: average(postRows) };
  summary.gain = Number((summary.postAvg - summary.preAvg).toFixed(2));
  const comparisonData = [{ name: 'ก่อนอบรม', score: summary.preAvg }, { name: 'หลังอบรม', score: summary.postAvg }];

  const personData = useMemo(() => {
    const grouped = {};
    filteredRows.forEach(r => {
      const key = `${r.batch}-${r.fullName}-${r.branch}`;
      grouped[key] ||= { batch: r.batch, name: r.fullName, position: r.position, branch: r.branch, pre: null, post: null };
      if (r.phase === 'ก่อนอบรม') grouped[key].pre = r.score;
      if (r.phase === 'หลังอบรม') grouped[key].post = r.score;
    });
    return Object.values(grouped).map(i => ({ ...i, diff: (i.post ?? 0) - (i.pre ?? 0) }));
  }, [filteredRows]);

  async function persist(nextRows, actionRow, mode) {
    if (hasSupabase && actionRow) {
      if (mode === 'insert') await supabase.from('surveys').insert(toDb(actionRow));
      if (mode === 'update') await supabase.from('surveys').update(toDb(actionRow)).eq('id', actionRow.id);
      if (mode === 'delete') await supabase.from('surveys').delete().eq('id', actionRow.id);
      await loadRows();
      return;
    }
    localStorage.setItem(LOCAL_KEY, JSON.stringify(nextRows));
    setRows(nextRows);
  }

  async function submitSurvey(e) {
    e.preventDefault();
    const finalPosition = form.position === 'อื่นๆ' ? form.otherPosition.trim() : form.position;
    if (!form.batch || !form.fullName || !finalPosition || !form.branch || form.answers.some(a => a === '')) return alert('กรุณากรอกข้อมูลให้ครบ และตอบข้อสอบ 10 ข้อ');
    if (form.phase === 'หลังอบรม' && score < 8) return alert(`คะแนนหลังอบรม ${score}/10 ยังไม่ผ่านเกณฑ์ ต้องได้ 8 คะแนนขึ้นไป กรุณาทำแบบทดสอบใหม่ทันที`);
    const newRow = { id: Date.now(), batch: form.batch, fullName: form.fullName, position: finalPosition, branch: form.branch, phase: form.phase, score, submittedAt: new Date().toLocaleString('th-TH') };
    await persist([newRow, ...rows], newRow, 'insert');
    setSelectedBatch(form.batch);
    setForm({ ...blankForm, batch: form.batch });
  }

  async function deleteRow(row) {
    if (!confirm('ยืนยันลบรายการนี้?')) return;
    await persist(rows.filter(r => r.id !== row.id), row, 'delete');
  }

  function startEdit(row) {
    setEditingId(row.id);
    setEditRow({ ...row });
  }

  async function saveEdit() {
    if (!editRow.batch || !editRow.fullName || !editRow.position || !editRow.branch) return alert('กรุณากรอกข้อมูลให้ครบ');
    if (editRow.phase === 'หลังอบรม' && Number(editRow.score) < 8) return alert('คะแนนหลังอบรมต้อง 8 คะแนนขึ้นไป หากไม่ถึงต้องทำใหม่ทันที');
    const fixed = { ...editRow, score: Number(editRow.score) };
    await persist(rows.map(r => r.id === fixed.id ? fixed : r), fixed, 'update');
    setSelectedBatch(fixed.batch);
    setEditingId(null);
    setEditRow(null);
  }

  function exportExcel() {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(filteredRows), 'Survey Data');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(personData), 'Individual Analysis');
    XLSX.writeFile(wb, `autobacs-pr-training-${selectedBatch}.xlsx`);
  }

  function exportPowerPoint() {
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_WIDE';
    const s1 = pptx.addSlide();
    s1.background = { color: 'FFF2E4' };
    s1.addText(`Autobacs PR Training: ${selectedBatch}`, { x: .6, y: .5, w: 12, h: .6, fontSize: 28, bold: true, color: 'F58220' });
    s1.addText(`ทั้งหมด ${summary.total} | ก่อนอบรม ${summary.preAvg}/10 | หลังอบรม ${summary.postAvg}/10 | เพิ่มขึ้น ${summary.gain}`, { x: .6, y: 1.3, w: 12, h: .5, fontSize: 17 });
    const s2 = pptx.addSlide();
    s2.addText('Individual Score Analysis', { x: .5, y: .3, w: 8, h: .4, fontSize: 24, bold: true, color: 'F58220' });
    s2.addTable([['Batch', 'Name', 'Branch', 'Pre', 'Post', 'Diff'], ...personData.map(i => [i.batch, i.name, i.branch, i.pre ?? '-', i.post ?? '-', i.diff])], { x: .4, y: 1, w: 12.5, h: 4.8, border: { color: 'DDDDDD' }, fontSize: 11 });
    pptx.writeFile({ fileName: `autobacs-pr-training-${selectedBatch}.pptx` });
  }

  function ChartPanel() {
    if (chartType === 'pie' || chartType === 'donut') return <ResponsiveContainer width="100%" height={280}><PieChart><Pie data={comparisonData} dataKey="score" nameKey="name" innerRadius={chartType === 'donut' ? 65 : 0} outerRadius={105} label>{comparisonData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>;
    return <ResponsiveContainer width="100%" height={280}><BarChart data={comparisonData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis domain={[0, 10]} /><Tooltip /><Bar dataKey="score" fill={ORANGE} radius={[10, 10, 0, 0]} /></BarChart></ResponsiveContainer>;
  }

  return <main className="app-shell">
    <section className="hero"><div><p className="eyebrow">Autobacs Academy</p><h1>PR Training Pre-Post Survey App</h1><p>{status === 'online' ? 'Online Database: Supabase Live' : status === 'error' ? 'Supabase Error: ใช้ข้อมูลสำรองในเครื่อง' : 'Demo Mode: ใส่ Supabase ENV เพื่อเก็บข้อมูลออนไลน์จริง'}</p></div><div className="hero-actions"><button onClick={loadRows}><RefreshCcw size={18} /> Refresh</button><button onClick={exportExcel}><FileSpreadsheet size={18} /> Export Excel</button><button onClick={exportPowerPoint}><Presentation size={18} /> Export PowerPoint</button></div></section>
    <section className="layout"><div className="card"><h2><QrCode size={20} /> QR Code เข้าทำแบบทดสอบ</h2><QRCodeSVG value={APP_URL} size={220} /><p>{APP_URL}</p><p>ผู้เข้าอบรมสแกน QR นี้เพื่อเข้าทำแบบทดสอบได้ทันที</p></div><div className="card"><h2>Dashboard สดสำหรับผู้บริหาร</h2><select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>{batches.map(b => <option key={b}>{b}</option>)}</select><ChartPanel /></div></section>
    <section className="kpi-grid"><div className="kpi"><Users /><span>รายการในรุ่น</span><strong>{summary.total}</strong></div><div className="kpi"><Trophy /><span>เฉลี่ยก่อนอบรม</span><strong>{summary.preAvg}/10</strong></div><div className="kpi"><Trophy /><span>เฉลี่ยหลังอบรม</span><strong>{summary.postAvg}/10</strong></div><div className="kpi"><Download /><span>คะแนนเพิ่มขึ้น</span><strong>{summary.gain}</strong></div></section>
    <section className="layout"><form className="card form-card" onSubmit={submitSurvey}><h2>แบบสอบถาม / ข้อสอบ PR 10 ข้อ</h2><div className="form-grid"><input value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })} placeholder="รุ่นอบรม เช่น PR รุ่น 2/2026" /><input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="ชื่อ-สกุล" /><select value={form.position} onChange={e => setForm({ ...form, position: e.target.value, otherPosition: '' })}><option value="">เลือกตำแหน่ง</option>{POSITION_OPTIONS.map(p => <option key={p}>{p}</option>)}</select>{form.position === 'อื่นๆ' && <input value={form.otherPosition} onChange={e => setForm({ ...form, otherPosition: e.target.value })} placeholder="ระบุตำแหน่งอื่นๆ" />}<input value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} placeholder="สาขา" /><select value={form.phase} onChange={e => setForm({ ...form, phase: e.target.value })}><option>ก่อนอบรม</option><option>หลังอบรม</option></select></div><p className="pass-note">หลังอบรมต้องได้อย่างน้อย 8/10 หากไม่ถึงระบบจะให้ทำใหม่ทันที</p><div className="questions">{questions.map((q, i) => <div className="question" key={q.text}><b>{i + 1}. {q.text}</b><select value={form.answers[i]} onChange={e => { const answers = [...form.answers]; answers[i] = e.target.value; setForm({ ...form, answers }); }}><option value="">เลือกคำตอบ</option>{q.choices.map((c, ci) => <option key={c} value={ci}>{c}</option>)}</select></div>)}</div><button className="primary" type="submit">บันทึกคะแนน {score}/10</button></form><div className="card"><h2>ข้อมูลล่าสุด</h2><div className="table-wrap"><table><thead><tr><th>รุ่น</th><th>ชื่อ</th><th>สาขา</th><th>ช่วง</th><th>คะแนน</th><th>จัดการ</th></tr></thead><tbody>{filteredRows.slice(0, 30).map(r => <tr key={r.id}>{editingId === r.id ? <><td><input value={editRow.batch} onChange={e => setEditRow({ ...editRow, batch: e.target.value })} /></td><td><input value={editRow.fullName} onChange={e => setEditRow({ ...editRow, fullName: e.target.value })} /></td><td><input value={editRow.branch} onChange={e => setEditRow({ ...editRow, branch: e.target.value })} /></td><td><select value={editRow.phase} onChange={e => setEditRow({ ...editRow, phase: e.target.value })}><option>ก่อนอบรม</option><option>หลังอบรม</option></select></td><td><input type="number" min="0" max="10" value={editRow.score} onChange={e => setEditRow({ ...editRow, score: e.target.value })} /></td><td className="row-actions"><button className="icon-btn save" onClick={saveEdit}><Save size={16} /></button><button className="icon-btn" onClick={() => { setEditingId(null); setEditRow(null); }}><X size={16} /></button></td></> : <><td>{r.batch}</td><td>{r.fullName}</td><td>{r.branch}</td><td>{r.phase}</td><td>{r.score}/10</td><td className="row-actions"><button className="icon-btn" onClick={() => startEdit(r)}><Pencil size={16} /></button><button className="icon-btn danger" onClick={() => deleteRow(r)}><Trash2 size={16} /></button></td></>}</tr>)}</tbody></table></div></div></section>
    <section className="card"><h2>วิเคราะห์คะแนนรายบุคคล</h2><div className="table-wrap"><table><thead><tr><th>รุ่น</th><th>ชื่อ-สกุล</th><th>ตำแหน่ง</th><th>สาขา</th><th>ก่อนอบรม</th><th>หลังอบรม</th><th>พัฒนา</th></tr></thead><tbody>{personData.map(i => <tr key={`${i.batch}-${i.name}-${i.branch}`}><td>{i.batch}</td><td>{i.name}</td><td>{i.position}</td><td>{i.branch}</td><td>{i.pre ?? '-'}</td><td>{i.post ?? '-'}</td><td className={i.diff >= 0 ? 'positive' : 'negative'}>{i.diff}</td></tr>)}</tbody></table></div></section>
  </main>;
}
