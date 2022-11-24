import Logger from './Logger';

export default class Functions {
  /**
   * Escapes regex characters in a string
   * @param  {string} string
   * @returns {string}
   */

  public static escapeRegex(str: string): string {
    try {
      return str.replace(/[.*+?^$`{}()|[\]\\]/g, `\\$&`);
    } catch (e) {
      Logger.error(e.stack);
    }
  }
}