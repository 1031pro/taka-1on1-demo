/* Ver.2.1：回答値1〜5、欠測NA。表示用は最低点を差し引いて100点換算する。 */
window.SCORING = {
  isAnswer: value => value === 'NA' || (Number.isInteger(value) && value >= 1 && value <= 5),
  score(values, reports) {
    if (!Array.isArray(values) || values.length !== 21 ||
        Array.from(values).some(value => !this.isAnswer(value))) {
      throw new RangeError('回答は1〜5またはNAで、21問すべて必要です。');
    }
    return reports.map((report, index) => {
      const valid = report.questions.map(n => values[n - 1]).filter(value => value !== 'NA');
      const total = valid.reduce((a, b) => a + b, 0);
      return {
        index, name: report.name, count: valid.length,
        score: valid.length === 3 ? total : null,
        display: valid.length === 3 ? Math.round((total - 3) / 12 * 100) : null,
        reference: valid.length === 2 ? total / 2 * 3 : null
      };
    });
  }
};
