import { html } from '../../../npm/hybrids/src/template/index.js';

/**
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2017-present Ghostery GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */


function preventClick(host, event) {
  if (host.value) {
    event.preventDefault();
    event.stopPropagation();
  }
}

const __vite_glob_0_6 = {
  managed: {
    value: false,
    reflect: true,
    observe(host, value) {
      host.inert = value;
    },
  },
  render: () => html`
    <template layout="grid" onclick="${preventClick}">
      <slot></slot>
    </template>
  `,
};

export { __vite_glob_0_6 as default };
