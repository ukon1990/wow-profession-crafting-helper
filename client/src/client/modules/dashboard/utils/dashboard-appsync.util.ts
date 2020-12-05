import {DashboardV2} from '../models/dashboard-v2.model';

export class DashboardAppsyncUtil {
  static reduce(boards: DashboardV2[]): any[] {
    return boards.map(board => {
      const copy = {
        ...board,
        columns: (board.columns || []).map(column => JSON.stringify(column)),
        rules: (board.rules || []).map(rule => JSON.stringify(rule)),
        itemRules: (board.itemRules || []).map(rule => JSON.stringify(rule)),
        sortRule: JSON.stringify(board.sortRule)
      };
      delete copy.data;
      delete copy.tsmShoppingString;
      delete copy.message;
      return copy;
    });
  }

  static unParseJSON(boards: any[]): DashboardV2[] {
    return boards.map(board => ({
      ...board,
      columns: board.columns.map(column => {
        try {
          return JSON.parse(column);
        } catch (e) {
          return undefined;
        }
      }).filter(isTruthy => isTruthy),
      rules: board.rules.map(rule => {
        try {
          return JSON.parse(rule);
        } catch (e) {
          return undefined;
        }
      }).filter(isTruthy => isTruthy),
      itemRules: board.itemRules.map(rule => {
        try {
          return JSON.parse(rule);
        } catch (e) {
          return undefined;
        }
      }).filter(isTruthy => isTruthy),
      sortRule: board.sortRule ? JSON.parse(board.sortRule) : undefined
    }));
  }
}
