      let undoButton = document.getElementById('undo');
      let redoButton = document.getElementById('redo');
      let copyButton = document.getElementById('copy');
      let pasteButton = document.getElementById('paste');

      undoButton.addEventListener("mousedown", undoText, false);
      undoButton.addEventListener("touchstart", undoText, false);
      redoButton.addEventListener("mousedown", redoText, false);
      redoButton.addEventListener("touchstart", redoText, false);
      copyButton.addEventListener("mousedown", copyText, false);
      copyButton.addEventListener("touchstart", copyText, false);
      pasteButton.addEventListener("mousedown", pasteText, false);
      pasteButton.addEventListener("touchstart", pasteText, false);
      function undoText(e) {
        e.preventDefault();
        undoManager.undo()
        return false;
      }

      function redoText(e) {
        e.preventDefault();
        undoManager.redo()
        return false;
      }
      function copyText(e) {
        e.preventDefault();
        if (mathField.__controller.cursor.selection) {
          copyField = document.getElementById('copyField');
          copyField.value = mathField.__controller.cursor.selection.join('latex');
          copyField.select(); 
          copyField.setSelectionRange(0,99999);
          document.execCommand('copy');
          navigator.clipboard.writeText(copyField.value);
          mathField.focus();
        }
        return false;
      }
      function pasteText(e) {
        e.preventDefault()

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

        this.dispatchEvent(simulatedEvent);
      }

      document.querySelector('#math-field').addEventListener("touchstart", TouchEventMapper, true);
      document.addEventListener("touchmove", TouchEventMapper, true);
      document.addEventListener("touchend", TouchEventMapper, true);
      document.addEventListener("touchcancel", TouchEventMapper, true);