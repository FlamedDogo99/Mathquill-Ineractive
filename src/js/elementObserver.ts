export const observeElement = (element: Element, property: string, callback: Function, delay = 0) => {
  let elementPrototype = Object.getPrototypeOf(element);
  if (elementPrototype.hasOwnProperty(property)) {
    let descriptor = Object.getOwnPropertyDescriptor(
      elementPrototype,
      property,
    ) as PropertyDescriptor;
    Object.defineProperty(element, property, {
      get: function () {
        // @ts-ignore
          return descriptor.get.apply(this, arguments);
      },
      set: function () {
        let oldValue = this[property];
          // @ts-ignore
          descriptor.set.apply(this, arguments);
        let newValue = this[property];
        if (typeof callback == "function") {
          setTimeout(callback.bind(this, oldValue, newValue), delay);
        }
        return newValue;
      },
    });
  }
};
