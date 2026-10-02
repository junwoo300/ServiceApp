export function groupRobotSites(robots) {
  const sites = new Map();
  for (const robot of robots) {
    const name = robot.location?.trim() || 'ไม่ระบุไซต์';
    if (!sites.has(name)) sites.set(name, { name, count: 0, actualArea: 0, plannedArea: 0 });
    const site = sites.get(name);
    site.count++;
    for (const key of ['actualArea', 'plannedArea']) {
      site[key] = site[key] == null || !Number.isFinite(robot[key]) ? null : site[key] + robot[key];
    }
  }
  return [...sites.values()].sort((a, b) => a.name.localeCompare(b.name, 'th', { numeric: true }));
}

export async function buildSiteChartImages(data, date, endDate) {
  const sites = groupRobotSites(data.robots);
  if (!sites.length) throw new Error('ไม่มีข้อมูลหุ่นยนต์สำหรับสร้างกราฟ');
  if (sites.length > 120) throw new Error('มีมากกว่า 120 ไซต์ เกินจำนวนรูปที่ส่งได้ในครั้งเดียว');
  await document.fonts?.ready;
  const images = [];
  const maximum = Math.max(1, ...sites.flatMap(site => [site.actualArea || 0, site.plannedArea || 0]));
  const format = value => value == null ? 'ข้อมูลไม่ครบ' : value.toLocaleString('th-TH', { maximumFractionDigits: 2 });
  for (let offset = 0; offset < sites.length; offset += 12) {
    const page = sites.slice(offset, offset + 12);
    const canvas = document.createElement('canvas');
    canvas.width = 1400; canvas.height = 240 + page.length * 100;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('เบราว์เซอร์ไม่รองรับการสร้างรูปกราฟ');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const text = (value, x, y, size = 22, color = '#183044', maxWidth) => {
      ctx.fillStyle = color; ctx.font = `${size}px Tahoma, sans-serif`;
      if (maxWidth) ctx.fillText(value, x, y, maxWidth); else ctx.fillText(value, x, y);
    };
    text('ผลงานหุ่นยนต์ทุกไซต์ — พื้นที่ทำความสะอาด', 40, 48, 32);
    text(`วันที่ ${date}${endDate !== date ? ` ถึง ${endDate}` : ''} | หน้า ${offset / 12 + 1}/${Math.ceil(sites.length / 12)}`, 40, 86);
    text(`ข้อมูล ณ ${new Date(data.fetchedAt).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`, 40, 120, 18);
    text('■ พื้นที่จริง', 440, 157, 22, '#b58616');
    text('■ พื้นที่แผน (ตร.ม.)', 650, 157, 22, '#4e83cd');
    page.forEach((site, index) => {
      const y = 195 + index * 100;
      text(site.name, 40, y + 15, 23, '#183044', 370);
      text(`${site.count} ตัว`, 40, y + 44, 18, '#657882');
      ['actualArea', 'plannedArea'].forEach((key, bar) => {
        const value = site[key];
        const width = (value || 0) / maximum * 730;
        ctx.fillStyle = '#eef2f5'; ctx.fillRect(440, y - 5 + bar * 34, 730, 25);
        ctx.fillStyle = bar === 0 ? '#d6a333' : '#4e83cd';
        ctx.fillRect(440, y - 5 + bar * 34, width, 25);
        text(format(value), 1190, y + 15 + bar * 34, 20);
      });
    });
    text('ข้อมูลไม่ครบ = มีหุ่นยนต์ที่ไม่มีข้อมูลพื้นที่ จึงไม่แสดงยอดรวมเป็นศูนย์', 40, canvas.height - 25, 18, '#657882');
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob || blob.size > 1024 * 1024) throw new Error('สร้างรูปกราฟไม่สำเร็จ หรือรูปมีขนาดเกินกำหนด');
    images.push(blob);
  }
  return images;
}
