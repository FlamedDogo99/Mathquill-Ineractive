export const handleTouches = (originalEvent: TouchEvent) => {
  let simulatedEventType = "";
  switch (originalEvent.type) {
    case "touchstart":
      simulatedEventType = "mousedown";
      break;
    case "touchmove":
      simulatedEventType = "mousemove";
      break;
    case "touchend":
      simulatedEventType = "mouseup";
      break;
    case "touchcancel":
      simulatedEventType = "mouseup";
      break;
    default:
      return;
  }

  let firstTouch = originalEvent.changedTouches[0] as Touch;

  let clientX = firstTouch.clientX,
    pageX = firstTouch.pageX,
    PageXOffset = window.scrollX || window.pageXOffset;
  let clientY = firstTouch.clientY,
    pageY = firstTouch.pageY,
    PageYOffset = window.scrollY || window.pageYOffset;
  if (
    (pageX === 0 && Math.floor(clientX) > Math.floor(pageX)) ||
    (pageY === 0 && Math.floor(clientY) > Math.floor(pageY))
  ) {
    clientX -= PageXOffset;
    clientY -= PageYOffset;
  } else if (clientX < pageX - PageXOffset || clientY < pageY - PageYOffset) {
    clientX = pageX - PageXOffset;
    clientY = pageY - PageYOffset;
  }


  const simulatedEvent = new MouseEvent(simulatedEventType, {
    bubbles: true,
    cancelable: true,
    screenX: firstTouch.screenX, //One of these is detected by mathquill, not sure which ones
    screenY: firstTouch.screenY,
    clientX: clientX,
    clientY: clientY,
    buttons: 1,
    button: 0,
    ctrlKey: originalEvent.ctrlKey,
    shiftKey: originalEvent.shiftKey,
    altKey: originalEvent.altKey,
    metaKey: originalEvent.metaKey,
  });
  if(originalEvent.target) {
      originalEvent.target.dispatchEvent(simulatedEvent);
  } else {
      window.dispatchEvent(simulatedEvent)
  }
};
