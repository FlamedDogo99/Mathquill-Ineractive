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
function observeElement(element, property, callback, delay = 0) {
    let elementPrototype = Object.getPrototypeOf(element);
    if (elementPrototype.hasOwnProperty(property)) {
        let descriptor = Object.getOwnPropertyDescriptor(elementPrototype, property);
        Object.defineProperty(element, property, {
            get: function() {
                return descriptor.get.apply(this, arguments);
            },
            set: function () {
                let oldValue = this[property];
                descriptor.set.apply(this, arguments);
                let newValue = this[property];
                if (typeof callback == "function") {
                    setTimeout(callback.bind(this, oldValue, newValue), delay);
                }
                return newValue;
            }
        });
    }
}

function translatefieldDifferences(differences) { // Turns differences provided by Google's diff check algorithm into instructions on how to construct the string
  var translatedDifferences = [];
  var stringIndex = 0;
  differences.forEach((difference) => { 
      const differenceLength = difference[1].length
      const differenceType = difference[0]
      if(differenceType !== 0) {
          // Our difference is a deletion or addition
          translatedDifferences.push({0: differenceType, 1: stringIndex, 2: differenceLength, 3: difference[1]});
      }
      if(differenceType !== -1) {
          // Our difference is adding to the built string
          stringIndex += differenceLength
      }
  });
  return translatedDifferences;
}

function runChanges(stringOld, differences, reverse = false) {
  var newString = stringOld
    differences.forEach((difference) => {
      const startIndex = difference[1];
      const length = difference[2];
      const shouldDelete = (difference[0] * (reverse ? -1 : 1)  === -1) // If reverse is true, we're running the instructions backwards
      const stringValue = difference[3];
      if(shouldDelete) {
      newString = newString.slice(0, startIndex) + newString.slice(startIndex + length); // Delete section
      } else {
        newString = newString.slice(0, startIndex) + stringValue + newString.slice(startIndex) // Insert section
      }
    });
    return newString
}
function reverseChanges(stringNew, differences) {
  const reversedArray = differences.map((item,idx) => differences[differences.length-1-idx])
  return runChanges(stringNew, reversedArray, true)
}
var inputHistory = {0: 0, 1: "", 2: []}
var inputField = document.getElementById('latex-output')
function inputChange(event) {
  const previousState = inputHistory[1];
  const currentState = this.value
  const inputChanged = (previousState !== currentState)
  if(inputChanged) { // We want to check this because we are using a mutation observer to catch changes made programatically, could be dispatched twice 
    var diffObject = new diff_match_patch(); // Google's difference checker object
    const differences = diffObject.diff_main(previousState, currentState); // Get a list of insertions, deletions and no-action's
    const translatedDiferences = translatefieldDifferences(differences); // Translate the differences into instructions on how to build the changes
    const historyLength = inputHistory[2].length
    const stateIndex = inputHistory[0];
    if (historyLength > stateIndex) { // If we're at a stateIndex less than the length of the changes, it mean's we've undone states.
      // When we right, we need to erase the now-invalid saved "next states"
      inputHistory[2] = inputHistory[2].slice(0,stateIndex - historyLength);
    }
    inputHistory[2].push(translatedDiferences)
    inputHistory[0] += 1
    inputHistory[1] = this.value
  }
}
inputField.addEventListener("input", inputChange, false); // user input
observeElement(inputField, "value", inputChange); // Mutation observer for value, thank you https://stackoverflow.com/a/61975440

function catchUndo(event) {
  const controlZPressed = event.key === 'z' && (event.ctrlKey || event.metaKey)
  const shiftPressed = event.shiftKey;
  if(controlZPressed) {
    event.preventDefault();
    inputField.this = inputHistory[1];
    if(shiftPressed) {
      redoInput();
    } else {
      undoInput();
    }
  }
}
inputField.addEventListener("keydown", catchUndo, false);
document.getElementById('math-field').addEventListener("keydown", catchUndo, false);
function undoInput() {
  const stateIndex = inputHistory[0];
    if(stateIndex > 0) { // If we have changes to undo
    const previousState = inputHistory[2][stateIndex - 1]; // Get instruction to build current state
    const currentString = inputField.value; // Get the current state
    const previousString = reverseChanges(currentString, previousState); // Reverse the instruction to on the current state to get the previous state
    inputField.value = previousString;
    mathField.latex(previousString.replace(/\\newline/g, '\\embed{linebreak}'));
    inputHistory[1] = previousString;
    inputHistory[0] -= 1;
  }
}

function redoInput() {
  const stateIndex = inputHistory[0];
  const historyLength = inputHistory[2].length
  if(stateIndex < historyLength) { //If we're at a stateIndex less than the length of the changes, it mean's we can redo states
    const currentString = inputField.value // Get current state
    const nextState = inputHistory[2][stateIndex] // Get instructions for next state
    const nextString = runChanges(currentString, nextState); // Use instructions to construct next state
    inputField.value = nextString
    mathField.latex(nextString.replace(/\\newline/g, '\\embed{linebreak}'));
    inputHistory[1] = nextString
    inputHistory[0] += 1
  }
}