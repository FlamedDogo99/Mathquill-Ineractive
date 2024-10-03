var Environments = {};

LatexCmds.begin = class extends MathCommand {
  parser() {
    var string = Parser.string;
    var regex = Parser.regex;
    return string('{')
      .then(regex(/^[a-z]+/i))
      .skip(string('}'))
      .then(function (env) {
          return (Environments[env] ?
            Environments[env]().parser() :
            Parser.fail('unknown environment type: '+env)
          ).skip(string('\\end{'+env+'}'));
      })
  }
}

class Environment extends MathCommand {
  template = [['\\begin{', '}'], ['\\end{', '}']];
  wrappers() {
    return [
      this.template[0].join(this.environment),
      this.template[1].join(this.environment)
    ];
  }
}

class Matrix extends Environment {
  constructor(leftParentheses,rightParentheses, environment) {
    super();
    this.delimiters = {
      column: '&',
      row: '\\\\'
    }
    this.parentheses = {
      left: leftParentheses,
      right: rightParentheses
    }
    this.environment = environment
  }

  latex() {
    var self = this;
    var latex = '';
    var row;

    self.eachChild(function (cell) {
      if (typeof row !== 'undefined') {
        latex += (row !== cell.row) ?
          self.delimiters.row :
          self.delimiters.column;
      }
      row = cell.row;
      latex += cell.latex();
    });

    return this.wrappers().join(latex);
  };
  html() {
    var cells = [], trs = '', i=0, row;

    function parenHtml(paren, isRight) {
      if(paren) {
        var parenSymbol = SVG_SYMBOLS[paren];
        return '<span style="width:' +
                parenSymbol.width +
                '" class="mq-paren mq-bracket-' + (isRight ? 'r' : 'l') + ' mq-scaled">' +
                parenSymbol.html +
                '</span>';
      }
      return ''
    }

    // Build <tr><td>.. structure from cells
    this.eachChild(function (cell) {
      if (row !== cell.row) {
        row = cell.row;
        trs += '<tr>$tds</tr>';
        cells[row] = [];
      }
      cells[row].push('<td>&'+(i++)+'</td>');
    });
    const = matrixCellMargin = SVG_SYMBOLS[this.parentheses.left].width;
    this.htmlTemplate =
        '<span class="mq-matrix mq-non-leaf mq-bracket-container">'
      +   parenHtml(this.parentheses.left, false)
      +   '<table class="mq-non-leaf" style="margin-left:' + matrixCellMargin + ';margin-right:' + matrixCellMargin + '">'
      +     trs.replace(/\$tds/g, function () {
              return cells.shift().join('');
            })
      +   '</table>'
      +   parenHtml(this.parentheses.right, true)
      + '</span>'
    ;

    return super.html();
  };
  createBlocks() {
    this.blocks = [
      new MatrixCell(0, this),
      new MatrixCell(0, this),
      new MatrixCell(1, this),
      new MatrixCell(1, this)
    ];
  };
  parser() {
    var self = this;
    var optWhitespace = Parser.optWhitespace;
    var string = Parser.string;

    return optWhitespace
    .then(string(self.delimiters.column)
      .or(string(self.delimiters.row))
      .or(latexMathParser.block))
    .many()
    .skip(optWhitespace)
    .then(function(items) {
      var blocks = [];
      var row = 0;
      self.blocks = [];

      function addCell() {
        self.blocks.push(new MatrixCell(row, self, blocks));
        blocks = [];
      }

      for (var i=0; i<items.length; i+=1) {
        if (items[i] instanceof MathBlock) {
          blocks.push(items[i]);
        } else {
          addCell();
          if (items[i] === self.delimiters.row) row+=1;
        }
      }
      addCell();
      self.autocorrect();
      return Parser.succeed(self);
    });
  };
  finalizeTree() {
    var table = this.jQ.find('table');
    table.toggleClass('mq-rows-1', table.find('tr').length === 1);
    this.relink();
  };
  // Enter the matrix at the top or bottom row if updown is configured.
  getEntryPoint(dir, cursor, updown) {
    if (updown === 'up') {
      if (dir === L) {
        return this.blocks[this.rowSize - 1];
      } else {
        return this.blocks[0];
      }
    } else { // updown === 'down'
      if (dir === L) {
        return this.blocks[this.blocks.length - 1];
      } else {
        return this.blocks[this.blocks.length - this.rowSize];
      }
    }
  };
  // Exit the matrix at the first and last columns if updown is configured.
  atExitPoint(dir, cursor) {
      // Which block are we in?
      var i = this.blocks.indexOf(cursor.parent);
      if (dir === L) {
        // If we're on the left edge and moving left, we should exit.
        return i % this.rowSize === 0;
      } else {
        // If we're on the right edge and moving right, we should exit.
        return (i + 1) % this.rowSize === 0;
      }
  };
  moveTowards(dir, cursor, updown) {
    var entryPoint = updown && this.getEntryPoint(dir, cursor, updown);
    cursor.insAtDirEnd(-dir, entryPoint || this.ends[-dir]);
  };

  // Set up directional pointers between cells
  relink() {
    var blocks = this.blocks;
    var rows = [];
    var row, column, cell;

    // The row size will be used by other functions down the track.
    // Begin by assuming we're a one-row matrix, and we'll overwrite this if we find another row.
    this.rowSize = blocks.length;

    // Use a for loop rather than eachChild
    // as we're still making sure children()
    // is set up properly
    for (var i=0; i<blocks.length; i+=1) {
      cell = blocks[i];
      if (row !== cell.row) {
        if (cell.row === 1) {
          // We've just finished iterating the first row.
          this.rowSize = column;
        }
        row = cell.row;
        rows[row] = [];
        column = 0;
      }
      rows[row][column] = cell;

      // Set up horizontal linkage
      cell[R] = blocks[i+1];
      cell[L] = blocks[i-1];

      // Set up vertical linkage
      if (rows[row-1] && rows[row-1][column]) {
        cell.upOutOf = rows[row-1][column];
        rows[row-1][column].downOutOf = cell;
      }

      column+=1;
    }

    // set start and end blocks of matrix
    this.ends[L] = blocks[0];
    this.ends[R] = blocks[blocks.length-1];
  };
  // Ensure consistent row lengths
  autocorrect = function(rows) {
    var lengths = [], rows = [];
    var blocks = this.blocks;
    var maxLength, shortfall, position, row, i;

    for (i=0; i<blocks.length; i+=1) {
      row = blocks[i].row;
      rows[row] = rows[row] || [];
      rows[row].push(blocks[i]);
      lengths[row] = rows[row].length;
    }

    maxLength = Math.max.apply(null, lengths);
    if (maxLength !== Math.min.apply(null, lengths)) {
      // Pad shorter rows to correct length
      for (i=0; i<rows.length; i+=1) {
        shortfall = maxLength - rows[i].length;
        while (shortfall) {
          position = maxLength*i + rows[i].length;
          blocks.splice(position, 0, new MatrixCell(i, this));
          shortfall-=1;
        }
      }
      this.relink();
    }
  };
  deleteCell(currentCell) {
    var rows = [], columns = [], myRow = [], myColumn = [];
    var blocks = this.blocks, row, column;

    // Create arrays for cells in the current row / column
    this.eachChild(function (cell) {
      if (row !== cell.row) {
        row = cell.row;
        rows[row] = [];
        column = 0;
      }
      columns[column] = columns[column] || [];
      columns[column].push(cell);
      rows[row].push(cell);

      if (cell === currentCell) {
        myRow = rows[row];
        myColumn = columns[column];
      }

      column+=1;
    });

    function isEmpty(cells) {
      var empties = [];
      for (var i=0; i<cells.length; i+=1) {
        if (cells[i].isEmpty()) empties.push(cells[i]);
      }
      return empties.length === cells.length;
    }

    function remove(cells) {
      for (var i=0; i<cells.length; i+=1) {
        if (blocks.indexOf(cells[i]) > -1) {
          cells[i].remove();
          blocks.splice(blocks.indexOf(cells[i]), 1);
        }
      }
    }

    if (isEmpty(myRow) && myColumn.length > 1) {
      row = rows.indexOf(myRow);
      // Decrease all following row numbers
      this.eachChild(function (cell) {
        if (cell.row > row) cell.row-=1;
      });
      // Dispose of cells and remove <tr>
      remove(myRow);
      this.jQ.find('tr').eq(row).remove();
    }
    if (isEmpty(myColumn) && myRow.length > 1) {
      remove(myColumn);
    }
    this.finalizeTree();
  };
  backspace(cell, dir, cursor, finalDeleteCallback) {
    var dirwards = cell[dir];
    if (cell.isEmpty()) {
      this.deleteCell(cell);
      while (dirwards &&
        dirwards[dir] &&
        this.blocks.indexOf(dirwards) === -1) {
          dirwards = dirwards[dir];
      }
      if (dirwards) {
        cursor.insAtDirEnd(-dir, dirwards);
      }
      if (this.blocks.length === 1 && this.blocks[0].isEmpty()) {
        finalDeleteCallback();
        this.finalizeTree();
      }
      this.bubble(function (node) {
        node.reflow();
        return undefined;
      });
    }
  };
}

Environments.matrix = () => new Matrix("", "", "matrix");
Environments.pmatrix = () => new Matrix("(", ")", "pmatrix");
Environments.bmatrix = () => new Matrix("[", "]", "bmatrix");
Environments.Bmatrix = () => new Matrix("{", "}", "Bmatrix");
Environments.vmatrix = () => new Matrix("|", "|", "vmatrix");
Environments.Vmatrix = () => new Matrix("&#8741;", "&#8741;", "Vmatrix");
Environments.cases = () => new Matrix("{", "", "cases");



class MatrixCell extends MathBlock {
  constructor(row, parent, replaces) {
    super(row, parent, replaces);
    this.row = row;
    if (parent) {
      this.adopt(parent, parent.ends[R], 0);
    }
    if (replaces) {
      for (var i=0; i<replaces.length; i++) {
        replaces[i].children().adopt(this, this.ends[R], 0);
      }
    }
  }
  deleteOutOf(dir, cursor) {
    this.parent.backspace(this, dir, cursor, () => {
      return super.deleteOutOf(dir, cursor);
    });
  };
  moveOutOf(dir, cursor, updown) {
    var atExitPoint = updown && this.parent.atExitPoint(dir, cursor);
    // Step out of the matrix if we've moved past an edge column
    if (!atExitPoint && this[dir]) cursor.insAtDirEnd(-dir, this[dir]);
    else cursor.insDirOf(dir, this.parent);
  };
}
