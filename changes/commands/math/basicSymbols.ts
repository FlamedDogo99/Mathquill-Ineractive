// Really really poorly made matrix support, abusing _{} and ^{}
// Latex Fragment allows us to replace a arbitrary string with a latex expression, so we can piggyback off of that
class MatrixHack extends LatexFragment {
  constructor(frontBracket, endBracket) {
    this.frontBracket = frontBracket;
    this.endBracket = endBracket;
  }
  ceilingRound2(x) {
    x--
    x = x | (x >> 1);
    x = x | (x >> 2);
    x = x | (x >> 4);
    x = x | (x >> 8);
    x = x | (x >> 16);
    x = x | (x >> 32);
    return x + 1
  }
  makeCell(number, size, flip) {
      const possibleBottom = Math.min(number, size);
      const possibleTop = number - possibleBottom;
      const top = flip ? possibleBottom : possibleTop;
      const bottom = flip ? possibleTop : possibleBottom;
      const newSize = size >> 1;
      const bottomString = (bottom == 0) ? "" : ("_{" + ((newSize > 0) ? this.makeCell(bottom, newSize, flip) : "") + "}");
      const topString = (top == 0) ? "" : ("^{" + ((newSize > 0) ? this.makeCell(top, newSize, flip) : "") + "}");
      return bottomString + topString;
  }

  makeCenteredColumn(size) {
    const nearestPower2 = this.ceilingRound2(size) >> 1;
    const top = Math.floor(size * 0.5);
    const bottom = size - top;
    return "^{" + this.makeCell(top, nearestPower2, false) + "}_{" + this.makeCell(bottom, nearestPower2, true) + "}";
  }
  makeMatrix(columns, rows) {
    return this.frontBracket + (this.makeCenteredColumn(rows) + "\\ \\ ").repeat(columns).slice(0,-4) + this.endBracket
  }
  createLeftOf(cursor: Cursor) {
    const inputColumns = parseInt(prompt("Columns:", "2"), 10);
    const inputRows = parseInt(prompt("Rows:", "2"), 10);
    const resultLatex = this.makeMatrix(inputRows, inputColumns);
    this.latexStr = resultLatex;
    return super.createLeftOf(cursor)
  }
}

LatexCmds['matrix'] = () => new MatrixHack('', '');
LatexCmds['pmatrix'] = () => new MatrixHack('\\left(', '\\right)');
LatexCmds['bmatrix'] = () => new MatrixHack('\\left[', '\\right]');
LatexCmds['Bmatrix'] = () => new MatrixHack('\\left\\{', '\\right\\}');
LatexCmds['vmatrix'] = () => new MatrixHack('\\left|', '\\right|');
LatexCmds['Vmatrix'] = () => new MatrixHack('\\left\\lVert', '\\right\\rVert');


// Replaces line 576
var mostOps = (
    'arg deg det dim exp gcd hom inf ker lg lim ln log max min mod sup' +
    ' limsup liminf injlim projlim Pr'
  ).split(' ');