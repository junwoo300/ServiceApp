// iDriverPlus site codes; names and ordering follow the team's report.
const sites = [
  ['ศูนย์ราชการแจ้งวัฒนะ', [['DAD']]],
  ['แพนโดร่า สาขาลำพูน production', [['PDR_LPN_PRD']]],
  ['แพนโดร่า สาขาลำพูน 2 operation', [['PDR_LPN_OPM']]],
  ['โรงพยาบาลรามคำแหง', [['RAM2']]],
  ['รพ.วิภารามพัฒนาการ', [['VBH_BKK']]],
  ['ธนาคารเกียรตินาคิน สาขา อโศก', [['KKP_ASOK']]],
  ['รพ.วิภารามแหลมฉบัง MIX-1', [['VBH_LEAM']]],
  ['โรงพยาบาลธรรมศาสตร์รังสิต', [['THAMC_F1', 'ชั้น 1'], ['THAMC_F2', 'ชั้น 2'], ['THAMC_F4', 'ชั้น 4'], ['THAMC_F5', 'ชั้น 5']]],
  ['ARL - Ban Thap Chang', [['ARL_BTC']]],
  ['ARL - Hua Mak', [['ARL_HUM']]],
  ['ARL - Lat Krabang', [['ARL_LKB']]],
  ['ARL - Makkasan', [['ARL_MAS_1', 'SC50'], ['ARL_MAS_2', 'SC80']]],
  ['ARL - Phaya Thai', [['ARL_PTH']]],
  ['ARL - Ramkhamhaeng', [['ARL_RKH']]],
  ['ARL - Ratchaprarop', [['ARL_RPR']]],
  ['ARL - Suvarnabhumi', [['ARL_SVB']]],
  ['SCB - WEST', [['SCB_WEST']]],
  ['SCB - EAST', [['SCB_EAST']]],
  ['SCB - HQ', [['SCB_MID']]],
  ['VPH_Amata_SC50', [['VBH_AMTA']]],
  ['SP_Srinakarin_SC50PLUS', [['SP_SNK']]],
  ['SET Ratchada 1', [['SET_1']]],
  ['SET Ratchada 2', [['SET_2']]],
  ['SET Ratchada 3', [['SET_3']]],
  ['SET (North Park1)', [['CMA_1', '', 'IDPWXB613216F90068']]],
  ['SET (North Park2)', [['CMA_2', '', 'IDPWXB613216F90080']]],
  ['RAV_CHM', [['RAV_CHM']]],
  ['CP-MEJI', [['CP-MEIJI']]],
  ['UTCC', [['MTTH_4', '', 'IDPWXB416053EA0009']]],
  ['AOTGA', [['AOTGA_TH_3', 'FL.B.EAST'], ['AOTGA_TH_2', 'FL.B.WEST'], ['AOTGA_TH_1', 'FL.2.WEST']]],
];

function statusLine(robot, prefix = '', mode = 'morning') {
  const label = prefix ? `${prefix} ` : '';
  const status = robot?.status === 'online' ? `🟢${label}ออนไลน์` :
    robot?.status === 'offline' ? `🔴${label}ออฟไลน์` :
      `⚪${label}${robot ? 'ไม่ทราบสถานะ' : 'ยังไม่พบข้อมูลหุ่นยนต์'}`;
  if (mode !== 'afternoon') return status;
  const area = robot?.actualArea;
  return `${status} · ${typeof area === 'number' && Number.isFinite(area) && area >= 0
    ? `ทำงานได้ ${area.toLocaleString('th-TH', { maximumFractionDigits: 2 })} ตารางเมตร`
    : 'ไม่มีข้อมูลพื้นที่การทำงาน'}`;
}

function buildRobotStatusSummary(robots, { mode = 'morning', date, endDate, fetchedAt } = {}) {
  const used = new Set();
  const sections = sites.map(([title, members]) => [title, ...members.flatMap(([code, label, vin]) => {
    const matches = robots.filter(robot => vin ? robot.vin === vin : robot.location?.trim().toUpperCase() === code);
    if (!matches.length) return [statusLine(null, label, mode)];
    return matches.map(robot => {
      used.add(robot.vin);
      return statusLine(robot, matches.length > 1 ? [label, robot.name || robot.vin].filter(Boolean).join(' / ') : label, mode);
    });
  })].join('\n'));
  const remaining = robots.filter(robot => !used.has(robot.vin));
  if (remaining.length) sections.push('ไซต์อื่น ๆ', ...remaining.map(robot =>
    `${robot.location || 'ไม่ระบุไซต์'} (${robot.name || robot.vin})\n${statusLine(robot, '', mode)}`));
  const period = endDate && endDate !== date ? `${date} ถึง ${endDate}` : date;
  const header = [`สรุป${mode === 'afternoon' ? 'ตอนบ่าย' : 'ตอนเช้า'}${date ? ` วันที่ ${period}` : ''}`];
  if (fetchedAt) header.push(`สถานะการเชื่อมต่อ ณ ${new Date(fetchedAt).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
  if (mode === 'afternoon') header.push('พื้นที่รวมตลอดช่วงวันที่เลือก รวมวันเริ่มต้นและสิ้นสุด (หากรวมวันนี้ เป็นยอดสะสมถึงเวลาที่ดึงข้อมูล)');
  return [...header, '', ...sections].join('\n');
}

module.exports = { buildRobotStatusSummary };
