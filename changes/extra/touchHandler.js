      let undoButton = document.getElementById('undo');
      let redoButton = document.getElementById('redo');
      let copyButton = document.getElementById('copy');
      let pasteButton = document.getElementById('paste');
      undoButton.addEventListener("pointerdown", preventButton, false);
      redoButton.addEventListener("pointerdown", preventButton, false);
      copyButton.addEventListener("pointerdown", preventButton, false);
      pasteButton.addEventListener("pointerdown", preventButton, false);


      undoButton.addEventListener("click", event => {
        undoManager.redo()
        return false;
      }, false);
      redoButton.addEventListener("click", event =>{
        undoManager.undo()
        return false;
      }, false);
      copyButton.addEventListener("click", event => {
        if (mathField.__controller.cursor.selection) {
          const textToCopy = mathField.__controller.cursor.selection.join('latex');
          navigator.clipboard.writeText(`${textToCopy}`);
          mathField.focus();
        }
      }, false);
      pasteButton.addEventListener("click", async clickEvent => {
        navigator.clipboard.readText().then(text => {
          const transfer = new window.DataTransfer();
          transfer.setData('text/plain', text);
          document.activeElement.dispatchEvent(new ClipboardEvent('paste', {
            bubbles: true,
            cancelable: true,
            clipboardData: transfer
          }));

        });
        return false;
      }, false);
      function preventButton(event) {
        event.preventDefault();
        return false
      }

      function TouchEventMapper(originalEvent) {
        let Target = originalEvent.target
        let simulatedEventType
        switch (originalEvent.type) {
          case "touchstart":
            simulatedEventType = "mousedown"
            break
          case "touchmove":
            simulatedEventType = "mousemove"
            break
          case "touchend":
            simulatedEventType = "mouseup"
            break
          case "touchcancel":
            simulatedEventType = "mouseup"
            break
          default:
            return
        }

        let firstTouch = originalEvent.changedTouches[0]

        let clientX = firstTouch.clientX,
          pageX = firstTouch.pageX,
          PageXOffset = window.pageXOffset
        let clientY = firstTouch.clientY,
          pageY = firstTouch.pageY,
          PageYOffset = window.pageYOffset
        if (
          (pageX === 0 && Math.floor(clientX) > Math.floor(pageX)) ||
          (pageY === 0 && Math.floor(clientY) > Math.floor(pageY))
        ) {
          clientX -= PageXOffset
          clientY -= PageYOffset
        } else if (clientX < pageX - PageXOffset || clientY < pageY - PageYOffset) {
          clientX = pageX - PageXOffset
          clientY = pageY - PageYOffset
        }

        let simulatedEvent = new MouseEvent(simulatedEventType, {
          bubbles: true,
          cancelable: true,
          screenX: firstTouch.screenX,
          screenY: firstTouch.screenY,
          clientX: firstTouch.clientX,
          clientY: firstTouch.clientY,
          pageX: firstTouch.pageX,
          pageY: firstTouch.pageU,
          buttons: 1,
          button: 0,
          ctrlKey: originalEvent.ctrlKey,
          shiftKey: originalEvent.shiftKey,
          altKey: originalEvent.altKey,
          metaKey: originalEvent.metaKey
        })

        this.dispatchEvent(simulatedEvent)
      }

      document.querySelector('#math-field').addEventListener("touchstart", TouchEventMapper, true)
      document.addEventListener("touchmove", TouchEventMapper, true)
      document.addEventListener("touchend", TouchEventMapper, true)
      document.addEventListener("touchcancel", TouchEventMapper, true)