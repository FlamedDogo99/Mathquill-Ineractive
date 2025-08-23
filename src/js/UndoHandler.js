import {diff_match_patch} from "./DiffMatchPatch.js"
const diff = new diff_match_patch()
export class UndoHandler {
  constructor() {
    this.inputHistory = {
      0: 0,
      1: "",
      2: []
    }
    window.inputHistory = this.inputHistory;

  }

  undo(currentString) {
    const stateIndex = this.inputHistory[0];
    if (stateIndex > 0) { // If we have changes to undo
      const previousState = this.inputHistory[2][stateIndex - 1]; // Get instruction to build current state
      const previousString = this.reverseChanges(currentString, previousState); // Reverse the instruction to on the current state to get the previous state
      this.inputHistory[1] = previousString;
      this.inputHistory[0] -= 1;
      return previousString;
    }
    return null;
  }
  redo(currentValue) {
    const stateIndex = this.inputHistory[0];
    const historyLength = this.inputHistory[2].length
    if (stateIndex < historyLength) { //If we're at a stateIndex less than the length of the changes, it mean's we can redo states
      const currentString = currentValue // Get current state
      const nextState = this.inputHistory[2][stateIndex] // Get instructions for next state
      const nextString = this.applyEdits(currentString, nextState); // Use instructions to construct next state
      this.inputHistory[1] = nextString
      this.inputHistory[0] += 1
      return nextString;
    }
    return null;
  }

  translate(differences) { // Turns differences provided by Google's diff check algorithm into instructions on how to construct the string
    let translatedDifferences = [];
    let stringIndex = 0;
    differences.forEach((difference) => {
      const differenceLength = difference[1].length
      const differenceType = difference[0]
      if (differenceType !== 0) {
        // Our difference is a deletion or addition
        translatedDifferences.push({
          0: differenceType,
          1: stringIndex,
          2: differenceLength,
          3: difference[1]
        });
      }
      if (differenceType !== -1) {
        // Our difference is adding to the built string
        stringIndex += differenceLength
      }
    });
    return translatedDifferences;
  }
  change(currentState) {
    const previousState = this.inputHistory[1];
    const inputChanged = (previousState !== currentState)
    if (inputChanged) { // We want to check this because we are using a mutation observer to catch changes made programatically, could be dispatched twice
      const differences = diff.diff_main(previousState, currentState); // Get a list of insertions, deletions and no-action's
      const translatedDifferences = this.translate(differences); // Translate the differences into instructions on how to build the changes
      const historyLength = this.inputHistory[2].length
      const stateIndex = this.inputHistory[0];
      if (historyLength > stateIndex) { // If we're at a stateIndex less than the length of the changes, it mean's we've undone states.
        // When we right, we need to erase the now-invalid saved "next states"
        this.inputHistory[2] = this.inputHistory[2].slice(0, stateIndex - historyLength);
      }
      this.inputHistory[2].push(translatedDifferences)
      this.inputHistory[0] += 1
      this.inputHistory[1] = currentState
    }
  }
  applyEdits(stringOld, differences, reverse = false) {
    let newString = stringOld
    differences.forEach((difference) => {
      const startIndex = difference[1];
      const length = difference[2];
      const shouldDelete = (difference[0] * (reverse ? -1 : 1) === -1) // If reverse is true, we're running the instructions backwards
      const stringValue = difference[3];
      if (shouldDelete) {
        newString = newString.slice(0, startIndex) + newString.slice(startIndex + length); // Delete section
      } else {
        newString = newString.slice(0, startIndex) + stringValue + newString.slice(startIndex) // Insert section
      }
    });
    return newString
  }
  reverseChanges(stringNew, differences) {
    const reversedArray = differences.map((item, idx) => differences[differences.length - 1 - idx])
    return this.applyEdits(stringNew, reversedArray, true)
  }
}