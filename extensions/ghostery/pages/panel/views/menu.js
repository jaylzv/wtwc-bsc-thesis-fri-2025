import Options from '../../../store/options.js';
import Session from '../../../store/session.js';
import Stats from '../../../store/tab-stats.js';
import { openTabWithUrl } from '../../../utils/tabs.js';
import __vite_glob_0_17 from './report-form.js';
import store from '../../../npm/hybrids/src/store.js';
import { html } from '../../../npm/hybrids/src/template/index.js';
import router from '../../../npm/hybrids/src/router.js';

const __vite_glob_0_14 = {
  options: store(Options),
  session: store(Session),
  stats: store(Stats),
  render: ({ options, session, stats }) => html`
    <template layout="grid grow">
      <ui-header>
        Menu
        <ui-action slot="actions">
          <a href="${router.backUrl()}">
            <ui-icon name="close" color="gray-800" layout="size:3"></ui-icon>
          </a>
        </ui-action>
      </ui-header>
      <panel-container>
        ${store.ready(options, stats) && html`
          <div layout="column gap:0.5 padding:1:0">
            ${!options.managed && html`
              <ui-text
                type="label-s"
                color="gray-600"
                uppercase
                layout="padding:1:1:0 margin:0:1"
              >
                Ghostery settings
              </ui-text>

              <panel-menu-item
                href="${chrome.runtime.getURL(
    "/pages/settings/index.html#@settings-privacy"
  )}"
                icon="shield-menu"
              >
                Privacy protection
              </panel-menu-item>
              <panel-menu-item
                href="${chrome.runtime.getURL(
    "/pages/settings/index.html#@settings-websites"
  )}"
                icon="websites"
              >
                Websites
              </panel-menu-item>
              <panel-menu-item
                href="${chrome.runtime.getURL(
    "/pages/settings/index.html#@settings-trackers"
  )}"
                icon="block-m"
              >
                Trackers
              </panel-menu-item>
              <panel-menu-item
                href="${chrome.runtime.getURL(
    "/pages/settings/index.html#@settings-whotracksme"
  )}"
                icon="wtm"
                translate="no"
              >
                WhoTracks.Me
              </panel-menu-item>
              <panel-menu-item
                href="${chrome.runtime.getURL(
    "/pages/settings/index.html#@settings-account"
  )}"
                icon="${store.ready(session) && session.contributor && "contributor" || "user"}"
              >
                <div layout="column">
                  <span>My Account</span>
                  ${store.ready(session) && (session.name || session.email) && html`
                    <ui-text type="body-xs" color="inherit">
                      ${session.name || session.email}
                    </ui-text>
                  `}
                </div>
              </panel-menu-item>

              ${store.ready(session) && !session.contributor && html`
                <ui-button type="outline-primary" layout="margin:1:1.5">
                  <a
                    href="https://www.ghostery.com/become-a-contributor?utm_source=gbe"
                    onclick="${openTabWithUrl}"
                  >
                    <ui-icon name="heart"></ui-icon>
                    Become a Contributor
                  </a>
                </ui-button>
              `}

              <ui-line></ui-line>
            `}

            <ui-text
              type="label-s"
              color="gray-600"
              uppercase
              layout="padding:1:1:0 margin:0:1"
            >
              Support
            </ui-text>

            ${stats.hostname && html`
              <panel-menu-item
                href="${router.url(__vite_glob_0_17)}"
                icon="report"
                internal
              >
                Report a broken page
              </panel-menu-item>
            `}

            <panel-menu-item
              href="https://www.ghostery.com/submit-a-tracker?utm_source=gbe"
              icon="send"
              suffix-icon="link-external-m"
            >
              Submit a new tracker
            </panel-menu-item>

            <panel-menu-item
              href="https://www.ghostery.com/feedback?utm_source=gbe"
              icon="thumb-up"
              suffix-icon="link-external-m"
            >
              Send feedback
            </panel-menu-item>

            <panel-menu-item
              href="https://www.ghostery.com/support?utm_source=gbe"
              icon="help"
              suffix-icon="link-external-m"
            >
              Contact support
            </panel-menu-item>

            <ui-line></ui-line>

            <ui-text
              type="label-s"
              color="gray-600"
              uppercase
              layout="padding:1:1:0 margin:0:1"
            >
              About
            </ui-text>

            <panel-menu-item
              href="https://www.ghostery.com/?utm_source=gbe"
              icon="ghosty-m"
              suffix-icon="link-external-m"
            >
              Website
            </panel-menu-item>

            <panel-menu-item
              href="${"https://www.ghostery.com/privacy-policy?utm_source=gbe"}"
              icon="privacy-m"
              suffix-icon="link-external-m"
            >
              Privacy Policy
            </panel-menu-item>

            <panel-menu-item
              href="https://www.ghostery.com/privacy/ghostery-terms-and-conditions/?utm_source=gbe"
              icon="doc-m"
              suffix-icon="link-external-m"
            >
              Terms & Conditions
            </panel-menu-item>

            <panel-menu-item
              href="https://www.ghostery.com/privacy/imprint?utm_source=gbe"
              icon="imprint-m"
              suffix-icon="link-external-m"
              translate="no"
            >
              Imprint
            </panel-menu-item>

            <panel-menu-item
              href="${chrome.runtime.getURL("/static_pages/licenses.html")}"
              icon="license-m"
              suffix-icon="link-external-m"
              data-qa="button:licenses"
            >
              Software Licenses
            </panel-menu-item>
          </div>
        `}
      </panel-container>
    </template>
  `
};

export { __vite_glob_0_14 as default };
