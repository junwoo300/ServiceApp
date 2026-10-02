require('./Config/env');
const { Telegraf, Markup } = require('telegraf');
const mongoose = require('mongoose');
const { buildSitePicker } = require('./Services/onsiteSitePicker');
const CaseSupport = require('./Models/CaseSupportModels');
const { getOptions: getCaseSupportOptions } = require('./Models/CaseSupportOptions');

// =================================================================
// 1. SETUP & CONFIG
// =================================================================

// ✅ Import Models ทั้งหมด
const {
    Onsite,
    Employeeonsite,
    Equipmentonsite,
    Siteonsite,
    RobotData
} = require('./Models/Onsitemodels');

const TELEGRAM_TOKEN = process.env.TELEGRAM_ONSITE_TOKEN; // ใส่ Token ของคุณ
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_ONSITE_CHAT_ID;      // ใส่ Chat ID ของคุณ 

const bot = new Telegraf(TELEGRAM_TOKEN);
const sessions = {};

// ✅ STATES ที่อัปเดตใหม่ทั้งหมด
const STATES = {
    AWAITING_JOB_TYPE: 'AWAITING_JOB_TYPE',
    AWAITING_DATE_INPUT: 'AWAITING_DATE_INPUT',
    AWAITING_EMPLOYEE: 'AWAITING_EMPLOYEE',
    AWAITING_SITE: 'AWAITING_SITE',
    AWAITING_ROBOT_SELECTION: 'AWAITING_ROBOT_SELECTION',
    AWAITING_SHIPPING_CHOICE: 'AWAITING_SHIPPING_CHOICE',
    AWAITING_SHIPPING_COST: 'AWAITING_SHIPPING_COST',
    AWAITING_SCOPE_SELECTION: 'AWAITING_SCOPE_SELECTION',
    AWAITING_DETAILS: 'AWAITING_DETAILS',
    AWAITING_EQUIPMENT: 'AWAITING_EQUIPMENT',
    // State สำหรับการเพิ่มข้อมูล
    ADD_EMPLOYEE_NAME: 'ADD_EMPLOYEE_NAME',
    ADD_EMPLOYEE_RATE: 'ADD_EMPLOYEE_RATE',
    ADD_SITE_NAME: 'ADD_SITE_NAME',
    ADD_SITE_TYPE: 'ADD_SITE_TYPE',
    ADD_SITE_REFCODE: 'ADD_SITE_REFCODE',
    ADD_SITE_TRAVEL_COST: 'ADD_SITE_TRAVEL_COST',
    ADD_EQUIPMENT_NAME: 'ADD_EQUIPMENT_NAME',
    ADD_EQUIPMENT_COST: 'ADD_EQUIPMENT_COST',
    AWAITING_CASE_SUBJECT: 'AWAITING_CASE_SUBJECT',
    AWAITING_CASE_DESCRIPTION: 'AWAITING_CASE_DESCRIPTION',
    AWAITING_CASE_SITE: 'AWAITING_CASE_SITE',
    AWAITING_CASE_TYPE: 'AWAITING_CASE_TYPE',
    AWAITING_CASE_CATEGORY: 'AWAITING_CASE_CATEGORY',
    AWAITING_CASE_PRIORITY: 'AWAITING_CASE_PRIORITY',
    AWAITING_CASE_ASSIGNEE: 'AWAITING_CASE_ASSIGNEE',
};

const SCOPE_OPTIONS = ['POC', 'Installation', 'Maintenance', 'PMA', 'Training'];
const CASE_CATEGORIES = ['แจ้งซ่อม', 'ติดตั้ง', 'สอบถามการใช้งาน', 'ร้องเรียน', 'อื่นๆ'];
const CASE_PAGE_SIZE = 6;

// =================================================================
// 2. HELPER FUNCTIONS
// =================================================================

async function replyOrEdit(ctx, text, keyboard) {
    const userId = ctx.from.id;
    const extra = keyboard ? { reply_markup: { inline_keyboard: keyboard }, parse_mode: 'Markdown' } : { parse_mode: 'Markdown' };
    try {
        if (sessions[userId] && sessions[userId].messageId) {
            await ctx.telegram.editMessageText(ctx.chat.id, sessions[userId].messageId, null, text, extra).catch(()=>{});
        } else {
            const message = await ctx.reply(text, extra);
            if (sessions[userId]) sessions[userId].messageId = message.message_id;
        }
    } catch (e) {
        if (e.message.includes('message is not modified')) return;
        console.error("Error in replyOrEdit:", e.message);
        const message = await ctx.reply(text, extra);
        if (sessions[userId]) sessions[userId].messageId = message.message_id;
    }
}

function resetSession(userId) {
    if (sessions[userId]) delete sessions[userId];
}

async function getNextCaseNo() {
    const prefix = `CS-${new Date().toISOString().slice(0, 7).replace('-', '')}-`;
    const latestCase = await CaseSupport.findOne({ caseNo: new RegExp(`^${prefix}`) })
        .sort({ caseNo: -1 })
        .select('caseNo')
        .lean();
    const latestNumber = latestCase ? Number(latestCase.caseNo.slice(-4)) : 0;
    return `${prefix}${String(latestNumber + 1).padStart(4, '0')}`;
}

async function startCaseFlow(ctx) {
    const userId = ctx.from.id;
    if (ctx.chat.id.toString() !== TELEGRAM_CHAT_ID) {
        return ctx.reply('❌ ไม่อนุญาตให้เปิดเคสจากแชตนี้');
    }

    resetSession(userId);
    sessions[userId] = { state: STATES.AWAITING_CASE_SUBJECT, case: {}, messageId: null };
    try {
        const options = await getCaseSupportOptions();
        sessions[userId].caseTypes = options.types.map(option => option.name).filter(Boolean);
        await showCaseChoices(ctx, userId, {
            key: 'subject', title: 'กรุณาเลือกหัวข้อเคส',
            options: options.subjects.map(option => option.name).filter(Boolean),
            inputState: STATES.AWAITING_CASE_SUBJECT,
        });
    } catch (error) {
        console.error('Cannot load case subject options:', error.message);
        await replyOrEdit(ctx, '📝 *เปิดเคสใหม่*\n\nกรุณาพิมพ์หัวข้อเคส');
    }
}

async function showCaseChoices(ctx, userId, { key, title, options, inputState, page = 0, allowSkip = false }) {
    const session = sessions[userId];
    const safeOptions = options.filter(Boolean);
    const pageCount = Math.max(1, Math.ceil(safeOptions.length / CASE_PAGE_SIZE));
    const currentPage = Math.max(0, Math.min(page, pageCount - 1));
    session.state = inputState;
    session.caseChoice = { key, title, options: safeOptions, inputState, page: currentPage, allowSkip };
    const start = currentPage * CASE_PAGE_SIZE;
    const selected = key === 'assignee' ? (session.case.assignees || []) : [];
    const buttons = safeOptions.slice(start, start + CASE_PAGE_SIZE)
        .map((option, index) => [Markup.button.callback(selected.includes(option) ? `✅ ${option}` : option, `CASE_CHOICE_${start + index}`)]);
    if (pageCount > 1) {
        const navigation = [];
        if (currentPage > 0) navigation.push(Markup.button.callback('⬅️ ก่อนหน้า', `CASE_CHOICE_PAGE_${currentPage - 1}`));
        if (currentPage < pageCount - 1) navigation.push(Markup.button.callback('➡️ ถัดไป', `CASE_CHOICE_PAGE_${currentPage + 1}`));
        buttons.push(navigation);
    }
    if (allowSkip) buttons.push([Markup.button.callback('✅ ยืนยันผู้รับผิดชอบ', 'CASE_CHOICE_DONE')]);
    buttons.push([Markup.button.callback('✏️ อื่นๆ (พิมพ์เอง)', 'CASE_CHOICE_CUSTOM')]);
    await replyOrEdit(ctx, title, buttons);
}

async function showCaseSiteSelection(ctx, userId) {
    sessions[userId].caseSitePicker = true;
    await showSiteSelection(ctx, userId, { mode: 'types' });
}

async function showCaseTypeSelection(ctx, userId) {
    await showCaseChoices(ctx, userId, {
        key: 'type', title: 'กรุณาเลือกประเภทงาน', options: sessions[userId].caseTypes || [],
        inputState: STATES.AWAITING_CASE_TYPE,
    });
}

async function showCaseCategorySelection(ctx, userId) {
    await showCaseChoices(ctx, userId, {
        key: 'category', title: 'กรุณาเลือกหมวดหมู่', options: CASE_CATEGORIES,
        inputState: STATES.AWAITING_CASE_CATEGORY,
    });
}

async function showCaseAssigneeSelection(ctx, userId) {
    const employees = await Employeeonsite.find().sort('name').lean();
    const excludedAssignees = new Set(['shipping', 'ค่าใช้จ่าย']);
    await showCaseChoices(ctx, userId, {
        key: 'assignee', title: 'กรุณาเลือกผู้รับผิดชอบ',
        options: employees.map(employee => employee.name).filter(name => !excludedAssignees.has(String(name).trim().toLocaleLowerCase())),
        inputState: STATES.AWAITING_CASE_ASSIGNEE, allowSkip: true,
    });
}

async function advanceCaseFlow(ctx, userId, key, value) {
    const session = sessions[userId];
    session.case[key] = value;
    if (key === 'assignee') session.case.assignees = Array.isArray(value) ? value : (value ? [value] : []);
    if (key === 'subject') {
        session.state = STATES.AWAITING_CASE_DESCRIPTION;
        return replyOrEdit(ctx, 'กรุณาพิมพ์รายละเอียดปัญหา');
    }
    if (key === 'site') return showCaseTypeSelection(ctx, userId);
    if (key === 'type') return showCaseCategorySelection(ctx, userId);
    if (key === 'category') return showCasePrioritySelection(ctx, userId);
    if (key === 'assignee') {
      session.case.assignee = session.case.assignees.join(', ');
      return replyOrEdit(ctx, caseSummary(session.case), [
        [Markup.button.callback('✅ ยืนยันเปิดเคส', 'CASE_SAVE')],
        [Markup.button.callback('❌ ยกเลิก', 'CASE_CANCEL')],
      ]);
    }
}

async function showCasePrioritySelection(ctx, userId) {
    sessions[userId].state = STATES.AWAITING_CASE_PRIORITY;
    await replyOrEdit(ctx, 'เลือกระดับความสำคัญของเคส', [
        [Markup.button.callback('ต่ำ', 'CASE_PRIORITY_LOW'), Markup.button.callback('ปกติ', 'CASE_PRIORITY_NORMAL')],
        [Markup.button.callback('สูง', 'CASE_PRIORITY_HIGH'), Markup.button.callback('เร่งด่วน', 'CASE_PRIORITY_URGENT')],
    ]);
}

function caseSummary(caseData) {
    return `📝 *ตรวจสอบข้อมูลก่อนบันทึก*\n\n` +
        `*หัวข้อ:* ${caseData.subject}\n` +
        `*รายละเอียด:* ${caseData.description}\n` +
        `*ไซต์งาน:* ${caseData.site}\n` +
        `*ประเภท:* ${caseData.type}\n` +
        `*หมวดหมู่:* ${caseData.category}\n` +
        `*ความสำคัญ:* ${caseData.priority}\n` +
        `*ผู้รับผิดชอบ:* ${caseData.assignee || '-'}\n\nยืนยันการเปิดเคสหรือไม่?`;
}

async function startOnsiteFlow(ctx) {
    const userId = ctx.from.id;
    const chatId = ctx.chat.id;

    if (chatId.toString() !== TELEGRAM_CHAT_ID) {
        return await ctx.reply('❌ ขณะนี้ไม่อนุญาตให้ใช้งานจากแชตนี้');
    }

    resetSession(userId);
    sessions[userId] = {
        employeeIds: [],
        equipmentIds: [],
        newItem: {},
        messageId: null,
        state: null
    };

    await showJobTypeSelection(ctx, userId);
}

async function showJobTypeSelection(ctx, userId) {
    sessions[userId].state = STATES.AWAITING_JOB_TYPE;
    const text = `สวัสดี @${ctx.from.username || ctx.from.first_name}\n\n*ขั้นตอนที่ 1:*\nกรุณาเลือกประเภทงาน`;
    const buttons = [
        [Markup.button.callback('🤖 งาน ROBOT', `SET_JOB_TYPE_ROBOT`)],
        [Markup.button.callback('🏢 งานอื่นๆ', `SET_JOB_TYPE_GENERAL`)]
    ];
    await replyOrEdit(ctx, text, buttons);
}

async function showDateSelection(ctx, userId) {
    sessions[userId].state = STATES.AWAITING_DATE_INPUT;
    const text = `*ขั้นตอนที่ 2:*\nกรุณาเลือกวันที่เข้าปฏิบัติงาน`;
    const buttons = [
        [Markup.button.callback('🗓️ วันนี้', `SEL_DATE_TODAY`)],
        [Markup.button.callback('🗓️ พรุ่งนี้', `SEL_DATE_TOMORROW`)],
        [Markup.button.callback('⌨️ ระบุวันที่เอง...', `SEL_DATE_INPUT`)],
    ];
    await replyOrEdit(ctx, text, buttons);
}

async function showEmployeeSelection(ctx, userId) {
    sessions[userId].state = STATES.AWAITING_EMPLOYEE;
    const employees = await Employeeonsite.find().lean();
    sessions[userId].tempData = employees;
    const text = `*ขั้นตอนที่ 3:*\nกรุณาเลือกพนักงาน`;
    const employeeButtons = employees.map((emp, i) => {
        const isSelected = sessions[userId].employeeIds.includes(emp._id.toString());
        return [Markup.button.callback(isSelected ? `✅ ${emp.name}` : emp.name, `SEL_EMP_${i}`)];
    });
    const actionButtons = [
        [Markup.button.callback('➕ เพิ่มพนักงานใหม่', `ADD_ITEM_EMPLOYEE`)],
        [Markup.button.callback('➡️ ถัดไป', `GOTO_SITE`)]
    ];
    const buttons = [...employeeButtons, ...actionButtons];
    await replyOrEdit(ctx, text, buttons);
}

async function showSiteSelection(ctx, userId, view = {}) {
    const session = sessions[userId];
    session.state = STATES.AWAITING_SITE;
    session.siteView = view;
    const sites = await Siteonsite.find().sort('type name').lean();
    session.siteTypes = [...new Set(sites.map(site => site.type))];
    session.availableSiteIds = sites.map(site => String(site._id));
    const recent = await Onsite.aggregate([
        { $match: { telegramUserId: String(userId),site: { $in: sites.map(site => site._id) } } },
        { $group: { _id: '$site', latest: { $max: '$createdAt' } } },
        { $sort: { latest: -1, _id: 1 } },
        { $limit: 5 },
    ]);
    const menu = buildSitePicker(sites, recent.map(item => item._id), view);
    const extra = { reply_markup: { inline_keyboard: menu.buttons } };
    if (session.messageId) {
        try {
            await ctx.telegram.editMessageText(ctx.chat.id, session.messageId, null, menu.text, extra);
            return;
        } catch (error) {
            if (error.message.includes('message is not modified')) return;
        }
    }
    const message = await ctx.reply(menu.text, extra);
    session.messageId = message.message_id;
}

async function showRobotSelection(ctx, userId, locationName) {
    sessions[userId].state = STATES.AWAITING_ROBOT_SELECTION;
    const robots = await RobotData.find({ location: locationName }).lean();
    let text = `*ขั้นตอนที่ 5:*\nเลือกหุ่นยนต์สำหรับไซต์ *${locationName}*`;
    let buttons = [];
    if (robots.length > 0) {
        robots.forEach(robot => {
            buttons.push([Markup.button.callback(`${robot.vin} (${robot.model})`, `SEL_ROBOT_${robot.vin}`)]);
        });
    } else {
        text += `\n\n⚠️ ไม่พบข้อมูลหุ่นยนต์ที่ตรงกับไซต์นี้\nกรุณาเลือก "ข้าม" เพื่อดำเนินการต่อ`;
    }
    buttons.push([Markup.button.callback('➡️ ข้าม', 'SKIP_ROBOT')]);
    buttons.push([Markup.button.callback('⬅️ กลับ', 'BACK_TO_SITE')]);
    await replyOrEdit(ctx, text, buttons);
}

async function showShippingChoice(ctx, userId) {
    sessions[userId].state = STATES.AWAITING_SHIPPING_CHOICE;
    const text = `*ขั้นตอนที่ 6:*\nมีค่าขนส่งของหรือไม่?`;
    const buttons = [
        [Markup.button.callback('✅ มี', 'SET_SHIPPING_YES')],
        [Markup.button.callback('❌ ไม่มี', 'SET_SHIPPING_NO')]
    ];
    await replyOrEdit(ctx, text, buttons);
}

async function showScopeSelection(ctx, userId) {
    sessions[userId].state = STATES.AWAITING_SCOPE_SELECTION;
    const text = `*ขั้นตอนที่ 7:*\nกรุณาเลือกขอบเขตของงาน (Scope)`;
    const buttons = SCOPE_OPTIONS.map(scope => [Markup.button.callback(scope, `SEL_SCOPE_${scope}`)]);
    await replyOrEdit(ctx, text, buttons);
}

async function showEquipmentSelection(ctx, userId) {
    sessions[userId].state = STATES.AWAITING_EQUIPMENT;
    const selectedSite = await Siteonsite.findById(sessions[userId].siteId).lean();
    if (!selectedSite) return await replyOrEdit(ctx, 'เกิดข้อผิดพลาด: ไม่พบไซต์ที่เลือก กรุณาเริ่มใหม่');
    
    sessions[userId].currentSiteType = selectedSite.type;
    const equipment = await Equipmentonsite.find({ type: selectedSite.type }).lean();
    sessions[userId].tempData = equipment;
    let text = `*ขั้นตอนสุดท้าย:*\nกรุณาเลือกอุปกรณ์ (ถ้ามี)`;
    let buttons = [];
    if (equipment.length > 0) {
        buttons.push(...equipment.map((eq, i) => {
            const isSelected = sessions[userId].equipmentIds.includes(eq._id.toString());
            return [Markup.button.callback(isSelected ? `✅ ${eq.name}` : eq.name, `SEL_EQUIP_${i}`)];
        }));
    } else {
        text += `\n_(ไม่พบอุปกรณ์สำหรับงานประเภทนี้)_`
    }
    buttons.push([Markup.button.callback(`➕ เพิ่มอุปกรณ์สำหรับ '${selectedSite.type}'`, 'ADD_ITEM_EQUIPMENT')]);
    buttons.push([Markup.button.callback('✅ ยืนยันและบันทึก', `SAVE_FINAL`)]);
    await replyOrEdit(ctx, text, buttons);
}

// =================================================================
// 3. BOT LOGIC
// =================================================================


bot.command('start', async (ctx) => {
    await startOnsiteFlow(ctx);
});

bot.command('opencase', async (ctx) => {
    await startCaseFlow(ctx);
});

bot.command('reset', async (ctx) => {
    const userId = ctx.from.id;
    resetSession(userId);
    await ctx.reply('✅ เคลียร์ session เรียบร้อยแล้ว\nพิมพ์คำว่า *ออนไซต์* หรือ /start เพื่อเริ่มใหม่ได้เลย', { parse_mode: 'Markdown' });
});


bot.hears(['onsite', 'Onsite', 'ออนไซต์'], async (ctx) => {
    await startOnsiteFlow(ctx);
});

bot.hears(['opencase', 'Opencase', 'เปิดเคส'], async (ctx) => {
    await startCaseFlow(ctx);
});

bot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    if (!sessions[userId] || !sessions[userId].state) return;
    const state = sessions[userId].state;
    const text = ctx.message.text.trim();
    await ctx.deleteMessage(ctx.message.message_id).catch(e => {});

    switch (state) {
        case STATES.AWAITING_CASE_SUBJECT:
            await advanceCaseFlow(ctx, userId, 'subject', text);
            break;
        case STATES.AWAITING_CASE_DESCRIPTION:
            sessions[userId].case.description = text;
            await showCaseSiteSelection(ctx, userId);
            break;
        case STATES.AWAITING_CASE_SITE:
            await advanceCaseFlow(ctx, userId, 'site', text);
            break;
        case STATES.AWAITING_CASE_TYPE:
            await advanceCaseFlow(ctx, userId, 'type', text);
            break;
        case STATES.AWAITING_CASE_CATEGORY:
            await advanceCaseFlow(ctx, userId, 'category', text);
            break;
        case STATES.AWAITING_CASE_ASSIGNEE:
            if (text !== '-') {
                const selected = sessions[userId].case.assignees || [];
                sessions[userId].case.assignees = selected.includes(text) ? selected : [...selected, text];
            }
            await showCaseAssigneeSelection(ctx, userId);
            break;
        case STATES.AWAITING_SITE:
            await showSiteSelection(ctx, userId, { mode: 'search', query: text.slice(0, 200) });
            break;
        case STATES.AWAITING_DATE_INPUT:
            const [day, month, year] = text.split('/');
            const date = new Date(year, month - 1, day);
            if (isNaN(date.getTime()) || !year || year.length < 4) {
                return await replyOrEdit(ctx, '❌ รูปแบบวันที่ไม่ถูกต้อง (DD/MM/YYYY) ลองใหม่');
            }
            sessions[userId].onsiteDate = date;
            await showEmployeeSelection(ctx, userId);
            break;
        
        case STATES.AWAITING_SHIPPING_COST:
            const cost = parseFloat(text);
            if (isNaN(cost)) return await replyOrEdit(ctx, '❌ กรุณาใส่ค่าขนส่งเป็นตัวเลขเท่านั้น');
            sessions[userId].shippingCost = cost;
            await showScopeSelection(ctx, userId);
            break;
        
        case STATES.AWAITING_DETAILS:
            sessions[userId].details = text;
            await showEquipmentSelection(ctx, userId);
            break;

        case STATES.ADD_EMPLOYEE_NAME:
             sessions[userId].newItem.name = text;
             sessions[userId].state = STATES.ADD_EMPLOYEE_RATE;
             await replyOrEdit(ctx, `ชื่อพนักงาน: ${text}\nกรุณาใส่ค่าแรง (ตัวเลข):`);
             break;
        case STATES.ADD_EMPLOYEE_RATE:
            const rate = parseFloat(text);
            if(isNaN(rate)) return await replyOrEdit(ctx, `❌ ค่าแรงต้องเป็นตัวเลขเท่านั้น`);
            await Employeeonsite.create({ name: sessions[userId].newItem.name, rate });
            await showEmployeeSelection(ctx, userId);
            break;

        case STATES.ADD_SITE_NAME:
            sessions[userId].newItem.name = text;
            sessions[userId].state = STATES.ADD_SITE_TYPE;
            await replyOrEdit(ctx, `ชื่อไซต์: ${text}\nกรุณาพิมพ์ "ประเภท" ของงาน:`);
            break;
        case STATES.ADD_SITE_TYPE:
            sessions[userId].newItem.type = text;
            sessions[userId].state = STATES.ADD_SITE_REFCODE;
            await replyOrEdit(ctx, `ประเภท: ${text}\nกรุณาใส่ "Ref Code" (ถ้าไม่มีให้พิมพ์ -):`);
            break;
        case STATES.ADD_SITE_REFCODE:
            sessions[userId].newItem.Refcode = text;
            sessions[userId].state = STATES.ADD_SITE_TRAVEL_COST;
            await replyOrEdit(ctx, `Ref Code: ${text}\nกรุณาใส่ "ค่าเดินทาง" (ตัวเลข):`);
            break;
        case STATES.ADD_SITE_TRAVEL_COST:
            const travelCost = parseFloat(text);
            if (isNaN(travelCost)) return await replyOrEdit(ctx, `❌ ค่าเดินทางต้องเป็นตัวเลขเท่านั้น`);
            sessions[userId].newItem.travelCost = travelCost;
            await Siteonsite.create(sessions[userId].newItem);
            
            await showSiteSelection(ctx, userId);
            break;
        
        case STATES.ADD_EQUIPMENT_NAME:
            sessions[userId].newItem.name = text;
            sessions[userId].state = STATES.ADD_EQUIPMENT_COST;
            await replyOrEdit(ctx, `ชื่ออุปกรณ์: ${text}\nกรุณาใส่ราคา (ตัวเลข):`);
            break;
        case STATES.ADD_EQUIPMENT_COST:
            const equipCost = parseFloat(text);
            if(isNaN(equipCost)) return await replyOrEdit(ctx, `❌ ราคาต้องเป็นตัวเลขเท่านั้น`);
            sessions[userId].newItem.cost = equipCost;
            sessions[userId].newItem.type = sessions[userId].currentSiteType;
            await Equipmentonsite.create(sessions[userId].newItem);
            await showEquipmentSelection(ctx, userId);
            break;
    }
});

bot.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery.data;
    const userId = ctx.from.id;
    if (!sessions[userId]) return await ctx.answerCbQuery('เมนูหมดอายุแล้ว', { show_alert: true });
    
    try {
        await ctx.answerCbQuery().catch(e => {});

        if (data.startsWith('CASE_CHOICE_PAGE_')) {
            const choice = sessions[userId].caseChoice;
            if (!choice) return ctx.answerCbQuery('เมนูหมดอายุแล้ว กรุณาเริ่มใหม่', { show_alert: true });
            await showCaseChoices(ctx, userId, { ...choice, page: Number(data.replace('CASE_CHOICE_PAGE_', '')) });
            return;
        }
        if (data === 'CASE_CHOICE_CUSTOM') {
            const choice = sessions[userId].caseChoice;
            if (!choice) return ctx.answerCbQuery('เมนูหมดอายุแล้ว กรุณาเริ่มใหม่', { show_alert: true });
            sessions[userId].state = choice.inputState;
            await replyOrEdit(ctx, `กรุณาพิมพ์${choice.title.replace('กรุณาเลือก', '')}`);
            return;
        }
        if (data === 'CASE_CHOICE_SKIP') {
            const choice = sessions[userId].caseChoice;
            if (!choice?.allowSkip) return ctx.answerCbQuery('ไม่สามารถข้ามขั้นตอนนี้ได้', { show_alert: true });
            await advanceCaseFlow(ctx, userId, choice.key, '');
            return;
        }
        if (data === 'CASE_CHOICE_DONE') {
            const choice = sessions[userId].caseChoice;
            if (!choice?.allowSkip) return ctx.answerCbQuery('ไม่สามารถยืนยันขั้นตอนนี้ได้', { show_alert: true });
            await advanceCaseFlow(ctx, userId, choice.key, sessions[userId].case.assignees || []);
            return;
        }
        if (data.startsWith('CASE_CHOICE_')) {
            const choice = sessions[userId].caseChoice;
            const option = choice?.options[Number(data.replace('CASE_CHOICE_', ''))];
            if (!option) return ctx.answerCbQuery('ไม่พบตัวเลือก กรุณาเริ่มใหม่', { show_alert: true });
            if (choice.key === 'assignee') {
                const selected = sessions[userId].case.assignees || [];
                sessions[userId].case.assignees = selected.includes(option)
                    ? selected.filter(value => value !== option)
                    : [...selected, option];
                await showCaseChoices(ctx, userId, choice);
                return;
            }
            await advanceCaseFlow(ctx, userId, choice.key, option);
            return;
        }
        if (data === 'CASE_SUBJECT_CUSTOM') {
            sessions[userId].state = STATES.AWAITING_CASE_SUBJECT;
            await replyOrEdit(ctx, 'กรุณาพิมพ์หัวข้อเคส');
            return;
        }
        if (data.startsWith('CASE_SUBJECT_')) {
            const subjectIndex = Number(data.replace('CASE_SUBJECT_', ''));
            const subject = sessions[userId].caseSubjects?.[subjectIndex];
            if (!subject) return ctx.answerCbQuery('ไม่พบหัวข้อที่เลือก กรุณาเริ่มใหม่', { show_alert: true });
            sessions[userId].case.subject = subject;
            sessions[userId].state = STATES.AWAITING_CASE_DESCRIPTION;
            await replyOrEdit(ctx, 'กรุณาพิมพ์รายละเอียดปัญหา');
            return;
        }
        if (data.startsWith('CASE_PRIORITY_')) {
            const priorities = {
                LOW: 'ต่ำ',
                NORMAL: 'ปกติ',
                HIGH: 'สูง',
                URGENT: 'เร่งด่วน',
            };
            sessions[userId].case.priority = priorities[data.replace('CASE_PRIORITY_', '')];
            await showCaseAssigneeSelection(ctx, userId);
            return;
        }
        if (data === 'CASE_CANCEL') {
            resetSession(userId);
            await ctx.editMessageText('ยกเลิกการเปิดเคสแล้ว');
            return;
        }
        if (data === 'CASE_SAVE') {
            const caseData = sessions[userId].case;
            if (!caseData.subject || !caseData.description || !caseData.site || !caseData.type || !caseData.category || !caseData.priority) {
                return ctx.answerCbQuery('ข้อมูลเปิดเคสไม่ครบ', { show_alert: true });
            }
            const newCase = await CaseSupport.create({
                ...caseData,
                caseNo: await getNextCaseNo(),
                openedDate: new Date(),
            });
            resetSession(userId);
            await ctx.editMessageText(
                `✅ เปิดเคสเรียบร้อยแล้ว\n` +
                `หมายเลขเคส: ${newCase.caseNo}\n` +
                `หัวข้อ: ${newCase.subject}\n` +
                `ไซต์งาน: ${newCase.site}\n` +
                `ประเภท: ${newCase.type}\n` +
                `หมวดหมู่: ${newCase.category}\n` +
                `ความสำคัญ: ${newCase.priority}\n` +
                `ผู้รับผิดชอบ: ${(newCase.assignees?.length ? newCase.assignees : [newCase.assignee]).filter(Boolean).join(', ') || '-'}\n` +
                `เปิดเมื่อ: ${new Date(newCase.openedDate).toLocaleString('th-TH')}`
            );
            return;
        }

        if (data.startsWith('ADD_ITEM_')) {
            const itemType = data.replace('ADD_ITEM_', '');
            sessions[userId].newItem = {};
            switch (itemType) {
                case 'EMPLOYEE':
                    sessions[userId].state = STATES.ADD_EMPLOYEE_NAME;
                    await replyOrEdit(ctx, 'พิมพ์ "ชื่อ" พนักงานใหม่:');
                    break;
                case 'SITE':
                    sessions[userId].state = STATES.ADD_SITE_NAME;
                    await replyOrEdit(ctx, 'พิมพ์ "ชื่อ" ไซต์งานใหม่:');
                    break;
                case 'EQUIPMENT':
                    sessions[userId].state = STATES.ADD_EQUIPMENT_NAME;
                    const type = sessions[userId].currentSiteType || 'ทั่วไป';
                    await replyOrEdit(ctx, `พิมพ์ "ชื่อ" อุปกรณ์ใหม่สำหรับประเภท "*${type}*":`);
                    break;
            }
            return;
        }

        if (data.startsWith('SET_JOB_TYPE_')) {
            sessions[userId].jobType = data.replace('SET_JOB_TYPE_', '');
            await showDateSelection(ctx, userId);
            return;
        }
        if (data.startsWith('SEL_DATE_')) {
            const choice = data.replace('SEL_DATE_', '');
            if (choice === 'INPUT') {
                sessions[userId].state = STATES.AWAITING_DATE_INPUT;
                await replyOrEdit(ctx, 'กรุณาพิมพ์วันที่ในรูปแบบ: `DD/MM/YYYY` เช่น `31/12/2025`');
            } else {
                let onsiteDate = new Date();
                if (choice === 'TOMORROW') onsiteDate.setDate(onsiteDate.getDate() + 1);
                sessions[userId].onsiteDate = onsiteDate;
                await showEmployeeSelection(ctx, userId);
            }
            return;
        }
        if (data.startsWith('SEL_EMP_')) {
            const empIndex = parseInt(data.replace('SEL_EMP_', ''), 10);
            const empId = sessions[userId].tempData[empIndex]._id.toString();
            const sessionEmpIndex = sessions[userId].employeeIds.indexOf(empId);
            if (sessionEmpIndex === -1) sessions[userId].employeeIds.push(empId);
            else sessions[userId].employeeIds.splice(sessionEmpIndex, 1);
            await showEmployeeSelection(ctx, userId);
            return;
        }
        if (data === 'GOTO_SITE') {
            if (sessions[userId].employeeIds.length === 0) return await ctx.answerCbQuery('กรุณาเลือกพนักงาน', { show_alert: true });
            await showSiteSelection(ctx, userId);
            return;
        }
        if (data.startsWith('SITE_')) {
            if (sessions[userId].state !== STATES.AWAITING_SITE) return;
            let view = { ...sessions[userId].siteView };
            if (data === 'SITE_TYPES') view = { mode: 'types' };
            else if (data === 'SITE_RECENT') view = { mode: 'recent' };
            else if (data.startsWith('SITE_TYPE_')) {
                const type = sessions[userId].siteTypes[Number(data.slice(10))];
                if (!type) return;
                view = { mode: 'all', type };
            } else if (data.startsWith('SITE_PAGE_')) view.page = Number(data.slice(10));
            else return;
            await showSiteSelection(ctx, userId, view);
            return;
        }
        if (data.startsWith('SEL_SITE_')) {
            const siteId = data.replace('SEL_SITE_', '');
            if (sessions[userId].state !== STATES.AWAITING_SITE || !sessions[userId].availableSiteIds?.includes(siteId)) return;
            const site = await Siteonsite.findById(siteId).lean();
            if (!site) {
                 await replyOrEdit(ctx, '⚠️ เกิดข้อผิดพลาด: ไม่พบข้อมูลไซต์ที่เลือก กรุณาเริ่มใหม่');
                 if (sessions[userId].caseSitePicker) return await showCaseSiteSelection(ctx, userId);
                 return await showJobTypeSelection(ctx, userId);
            }
            if (sessions[userId].caseSitePicker) {
                delete sessions[userId].caseSitePicker;
                await advanceCaseFlow(ctx, userId, 'site', site.name);
                return;
            }
            sessions[userId].siteId = siteId;
            sessions[userId].jobType = String(site.type || '').trim().toUpperCase() === 'ROBOT' ? 'ROBOT' : 'GENERAL';
            sessions[userId].robotname = '-';
            if (sessions[userId].jobType === 'ROBOT') {
                await showRobotSelection(ctx, userId, site.name);
            } else {
                sessions[userId].robotname = '-';
                await showShippingChoice(ctx, userId);
            }
            return;
        }
        if (data.startsWith('SEL_ROBOT_')) {
            sessions[userId].robotname = data.replace('SEL_ROBOT_', '');
            await showShippingChoice(ctx, userId);
            return;
        }
        if (data === 'SKIP_ROBOT') {
            sessions[userId].robotname = '-';
            await showShippingChoice(ctx, userId);
            return;
        }
        if (data.startsWith('SET_SHIPPING_')) {
            const choice = data.replace('SET_SHIPPING_', '');
            if (choice === 'YES') {
                sessions[userId].state = STATES.AWAITING_SHIPPING_COST;
                await replyOrEdit(ctx, 'กรุณาพิมพ์ค่าขนส่ง (ตัวเลข):');
            } else {
                sessions[userId].shippingCost = 0;
                await showScopeSelection(ctx, userId);
            }
            return;
        }
        if (data.startsWith('SEL_SCOPE_')) {
            sessions[userId].scope = data.replace('SEL_SCOPE_', '');
            sessions[userId].state = STATES.AWAITING_DETAILS;
            await replyOrEdit(ctx, '*ขั้นตอนที่ 8:*\nกรุณาพิมพ์รายละเอียดงานที่ทำ:');
            return;
        }
        if (data.startsWith('SEL_EQUIP_')) {
            const equipIndex = parseInt(data.replace('SEL_EQUIP_', ''), 10);
            const equipId = sessions[userId].tempData[equipIndex]._id.toString();
            const sessionEquipIndex = sessions[userId].equipmentIds.indexOf(equipId);
            if (sessionEquipIndex === -1) sessions[userId].equipmentIds.push(equipId);
            else sessions[userId].equipmentIds.splice(sessionEquipIndex, 1);
            await showEquipmentSelection(ctx, userId);
            return;
        }
        if (data === 'SAVE_FINAL') {
            const { employeeIds, siteId, onsiteDate, details, equipmentIds, jobType, robotname, shippingCost, scope } = sessions[userId];
            if (!siteId || !scope || !details) return await ctx.answerCbQuery('ข้อมูลไม่ครบถ้วน', { show_alert: true });

            await ctx.editMessageText('กำลังบันทึกข้อมูล...');
            
            const finalSite = await Siteonsite.findById(siteId).lean();
            const allSelectedEmployees = await Employeeonsite.find({ _id: { $in: employeeIds } }).lean();
            const selectedEquipment = await Equipmentonsite.find({ _id: { $in: equipmentIds } }).lean();
            
            const totalEquipmentCost = selectedEquipment.reduce((sum, eq) => sum + eq.cost, 0);
            const travelCost = finalSite.travelCost || 0;
            
            // 1. สร้าง Record สำหรับพนักงานแต่ละคน
            for (let i = 0; i < allSelectedEmployees.length; i++) {
                const employee = allSelectedEmployees[i];
                await Onsite.create({
                    selectedBy: ctx.from.username || ctx.from.first_name,
                    telegramUserId: String(userId),
                    onsiteDate, 
                    employees: [employee._id], 
                    site: siteId,
                    type: finalSite.type, 
                    Refcode: finalSite.Refcode || '-',
                    robotname: jobType === 'ROBOT' ? robotname : '-',
                    equipment: [], 
                    Shipping: 0, 
                    travelCost: 0, 
                    scope: scope, 
                    details: details, 
                    totalLaborCost: employee.rate, 
                    totalEquipmentCost: 0,
                    grandTotal: employee.rate 
                });
            }

            // 2. สร้าง Record ใหม่สำหรับ "ค่าใช้จ่าย" ทั้งหมด
            const jobLevelCost = travelCost + (shippingCost || 0) + totalEquipmentCost;
            
            let expenseEmployee = await Employeeonsite.findOne({ name: 'ค่าใช้จ่าย' });
            if (!expenseEmployee) {
                expenseEmployee = await Employeeonsite.create({ name: 'ค่าใช้จ่าย', rate: 0 });
            }

            await Onsite.create({
                selectedBy: ctx.from.username || ctx.from.first_name,
                    telegramUserId: String(userId),
                onsiteDate, 
                employees: [expenseEmployee._id], 
                site: siteId,
                type: finalSite.type, 
                Refcode: finalSite.Refcode || '-',
                robotname: jobType === 'ROBOT' ? robotname : '-',
                equipment: equipmentIds, 
                Shipping: shippingCost || 0, 
                travelCost: travelCost, 
                scope: scope, 
                details: details, 
                totalLaborCost: 0, 
                totalEquipmentCost: totalEquipmentCost, 
                grandTotal: jobLevelCost 
            });

            const totalLaborCost = allSelectedEmployees.reduce((sum, emp) => sum + emp.rate, 0);
            const grandTotal = totalLaborCost + jobLevelCost;
            
            let summary = `✅ *บันทึกข้อมูลเรียบร้อยแล้ว*
👤 *บันทึกโดย:* @${ctx.from.username || ctx.from.first_name}
===================================
🗓️ *วันที่:* ${onsiteDate.toLocaleDateString('th-TH', { dateStyle: 'full' })}
👥 *พนักงาน:* ${allSelectedEmployees.map(e => e.name).join(', ')} 
📍 *ไซต์งาน:* ${finalSite.name}`;

            // ✅ เพิ่มเงื่อนไขเพื่อแสดง Refcode หากมี
            if (finalSite.Refcode && finalSite.Refcode !== '-') {
                summary += `\n*Ref Code:* ${finalSite.Refcode}`;
            }
            
            summary += `\n*ประเภท:* ${finalSite.type}`;
            
            if (jobType === 'ROBOT' && robotname !== '-') { summary += `\n*หุ่นยนต์:* ${robotname}`; }

            summary += `\n*ขอบเขตงาน:* ${scope}
📝 *รายละเอียด:* ${details}
🛠 *อุปกรณ์:* ${selectedEquipment.length > 0 ? selectedEquipment.map(e => e.name).join(', ') : 'ไม่มี'} 
===================================
--- *สรุปค่าใช้จ่าย* ---
💰 *ค่าแรง:* ${totalLaborCost.toLocaleString()} บาท
*ค่าเดินทาง:* ${travelCost.toLocaleString()} บาท
*ค่าขนส่ง:* ${(shippingCost || 0).toLocaleString()} บาท
*ค่าอุปกรณ์:* ${totalEquipmentCost.toLocaleString()} บาท
---
**รวมทั้งสิ้น:** **${grandTotal.toLocaleString()} บาท**`;

            await replyOrEdit(ctx, summary, null);
            delete sessions[userId];
            return;
        }
        
        // --- Back Buttons ---
        if (data === 'BACK_TO_EMPLOYEE') {
              await showEmployeeSelection(ctx, userId);
              return;
        }
        if (data === 'BACK_TO_SITE') {
            await showSiteSelection(ctx, userId);
            return;
        }

    } catch (error) {
        console.error('Error in callback_query handler:', error);
        await ctx.reply('เกิดข้อผิดพลาด โปรดลองอีกครั้งโดยการพิมพ์ /ออนไซต์');
        if (sessions[userId]) {
            delete sessions[userId];
        }
    }
});

// =================================================================
// 4. LAUNCH BOT
// =================================================================
bot.launch(() => {
    console.log("Bot is running with the new advanced workflow!");
});
