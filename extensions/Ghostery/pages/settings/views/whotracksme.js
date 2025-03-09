import Options from '../../../store/options.js';
import assets from '../assets/index.js';
import __vite_glob_0_17 from './preview.js';
import { msg } from '../../../npm/hybrids/src/localize.js';
import store from '../../../npm/hybrids/src/store.js';
import { html } from '../../../npm/hybrids/src/template/index.js';
import router from '../../../npm/hybrids/src/router.js';

const PREVIEWS = {
  "wtm_wheel": {
    src: assets["wtm_wheel"],
    title: msg`Trackers Wheel`,
    description: msg`Replaces the Ghostery icon in the browser toolbar with the tracker wheel.`
  },
  "trackers_count": {
    src: assets["trackers_count"],
    title: msg`Trackers Count`,
    description: msg`Displays the tracker count on the Ghostery icon in the browser toolbar.`
  },
  "trackers_preview": {
    src: assets["trackers_preview"],
    title: msg`Trackers Preview`,
    description: msg`Shows the tracker preview beside search results.`
  }
};
const __vite_glob_0_25 = {
  options: store(Options),
  render: ({ options }) => html`
    <template layout="contents">
      <settings-page-layout layout="gap:4" layout@768px="gap:4">
        <div layout="column gap" layout@992px="margin:bottom">
          <ui-text type="headline-m" translate="no">WhoTracks.Me</ui-text>
          <ui-text type="body-l" mobile-type="body-m" color="gray-600">
            WhoTracks.Me, operated by Ghostery, is a vital cornerstone of
            Ghostery’s AI anti-tracking technology, playing a crucial role in
            providing real-time privacy protection for the Ghostery community.
            It is a comprehensive global resource on trackers, bringing
            transparency to web tracking.
          </ui-text>
          <ui-text type="body-l" mobile-type="body-m" color="gray-600">
            It exists thanks to the micro-contributions of every Ghostery user
            who chooses to send non-personal information to WhoTracks.Me. This
            input enables Ghostery to provide real-time intel on trackers,
            which, in turn, delivers privacy protection to the entire Ghostery
            community.
          </ui-text>
        </div>
        ${store.ready(options) && html`
          <section layout="column gap:4">
            <ui-toggle
              value="${options.trackerWheel}"
              onchange="${html.set(options, "trackerWheel")}"
              data-qa="toggle:trackerWheel"
            >
              <div layout="row items:start gap:2" layout@768px="gap:3">
                <a href="${router.url(__vite_glob_0_17, PREVIEWS["wtm_wheel"])}">
                  <settings-help-image>
                    <img
                      src="${assets.wtm_wheel_small}"
                      alt="WhoTracks.Me Wheel"
                    />
                  </settings-help-image>
                </a>
                <div layout="column grow gap:0.5">
                  <ui-text type="headline-xs">WhoTracks.Me Wheel</ui-text>
                  <ui-text type="body-m" mobile-type="body-s" color="gray-600">
                    Replaces the Ghostery icon in the browser toolbar with the
                    tracker wheel.
                  </ui-text>
                </div>
              </div>
            </ui-toggle>
            ${Options.trackerCount && html`
              <ui-toggle
                value="${options.trackerCount}"
                onchange="${html.set(options, "trackerCount")}"
                data-qa="toggle:trackerCount"
              >
                <div layout="row items:start gap:2" layout@768px="gap:3">
                  <a href="${router.url(__vite_glob_0_17, PREVIEWS["trackers_count"])}">
                    <settings-help-image>
                      <img
                        src="${assets.trackers_count_small}"
                        alt="Trackers Count"
                      />
                    </settings-help-image>
                  </a>
                  <div layout="column grow gap:0.5">
                    <ui-text type="headline-xs">Trackers Count</ui-text>
                    <ui-text
                      type="body-m"
                      mobile-type="body-s"
                      color="gray-600"
                    >
                      Displays the tracker count on the Ghostery icon in the
                      browser toolbar.
                    </ui-text>
                  </div>
                </div>
              </ui-toggle>
            `}
            <ui-toggle
              value="${options.wtmSerpReport}"
              onchange="${html.set(options, "wtmSerpReport")}"
              data-qa="toggle:wtmSerpReport"
            >
              <div layout="row gap:2" layout@768px="gap:3">
                <a href="${router.url(__vite_glob_0_17, PREVIEWS["trackers_preview"])}">
                  <settings-help-image>
                    <img
                      src="${assets.trackers_preview_small}"
                      alt="Trackers Preview"
                    />
                  </settings-help-image>
                </a>
                <div layout="column grow gap:0.5">
                  <ui-text type="headline-xs">Trackers Preview</ui-text>
                  <ui-text type="body-m" mobile-type="body-s" color="gray-600">
                    Shows the tracker preview beside search results.
                  </ui-text>
                  <ui-text type="label-s" color="gray-600" underline>
                    <a
                      href="https://www.ghostery.com/blog/introducing-wtm-serp-report"
                      target="_blank"
                      layout="row gap:0.5"
                    >
                      Learn more <ui-icon name="arrow-right-s"></ui-icon>
                    </a>
                  </ui-text>
                </div>
              </div>
            </ui-toggle>
            ${false}
          </section>
        `}
      </settings-page-layout>
    </template>
  `
};

export { __vite_glob_0_25 as default };
