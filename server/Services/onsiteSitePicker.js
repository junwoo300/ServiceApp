const PAGE_SIZE = 6;
const normalizeSearch = value => String(value || '').normalize('NFKC').toLocaleLowerCase().replace(/[\s\u200B-\u200D\uFEFF]+/g, '');

function buildSitePicker(sites, recentIds = [], view = {}) {
    const query = normalizeSearch(view.query);
    const mode = view.mode || 'recent';
    let items;
    let title;
    if (mode === 'types') {
        items = [...new Set(sites.map(site => site.type))];
        title = 'เลือกประเภทไซต์งาน';
    } else if (mode === 'recent' && !query) {
        items = recentIds.map(id => sites.find(site => String(site._id) === String(id))).filter(Boolean).slice(0, 5);
        title = 'ไซต์ที่คุณใช้ล่าสุด';
    } else {
        items = sites.filter(site => query
            ? [site.name, site.Refcode, site.type].some(value => normalizeSearch(value).includes(query))
            : !view.type || site.type === view.type);
        title = query ? `ผลการค้นหา: ${view.query}` : view.type || 'ไซต์ทั้งหมด';
    }
    const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    const page = Math.max(0, Math.min(Number.isInteger(view.page) ? view.page : 0, pages - 1));
    const buttons = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((item, index) => [{
        text: mode === 'types' ? item : `${item.name} · ${item.type}${item.Refcode && item.Refcode !== '-' ? ` · ${item.Refcode}` : ''}`,
        callback_data: mode === 'types' ? `SITE_TYPE_${page * PAGE_SIZE + index}` : `SEL_SITE_${item._id}`,
    }]);
    if (pages > 1) {
        const navigation = [];
        if (page > 0) navigation.push({ text: '⬅️ ก่อนหน้า', callback_data: `SITE_PAGE_${page - 1}` });
        if (page < pages - 1) navigation.push({ text: '➡️ ถัดไป', callback_data: `SITE_PAGE_${page + 1}` });
        buttons.push(navigation);
    }
    buttons.push([{ text: '📋 ดูไซต์ทั้งหมด / เลือกประเภท', callback_data: 'SITE_TYPES' }]);
    if (mode !== 'recent') buttons.push([{ text: '🕘 ไซต์ล่าสุด', callback_data: 'SITE_RECENT' }]);
    buttons.push([{ text: '➕ เพิ่มไซต์งานใหม่', callback_data: 'ADD_ITEM_SITE' }]);
    buttons.push([{ text: '⬅️ กลับเลือกพนักงาน', callback_data: 'BACK_TO_EMPLOYEE' }]);
    return {
        text: `📍 ขั้นตอนที่ 4: เลือกไซต์งาน\n\nค้นหาได้ทุกประเภท: พิมพ์ชื่อไซต์ ประเภท (เช่น ROBOT, CCTV) หรือ Ref Code\n\n${title}${pages > 1 ? ` (${page + 1}/${pages})` : ''}\n${items.length ? '' : mode === 'recent' ? 'ยังไม่มีไซต์ล่าสุด เลือกดูไซต์ทั้งหมดหรือพิมพ์ค้นหาได้เลย' : 'ไม่พบไซต์งาน ลองค้นคำอื่นหรือเพิ่มไซต์งานใหม่'}`,
        buttons,
    };
}

module.exports = { buildSitePicker };
