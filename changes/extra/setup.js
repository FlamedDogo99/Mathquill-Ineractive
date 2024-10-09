const L = 'left';
const R = 'right';

const MQ = MathQuill.getInterface(2);

function setupMathField() {
MQ.registerEmbed('linebreak', function() {
  const node = document.createElement('span');
  node.className = 'mq-line-break';
  return {
    htmlString: node.outerHTML,
    text: function() {
    return '\\newline';
  },
    latex: function() {
      return '\\newline';
    }
  };
});
mathFieldEl = $('#math-field');
const mathField = MQ.MathField(document.getElementById('math-field'), {
  spaceBehavesLikeTab: false,
  restrictMismatchedBrackets: false,
  autoCommands: 'alpha beta sqrt theta phi rho pi tau nthroot cbrt sum prod integral percent infinity infty cross ans frac int gamma Gamma delta Delta epsilon zeta eta Theta iota kappa lambda Lambda mu Xi xi Pi sigma Sigma upsilon Upsilon Phi chi psi Psi omega Omega',
  charsThatBreakOutOfSupSub: '',
  handlers: {
    edit: function() {
      let enteredMath = mathField.latex();
      enteredMath = enteredMath.replace(/\\embed{linebreak}/g, '\\newline');
      document.getElementById('latex-output').value = enteredMath;
    }
  }
});
undoManager = new UndoRedoManager(mathField, mathFieldEl);

document.getElementById('math-field').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    mathField.write('\\embed{linebreak}');
    let enteredMath = mathField.latex();
    enteredMath = enteredMath.replace(/\\embed{linebreak}/g, '\\newline');
    document.getElementById('latex-output').value = enteredMath;
  } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault();
    moveCursorManually(mathField, event.key === 'ArrowUp' ? 'up' : 'down');
  }
});

document.getElementById('math-field').addEventListener('paste', mathPaste, false);
return mathField;
}
latexSource = document.getElementById("latex-output")
function mathPaste(event) {
event.preventDefault();
event.stopPropagation();
let paste = (event.clipboardData || window.clipboardData).getData('Text');
paste = paste.replace(/\\newline/g, '\\embed{linebreak}');
mathField.__controller.cursor.deleteSelection();
mathField.write(paste);
mathField.__controller.textarea[0].value = '' // For some damn reason, this little shit stores the value of the text selection, and reappends it after we paste it. We don't want that
let enteredMath = mathField.latex();
enteredMath = enteredMath.replace(/\\embed{linebreak}/g, '\\newline');
document.getElementById('latex-output').value = enteredMath;
}

function sourceHandler(event) {
let newtext = this.value
if(newtext) {
  newtext = newtext.replace(/\\newline/g, '\\embed{linebreak}');
  mathField.latex(newtext);
  undoManager.saveState()
}
}
latexSource.addEventListener("input", sourceHandler, false);

function moveCursorManually(mathField, direction) {
const cursor = mathField.__controller.cursor;

let currentLine = getCurrentLine(cursor);
let targetLine = direction === 'up' ? currentLine - 1 : currentLine + 1;
let currentPos = getCursorPosInLine(cursor);
let targetNode = getLineNode(cursor, currentLine, targetLine, direction);

if (targetNode) {
  moveToClosestPosition(cursor, targetLine, targetNode, currentPos, direction);
}
}

function getCurrentLine(cursor) {
let line = 0;
let node = cursor[MQ.L];
while (node) {
  if (node.jQ && node.jQ.hasClass('mq-line-break')) {
    line++;
  }
  node = node[MQ.L];
}
return line;
}

function getCursorPosInLine(cursor) {
let pos = 0;
let node = cursor[MQ.L];
while (node) {
  if (node.jQ && node.jQ.hasClass('mq-line-break')) {
    break;
  }
  pos++;
  node = node[MQ.L];
}
return pos;
}

function getLineNode(cursor, currentLine, targetLine, direction) {
let line = currentLine;

if (direction == 'up') {
  var node = cursor[MQ.L];
  while (node) {
    if (node.jQ && node.jQ.hasClass('mq-line-break')) {
      node = node[MQ.L];
      line--;
    }
    if (targetLine == line) {
      return node[MQ.L];
    }
    node = node[MQ.L];
  }
  return null;

} else {
  var node = cursor[MQ.R];
  while (node) {
    if (node.jQ && node.jQ.hasClass('mq-line-break')) {
      node = node[MQ.R];
      line++;
    }
    if (targetLine == line) {
      return node;
    }
    node = node[MQ.R];
  }
  return null;
}
}

function moveToClosestPosition(cursor, targetLine, targetNode, currentPos, direction) {
cursor.insRightOf(targetNode);
let pos = getCursorPosInLine(cursor);

if (currentPos < pos) {
  let cnt = pos - currentPos;
  let node = targetNode;
  for (let i = 0; i < cnt; i++) {
    var tmpNode = node[MQ.L];
    if (!tmpNode) {
      break;
    }
    if (tmpNode.jQ && tmpNode.jQ.hasClass('mq-line-break')) {
      node = tmpNode;
      break;
    }
    node = tmpNode;
  }
  if (direction == "up" && targetLine == 0 && currentPos == 0) {
    while (cursor[MQ.L]) {
      cursor.insLeftOf(cursor[MQ.L]);
    }
  } else {
    cursor.insRightOf(node);
  }

} else if (currentPos > pos) {
  let cnt = currentPos - pos;
  let node = targetNode;
  for (let i = 0; i < cnt; i++) {
  var tmpNode = node[MQ.R];
  if (!tmpNode) break;
    if (tmpNode.jQ && tmpNode.jQ.hasClass('mq-line-break')) {
      break;
    }
    node = tmpNode;
  }
  cursor.insRightOf(node);
}

cursor.show();
}
const mathField = setupMathField();