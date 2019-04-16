export function ResizeDetector({
                                 onEnter,
                                 onUpdate,
                                 selector
                               }) {
  const element = document.querySelector(selector);
  onEnter({
    width: element.offsetWidth,
    height: element.offsetHeight,
  });
  window.addEventListener('resize', () =>
    onUpdate({
      width: element.offsetWidth,
      height: element.offsetHeight,
    })
  );
}