const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSitePicker } = require('../Services/onsiteSitePicker');

const sites = Array.from({ length: 14 }, (_, i) => ({ _id: String(i), name: `ไซต์ ${i}`, type: i < 7 ? 'ROBOT' : 'Camera', Refcode: `REF-${i}` }));
const choices = menu => menu.buttons.flat().filter(button => button.callback_data.startsWith('SEL_SITE_'));

test('searches by type with partial and case-insensitive matches across pages', () => {
    for (const query of ['ROBOT', 'robot', ' rob ']) {
        const first = choices(buildSitePicker(sites, [], { mode: 'search', query }));
        const second = choices(buildSitePicker(sites, [], { mode: 'search', query, page: 1 }));
        assert.deepEqual([...first, ...second].map(button => button.callback_data),
            sites.filter(site => site.type === 'ROBOT').map(site => `SEL_SITE_${site._id}`));
    }
    assert.equal(choices(buildSitePicker(sites.filter(site => site.type !== 'ROBOT'), [], { mode: 'search', query: 'ROBOT' })).length, 0);
});

test('finds Plan B by Planb regardless of spaces, case, or nonbreaking spaces', () => {
    const records = [
        { _id: 'a', name: 'Plan B HQ', type: 'CCTV', Refcode: '-' },
        { _id: 'b', name: 'PLAN\u00a0B billboard', type: 'CCTV', Refcode: '-' },
        { _id: 'c', name: 'Another site', type: 'CCTV', Refcode: 'PB 123' },
    ];
    for (const query of ['Planb', 'plan b', ' PLAN  B ']) {
        assert.deepEqual(choices(buildSitePicker(records, [], { mode: 'search', query })).map(item => item.callback_data), ['SEL_SITE_a', 'SEL_SITE_b']);
    }
    assert.equal(choices(buildSitePicker(records, [], { mode: 'search', query: 'PB123' }))[0].callback_data, 'SEL_SITE_c');
});

test('searches partial names and reference codes without case sensitivity or regex interpretation', () => {
    assert.equal(choices(buildSitePicker(sites, [], { mode: 'search', query: ' ref-13 ' }))[0].callback_data, 'SEL_SITE_13');
    assert.equal(choices(buildSitePicker(sites, [], { mode: 'search', query: 'ไซต์ 13' })).length, 1);
    const empty = buildSitePicker(sites, [], { mode: 'search', query: '[.*' });
    assert.equal(choices(empty).length, 0);
    assert.ok(empty.buttons.flat().some(button => button.callback_data === 'ADD_ITEM_SITE'));
});

test('shows up to five recent sites in order and ignores deleted or unavailable sites', () => {
    const menu = buildSitePicker(sites, ['deleted', '13', '5', '1', '2', '3', '4']);
    assert.deepEqual(choices(menu).map(button => button.callback_data), ['SEL_SITE_13', 'SEL_SITE_5', 'SEL_SITE_1', 'SEL_SITE_2', 'SEL_SITE_3']);
    assert.match(buildSitePicker(sites).text, /ยังไม่มีไซต์ล่าสุด/);
});

test('paginates results with six sites per page and clamps invalid pages', () => {
    assert.equal(choices(buildSitePicker(sites, [], { mode: 'all' })).length, 6);
    const second = buildSitePicker(sites, [], { mode: 'all', page: 1 });
    assert.equal(choices(second)[0].callback_data, 'SEL_SITE_6');
    assert.ok(second.buttons.flat().some(button => button.callback_data === 'SITE_PAGE_0'));
    assert.equal(choices(buildSitePicker(sites, [], { mode: 'all', page: 99 })).length, 2);
});

test('selects types directly and paginates within the chosen type', () => {
    const menu = buildSitePicker(sites, [], { mode: 'types' });
    assert.equal(menu.buttons[0][0].text, 'ROBOT');
    assert.equal(menu.buttons[1][0].callback_data, 'SITE_TYPE_1');
    const filtered = buildSitePicker(sites, [], { mode: 'all', type: 'Camera', page: 1 });
    assert.deepEqual(choices(filtered).map(button => button.callback_data), ['SEL_SITE_13']);
});
