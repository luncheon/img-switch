const debounce = (callback, milliseconds) => {
  let id;
  const _callback = () => {
    id = undefined;
    callback();
  };
  return () => {
    cancelAnimationFrame(id);
    id = requestAnimationFrame(_callback, milliseconds);
  };
};

class ImgSwitchElement extends HTMLElement {
  #activeSource;
  #update = debounce(() => {
    const elementDeviceWidth = this.getBoundingClientRect().width * devicePixelRatio;
    let sourceWidth = Infinity;
    let sourceElement;
    for (let child = this.firstElementChild; child; child = child.nextElementSibling) {
      const width = +child.getAttribute("data-device-width") || Infinity;
      if (elementDeviceWidth <= width && width <= sourceWidth) {
        sourceWidth = width;
        sourceElement = child;
      }
    }
    if (sourceElement && this.#activeSource !== sourceElement) {
      this.#activeSource = sourceElement;
      const image = new Image();
      image.src = sourceElement.getAttribute("src");
      image.part = "img";
      image.addEventListener(
        "load",
        () => {
          if (this.#activeSource === sourceElement) {
            this.shadowRoot.firstElementChild?.remove();
            this.shadowRoot.appendChild(image);
          }
        },
        { once: true },
      );
    }
  });

  #mutationObserver = new MutationObserver(this.#update);
  #resizeObserver = new ResizeObserver(this.#update);

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.#mutationObserver.observe(this, { childList: true });
    this.#resizeObserver.observe(this);
  }

  disconnectedCallback() {
    this.#mutationObserver.disconnect();
    this.#resizeObserver.disconnect();
  }
}

customElements.define("img-switch", ImgSwitchElement);
