const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { buildSitePicker } = require('../Services/onsiteSitePicker');

test('general job flow can discover a ROBOT site and continues to robot selection', async () => {
    const records = [{ _id: 'r1', name: 'Robot site', type: 'ROBOT' }, { _id: 'c1', name: 'Camera site', type: 'CCTV' }];
    const messages = [];
    const chain = data => ({ sort: () => chain(data), lean: async () => data });
    const handlers = {};
    class Bot { command() {} hears() {} on(event, handler) { handlers[event] = handler; } launch() {} }
    const context = vm.createContext({ console, process: { env: {} }, require: name => {
        if (name === './Config/env' || name === 'mongoose') return {};
        if (name === 'telegraf') return { Telegraf: Bot, Markup: { button: { callback: (text, callback_data) => ({ text, callback_data }) } } };
        if (name === './Services/onsiteSitePicker') return { buildSitePicker };
        if (name === './Models/CaseSupportModels') return { findOne: () => chain([]), create: async () => ({ caseNo: 'CS-TEST-0001' }) };
        if (name === './Models/CaseSupportOptions') return { getOptions: async () => ({ subjects: [] }) };
        if (name === './Models/Onsitemodels') return {
            Siteonsite: { findById: id => chain(records.find(item => item._id === id)), find: filter => {
                assert.equal(filter, undefined, 'site picker must not exclude other job types');
                return chain(records);
            } }, Onsite: { aggregate: async () => [] },
            RobotData: { find: () => chain([]) },
        };
        throw new Error(`Unexpected import: ${name}`);
    } });
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../onsitetelegram.js'), 'utf8'), context);
    context.ctx = { from: { id: 1 }, chat: { id: 1 }, reply: async (text, extra) => {
        messages.push({ text, extra }); return { message_id: 1 };
    }, telegram: { editMessageText: async (chat, id, inline, text, extra) => messages.push({ text, extra }) } };
    await vm.runInContext("sessions[1] = {jobType:'GENERAL'}; showSiteSelection(ctx, 1, {mode:'search',query:'ROBOT'})", context);
    assert.ok(messages[0].extra.reply_markup.inline_keyboard.flat().some(button => button.callback_data === 'SEL_SITE_r1'));
    context.ctx.callbackQuery = { data: 'SEL_SITE_r1' };
    context.ctx.answerCbQuery = async () => {};
    await handlers.callback_query(context.ctx);
    assert.equal(vm.runInContext('sessions[1].jobType', context), 'ROBOT');
    assert.equal(vm.runInContext('sessions[1].state', context), 'AWAITING_ROBOT_SELECTION');
});
