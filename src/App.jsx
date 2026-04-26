import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import * as XLSX from 'xlsx';
import pptxgen from 'pptxgenjs';
import { Download, FileSpreadsheet, Presentation, MapPin, Users, Trophy } from 'lucide-react';

const AUTOBACS_ORANGE = '#f58220';
const SOFT_ORANGE = '#fff2e4';
const DEEP_ORANGE = '#d65f00';
const COLORS = ['#f58220', '#ffb168', '#ffd0a3', '#7a3b00', '#ff8f3d'];

const questions = [
  {
    text: 'ในปี 2026 ปัจจัยใดที่ Google ให้ความสำคัญสูงสุดในการประเมินความน่าเชื่อถือของรีวิว?',
    choices: ['ความเกี่ยวข้องของเนื้อหาและความน่าเชื่อถือของข้อมูล', 'ราคาของสินค้าหรือบริการในรีวิว', 'รีวิวจาก Local Guide เท่านั้น', 'จำนวนดาวรวมทั้งหมด'],
    answer: 0
  },
  {
    text: 'ข้อใดคือ 3 ปัจจัยหลักที่ Google ใช้จัดอันดับร้านค้าใน Local 3-Pack?',
    choices: ['Quantity, Quality, Frequency', 'Design, Rating, Promotion', 'Relevance, Distance, Prominence', 'Price, Location, Speed'],
    answer: 2
  },
  {
    text: 'เหตุใดรีวิวที่มีข้อความว่า “เปลี่ยนยางไวมาก” จึงมีประโยชน์ต่อสาขา?',
    choices: ['ช่วยเพิ่ม keyword และบริบทบริการจริง', 'ทำให้ราคาแพงขึ้น', 'ลดความจำเป็นในการตอบรีวิว', 'ทำให้รีวิวหายเร็วขึ้น'],
    answer: 0
  },
  {
    text: 'การตอบรีวิวเชิงลบที่เหมาะสมควรเริ่มจากอะไร?',
    choices: ['โต้แย้งทันที', 'ขอโทษ รับฟัง และชวนแก้ไขปัญหา', 'ลบรีวิว', 'ไม่ต้องตอบ'],
    answer: 1
  },
  {
    text: 'Social Media ของสาขาควรสื่อสารภาพลักษณ์แบบใด?',
    choices: ['ช่างมืออาชีพ บริการไว เชื่อถือได้', 'ขายลดราคาอย่างเดียว', 'ใช้ศัพท์เทคนิคยาก ๆ', 'โพสต์เฉพาะวันหยุด'],
    answer: 0
  },
  {
    text: 'คอนเทนต์หลังอบรมควรติดตามผลจากอะไรเป็นหลัก?',
    choices: ['จำนวนโพสต์ คุณภาพเนื้อหา และ engagement', 'จำนวนพนักงานทั้งหมด', 'ขนาดพื้นที่ร้าน', 'จำนวนที่จอดรถ'],
    answer: 0
  },
  {
    text: 'Call to Action ที่ดีสำหรับศูนย์บริการรถยนต์ควรเป็นอย่างไร?',
    choices: ['ชัดเจน เช่น นัดหมาย/สอบถาม/เข้ารับบริการ', 'ยาวและซับซ้อน', 'ไม่มีข้อมูลติดต่อ', 'ใช้คำสั่งแข็ง ๆ เท่านั้น'],
    answer: 0
  },
  {
    text: 'รูปภาพ/วิดีโอที่ดีสำหรับ PR สาขาควรเน้นอะไร?',
    choices: ['ความสะอาด ทีมงาน ขั้นตอนบริการ และผลลัพธ์จริง', 'ภาพไม่เกี่ยวกับร้าน', 'ภาพเบลอ ๆ เพื่อความธรรมชาติ', 'ใช้ข้อความล้วนเท่านั้น'],
    answer: 0
  },
  {
    text: 'การวัดผล PR Training แบบ Pre-Post มีประโยชน์อย่างไร?',
    choices: ['เห็นพัฒนาการก่อนและหลังอบรม', 'ใช้แทนการทำงานจริงทั้งหมด', 'ทำให้ไม่ต้องติดตามสาขา', 'ลดจำนวนคำถาม'],
    answer: 0
  },
  {
    text: 'ข้อมูลใดสำคัญต่อการวิเคราะห์คะแนนรายบุคคล?',
    choices: ['ชื่อ ตำแหน่ง สาขา รอบก่อน/หลัง และคะแนน', 'สีเสื้อ', 'เบอร์รองเท้า', 'รุ่นโทรศัพท์'],
    answer: 0
  }
];

const demoRows = [
  { id: 1, fullName: 'สมชาย Autobacs', position: 'Service Advisor', branch: 'ศรีนครินทร์', phase: 'ก่อนอบรม', score: 5, lat: 13.689, lng: 100.646 },
  { id: 2, fullName: 'สมชาย Autobacs', position: 'Service Advisor', branch: 'ศรีนครินทร์', phase: 'หลังอบรม', score: 9, lat: 13.689, lng: 100.646 },
  { id: 3, fullName: 'กมล Training', position: 'Store Manager', branch: 'รามอินทรา', phase: 'ก่อนอบรม', score: 6, lat: 13.846, lng: 100.635 },
  { id: 4, fullName: 'กมล Training', position: 'Store Manager', branch: 'รามอินทรา', phase: 'หลังอบรม', score: 8, lat: 13.846, lng: 100.635 }
];

function scoreAnswers(answers) {
  return questions.reduce((sum, q, index) => sum + (Number(answers[index]) === q.answer ? 1 : 0), 0);
}

function average(items) {
  if (!items.length) return 0;
  return Number((items.reduce((sum, item) => sum + item.score, 0) / items.length).toFixed(2));
}

export default function App() {
  const [rows, setRows] = useState(demoRows);
  const [chartType, setChartType] = useState('bar');
  const [form, setForm] = useState({
    fullName: '',
    position: '',
    branch: '',
    phase: 'ก่อนอบรม',
    answers: Array(10).fill('')
  });

  const score = scoreAnswers(form.answers);
  const preRows = rows.filter(row => row.phase === 'ก่อนอบรม');
  const postRows = rows.filter(row => row.phase === 'หลังอบรม');

  const summary = useMemo(() => {
    const preAvg = average(preRows);
    const postAvg = average(postRows);
    return {
      total: rows.length,
      preAvg,
      postAvg,
      gain: Number((postAvg - preAvg).toFixed(2))
    };
  }, [rows]);

  const comparisonData = [
    { name: 'ก่อนอบรม', score: summary.preAvg },
    { name: 'หลังอบรม', score: summary.postAvg }
  ];

  const personData = useMemo(() => {
    const grouped = {};
    rows.forEach(row => {
      grouped[row.fullName] = grouped[row.fullName] || { name: row.fullName, branch: row.branch, pre: null, post: null };
      if (row.phase === 'ก่อนอบรม') grouped[row.fullName].pre = row.score;
      if (row.phase === 'หลังอบรม') grouped[row.fullName].post = row.score;
    });
    return Object.values(grouped).map(item => ({ ...item, diff: (item.post ?? 0) - (item.pre ?? 0) }));
  }, [rows]);

  function submitSurvey(event) {
    event.preventDefault();
    if (!form.fullName || !form.position || !form.branch || form.answers.some(answer => answer === '')) {
      alert('กรุณากรอกข้อมูลและตอบข้อสอบให้ครบ 10 ข้อ');
      return;
    }
    setRows([
      ...rows,
      {
        id: Date.now(),
        fullName: form.fullName,
        position: form.position,
        branch: form.branch,
        phase: form.phase,
        score,
        lat: 13.7563 + Math.random() / 20,
        lng: 100.5018 + Math.random() / 20,
        submittedAt: new Date().toLocaleString('th-TH')
      }
    ]);
    setForm({ fullName: '', position: '', branch: '', phase: 'ก่อนอบรม', answers: Array(10).fill('') });
  }

  function exportExcel() {
    const workbook = XLSX.utils.book_new();
    const surveySheet = XLSX.utils.json_to_sheet(rows);
    const analysisSheet = XLSX.utils.json_to_sheet(personData);
    XLSX.utils.book_append_sheet(workbook, surveySheet, 'Survey Data');
    XLSX.utils.book_append_sheet(workbook, analysisSheet, 'Individual Analysis');
    XLSX.writeFile(workbook, 'autobacs-pr-training-survey.xlsx');
  }

  function exportPowerPoint() {
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.author = 'Autobacs Training';
    const title = pptx.addSlide();
    title.background = { color: 'FFF2E4' };
    title.addText('Autobacs PR Training Pre-Post Survey', { x: 0.6, y: 0.5, w: 12, h: 0.6, fontSize: 30, bold: true, color: 'F58220' });
    title.addText(`จำนวนแบบสอบถาม ${summary.total} รายการ | ก่อนอบรม ${summary.preAvg}/10 | หลังอบรม ${summary.postAvg}/10 | เพิ่มขึ้น ${summary.gain}`, { x: 0.6, y: 1.4, w: 12, h: 0.5, fontSize: 18, color: '333333' });
    title.addText('Export generated from live dashboard', { x: 0.6, y: 2.1, w: 7, h: 0.4, fontSize: 14, color: '666666' });

    const slide = pptx.addSlide();
    slide.addText('Individual Score Analysis', { x: 0.5, y: 0.3, w: 8, h: 0.4, fontSize: 24, bold: true, color: 'F58220' });
    slide.addTable([
      ['Name', 'Branch', 'Pre', 'Post', 'Diff'],
      ...personData.map(item => [item.name, item.branch, item.pre ?? '-', item.post ?? '-', item.diff])
    ], { x: 0.5, y: 1, w: 12, h: 4.5, border: { color: 'DDDDDD' }, fontSize: 12 });
    pptx.writeFile({ fileName: 'autobacs-pr-training-dashboard.pptx' });
  }

  function ChartPanel() {
    if (chartType === 'grid') {
      return <div className="score-grid">{comparisonData.map(item => <div className="score-box" key={item.name}><span>{item.name}</span><strong>{item.score}/10</strong></div>)}</div>;
    }
    if (chartType === 'map') {
      return <div className="map-box">{rows.map(row => <span key={row.id} style={{ left: `${25 + Math.random() * 45}%`, top: `${20 + Math.random() * 50}%` }} title={`${row.branch}: ${row.score}`}></span>)}<p><MapPin size={18}/> Branch score map preview</p></div>;
    }
    if (chartType === 'pie' || chartType === 'donut') {
      return <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={comparisonData} dataKey="score" nameKey="name" innerRadius={chartType === 'donut' ? 65 : 0} outerRadius={105} label>{comparisonData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Pie><Tooltip/><Legend/></PieChart></ResponsiveContainer>;
    }
    return <ResponsiveContainer width="100%" height={300}><BarChart data={comparisonData}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis domain={[0,10]}/><Tooltip/><Bar dataKey="score" fill={AUTOBACS_ORANGE} radius={[10,10,0,0]}/></BarChart></ResponsiveContainer>;
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Autobacs Academy</p>
          <h1>PR Training Pre-Post Survey App</h1>
          <p>ระบบเก็บแบบสอบถามก่อน-หลังอบรม วิเคราะห์คะแนนรายบุคคล และส่งออกไฟล์ Excel / PowerPoint ได้จริง</p>
        </div>
        <div className="hero-actions">
          <button onClick={exportExcel}><FileSpreadsheet size={18}/> Export Excel</button>
          <button onClick={exportPowerPoint}><Presentation size={18}/> Export PowerPoint</button>
        </div>
      </section>

      <section className="kpi-grid">
        <div className="kpi"><Users/><span>รายการทั้งหมด</span><strong>{summary.total}</strong></div>
        <div className="kpi"><Trophy/><span>เฉลี่ยก่อนอบรม</span><strong>{summary.preAvg}/10</strong></div>
        <div className="kpi"><Trophy/><span>เฉลี่ยหลังอบรม</span><strong>{summary.postAvg}/10</strong></div>
        <div className="kpi"><Download/><span>คะแนนเพิ่มขึ้น</span><strong>{summary.gain}</strong></div>
      </section>

      <section className="layout">
        <form className="card form-card" onSubmit={submitSurvey}>
          <h2>แบบสอบถาม / ข้อสอบ PR 10 ข้อ</h2>
          <div className="form-grid">
            <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="ชื่อ-สกุล" />
            <input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} placeholder="ตำแหน่ง" />
            <input value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} placeholder="สาขา" />
            <select value={form.phase} onChange={e => setForm({ ...form, phase: e.target.value })}><option>ก่อนอบรม</option><option>หลังอบรม</option></select>
          </div>
          <div className="questions">
            {questions.map((q, index) => <div className="question" key={q.text}><b>{index + 1}. {q.text}</b><select value={form.answers[index]} onChange={e => { const answers = [...form.answers]; answers[index] = e.target.value; setForm({ ...form, answers }); }}><option value="">เลือกคำตอบ</option>{q.choices.map((choice, choiceIndex) => <option key={choice} value={choiceIndex}>{choice}</option>)}</select></div>)}
          </div>
          <button className="primary" type="submit">บันทึกคะแนน {score}/10</button>
        </form>

        <div className="card dashboard-card">
          <div className="dashboard-head"><h2>Dashboard เปรียบเทียบก่อน-หลังอบรม</h2><select value={chartType} onChange={e => setChartType(e.target.value)}><option value="bar">กราฟแท่ง</option><option value="pie">วงกลม</option><option value="donut">โดนัท</option><option value="grid">กริด</option><option value="map">แผนที่</option></select></div>
          <ChartPanel />
        </div>
      </section>

      <section className="card">
        <h2>วิเคราะห์คะแนนรายบุคคล</h2>
        <div className="table-wrap"><table><thead><tr><th>ชื่อ-สกุล</th><th>สาขา</th><th>ก่อนอบรม</th><th>หลังอบรม</th><th>พัฒนา</th></tr></thead><tbody>{personData.map(item => <tr key={item.name}><td>{item.name}</td><td>{item.branch}</td><td>{item.pre ?? '-'}</td><td>{item.post ?? '-'}</td><td className={item.diff >= 0 ? 'positive' : 'negative'}>{item.diff}</td></tr>)}</tbody></table></div>
      </section>
    </main>
  );
}
