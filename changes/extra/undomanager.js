const TAB_KEYCODE = 9;
const ENTER_KEYCODE = 13;
const SHIFT_KEYCODE = 16;
const CTRL_KEYCODE = 17;
const ALT_KEYCODE = 18;
const CAPSLOCK_KEYCODE = 20;
const ESCAPE_KEYCODE = 27;
const PAGEUP_KEYCODE = 33;
const PAGEDOWN_KEYCODE = 34;
const END_KEYCODE = 35;
const HOME_KEYCODE = 36;
const LEFTARROW_KEYCODE = 37;
const UPARROW_KEYCODE = 38;
const RIGHTARROW_KEYCODE = 39;
const DOWNARROW_KEYCODE = 40;
const V_KEYCODE = 86;
const Y_KEYCODE = 89;
const Z_KEYCODE = 90;
const ALTGR_KEYCODE = 225;

const unaffectingKeys = [TAB_KEYCODE,
                        ENTER_KEYCODE,
                        SHIFT_KEYCODE,
                        CTRL_KEYCODE,
                        ALT_KEYCODE,
                        CAPSLOCK_KEYCODE,
                        ESCAPE_KEYCODE,
                        LEFTARROW_KEYCODE,
                        PAGEUP_KEYCODE,
                        PAGEDOWN_KEYCODE,
                        END_KEYCODE,
                        HOME_KEYCODE,
                        LEFTARROW_KEYCODE,
                        UPARROW_KEYCODE,
                        RIGHTARROW_KEYCODE,
                        DOWNARROW_KEYCODE,
                        ALTGR_KEYCODE];

function UndoRedoManager(pMathField, pElement) {
    this.mathField = pMathField;
    this.contentEl = pElement;
    this.typedHistory = [this.mathField.latex()];
    this.ctrlIsDown = false;
    this.YIsDown = false;
    this.ZIsDown = false;
    this.currentState = 0;
    this.buffSize = 50;

    this.rearrangeTypedArray = () => {
        if (this.typedHistory.length > this.buffSize) {
            let sizeOverflow = this.typedHistory.length - this.buffSize;
            this.currentState = this.currentState - sizeOverflow;
            this.typedHistory = this.typedHistory.slice(this.buffSize * (-1));
        }
    };

    this.isKeyIsUnaffecting = (pKey) => {
        return unaffectingKeys.includes(pKey);
    };

    this.checkIfSpecialKeysAreUpAndSetStates = (e) => {
      this.ctrlIsDown = (e.metaKey || e.ctrlKey);
      const zPressed = (e.key == 'z' || e.which == Z_KEYCODE || e.keyCode == Z_KEYCODE)
      this.ZIsDown = zPressed && !e.shiftKey
      this.YIsDown = zPressed && e.shiftKey
    }

    this.checkIfSpecialKeysAreDownAndSetStates = (e) => {
      this.ctrlIsDown = (e.metaKey === true || e.ctrlKey === true);
      const zPressed = (e.key == 'z' || e.which == Z_KEYCODE || e.keyCode == Z_KEYCODE)
      this.ZIsDown = zPressed && (e.shiftKey === false)
      this.YIsDown = zPressed && (e.shiftKey === true)
    }

    this.saveState = () => {
        if (this.currentState !== (this.typedHistory.length - 1)) {
            this.typedHistory = this.typedHistory.slice(0, (this.currentState + 1));
        }   
        
        this.typedHistory.push(this.mathField.latex());
        this.rearrangeTypedArray();
        this.currentState++;
    };

    this.undo = () => {
        if (this.currentState !== 0) {
            this.currentState--;
            let updatedText = this.typedHistory[this.currentState];
            updatedText = updatedText.replace(/\\newline/g, '\\embed{linebreak}');
            this.mathField.latex(updatedText);
            this.mathField.focus()
        }  else {
            //console.log('do nothing');
        }
    };

    this.redo = () => {
        if (this.currentState < (this.typedHistory.length - 1)) {
            this.currentState++;
            let updatedText = this.typedHistory[this.currentState];
            updatedText = updatedText.replace(/\\newline/g, '\\embed{linebreak}');
            this.mathField.latex(updatedText);
            this.mathField.focus()
        } else {
            //console.log('do nothing');
        }
    };

    this.contentEl.on('keyup', (e) => {
        this.checkIfSpecialKeysAreUpAndSetStates(e);
        
        //log in typedHistory
        if ((this.isKeyIsUnaffecting(e.which) === false)
            && (this.ctrlIsDown === false || (this.ctrlIsDown && e.which === V_KEYCODE))) {
            this.saveState();
        }
    });

    this.contentEl.on('keydown', (e) => {
        this.checkIfSpecialKeysAreDownAndSetStates(e);
        //ctrl+z
        if (this.ctrlIsDown && this.ZIsDown) {
            this.undo();
        }

        //ctrl + y
        if (this.ctrlIsDown && this.YIsDown) {
            this.redo();
        }
    });
}