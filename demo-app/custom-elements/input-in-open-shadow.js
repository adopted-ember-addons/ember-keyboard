if (typeof FastBoot === 'undefined') {
  class InputInOpenShadow extends HTMLElement {
    async connectedCallback() {
      const shadowRoot = this.attachShadow({ mode: 'open' });
      const input = document.createElement('input');
      shadowRoot.appendChild(input);
    }
  }

  customElements.define('input-in-open-shadow', InputInOpenShadow);
}
