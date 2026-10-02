import { groupRobotSites } from './robotSiteChartImage';

test('groups every site, keeps zeros and does not report partial totals as complete', () => {
  expect(groupRobotSites([
    { location: 'A', actualArea: 20, plannedArea: 30 },
    { location: ' A ', actualArea: 10, plannedArea: null },
    { location: 'B', actualArea: 0, plannedArea: 0 },
    { actualArea: null, plannedArea: 15 },
  ])).toEqual(expect.arrayContaining([
    { name: 'A', count: 2, actualArea: 30, plannedArea: null },
    { name: 'B', count: 1, actualArea: 0, plannedArea: 0 },
    { name: 'ไม่ระบุไซต์', count: 1, actualArea: null, plannedArea: 15 },
  ]));
});
