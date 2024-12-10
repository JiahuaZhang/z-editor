export const setDomHiddenUntilFound = (dom: HTMLElement) => {
  // @ts-expect-error
  dom.hidden = 'until-found';
};

export const domOnBeforeMatch = (dom: HTMLElement, callback: () => void) => {
  // @ts-expect-error
  dom.onbeforematch = callback;
};
