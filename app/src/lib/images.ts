// Every photo ships as two WebP prints (tools/images.py): the full one and a
// phone one. The browser picks between them by the `sizes` the caller passes,
// so a phone never downloads a laptop-sized file.
export function pic(path: string, width: number, phoneWidth = 720) {
  return {
    src: `${path}.webp`,
    srcSet: `${path}-sm.webp ${phoneWidth}w, ${path}.webp ${width}w`,
  };
}
