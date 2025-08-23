import * as htmlToImage from "html-to-image/dist/html-to-image";
import {mathField} from "./js/mathQuillSetup.js";
import {handleTouches} from "./js/touchHandler.js";
import {observeElement} from "./js/elementObserver.js"
import {UndoHandler} from "./js/UndoHandler.js"

const mqStandAlone = '(display-mode: standalone)';
const isPWA = navigator.standalone || window.matchMedia(mqStandAlone).matches

const undoHandler = new UndoHandler();
const inputField = document.getElementById('latex-output');
const latexSource = document.getElementById("latex-output")


const getHexColor = (colorStr) => {
  const colorDiv = document.createElement('div');
  colorDiv.style.color = colorStr;
  const colors = window.getComputedStyle(document.body.appendChild(colorDiv))
    .color.match(/\d+/g)
    .map((a) => {
      return parseInt(a,10);
    });
  document.body.removeChild(colorDiv);
  return (colors.length >= 3) ? '#' + (((1 << 24) + (colors[0] << 16) + (colors[1] << 8) + colors[2]).toString(16).slice(1)) : false;
}


const insertLatex = (beginLatex, endLatex) => {
  const mathFieldController = mathField.__controller
  const mathFieldSelection = mathFieldController.cursor.selection
  const selectedValue = !mathFieldSelection ? "" : mathFieldSelection.join('latex').replace(/\\newline/g, '\\embed{linebreak}');
  mathFieldController.cursor.deleteSelection();
  const replacedValue = beginLatex + selectedValue + endLatex;
  mathField.write(replacedValue)
}

let mathFieldElement = document.getElementById('math-field')

const undoButton = document.getElementById('undo');
const redoButton = document.getElementById('redo');
const copyButton = document.getElementById('copy');
const pasteButton = document.getElementById('paste');
const urlButton = document.getElementById('updateUrl');
const printButton = document.getElementById('print');
const colorButton = document.getElementById('color')

const preventButton = (event) => {
  event.preventDefault();
  return false
}
const toolbarButtons = document.getElementsByClassName("toolbarButton");
for(const button of toolbarButtons) {
  button.addEventListener("pointerdown", preventButton, false);
}
const undoInput = () => {
  const previousString = undoHandler.undo(inputField.value);
  if(previousString !== null) {
    inputField.value = previousString;
    mathField.latex(previousString.replace(/\\newline/g, '\\embed{linebreak}'));
  }
}

const redoInput = () => {
  const nextString = undoHandler.redo(inputField.value);
  if(nextString !== null) {
    inputField.value = nextString
    mathField.latex(nextString.replace(/\\newline/g, '\\embed{linebreak}'));
  }
}

const copyMathFieldSelection = () => {
  if (mathField.__controller.cursor.selection) {
    const textToCopy = mathField.__controller.cursor.selection.join('latex');
    navigator.clipboard.writeText(`${textToCopy}`); // This appears to work over the majority of browsers
    mathField.focus();
  }
}
const attemptPaste = () => {
  navigator.clipboard.readText()
    .then(text => {
      const transfer = new window.DataTransfer();
      transfer.setData('text/plain', text);
      document.activeElement.dispatchEvent(new ClipboardEvent('paste', { // on iOS this will present the user the ability to hit the paste button
        bubbles: true,
        cancelable: true,
        clipboardData: transfer
      }));
    });
}
const updateUrl = () => {
  const documentUrl = new URL(window.location.href);
  documentUrl.searchParams.set('latex', latexSource.value);
  window.history.replaceState({}, '', documentUrl.toString());
  if(isPWA) {
    navigator.clipboard.writeText(`${location.href}`)
  }
}
const attemptPrint = () => {
  const mathNode = document.querySelector("#math-field > span.mq-root-block");
  mathNode.style.width = 'auto'
  htmlToImage.toPng(mathNode)
    .then(function (dataUrl) {
      const link = document.createElement('a');
      link.download = 'mathquill-export.png';
      link.href = typeof dataUrl === "string" ? dataUrl : "";
      link.click();
      mathNode.style.width = ''
    })
    .catch(function (error) {
      console.error('[htmlToImage]', error);
      mathNode.style.width = ''
    });
}
const addColor = () => {
  const colorString = prompt("Enter a css color, hex, rgb etc.")
  if(colorString) {
    const realColor = getHexColor(colorString)
    insertLatex('\\textcolor{' + realColor +'}{', '}')
    mathField.focus()
  }
}
undoButton.addEventListener("click", undoInput, false);
redoButton.addEventListener("click", redoInput, false);
copyButton.addEventListener("click", copyMathFieldSelection, false);
pasteButton.addEventListener("click", attemptPaste, false);
urlButton.addEventListener("click", updateUrl, false);
printButton.addEventListener("click", attemptPrint, false);
colorButton.addEventListener("click", addColor, false);


mathFieldElement.addEventListener("touchstart", handleTouches, true)
document.addEventListener("touchmove", handleTouches, true)
document.addEventListener("touchend", handleTouches, true)
document.addEventListener("touchcancel", handleTouches, true)


const inputChange = () => {
  undoHandler.change(inputField.value);
}

inputField.addEventListener("input", inputChange, false);
observeElement(inputField, "value", inputChange); // Mutation observer for value, thank you https://stackoverflow.com/a/61975440


function catchUndo(event) {
  const controlZPressed = event.key === 'z' && (event.ctrlKey || event.metaKey)
  const shiftPressed = event.shiftKey;
  if (controlZPressed) {
    event.preventDefault();
    if (shiftPressed) {
      redoInput();
    } else {
      undoInput();
    }
  }
}
function catchSoftwareUndo(event) {
  if (event.inputType === 'historyUndo') {
    event.preventDefault();
    undoInput();
  }
  if (event.inputType === 'historyRedo') {
    event.preventDefault();
    redoInput();
  }
}

inputField.addEventListener("keydown", catchUndo, false); // catch undo/redo keypress from textarea
mathFieldElement.addEventListener("keydown", catchUndo, false); // catch undo/redo kepress from matharea

inputField.addEventListener('beforeinput', catchSoftwareUndo, false);
mathFieldElement.getElementsByTagName('textarea')[0].addEventListener('beforeinput', catchSoftwareUndo, false);
