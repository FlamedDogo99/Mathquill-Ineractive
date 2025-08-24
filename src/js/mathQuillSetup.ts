import {MathQuill} from "./mathquill.min";
import type {v3, Cursor, MQNode} from "../types/mathquill"

import $ from "jquery";
declare let global: any;
global.jQuery = $;

const mathFieldElement = document.getElementById("math-field") as HTMLSpanElement;
const latexOutput = document.getElementById("latex-output") as HTMLInputElement
const MQ = MathQuill.getInterface(2) as v3.API;
MQ.registerEmbed("linebreak", function () {
  const node = document.createElement("span");
  node.className = "mq-line-break";
  return {
    htmlString: node.outerHTML,
    text: function () {
      return "\\newline";
    },
    latex: function () {
      return "\\newline";
    },
  };
});
export const mathField = MQ.MathField(mathFieldElement, {
  spaceBehavesLikeTab: false,
  restrictMismatchedBrackets: false,
  autoCommands:
    "alpha beta sqrt theta phi rho pi tau nthroot cbrt sum prod integral percent infinity infty cross ans frac int gamma Gamma delta Delta epsilon zeta eta Theta iota kappa lambda Lambda mu Xi xi Pi sigma Sigma upsilon Upsilon Phi chi psi Psi omega Omega",
  charsThatBreakOutOfSupSub: "",
  handlers: {
    edit: function () {
      let enteredMath = mathField.latex();
      enteredMath = enteredMath.replace(/\\embed{linebreak}/g, "\\newline");
        latexOutput.value = enteredMath;
    },
  },
});

mathFieldElement.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    mathField.write("\\embed{linebreak}");
    let enteredMath = mathField.latex();
    enteredMath = enteredMath.replace(/\\embed{linebreak}/g, "\\newline");
      latexOutput.value = enteredMath;
  } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
    event.preventDefault();
    moveCursorManually(mathField, event.key === "ArrowUp" ? "up" : "down");
  }
});

mathFieldElement.addEventListener("paste", mathPaste, false);
let urlParams = new URL(document.location.toString()).searchParams;
let encodedLatex = urlParams.get("latex");
if (encodedLatex) {
  let decodedLatex = decodeURIComponent(encodedLatex);
  decodedLatex = decodedLatex.replace(/\\newline/g, "\\embed{linebreak}");
  mathField.latex(decodedLatex);
    latexOutput.value = decodedLatex;
}
// This is a really dumb way of making our dom scroll to where we're writing
// We are PRAYING that making the span element containing the textArea position:static doesn't break anything
// so that we can use position:absolute on the textArea to move it relative to the document
const mathTextArea = mathField.__controller.textarea;
const mathSpan = mathField.__controller.textareaSpan;
mathSpan.style.position = "static";
mathTextArea.style.position = "absolute";
mathFieldElement.addEventListener("click", moveMathTextArea, false);
mathFieldElement.addEventListener("keydown", moveMathTextArea, false);

function moveMathTextArea() {
  const cursorElement = mathField.__controller.cursor.cursorElement;
  if (cursorElement) {
    const newOffset =
      window.scrollY + cursorElement.getBoundingClientRect().top;
    mathTextArea.style.top = newOffset + "px";
  }
}

function mathPaste(event: ClipboardEvent) {
  event.preventDefault();
  event.stopPropagation();
  // @ts-ignore
    let paste = (event.clipboardData || window.clipboardData).getData("Text");
  paste = paste.replace(/\\newline/g, "\\embed{linebreak}");
  mathField.__controller.cursor.deleteSelection();
  mathField.write(paste);
  mathField.__controller.textarea.value = ""; // For some damn reason, this little shit stores the value of the text selection, and reappends it after we paste it. We don't want that
  let enteredMath = mathField.latex();
  enteredMath = enteredMath.replace(/\\embed{linebreak}/g, "\\newline");
  latexOutput.value = enteredMath;
}

function sourceHandler() {
  let updatedText = latexOutput.value;
  if (updatedText) {
    mathField.latex(updatedText.replace(/\\newline/g, "\\embed{linebreak}"));
  }
}
latexOutput.addEventListener("input", sourceHandler, false);

function moveCursorManually(mathField: v3.EditableMathQuill, direction: string) {
  const cursor = mathField.__controller.cursor;

  let currentLine = getCurrentLine(cursor);
  let targetLine = direction === "up" ? currentLine - 1 : currentLine + 1;
  let currentPos = getCursorPosInLine(cursor);
  let targetNode = getLineNode(cursor, currentLine, targetLine, direction);

  if (targetNode) {
    moveToClosestPosition(
      cursor,
      targetLine,
      targetNode,
      currentPos,
      direction,
    );
  }
}

function getCurrentLine(cursor: Cursor): number {
  let line = 0;
  let node = cursor[MQ.L];
  while (node) {
    if (node.jQ && node.jQ.hasClass("mq-line-break")) {
      line++;
    }
    node = node[MQ.L];
  }
  return line;
}

function getCursorPosInLine(cursor: Cursor) {
  let pos = 0;
  let node = cursor[MQ.L];
  while (node) {
    if (node.jQ && node.jQ.hasClass("mq-line-break")) {
      break;
    }
    pos++;
    node = node[MQ.L];
  }
  return pos;
}

function getLineNode(cursor: Cursor, currentLine: number, targetLine: number, direction: string) {
  let line = currentLine;
  if (direction === "up") {
    let node = cursor[MQ.L];
    while (node) {
      if (node.jQ && node.jQ.hasClass("mq-line-break")) {
        node = node[MQ.L];
        line--;
      }
      if (targetLine === line) {
        return node[MQ.L];
      }
      node = node[MQ.L];
    }
    return null;
  } else {
    let node = cursor[MQ.R];
    while (node) {
      if (node.jQ && node.jQ.hasClass("mq-line-break")) {
        node = node[MQ.R];
        line++;
      }
      if (targetLine === line) {
        return node;
      }
      node = node[MQ.R];
    }
    return null;
  }
}

function moveToClosestPosition(
  cursor: Cursor,
  targetLine: number ,
  targetNode: MQNode,
  currentPos: number,
  direction: string,
) {
  cursor.insRightOf(targetNode);
  let pos = getCursorPosInLine(cursor);

  if (currentPos < pos) {
    let cnt = pos - currentPos;
    let node = targetNode;
    for (let i = 0; i < cnt; i++) {
      let tempNode = node[MQ.L];
      if (!tempNode) {
        break;
      }
      if (tempNode.jQ && tempNode.jQ.hasClass("mq-line-break")) {
        node = tempNode;
        break;
      }
      node = tempNode;
    }
    if (direction === "up" && targetLine === 0 && currentPos === 0) {
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
      let tmpNode = node[MQ.R];
      if (!tmpNode) break;
      if (tmpNode.jQ && tmpNode.jQ.hasClass("mq-line-break")) {
        break;
      }
      node = tmpNode;
    }
    cursor.insRightOf(node);
  }
  cursor.show();
}
