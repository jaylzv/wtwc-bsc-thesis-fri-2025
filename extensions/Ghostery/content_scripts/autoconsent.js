(function () {
  'use strict';

  // lib/consentomatic/tools.ts
  var _Tools = class _Tools {
    static setBase(base2) {
      _Tools.base = base2;
    }
    static findElement(options, parent = null, multiple = false) {
      let possibleTargets = null;
      if (parent != null) {
        possibleTargets = Array.from(parent.querySelectorAll(options.selector));
      } else {
        if (_Tools.base != null) {
          possibleTargets = Array.from(
            _Tools.base.querySelectorAll(options.selector)
          );
        } else {
          possibleTargets = Array.from(
            document.querySelectorAll(options.selector)
          );
        }
      }
      if (options.textFilter != null) {
        possibleTargets = possibleTargets.filter((possibleTarget) => {
          const textContent = possibleTarget.textContent.toLowerCase();
          if (Array.isArray(options.textFilter)) {
            let foundText = false;
            for (const text of options.textFilter) {
              if (textContent.indexOf(text.toLowerCase()) !== -1) {
                foundText = true;
                break;
              }
            }
            return foundText;
          } else if (options.textFilter != null) {
            return textContent.indexOf(options.textFilter.toLowerCase()) !== -1;
          }
          return false;
        });
      }
      if (options.styleFilters != null) {
        possibleTargets = possibleTargets.filter((possibleTarget) => {
          const styles = window.getComputedStyle(possibleTarget);
          let keep = true;
          for (const styleFilter of options.styleFilters) {
            const option = styles[styleFilter.option];
            if (styleFilter.negated) {
              keep = keep && option !== styleFilter.value;
            } else {
              keep = keep && option === styleFilter.value;
            }
          }
          return keep;
        });
      }
      if (options.displayFilter != null) {
        possibleTargets = possibleTargets.filter((possibleTarget) => {
          if (options.displayFilter) {
            return possibleTarget.offsetHeight !== 0;
          } else {
            return possibleTarget.offsetHeight === 0;
          }
        });
      }
      if (options.iframeFilter != null) {
        possibleTargets = possibleTargets.filter(() => {
          if (options.iframeFilter) {
            return window.location !== window.parent.location;
          } else {
            return window.location === window.parent.location;
          }
        });
      }
      if (options.childFilter != null) {
        possibleTargets = possibleTargets.filter((possibleTarget) => {
          const oldBase = _Tools.base;
          _Tools.setBase(possibleTarget);
          const childResults = _Tools.find(options.childFilter);
          _Tools.setBase(oldBase);
          return childResults.target != null;
        });
      }
      if (multiple) {
        return possibleTargets;
      } else {
        if (possibleTargets.length > 1) {
          console.warn(
            "Multiple possible targets: ",
            possibleTargets,
            options,
            parent
          );
        }
        return possibleTargets[0];
      }
    }
    static find(options, multiple = false) {
      const results = [];
      if (options.parent != null) {
        const parent = _Tools.findElement(options.parent, null, multiple);
        if (parent != null) {
          if (parent instanceof Array) {
            parent.forEach((p) => {
              const targets = _Tools.findElement(options.target, p, multiple);
              if (targets instanceof Array) {
                targets.forEach((target) => {
                  results.push({
                    parent: p,
                    target
                  });
                });
              } else {
                results.push({
                  parent: p,
                  target: targets
                });
              }
            });
            return results;
          } else {
            const targets = _Tools.findElement(options.target, parent, multiple);
            if (targets instanceof Array) {
              targets.forEach((target) => {
                results.push({
                  parent,
                  target
                });
              });
            } else {
              results.push({
                parent,
                target: targets
              });
            }
          }
        }
      } else {
        const targets = _Tools.findElement(options.target, null, multiple);
        if (targets instanceof Array) {
          targets.forEach((target) => {
            results.push({
              parent: null,
              target
            });
          });
        } else {
          results.push({
            parent: null,
            target: targets
          });
        }
      }
      if (results.length === 0) {
        results.push({
          parent: null,
          target: null
        });
      }
      if (multiple) {
        return results;
      } else {
        if (results.length !== 1) {
          console.warn(
            "Multiple results found, even though multiple false",
            results
          );
        }
        return results[0];
      }
    }
  };
  _Tools.base = null;
  var Tools = _Tools;

  // lib/consentomatic/index.ts
  function matches(config) {
    const result = Tools.find(config);
    if (config.type === "css") {
      return !!result.target;
    } else if (config.type === "checkbox") {
      return !!result.target && result.target.checked;
    }
  }
  async function executeAction(config, param) {
    switch (config.type) {
      case "click":
        return clickAction(config);
      case "list":
        return listAction(config, param);
      case "consent":
        return consentAction(config, param);
      case "ifcss":
        return ifCssAction(config, param);
      case "waitcss":
        return waitCssAction(config);
      case "foreach":
        return forEachAction(config, param);
      case "hide":
        return hideAction(config);
      case "slide":
        return slideAction(config);
      case "close":
        return closeAction();
      case "wait":
        return waitAction(config);
      case "eval":
        return evalAction(config);
      default:
        throw new Error("Unknown action type: " + config.type);
    }
  }
  var STEP_TIMEOUT = 0;
  function waitTimeout(timeout) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, timeout);
    });
  }
  async function clickAction(config) {
    const result = Tools.find(config);
    if (result.target != null) {
      result.target.click();
    }
    return waitTimeout(STEP_TIMEOUT);
  }
  async function listAction(config, param) {
    for (const action of config.actions) {
      await executeAction(action, param);
    }
  }
  async function consentAction(config, consentTypes) {
    for (const consentConfig of config.consents) {
      const shouldEnable = consentTypes.indexOf(consentConfig.type) !== -1;
      if (consentConfig.matcher && consentConfig.toggleAction) {
        const isEnabled = matches(consentConfig.matcher);
        if (isEnabled !== shouldEnable) {
          await executeAction(consentConfig.toggleAction);
        }
      } else {
        if (shouldEnable) {
          await executeAction(consentConfig.trueAction);
        } else {
          await executeAction(consentConfig.falseAction);
        }
      }
    }
  }
  async function ifCssAction(config, param) {
    const result = Tools.find(config);
    if (!result.target) {
      if (config.trueAction) {
        await executeAction(config.trueAction, param);
      }
    } else {
      if (config.falseAction) {
        await executeAction(config.falseAction, param);
      }
    }
  }
  async function waitCssAction(config) {
    await new Promise((resolve) => {
      let numRetries = config.retries || 10;
      const waitTime = config.waitTime || 250;
      const checkCss = () => {
        const result = Tools.find(config);
        if (config.negated && result.target || !config.negated && !result.target) {
          if (numRetries > 0) {
            numRetries -= 1;
            setTimeout(checkCss, waitTime);
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      };
      checkCss();
    });
  }
  async function forEachAction(config, param) {
    const results = Tools.find(config, true);
    const oldBase = Tools.base;
    for (const result of results) {
      if (result.target) {
        Tools.setBase(result.target);
        await executeAction(config.action, param);
      }
    }
    Tools.setBase(oldBase);
  }
  async function hideAction(config) {
    const result = Tools.find(config);
    if (result.target) {
      result.target.classList.add("Autoconsent-Hidden");
    }
  }
  async function slideAction(config) {
    const result = Tools.find(config);
    const dragResult = Tools.find(config.dragTarget);
    if (result.target) {
      const targetBounds = result.target.getBoundingClientRect();
      const dragTargetBounds = dragResult.target.getBoundingClientRect();
      let yDiff = dragTargetBounds.top - targetBounds.top;
      let xDiff = dragTargetBounds.left - targetBounds.left;
      if (this.config.axis.toLowerCase() === "y") {
        xDiff = 0;
      }
      if (this.config.axis.toLowerCase() === "x") {
        yDiff = 0;
      }
      const screenX = window.screenX + targetBounds.left + targetBounds.width / 2;
      const screenY = window.screenY + targetBounds.top + targetBounds.height / 2;
      const clientX = targetBounds.left + targetBounds.width / 2;
      const clientY = targetBounds.top + targetBounds.height / 2;
      const mouseDown = document.createEvent("MouseEvents");
      mouseDown.initMouseEvent(
        "mousedown",
        true,
        true,
        window,
        0,
        screenX,
        screenY,
        clientX,
        clientY,
        false,
        false,
        false,
        false,
        0,
        result.target
      );
      const mouseMove = document.createEvent("MouseEvents");
      mouseMove.initMouseEvent(
        "mousemove",
        true,
        true,
        window,
        0,
        screenX + xDiff,
        screenY + yDiff,
        clientX + xDiff,
        clientY + yDiff,
        false,
        false,
        false,
        false,
        0,
        result.target
      );
      const mouseUp = document.createEvent("MouseEvents");
      mouseUp.initMouseEvent(
        "mouseup",
        true,
        true,
        window,
        0,
        screenX + xDiff,
        screenY + yDiff,
        clientX + xDiff,
        clientY + yDiff,
        false,
        false,
        false,
        false,
        0,
        result.target
      );
      result.target.dispatchEvent(mouseDown);
      await this.waitTimeout(10);
      result.target.dispatchEvent(mouseMove);
      await this.waitTimeout(10);
      result.target.dispatchEvent(mouseUp);
    }
  }
  async function waitAction(config) {
    await waitTimeout(config.waitTime);
  }
  async function closeAction() {
    window.close();
  }
  async function evalAction(config) {
    console.log("eval!", config.code);
    return new Promise((resolve) => {
      try {
        if (config.async) {
          window.eval(config.code);
          setTimeout(() => {
            resolve(window.eval("window.__consentCheckResult"));
          }, config.timeout || 250);
        } else {
          resolve(window.eval(config.code));
        }
      } catch (e) {
        console.warn("eval error", e, config.code);
        resolve(false);
      }
    });
  }

  // lib/random.ts
  function getRandomID() {
    if (crypto && typeof crypto.randomUUID !== "undefined") {
      return crypto.randomUUID();
    }
    return Math.random().toString();
  }

  // lib/eval-handler.ts
  var Deferred = class {
    constructor(id, timeout = 1e3) {
      this.id = id;
      this.promise = new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
      this.timer = window.setTimeout(() => {
        this.reject(new Error("timeout"));
      }, timeout);
    }
  };
  var evalState = {
    pending: /* @__PURE__ */ new Map(),
    sendContentMessage: null
  };
  function requestEval(code, snippetId) {
    const id = getRandomID();
    evalState.sendContentMessage({
      type: "eval",
      id,
      code,
      snippetId
    });
    const deferred = new Deferred(id);
    evalState.pending.set(deferred.id, deferred);
    return deferred.promise;
  }
  function resolveEval(id, value) {
    const deferred = evalState.pending.get(id);
    if (deferred) {
      evalState.pending.delete(id);
      deferred.timer && window.clearTimeout(deferred.timer);
      deferred.resolve(value);
    } else {
      console.warn("no eval #", id);
    }
  }

  // lib/eval-snippets.ts
  var snippets = {
    // code-based rules
    EVAL_0: () => console.log(1),
    EVAL_CONSENTMANAGER_1: () => window.__cmp && typeof __cmp("getCMPData") === "object",
    EVAL_CONSENTMANAGER_2: () => !__cmp("consentStatus").userChoiceExists,
    EVAL_CONSENTMANAGER_3: () => __cmp("setConsent", 0),
    EVAL_CONSENTMANAGER_4: () => __cmp("setConsent", 1),
    EVAL_CONSENTMANAGER_5: () => __cmp("consentStatus").userChoiceExists,
    EVAL_COOKIEBOT_1: () => !!window.Cookiebot,
    EVAL_COOKIEBOT_2: () => !window.Cookiebot.hasResponse && window.Cookiebot.dialog?.visible === true,
    EVAL_COOKIEBOT_3: () => window.Cookiebot.withdraw() || true,
    EVAL_COOKIEBOT_4: () => window.Cookiebot.hide() || true,
    EVAL_COOKIEBOT_5: () => window.Cookiebot.declined === true,
    EVAL_KLARO_1: () => {
      const config = globalThis.klaroConfig || globalThis.klaro?.getManager && globalThis.klaro.getManager().config;
      if (!config) {
        return true;
      }
      const optionalServices = (config.services || config.apps).filter((s) => !s.required).map((s) => s.name);
      if (klaro && klaro.getManager) {
        const manager = klaro.getManager();
        return optionalServices.every((name) => !manager.consents[name]);
      } else if (klaroConfig && klaroConfig.storageMethod === "cookie") {
        const cookieName = klaroConfig.cookieName || klaroConfig.storageName;
        const consents = JSON.parse(
          decodeURIComponent(
            document.cookie.split(";").find((c) => c.trim().startsWith(cookieName)).split("=")[1]
          )
        );
        return Object.keys(consents).filter((k) => optionalServices.includes(k)).every((k) => consents[k] === false);
      }
    },
    EVAL_KLARO_OPEN_POPUP: () => {
      klaro.show(void 0, true);
    },
    EVAL_KLARO_TRY_API_OPT_OUT: () => {
      if (window.klaro && typeof klaro.show === "function" && typeof klaro.getManager === "function") {
        try {
          klaro.getManager().changeAll(false);
          klaro.getManager().saveAndApplyConsents();
          return true;
        } catch (e) {
          console.warn(e);
          return false;
        }
      }
      return false;
    },
    EVAL_ONETRUST_1: () => window.OnetrustActiveGroups.split(",").filter((s) => s.length > 0).length <= 1,
    EVAL_TRUSTARC_TOP: () => window && window.truste && window.truste.eu.bindMap.prefCookie === "0",
    EVAL_TRUSTARC_FRAME_TEST: () => window && window.QueryString && window.QueryString.preferences === "0",
    EVAL_TRUSTARC_FRAME_GTM: () => window && window.QueryString && window.QueryString.gtm === "1",
    // declarative rules
    EVAL_ABC_TEST: () => document.cookie.includes("trackingconsent"),
    EVAL_ADROLL_0: () => !document.cookie.includes("__adroll_fpc"),
    EVAL_ALMACMP_0: () => document.cookie.includes('"name":"Google","consent":false'),
    EVAL_AFFINITY_SERIF_COM_0: () => document.cookie.includes("serif_manage_cookies_viewed") && !document.cookie.includes("serif_allow_analytics"),
    EVAL_ARBEITSAGENTUR_TEST: () => document.cookie.includes("cookie_consent=denied"),
    EVAL_AXEPTIO_0: () => document.cookie.includes("axeptio_authorized_vendors=%2C%2C"),
    EVAL_BAHN_TEST: () => utag.gdpr.getSelectedCategories().length === 1,
    EVAL_BING_0: () => document.cookie.includes("AD=0"),
    EVAL_BLOCKSY_0: () => document.cookie.includes("blocksy_cookies_consent_accepted=no"),
    EVAL_BORLABS_0: () => !JSON.parse(
      decodeURIComponent(
        document.cookie.split(";").find((c) => c.indexOf("borlabs-cookie") !== -1).split("=", 2)[1]
      )
    ).consents.statistics,
    EVAL_BUNDESREGIERUNG_DE_0: () => document.cookie.match("cookie-allow-tracking=0"),
    EVAL_CANVA_0: () => !document.cookie.includes("gtm_fpc_engagement_event"),
    EVAL_CC_BANNER2_0: () => !!document.cookie.match(/sncc=[^;]+D%3Dtrue/),
    EVAL_CLICKIO_0: () => document.cookie.includes("__lxG__consent__v2_daisybit="),
    EVAL_CLINCH_0: () => document.cookie.includes("ctc_rejected=1"),
    EVAL_COOKIECONSENT2_TEST: () => document.cookie.includes("cc_cookie="),
    EVAL_COOKIECONSENT3_TEST: () => document.cookie.includes("cc_cookie="),
    EVAL_COINBASE_0: () => JSON.parse(decodeURIComponent(document.cookie.match(/cm_(eu|default)_preferences=([0-9a-zA-Z\\{\\}\\[\\]%:]*);?/)[2])).consent.length <= 1,
    EVAL_COMPLIANZ_BANNER_0: () => document.cookie.includes("cmplz_banner-status=dismissed"),
    EVAL_COOKIE_LAW_INFO_0: () => CLI.disableAllCookies() || CLI.reject_close() || true,
    EVAL_COOKIE_LAW_INFO_1: () => document.cookie.indexOf("cookielawinfo-checkbox-non-necessary=yes") === -1,
    EVAL_COOKIE_LAW_INFO_DETECT: () => !!window.CLI,
    EVAL_COOKIE_MANAGER_POPUP_0: () => JSON.parse(
      document.cookie.split(";").find((c) => c.trim().startsWith("CookieLevel")).split("=")[1]
    ).social === false,
    EVAL_COOKIEALERT_0: () => document.querySelector("body").removeAttribute("style") || true,
    EVAL_COOKIEALERT_1: () => document.querySelector("body").removeAttribute("style") || true,
    EVAL_COOKIEALERT_2: () => window.CookieConsent.declined === true,
    EVAL_COOKIEFIRST_0: () => ((o) => o.performance === false && o.functional === false && o.advertising === false)(
      JSON.parse(
        decodeURIComponent(
          document.cookie.split(";").find((c) => c.indexOf("cookiefirst") !== -1).trim()
        ).split("=")[1]
      )
    ),
    EVAL_COOKIEFIRST_1: () => document.querySelectorAll("button[data-cookiefirst-accent-color=true][role=checkbox]:not([disabled])").forEach((i) => i.getAttribute("aria-checked") === "true" && i.click()) || true,
    EVAL_COOKIEINFORMATION_0: () => CookieInformation.declineAllCategories() || true,
    EVAL_COOKIEINFORMATION_1: () => CookieInformation.submitAllCategories() || true,
    EVAL_COOKIEINFORMATION_2: () => document.cookie.includes("CookieInformationConsent="),
    EVAL_COOKIEYES_0: () => document.cookie.includes("advertisement:no"),
    EVAL_DAILYMOTION_0: () => !!document.cookie.match("dm-euconsent-v2"),
    EVAL_DNDBEYOND_TEST: () => document.cookie.includes("cookie-consent=denied"),
    EVAL_DSGVO_0: () => !document.cookie.includes("sp_dsgvo_cookie_settings"),
    EVAL_DUNELM_0: () => document.cookie.includes("cc_functional=0") && document.cookie.includes("cc_targeting=0"),
    EVAL_ETSY_0: () => document.querySelectorAll(".gdpr-overlay-body input").forEach((toggle) => {
      toggle.checked = false;
    }) || true,
    EVAL_ETSY_1: () => document.querySelector(".gdpr-overlay-view button[data-wt-overlay-close]").click() || true,
    EVAL_EU_COOKIE_COMPLIANCE_0: () => document.cookie.indexOf("cookie-agreed=2") === -1,
    EVAL_EU_COOKIE_LAW_0: () => !document.cookie.includes("euCookie"),
    EVAL_EZOIC_0: () => ezCMP.handleAcceptAllClick(),
    EVAL_EZOIC_1: () => !!document.cookie.match(/ez-consent-tcf/),
    EVAL_FIDES_DETECT_POPUP: () => window.Fides?.initialized,
    EVAL_GOOGLE_0: () => !!document.cookie.match(/SOCS=CAE/),
    EVAL_HEMA_TEST_0: () => document.cookie.includes("cookies_rejected=1"),
    EVAL_IUBENDA_0: () => document.querySelectorAll(".purposes-item input[type=checkbox]:not([disabled])").forEach((x) => {
      if (x.checked) x.click();
    }) || true,
    EVAL_IUBENDA_1: () => !!document.cookie.match(/_iub_cs-\d+=/),
    EVAL_IWINK_TEST: () => document.cookie.includes("cookie_permission_granted=no"),
    EVAL_JQUERY_COOKIEBAR_0: () => !document.cookie.includes("cookies-state=accepted"),
    EVAL_KETCH_TEST: () => document.cookie.includes("_ketch_consent_v1_"),
    EVAL_MEDIAVINE_0: () => document.querySelectorAll('[data-name="mediavine-gdpr-cmp"] input[type=checkbox]').forEach((x) => x.checked && x.click()) || true,
    EVAL_MICROSOFT_0: () => Array.from(document.querySelectorAll("div > button")).filter((el) => el.innerText.match("Reject|Ablehnen"))[0].click() || true,
    EVAL_MICROSOFT_1: () => Array.from(document.querySelectorAll("div > button")).filter((el) => el.innerText.match("Accept|Annehmen"))[0].click() || true,
    EVAL_MICROSOFT_2: () => !!document.cookie.match("MSCC|GHCC"),
    EVAL_MOOVE_0: () => document.querySelectorAll("#moove_gdpr_cookie_modal input").forEach((i) => {
      if (!i.disabled) i.checked = i.name === "moove_gdpr_strict_cookies" || i.id === "moove_gdpr_strict_cookies";
    }) || true,
    EVAL_ONENINETWO_0: () => document.cookie.includes("CC_ADVERTISING=NO") && document.cookie.includes("CC_ANALYTICS=NO"),
    EVAL_OPENAI_TEST: () => document.cookie.includes("oai-allow-ne=false"),
    EVAL_OPERA_0: () => document.cookie.includes("cookie_consent_essential=true") && !document.cookie.includes("cookie_consent_marketing=true"),
    EVAL_PAYPAL_0: () => document.cookie.includes("cookie_prefs") === true,
    EVAL_PRIMEBOX_0: () => !document.cookie.includes("cb-enabled=accepted"),
    EVAL_PUBTECH_0: () => document.cookie.includes("euconsent-v2") && (document.cookie.match(/.YAAAAAAAAAAA/) || document.cookie.match(/.aAAAAAAAAAAA/) || document.cookie.match(/.YAAACFgAAAAA/)),
    EVAL_REDDIT_0: () => document.cookie.includes("eu_cookie={%22opted%22:true%2C%22nonessential%22:false}"),
    EVAL_ROBLOX_TEST: () => document.cookie.includes("RBXcb"),
    EVAL_SKYSCANNER_TEST: () => document.cookie.match(/gdpr=[^;]*adverts:::false/) && !document.cookie.match(/gdpr=[^;]*init:::true/),
    EVAL_SIRDATA_UNBLOCK_SCROLL: () => {
      document.documentElement.classList.forEach((cls) => {
        if (cls.startsWith("sd-cmp-")) document.documentElement.classList.remove(cls);
      });
      return true;
    },
    EVAL_SNIGEL_0: () => !!document.cookie.match("snconsent"),
    EVAL_STEAMPOWERED_0: () => JSON.parse(
      decodeURIComponent(
        document.cookie.split(";").find((s) => s.trim().startsWith("cookieSettings")).split("=")[1]
      )
    ).preference_state === 2,
    EVAL_SVT_TEST: () => document.cookie.includes('cookie-consent-1={"optedIn":true,"functionality":false,"statistics":false}'),
    EVAL_TAKEALOT_0: () => document.body.classList.remove("freeze") || (document.body.style = "") || true,
    EVAL_TARTEAUCITRON_0: () => tarteaucitron.userInterface.respondAll(false) || true,
    EVAL_TARTEAUCITRON_1: () => tarteaucitron.userInterface.respondAll(true) || true,
    EVAL_TARTEAUCITRON_2: () => document.cookie.match(/tarteaucitron=[^;]*/)?.[0].includes("false"),
    EVAL_TAUNTON_TEST: () => document.cookie.includes("taunton_user_consent_submitted=true"),
    EVAL_TEALIUM_0: () => typeof window.utag !== "undefined" && typeof utag.gdpr === "object",
    EVAL_TEALIUM_1: () => utag.gdpr.setConsentValue(false) || true,
    EVAL_TEALIUM_DONOTSELL: () => utag.gdpr.dns?.setDnsState(false) || true,
    EVAL_TEALIUM_2: () => utag.gdpr.setConsentValue(true) || true,
    EVAL_TEALIUM_3: () => utag.gdpr.getConsentState() !== 1,
    EVAL_TEALIUM_DONOTSELL_CHECK: () => utag.gdpr.dns?.getDnsState() !== 1,
    EVAL_TESLA_TEST: () => document.cookie.includes("tsla-cookie-consent=rejected"),
    EVAL_TESTCMP_STEP: () => !!document.querySelector("#reject-all"),
    EVAL_TESTCMP_0: () => window.results.results[0] === "button_clicked",
    EVAL_TESTCMP_COSMETIC_0: () => window.results.results[0] === "banner_hidden",
    EVAL_THEFREEDICTIONARY_0: () => cmpUi.showPurposes() || cmpUi.rejectAll() || true,
    EVAL_THEFREEDICTIONARY_1: () => cmpUi.allowAll() || true,
    EVAL_THEVERGE_0: () => document.cookie.includes("_duet_gdpr_acknowledged=1"),
    EVAL_TWCC_TEST: () => document.cookie.includes("twCookieConsent="),
    EVAL_UBUNTU_COM_0: () => document.cookie.includes("_cookies_accepted=essential"),
    EVAL_UK_COOKIE_CONSENT_0: () => !document.cookie.includes("catAccCookies"),
    EVAL_USERCENTRICS_API_0: () => typeof UC_UI === "object",
    EVAL_USERCENTRICS_API_1: () => !!UC_UI.closeCMP(),
    EVAL_USERCENTRICS_API_2: () => !!UC_UI.denyAllConsents(),
    EVAL_USERCENTRICS_API_3: () => !!UC_UI.acceptAllConsents(),
    EVAL_USERCENTRICS_API_4: () => !!UC_UI.closeCMP(),
    EVAL_USERCENTRICS_API_5: () => UC_UI.areAllConsentsAccepted() === true,
    EVAL_USERCENTRICS_API_6: () => UC_UI.areAllConsentsAccepted() === false,
    EVAL_USERCENTRICS_BUTTON_0: () => JSON.parse(localStorage.getItem("usercentrics")).consents.every((c) => c.isEssential || !c.consentStatus),
    EVAL_WAITROSE_0: () => Array.from(document.querySelectorAll("label[id$=cookies-deny-label]")).forEach((e) => e.click()) || true,
    EVAL_WAITROSE_1: () => document.cookie.includes("wtr_cookies_advertising=0") && document.cookie.includes("wtr_cookies_analytics=0"),
    EVAL_WP_COOKIE_NOTICE_0: () => document.cookie.includes("wpl_viewed_cookie=no"),
    EVAL_XE_TEST: () => document.cookie.includes("xeConsentState={%22performance%22:false%2C%22marketing%22:false%2C%22compliance%22:false}"),
    EVAL_XING_0: () => document.cookie.includes("userConsent=%7B%22marketing%22%3Afalse"),
    EVAL_YOUTUBE_DESKTOP_0: () => !!document.cookie.match(/SOCS=CAE/),
    EVAL_YOUTUBE_MOBILE_0: () => !!document.cookie.match(/SOCS=CAE/)
  };
  function getFunctionBody(snippetFunc) {
    const snippetStr = snippetFunc.toString();
    return `(${snippetStr})()`;
  }

  // lib/cmps/base.ts
  var defaultRunContext = {
    main: true,
    frame: false,
    urlPattern: ""
  };
  var AutoConsentCMPBase = class {
    constructor(autoconsentInstance) {
      this.runContext = defaultRunContext;
      this.autoconsent = autoconsentInstance;
    }
    get hasSelfTest() {
      throw new Error("Not Implemented");
    }
    get isIntermediate() {
      throw new Error("Not Implemented");
    }
    get isCosmetic() {
      throw new Error("Not Implemented");
    }
    mainWorldEval(snippetId) {
      const snippet = snippets[snippetId];
      if (!snippet) {
        console.warn("Snippet not found", snippetId);
        return Promise.resolve(false);
      }
      const logsConfig = this.autoconsent.config.logs;
      if (this.autoconsent.config.isMainWorld) {
        logsConfig.evals && console.log("inline eval:", snippetId, snippet);
        let result = false;
        try {
          result = !!snippet.call(globalThis);
        } catch (e) {
          logsConfig.evals && console.error("error evaluating rule", snippetId, e);
        }
        return Promise.resolve(result);
      }
      const snippetSrc = getFunctionBody(snippet);
      logsConfig.evals && console.log("async eval:", snippetId, snippetSrc);
      return requestEval(snippetSrc, snippetId).catch((e) => {
        logsConfig.evals && console.error("error evaluating rule", snippetId, e);
        return false;
      });
    }
    checkRunContext() {
      const runCtx = {
        ...defaultRunContext,
        ...this.runContext
      };
      const isTop = window.top === window;
      if (isTop && !runCtx.main) {
        return false;
      }
      if (!isTop && !runCtx.frame) {
        return false;
      }
      if (runCtx.urlPattern && !window.location.href.match(runCtx.urlPattern)) {
        return false;
      }
      return true;
    }
    detectCmp() {
      throw new Error("Not Implemented");
    }
    async detectPopup() {
      return false;
    }
    optOut() {
      throw new Error("Not Implemented");
    }
    optIn() {
      throw new Error("Not Implemented");
    }
    openCmp() {
      throw new Error("Not Implemented");
    }
    async test() {
      return Promise.resolve(true);
    }
    // Implementing DomActionsProvider below:
    click(selector, all = false) {
      return this.autoconsent.domActions.click(selector, all);
    }
    elementExists(selector) {
      return this.autoconsent.domActions.elementExists(selector);
    }
    elementVisible(selector, check) {
      return this.autoconsent.domActions.elementVisible(selector, check);
    }
    waitForElement(selector, timeout) {
      return this.autoconsent.domActions.waitForElement(selector, timeout);
    }
    waitForVisible(selector, timeout, check) {
      return this.autoconsent.domActions.waitForVisible(selector, timeout, check);
    }
    waitForThenClick(selector, timeout, all) {
      return this.autoconsent.domActions.waitForThenClick(selector, timeout, all);
    }
    wait(ms) {
      return this.autoconsent.domActions.wait(ms);
    }
    hide(selector, method) {
      return this.autoconsent.domActions.hide(selector, method);
    }
    prehide(selector) {
      return this.autoconsent.domActions.prehide(selector);
    }
    undoPrehide() {
      return this.autoconsent.domActions.undoPrehide();
    }
    querySingleReplySelector(selector, parent) {
      return this.autoconsent.domActions.querySingleReplySelector(selector, parent);
    }
    querySelectorChain(selectors) {
      return this.autoconsent.domActions.querySelectorChain(selectors);
    }
    elementSelector(selector) {
      return this.autoconsent.domActions.elementSelector(selector);
    }
  };
  var AutoConsentCMP = class extends AutoConsentCMPBase {
    constructor(rule, autoconsentInstance) {
      super(autoconsentInstance);
      this.rule = rule;
      this.name = rule.name;
      this.runContext = rule.runContext || defaultRunContext;
    }
    get hasSelfTest() {
      return !!this.rule.test;
    }
    get isIntermediate() {
      return !!this.rule.intermediate;
    }
    get isCosmetic() {
      return !!this.rule.cosmetic;
    }
    get prehideSelectors() {
      return this.rule.prehideSelectors;
    }
    async detectCmp() {
      if (this.rule.detectCmp) {
        return this._runRulesParallel(this.rule.detectCmp);
      }
      return false;
    }
    async detectPopup() {
      if (this.rule.detectPopup) {
        return this._runRulesSequentially(this.rule.detectPopup);
      }
      return false;
    }
    async optOut() {
      const logsConfig = this.autoconsent.config.logs;
      if (this.rule.optOut) {
        logsConfig.lifecycle && console.log("Initiated optOut()", this.rule.optOut);
        return this._runRulesSequentially(this.rule.optOut);
      }
      return false;
    }
    async optIn() {
      const logsConfig = this.autoconsent.config.logs;
      if (this.rule.optIn) {
        logsConfig.lifecycle && console.log("Initiated optIn()", this.rule.optIn);
        return this._runRulesSequentially(this.rule.optIn);
      }
      return false;
    }
    async openCmp() {
      if (this.rule.openCmp) {
        return this._runRulesSequentially(this.rule.openCmp);
      }
      return false;
    }
    async test() {
      if (this.hasSelfTest) {
        return this._runRulesSequentially(this.rule.test);
      }
      return super.test();
    }
    async evaluateRuleStep(rule) {
      const results = [];
      const logsConfig = this.autoconsent.config.logs;
      if (rule.exists) {
        results.push(this.elementExists(rule.exists));
      }
      if (rule.visible) {
        results.push(this.elementVisible(rule.visible, rule.check));
      }
      if (rule.eval) {
        const res = this.mainWorldEval(rule.eval);
        results.push(res);
      }
      if (rule.waitFor) {
        results.push(this.waitForElement(rule.waitFor, rule.timeout));
      }
      if (rule.waitForVisible) {
        results.push(this.waitForVisible(rule.waitForVisible, rule.timeout, rule.check));
      }
      if (rule.click) {
        results.push(this.click(rule.click, rule.all));
      }
      if (rule.waitForThenClick) {
        results.push(this.waitForThenClick(rule.waitForThenClick, rule.timeout, rule.all));
      }
      if (rule.wait) {
        results.push(this.wait(rule.wait));
      }
      if (rule.hide) {
        results.push(this.hide(rule.hide, rule.method));
      }
      if (rule.if) {
        if (!rule.if.exists && !rule.if.visible) {
          console.error("invalid conditional rule", rule.if);
          return false;
        }
        const condition = await this.evaluateRuleStep(rule.if);
        logsConfig.rulesteps && console.log("Condition is", condition);
        if (condition) {
          results.push(this._runRulesSequentially(rule.then));
        } else if (rule.else) {
          results.push(this._runRulesSequentially(rule.else));
        } else {
          results.push(true);
        }
      }
      if (rule.any) {
        for (const step of rule.any) {
          if (await this.evaluateRuleStep(step)) {
            return true;
          }
        }
        return false;
      }
      if (results.length === 0) {
        logsConfig.errors && console.warn("Unrecognized rule", rule);
        return false;
      }
      const all = await Promise.all(results);
      return all.reduce((a, b) => a && b, true);
    }
    async _runRulesParallel(rules) {
      const results = rules.map((rule) => this.evaluateRuleStep(rule));
      const detections = await Promise.all(results);
      return detections.every((r) => !!r);
    }
    async _runRulesSequentially(rules) {
      const logsConfig = this.autoconsent.config.logs;
      for (const rule of rules) {
        logsConfig.rulesteps && console.log("Running rule...", rule);
        const result = await this.evaluateRuleStep(rule);
        logsConfig.rulesteps && console.log("...rule result", result);
        if (!result && !rule.optional) {
          return false;
        }
      }
      return true;
    }
  };

  // lib/cmps/consentomatic.ts
  var ConsentOMaticCMP = class {
    constructor(name, config) {
      this.name = name;
      this.config = config;
      this.methods = /* @__PURE__ */ new Map();
      this.runContext = defaultRunContext;
      this.isCosmetic = false;
      config.methods.forEach((methodConfig) => {
        if (methodConfig.action) {
          this.methods.set(methodConfig.name, methodConfig.action);
        }
      });
      this.hasSelfTest = false;
    }
    get isIntermediate() {
      return false;
    }
    checkRunContext() {
      return true;
    }
    async detectCmp() {
      const matchResults = this.config.detectors.map((detectorConfig) => matches(detectorConfig.presentMatcher));
      return matchResults.some((r) => !!r);
    }
    async detectPopup() {
      const matchResults = this.config.detectors.map((detectorConfig) => matches(detectorConfig.showingMatcher));
      return matchResults.some((r) => !!r);
    }
    async executeAction(method, param) {
      if (this.methods.has(method)) {
        return executeAction(this.methods.get(method), param);
      }
      return true;
    }
    async optOut() {
      await this.executeAction("HIDE_CMP");
      await this.executeAction("OPEN_OPTIONS");
      await this.executeAction("HIDE_CMP");
      await this.executeAction("DO_CONSENT", []);
      await this.executeAction("SAVE_CONSENT");
      return true;
    }
    async optIn() {
      await this.executeAction("HIDE_CMP");
      await this.executeAction("OPEN_OPTIONS");
      await this.executeAction("HIDE_CMP");
      await this.executeAction("DO_CONSENT", ["D", "A", "B", "E", "F", "X"]);
      await this.executeAction("SAVE_CONSENT");
      return true;
    }
    async openCmp() {
      await this.executeAction("HIDE_CMP");
      await this.executeAction("OPEN_OPTIONS");
      return true;
    }
    async test() {
      return true;
    }
  };

  // lib/utils.ts
  function getStyleElement(styleOverrideElementId = "autoconsent-css-rules") {
    const styleSelector = `style#${styleOverrideElementId}`;
    const existingElement = document.querySelector(styleSelector);
    if (existingElement && existingElement instanceof HTMLStyleElement) {
      return existingElement;
    } else {
      const parent = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
      const css = document.createElement("style");
      css.id = styleOverrideElementId;
      parent.appendChild(css);
      return css;
    }
  }
  function getHidingStyle(method) {
    const hidingSnippet = method === "opacity" ? `opacity: 0` : `display: none`;
    return `${hidingSnippet} !important; z-index: -1 !important; pointer-events: none !important;`;
  }
  function hideElements(styleEl, selector, method = "display") {
    const rule = `${selector} { ${getHidingStyle(method)} } `;
    if (styleEl instanceof HTMLStyleElement) {
      styleEl.innerText += rule;
      return selector.length > 0;
    }
    return false;
  }
  async function waitFor(predicate, maxTimes, interval) {
    const result = await predicate();
    if (!result && maxTimes > 0) {
      return new Promise((resolve) => {
        setTimeout(async () => {
          resolve(waitFor(predicate, maxTimes - 1, interval));
        }, interval);
      });
    }
    return Promise.resolve(result);
  }
  function isElementVisible(elem) {
    if (!elem) {
      return false;
    }
    if (elem.offsetParent !== null) {
      return true;
    } else {
      const css = window.getComputedStyle(elem);
      if (css.position === "fixed" && css.display !== "none") {
        return true;
      }
    }
    return false;
  }
  function copyObject(data) {
    if (globalThis.structuredClone) {
      return structuredClone(data);
    }
    return JSON.parse(JSON.stringify(data));
  }
  function normalizeConfig(providedConfig) {
    const defaultConfig = {
      enabled: true,
      autoAction: "optOut",
      // if falsy, the extension will wait for an explicit user signal before opting in/out
      disabledCmps: [],
      enablePrehide: true,
      enableCosmeticRules: true,
      enableHeuristicDetection: false,
      detectRetries: 20,
      isMainWorld: false,
      prehideTimeout: 2e3,
      enableFilterList: false,
      logs: {
        lifecycle: false,
        rulesteps: false,
        evals: false,
        errors: true,
        messages: false,
        waits: false
      }
    };
    const updatedConfig = copyObject(defaultConfig);
    for (const key of Object.keys(defaultConfig)) {
      if (typeof providedConfig[key] !== "undefined") {
        updatedConfig[key] = providedConfig[key];
      }
    }
    return updatedConfig;
  }
  function scheduleWhenIdle(callback, timeout = 500) {
    if (globalThis.requestIdleCallback) {
      requestIdleCallback(callback, { timeout });
    } else {
      setTimeout(callback, 0);
    }
  }

  // lib/cmps/trustarc-top.ts
  var cookieSettingsButton = "#truste-show-consent";
  var shortcutOptOut = "#truste-consent-required";
  var shortcutOptIn = "#truste-consent-button";
  var popupContent = "#truste-consent-content";
  var bannerOverlay = "#trustarc-banner-overlay";
  var bannerContainer = "#truste-consent-track";
  var TrustArcTop = class extends AutoConsentCMPBase {
    constructor(autoconsentInstance) {
      super(autoconsentInstance);
      this.name = "TrustArc-top";
      this.prehideSelectors = [".trustarc-banner-container", `.truste_popframe,.truste_overlay,.truste_box_overlay,${bannerContainer}`];
      this.runContext = {
        main: true,
        frame: false
      };
      this._shortcutButton = null;
      this._optInDone = false;
    }
    get hasSelfTest() {
      return true;
    }
    get isIntermediate() {
      if (this._optInDone) {
        return false;
      }
      return !this._shortcutButton;
    }
    get isCosmetic() {
      return false;
    }
    async detectCmp() {
      const result = this.elementExists(`${cookieSettingsButton},${bannerContainer}`);
      if (result) {
        this._shortcutButton = document.querySelector(shortcutOptOut);
      }
      return result;
    }
    async detectPopup() {
      return this.elementVisible(`${popupContent},${bannerOverlay},${bannerContainer}`, "any");
    }
    openFrame() {
      this.click(cookieSettingsButton);
    }
    async optOut() {
      if (this._shortcutButton) {
        this._shortcutButton.click();
        return true;
      }
      hideElements(getStyleElement(), `.truste_popframe, .truste_overlay, .truste_box_overlay, ${bannerContainer}`);
      this.click(cookieSettingsButton);
      setTimeout(() => {
        getStyleElement().remove();
      }, 1e4);
      return true;
    }
    async optIn() {
      this._optInDone = true;
      return this.click(shortcutOptIn);
    }
    async openCmp() {
      return true;
    }
    async test() {
      await this.wait(500);
      return await this.mainWorldEval("EVAL_TRUSTARC_TOP");
    }
  };

  // lib/cmps/trustarc-frame.ts
  var TrustArcFrame = class extends AutoConsentCMPBase {
    constructor() {
      super(...arguments);
      this.name = "TrustArc-frame";
      this.runContext = {
        main: false,
        frame: true,
        urlPattern: "^https://consent-pref\\.trustarc\\.com/\\?"
      };
    }
    get hasSelfTest() {
      return true;
    }
    get isIntermediate() {
      return false;
    }
    get isCosmetic() {
      return false;
    }
    async detectCmp() {
      return true;
    }
    async detectPopup() {
      return this.elementVisible("#defaultpreferencemanager", "any") && this.elementVisible(".mainContent", "any");
    }
    async navigateToSettings() {
      await waitFor(
        async () => {
          return this.elementExists(".shp") || this.elementVisible(".advance", "any") || this.elementExists(".switch span:first-child");
        },
        10,
        500
      );
      if (this.elementExists(".shp")) {
        this.click(".shp");
      }
      await this.waitForElement(".prefPanel", 5e3);
      if (this.elementVisible(".advance", "any")) {
        this.click(".advance");
      }
      return await waitFor(() => this.elementVisible(".switch span:first-child", "any"), 5, 1e3);
    }
    async optOut() {
      if (await this.mainWorldEval("EVAL_TRUSTARC_FRAME_TEST")) {
        return true;
      }
      let timeout = 3e3;
      if (await this.mainWorldEval("EVAL_TRUSTARC_FRAME_GTM")) {
        timeout = 1500;
      }
      await waitFor(() => document.readyState === "complete", 20, 100);
      await this.waitForElement(".mainContent[aria-hidden=false]", timeout);
      if (this.click(".rejectAll")) {
        return true;
      }
      if (this.elementExists(".prefPanel")) {
        await this.waitForElement('.prefPanel[style="visibility: visible;"]', timeout);
      }
      if (this.click("#catDetails0")) {
        this.click(".submit");
        this.waitForThenClick("#gwt-debug-close_id", timeout);
        return true;
      }
      if (this.click(".required")) {
        this.waitForThenClick("#gwt-debug-close_id", timeout);
        return true;
      }
      await this.navigateToSettings();
      this.click(".switch span:nth-child(1):not(.active)", true);
      this.click(".submit");
      this.waitForThenClick("#gwt-debug-close_id", timeout * 10);
      return true;
    }
    async optIn() {
      if (this.click(".call")) {
        return true;
      }
      await this.navigateToSettings();
      this.click(".switch span:nth-child(2)", true);
      this.click(".submit");
      this.waitForElement("#gwt-debug-close_id", 3e5).then(() => {
        this.click("#gwt-debug-close_id");
      });
      return true;
    }
    async test() {
      await this.wait(500);
      return await this.mainWorldEval("EVAL_TRUSTARC_FRAME_TEST");
    }
  };

  // lib/cmps/cookiebot.ts
  var Cookiebot = class extends AutoConsentCMPBase {
    constructor() {
      super(...arguments);
      this.name = "Cybotcookiebot";
      this.prehideSelectors = [
        "#CybotCookiebotDialog,#CybotCookiebotDialogBodyUnderlay,#dtcookie-container,#cookiebanner,#cb-cookieoverlay,.modal--cookie-banner,#cookiebanner_outer,#CookieBanner"
      ];
    }
    get hasSelfTest() {
      return true;
    }
    get isIntermediate() {
      return false;
    }
    get isCosmetic() {
      return false;
    }
    async detectCmp() {
      return await this.mainWorldEval("EVAL_COOKIEBOT_1");
    }
    async detectPopup() {
      return this.mainWorldEval("EVAL_COOKIEBOT_2");
    }
    async optOut() {
      await this.wait(500);
      let res = await this.mainWorldEval("EVAL_COOKIEBOT_3");
      await this.wait(500);
      res = res && await this.mainWorldEval("EVAL_COOKIEBOT_4");
      return res;
    }
    async optIn() {
      if (this.elementExists("#dtcookie-container")) {
        return this.click(".h-dtcookie-accept");
      }
      this.click(".CybotCookiebotDialogBodyLevelButton:not(:checked):enabled", true);
      this.click("#CybotCookiebotDialogBodyLevelButtonAccept");
      this.click("#CybotCookiebotDialogBodyButtonAccept");
      return true;
    }
    async test() {
      await this.wait(500);
      return await this.mainWorldEval("EVAL_COOKIEBOT_5");
    }
  };

  // lib/cmps/sourcepoint-frame.ts
  var SourcePoint = class extends AutoConsentCMPBase {
    constructor() {
      super(...arguments);
      this.name = "Sourcepoint-frame";
      this.prehideSelectors = ["div[id^='sp_message_container_'],.message-overlay", "#sp_privacy_manager_container"];
      this.ccpaNotice = false;
      this.ccpaPopup = false;
      this.runContext = {
        main: true,
        frame: true
      };
    }
    get hasSelfTest() {
      return false;
    }
    get isIntermediate() {
      return false;
    }
    get isCosmetic() {
      return false;
    }
    async detectCmp() {
      const url = new URL(location.href);
      if (url.searchParams.has("message_id") && url.hostname === "ccpa-notice.sp-prod.net") {
        this.ccpaNotice = true;
        return true;
      }
      if (url.hostname === "ccpa-pm.sp-prod.net") {
        this.ccpaPopup = true;
        return true;
      }
      return (url.pathname === "/index.html" || url.pathname === "/privacy-manager/index.html" || url.pathname === "/ccpa_pm/index.html") && (url.searchParams.has("message_id") || url.searchParams.has("requestUUID") || url.searchParams.has("consentUUID"));
    }
    async detectPopup() {
      if (this.ccpaNotice) {
        return true;
      }
      if (this.ccpaPopup) {
        return await this.waitForElement(".priv-save-btn", 2e3);
      }
      await this.waitForElement(
        ".sp_choice_type_11,.sp_choice_type_12,.sp_choice_type_13,.sp_choice_type_ACCEPT_ALL,.sp_choice_type_SAVE_AND_EXIT",
        2e3
      );
      return !this.elementExists(".sp_choice_type_9");
    }
    async optIn() {
      await this.waitForElement(".sp_choice_type_11,.sp_choice_type_ACCEPT_ALL", 2e3);
      if (this.click(".sp_choice_type_11")) {
        return true;
      }
      if (this.click(".sp_choice_type_ACCEPT_ALL")) {
        return true;
      }
      return false;
    }
    isManagerOpen() {
      return location.pathname === "/privacy-manager/index.html" || location.pathname === "/ccpa_pm/index.html";
    }
    async optOut() {
      const logsConfig = this.autoconsent.config.logs;
      if (this.ccpaPopup) {
        const toggles = document.querySelectorAll(
          ".priv-purpose-container .sp-switch-arrow-block a.neutral.on .right"
        );
        for (const t of toggles) {
          t.click();
        }
        const switches = document.querySelectorAll(
          ".priv-purpose-container .sp-switch-arrow-block a.switch-bg.on"
        );
        for (const t of switches) {
          t.click();
        }
        return this.click(".priv-save-btn");
      }
      if (!this.isManagerOpen()) {
        const actionable = await this.waitForElement(".sp_choice_type_12,.sp_choice_type_13");
        if (!actionable) {
          return false;
        }
        if (!this.elementExists(".sp_choice_type_12")) {
          return this.click(".sp_choice_type_13");
        }
        this.click(".sp_choice_type_12");
        await waitFor(() => this.isManagerOpen(), 200, 100);
      }
      await this.waitForElement(".type-modal", 2e4);
      this.waitForThenClick(".ccpa-stack .pm-switch[aria-checked=true] .slider", 500, true);
      try {
        const rejectSelector1 = ".sp_choice_type_REJECT_ALL";
        const rejectSelector2 = ".reject-toggle";
        const path = await Promise.race([
          this.waitForElement(rejectSelector1, 2e3).then((success) => success ? 0 : -1),
          this.waitForElement(rejectSelector2, 2e3).then((success) => success ? 1 : -1),
          this.waitForElement(".pm-features", 2e3).then((success) => success ? 2 : -1)
        ]);
        if (path === 0) {
          await this.waitForVisible(rejectSelector1);
          return this.click(rejectSelector1);
        } else if (path === 1) {
          this.click(rejectSelector2);
        } else if (path === 2) {
          await this.waitForElement(".pm-features", 1e4);
          this.click(".checked > span", true);
          this.click(".chevron");
        }
      } catch (e) {
        logsConfig.errors && console.warn(e);
      }
      return this.click(".sp_choice_type_SAVE_AND_EXIT");
    }
  };

  // lib/cmps/consentmanager.ts
  var ConsentManager = class extends AutoConsentCMPBase {
    constructor() {
      super(...arguments);
      this.name = "consentmanager.net";
      this.prehideSelectors = ["#cmpbox,#cmpbox2"];
      this.apiAvailable = false;
    }
    get hasSelfTest() {
      return this.apiAvailable;
    }
    get isIntermediate() {
      return false;
    }
    get isCosmetic() {
      return false;
    }
    async detectCmp() {
      this.apiAvailable = await this.mainWorldEval("EVAL_CONSENTMANAGER_1");
      if (!this.apiAvailable) {
        return this.elementExists("#cmpbox");
      } else {
        return true;
      }
    }
    async detectPopup() {
      if (this.apiAvailable) {
        await this.wait(500);
        return await this.mainWorldEval("EVAL_CONSENTMANAGER_2");
      }
      return this.elementVisible("#cmpbox .cmpmore", "any");
    }
    async optOut() {
      await this.wait(500);
      if (this.apiAvailable) {
        return await this.mainWorldEval("EVAL_CONSENTMANAGER_3");
      }
      if (this.click(".cmpboxbtnno")) {
        return true;
      }
      if (this.elementExists(".cmpwelcomeprpsbtn")) {
        this.click(".cmpwelcomeprpsbtn > a[aria-checked=true]", true);
        this.click(".cmpboxbtnsave");
        return true;
      }
      this.click(".cmpboxbtncustom");
      await this.waitForElement(".cmptblbox", 2e3);
      this.click(".cmptdchoice > a[aria-checked=true]", true);
      this.click(".cmpboxbtnyescustomchoices");
      this.hide("#cmpwrapper,#cmpbox", "display");
      return true;
    }
    async optIn() {
      if (this.apiAvailable) {
        return await this.mainWorldEval("EVAL_CONSENTMANAGER_4");
      }
      return this.click(".cmpboxbtnyes");
    }
    async test() {
      if (this.apiAvailable) {
        return await this.mainWorldEval("EVAL_CONSENTMANAGER_5");
      }
    }
  };

  // lib/cmps/evidon.ts
  var Evidon = class extends AutoConsentCMPBase {
    constructor() {
      super(...arguments);
      this.name = "Evidon";
    }
    get hasSelfTest() {
      return false;
    }
    get isIntermediate() {
      return false;
    }
    get isCosmetic() {
      return false;
    }
    async detectCmp() {
      return this.elementExists("#_evidon_banner");
    }
    async detectPopup() {
      return this.elementVisible("#_evidon_banner", "any");
    }
    async optOut() {
      if (this.click("#_evidon-decline-button")) {
        return true;
      }
      hideElements(getStyleElement(), "#evidon-prefdiag-overlay,#evidon-prefdiag-background,#_evidon-background");
      await this.waitForThenClick("#_evidon-option-button");
      await this.waitForElement("#evidon-prefdiag-overlay", 5e3);
      await this.wait(500);
      await this.waitForThenClick("#evidon-prefdiag-decline");
      return true;
    }
    async optIn() {
      return this.click("#_evidon-accept-button");
    }
  };

  // lib/cmps/onetrust.ts
  var Onetrust = class extends AutoConsentCMPBase {
    constructor() {
      super(...arguments);
      this.name = "Onetrust";
      this.prehideSelectors = ["#onetrust-banner-sdk,#onetrust-consent-sdk,.onetrust-pc-dark-filter,.js-consent-banner"];
      this.runContext = {
        urlPattern: "^(?!.*https://www\\.nba\\.com/)"
      };
    }
    get hasSelfTest() {
      return true;
    }
    get isIntermediate() {
      return false;
    }
    get isCosmetic() {
      return false;
    }
    async detectCmp() {
      return this.elementExists("#onetrust-banner-sdk,#onetrust-pc-sdk");
    }
    async detectPopup() {
      return this.elementVisible("#onetrust-banner-sdk,#onetrust-pc-sdk", "any");
    }
    async optOut() {
      if (this.elementVisible("#onetrust-reject-all-handler,.ot-pc-refuse-all-handler,.js-reject-cookies", "any")) {
        return this.click("#onetrust-reject-all-handler,.ot-pc-refuse-all-handler,.js-reject-cookies");
      }
      if (this.elementExists("#onetrust-pc-btn-handler")) {
        this.click("#onetrust-pc-btn-handler");
      } else {
        this.click(".ot-sdk-show-settings,button.js-cookie-settings");
      }
      await this.waitForElement("#onetrust-consent-sdk", 2e3);
      await this.wait(1e3);
      this.click("#onetrust-consent-sdk input.category-switch-handler:checked,.js-editor-toggle-state:checked", true);
      await this.wait(1e3);
      await this.waitForElement(".save-preference-btn-handler,.js-consent-save", 2e3);
      this.click(".save-preference-btn-handler,.js-consent-save");
      await this.waitForVisible("#onetrust-banner-sdk", 5e3, "none");
      return true;
    }
    async optIn() {
      return this.click("#onetrust-accept-btn-handler,#accept-recommended-btn-handler,.js-accept-cookies");
    }
    async test() {
      return await waitFor(() => this.mainWorldEval("EVAL_ONETRUST_1"), 10, 500);
    }
  };

  // lib/cmps/klaro.ts
  var Klaro = class extends AutoConsentCMPBase {
    constructor() {
      super(...arguments);
      this.name = "Klaro";
      this.prehideSelectors = [".klaro"];
      this.settingsOpen = false;
    }
    get hasSelfTest() {
      return true;
    }
    get isIntermediate() {
      return false;
    }
    get isCosmetic() {
      return false;
    }
    async detectCmp() {
      if (this.elementExists(".klaro > .cookie-modal")) {
        this.settingsOpen = true;
        return true;
      }
      return this.elementExists(".klaro > .cookie-notice");
    }
    async detectPopup() {
      return this.elementVisible(".klaro > .cookie-notice,.klaro > .cookie-modal", "any");
    }
    async optOut() {
      const apiOptOutSuccess = await this.mainWorldEval("EVAL_KLARO_TRY_API_OPT_OUT");
      if (apiOptOutSuccess) {
        return true;
      }
      if (this.click(".klaro .cn-decline")) {
        return true;
      }
      await this.mainWorldEval("EVAL_KLARO_OPEN_POPUP");
      if (this.click(".klaro .cn-decline")) {
        return true;
      }
      this.click(
        ".cm-purpose:not(.cm-toggle-all) > input:not(.half-checked,.required,.only-required),.cm-purpose:not(.cm-toggle-all) > div > input:not(.half-checked,.required,.only-required)",
        true
      );
      return this.click(".cm-btn-accept,.cm-button");
    }
    async optIn() {
      if (this.click(".klaro .cm-btn-accept-all")) {
        return true;
      }
      if (this.settingsOpen) {
        this.click(".cm-purpose:not(.cm-toggle-all) > input.half-checked", true);
        return this.click(".cm-btn-accept");
      }
      return this.click(".klaro .cookie-notice .cm-btn-success");
    }
    async test() {
      return await this.mainWorldEval("EVAL_KLARO_1");
    }
  };

  // lib/cmps/uniconsent.ts
  var Uniconsent = class extends AutoConsentCMPBase {
    constructor() {
      super(...arguments);
      this.name = "Uniconsent";
    }
    get prehideSelectors() {
      return [".unic", ".modal:has(.unic)"];
    }
    get hasSelfTest() {
      return true;
    }
    get isIntermediate() {
      return false;
    }
    get isCosmetic() {
      return false;
    }
    async detectCmp() {
      return this.elementExists(".unic .unic-box,.unic .unic-bar,.unic .unic-modal");
    }
    async detectPopup() {
      return this.elementVisible(".unic .unic-box,.unic .unic-bar,.unic .unic-modal", "any");
    }
    async optOut() {
      await this.waitForElement(".unic button", 1e3);
      document.querySelectorAll(".unic button").forEach((button) => {
        const text = button.textContent;
        if (text.includes("Manage Options") || text.includes("Optionen verwalten")) {
          button.click();
        }
      });
      if (await this.waitForElement(".unic input[type=checkbox]", 1e3)) {
        await this.waitForElement(".unic button", 1e3);
        document.querySelectorAll(".unic input[type=checkbox]").forEach((c) => {
          if (c.checked) {
            c.click();
          }
        });
        for (const b of document.querySelectorAll(".unic button")) {
          const text = b.textContent;
          for (const pattern of ["Confirm Choices", "Save Choices", "Auswahl speichern"]) {
            if (text.includes(pattern)) {
              b.click();
              await this.wait(500);
              return true;
            }
          }
        }
      }
      return false;
    }
    async optIn() {
      return this.waitForThenClick(".unic #unic-agree");
    }
    async test() {
      await this.wait(1e3);
      const res = this.elementExists(".unic .unic-box,.unic .unic-bar");
      return !res;
    }
  };

  // lib/cmps/conversant.ts
  var Conversant = class extends AutoConsentCMPBase {
    constructor() {
      super(...arguments);
      this.prehideSelectors = [".cmp-root"];
      this.name = "Conversant";
    }
    get hasSelfTest() {
      return true;
    }
    get isIntermediate() {
      return false;
    }
    get isCosmetic() {
      return false;
    }
    async detectCmp() {
      return this.elementExists(".cmp-root .cmp-receptacle");
    }
    async detectPopup() {
      return this.elementVisible(".cmp-root .cmp-receptacle", "any");
    }
    async optOut() {
      if (!await this.waitForThenClick(".cmp-main-button:not(.cmp-main-button--primary)")) {
        return false;
      }
      if (!await this.waitForElement(".cmp-view-tab-tabs")) {
        return false;
      }
      await this.waitForThenClick(".cmp-view-tab-tabs > :first-child");
      await this.waitForThenClick(".cmp-view-tab-tabs > .cmp-view-tab--active:first-child");
      for (const item of Array.from(document.querySelectorAll(".cmp-accordion-item"))) {
        item.querySelector(".cmp-accordion-item-title").click();
        await waitFor(() => !!item.querySelector(".cmp-accordion-item-content.cmp-active"), 10, 50);
        const content = item.querySelector(".cmp-accordion-item-content.cmp-active");
        content.querySelectorAll(".cmp-toggle-actions .cmp-toggle-deny:not(.cmp-toggle-deny--active)").forEach((e) => e.click());
        content.querySelectorAll(".cmp-toggle-actions .cmp-toggle-checkbox:not(.cmp-toggle-checkbox--active)").forEach((e) => e.click());
      }
      await this.click(".cmp-main-button:not(.cmp-main-button--primary)");
      return true;
    }
    async optIn() {
      return this.waitForThenClick(".cmp-main-button.cmp-main-button--primary");
    }
    async test() {
      return document.cookie.includes("cmp-data=0");
    }
  };

  // lib/cmps/tiktok.ts
  var Tiktok = class extends AutoConsentCMPBase {
    constructor() {
      super(...arguments);
      this.name = "tiktok.com";
      this.runContext = {
        urlPattern: "tiktok"
      };
    }
    get hasSelfTest() {
      return true;
    }
    get isIntermediate() {
      return false;
    }
    get isCosmetic() {
      return false;
    }
    getShadowRoot() {
      const container = document.querySelector("tiktok-cookie-banner");
      if (!container) {
        return null;
      }
      return container.shadowRoot;
    }
    async detectCmp() {
      return this.elementExists("tiktok-cookie-banner");
    }
    async detectPopup() {
      const banner = this.getShadowRoot().querySelector(".tiktok-cookie-banner");
      return isElementVisible(banner);
    }
    async optOut() {
      const logsConfig = this.autoconsent.config.logs;
      const declineButton = this.getShadowRoot().querySelector(".button-wrapper button:first-child");
      if (declineButton) {
        logsConfig.rulesteps && console.log("[clicking]", declineButton);
        declineButton.click();
        return true;
      } else {
        logsConfig.errors && console.log("no decline button found");
        return false;
      }
    }
    async optIn() {
      const logsConfig = this.autoconsent.config.logs;
      const acceptButton = this.getShadowRoot().querySelector(".button-wrapper button:last-child");
      if (acceptButton) {
        logsConfig.rulesteps && console.log("[clicking]", acceptButton);
        acceptButton.click();
        return true;
      } else {
        logsConfig.errors && console.log("no accept button found");
        return false;
      }
    }
    async test() {
      const match = document.cookie.match(/cookie-consent=([^;]+)/);
      if (!match) {
        return false;
      }
      const value = JSON.parse(decodeURIComponent(match[1]));
      return Object.values(value).every((x) => typeof x !== "boolean" || x === false);
    }
  };

  // lib/cmps/airbnb.ts
  var Airbnb = class extends AutoConsentCMPBase {
    constructor() {
      super(...arguments);
      this.name = "airbnb";
      this.runContext = {
        urlPattern: "^https://(www\\.)?airbnb\\.[^/]+/"
      };
      this.prehideSelectors = [
        "div[data-testid=main-cookies-banner-container]",
        'div:has(> div:first-child):has(> div:last-child):has(> section [data-testid="strictly-necessary-cookies"])'
      ];
    }
    get hasSelfTest() {
      return true;
    }
    get isIntermediate() {
      return false;
    }
    get isCosmetic() {
      return false;
    }
    async detectCmp() {
      return this.elementExists("div[data-testid=main-cookies-banner-container]");
    }
    async detectPopup() {
      return this.elementVisible("div[data-testid=main-cookies-banner-container", "any");
    }
    async optOut() {
      await this.waitForThenClick("div[data-testid=main-cookies-banner-container] button._snbhip0");
      let check;
      while (check = document.querySelector("[data-testid=modal-container] button[aria-checked=true]:not([disabled])")) {
        check.click();
      }
      return this.waitForThenClick("button[data-testid=save-btn]");
    }
    async optIn() {
      return this.waitForThenClick("div[data-testid=main-cookies-banner-container] button._148dgdpk");
    }
    async test() {
      return await waitFor(() => !!document.cookie.match("OptanonAlertBoxClosed"), 20, 200);
    }
  };

  // lib/cmps/tumblr-com.ts
  var Tumblr = class extends AutoConsentCMPBase {
    constructor() {
      super(...arguments);
      this.name = "tumblr-com";
      this.runContext = {
        urlPattern: "^https://(www\\.)?tumblr\\.com/"
      };
    }
    get hasSelfTest() {
      return false;
    }
    get isIntermediate() {
      return false;
    }
    get isCosmetic() {
      return false;
    }
    get prehideSelectors() {
      return ["#cmp-app-container"];
    }
    async detectCmp() {
      return this.elementExists("#cmp-app-container");
    }
    async detectPopup() {
      return this.elementVisible("#cmp-app-container", "any");
    }
    async optOut() {
      let iframe = document.querySelector("#cmp-app-container iframe");
      let settingsButton = iframe.contentDocument?.querySelector(".cmp-components-button.is-secondary");
      if (!settingsButton) {
        return false;
      }
      settingsButton.click();
      await waitFor(
        () => {
          const iframe2 = document.querySelector("#cmp-app-container iframe");
          return !!iframe2.contentDocument?.querySelector(".cmp__dialog input");
        },
        5,
        500
      );
      iframe = document.querySelector("#cmp-app-container iframe");
      settingsButton = iframe.contentDocument?.querySelector(".cmp-components-button.is-secondary");
      if (!settingsButton) {
        return false;
      }
      settingsButton.click();
      return true;
    }
    async optIn() {
      const iframe = document.querySelector("#cmp-app-container iframe");
      const acceptButton = iframe.contentDocument.querySelector(".cmp-components-button.is-primary");
      if (acceptButton) {
        acceptButton.click();
        return true;
      }
      return false;
    }
  };

  // lib/cmps/admiral.ts
  var Admiral = class extends AutoConsentCMPBase {
    constructor() {
      super(...arguments);
      this.name = "Admiral";
    }
    get hasSelfTest() {
      return false;
    }
    get isIntermediate() {
      return false;
    }
    get isCosmetic() {
      return false;
    }
    async detectCmp() {
      return this.elementExists("div > div[class*=Card] > div[class*=Frame] > div[class*=Pills] > button[class*=Pills__StyledPill]");
    }
    async detectPopup() {
      return this.elementVisible(
        "div > div[class*=Card] > div[class*=Frame] > div[class*=Pills] > button[class*=Pills__StyledPill]",
        "any"
      );
    }
    async optOut() {
      const rejectAllSelector = "xpath///button[contains(., 'Afvis alle') or contains(., 'Reject all') or contains(., 'Odbaci sve') or contains(., 'Rechazar todo') or contains(., 'Atmesti visus') or contains(., 'Odm\xEDtnout v\u0161e') or contains(., '\u0391\u03C0\u03CC\u03C1\u03C1\u03B9\u03C8\u03B7 \u03CC\u03BB\u03C9\u03BD') or contains(., 'Rejeitar tudo') or contains(., 'T\xFCm\xFCn\xFC reddet') or contains(., '\u041E\u0442\u043A\u043B\u043E\u043D\u0438\u0442\u044C \u0432\u0441\u0435') or contains(., 'Noraid\u012Bt visu') or contains(., 'Avvisa alla') or contains(., 'Odrzu\u0107 wszystkie') or contains(., 'Alles afwijzen') or contains(., '\u041E\u0442\u0445\u0432\u044A\u0440\u043B\u044F\u043D\u0435 \u043D\u0430 \u0432\u0441\u0438\u0447\u043A\u0438') or contains(., 'Rifiuta tutto') or contains(., 'Zavrni vse') or contains(., 'Az \xF6sszes elutas\xEDt\xE1sa') or contains(., 'Respinge\u021Bi tot') or contains(., 'Alles ablehnen') or contains(., 'Tout rejeter') or contains(., 'Odmietnu\u0165 v\u0161etko') or contains(., 'L\xFCkka k\xF5ik tagasi') or contains(., 'Hylk\xE4\xE4 kaikki')]";
      if (await this.waitForElement(rejectAllSelector, 500)) {
        return this.click(rejectAllSelector);
      }
      const purposesButtonSelector = "xpath///button[contains(., 'Zwecke') or contains(., '\u03A3\u03BA\u03BF\u03C0\u03BF\u03AF') or contains(., 'Purposes') or contains(., '\u0426\u0435\u043B\u0438') or contains(., 'Eesm\xE4rgid') or contains(., 'Tikslai') or contains(., 'Svrhe') or contains(., 'Cele') or contains(., '\xDA\u010Dely') or contains(., 'Finalidades') or contains(., 'M\u0113r\u0137i') or contains(., 'Scopuri') or contains(., 'Fines') or contains(., '\xC4ndam\xE5l') or contains(., 'Finalit\xE9s') or contains(., 'Doeleinden') or contains(., 'Tarkoitukset') or contains(., 'Scopi') or contains(., 'Ama\xE7lar') or contains(., 'Nameni') or contains(., 'C\xE9lok') or contains(., 'Form\xE5l')]";
      const saveAndExitSelector = "xpath///button[contains(., 'Spara & avsluta') or contains(., 'Save & exit') or contains(., 'Ulo\u017Eit a ukon\u010Dit') or contains(., 'Enregistrer et quitter') or contains(., 'Speichern & Verlassen') or contains(., 'Tallenna ja poistu') or contains(., 'I\u0161saugoti ir i\u0161eiti') or contains(., 'Opslaan & afsluiten') or contains(., 'Guardar y salir') or contains(., 'Shrani in zapri') or contains(., 'Ulo\u017Ei\u0165 a ukon\u010Di\u0165') or contains(., 'Kaydet ve \xE7\u0131k\u0131\u015F yap') or contains(., '\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0438 \u0432\u044B\u0439\u0442\u0438') or contains(., 'Salvesta ja v\xE4lju') or contains(., 'Salva ed esci') or contains(., 'Gem & afslut') or contains(., '\u0391\u03C0\u03BF\u03B8\u03AE\u03BA\u03B5\u03C5\u03C3\u03B7 \u03BA\u03B1\u03B9 \u03AD\u03BE\u03BF\u03B4\u03BF\u03C2') or contains(., 'Saglab\u0101t un iziet') or contains(., 'Ment\xE9s \xE9s kil\xE9p\xE9s') or contains(., 'Guardar e sair') or contains(., 'Zapisz & zako\u0144cz') or contains(., 'Salvare \u0219i ie\u0219ire') or contains(., 'Spremi i iza\u0111i') or contains(., '\u0417\u0430\u043F\u0430\u0437\u0432\u0430\u043D\u0435 \u0438 \u0438\u0437\u0445\u043E\u0434')]";
      if (await this.waitForThenClick(purposesButtonSelector) && await this.waitForVisible(saveAndExitSelector)) {
        const popupBody = this.elementSelector(saveAndExitSelector)[0].parentElement.parentElement;
        const checkboxes = popupBody.querySelectorAll("input[type=checkbox]:checked");
        checkboxes.forEach((checkbox) => checkbox.click());
        return this.click(saveAndExitSelector);
      }
      return false;
    }
    async optIn() {
      return this.click(
        "xpath///button[contains(., 'Sprejmi vse') or contains(., 'Prihvati sve') or contains(., 'Godk\xE4nn alla') or contains(., 'Prija\u0165 v\u0161etko') or contains(., '\u041F\u0440\u0438\u043D\u044F\u0442\u044C \u0432\u0441\u0435') or contains(., 'Aceptar todo') or contains(., '\u0391\u03C0\u03BF\u03B4\u03BF\u03C7\u03AE \u03CC\u03BB\u03C9\u03BD') or contains(., 'Zaakceptuj wszystkie') or contains(., 'Accetta tutto') or contains(., 'Priimti visus') or contains(., 'Pie\u0146emt visu') or contains(., 'T\xFCm\xFCn\xFC kabul et') or contains(., 'Az \xF6sszes elfogad\xE1sa') or contains(., 'Accept all') or contains(., '\u041F\u0440\u0438\u0435\u043C\u0430\u043D\u0435 \u043D\u0430 \u0432\u0441\u0438\u0447\u043A\u0438') or contains(., 'Accepter alle') or contains(., 'Hyv\xE4ksy kaikki') or contains(., 'Tout accepter') or contains(., 'Alles accepteren') or contains(., 'Aktsepteeri k\xF5ik') or contains(., 'P\u0159ijmout v\u0161e') or contains(., 'Alles akzeptieren') or contains(., 'Aceitar tudo') or contains(., 'Accepta\u021Bi tot')]"
      );
    }
  };

  // lib/cmps/all.ts
  var dynamicCMPs = [
    TrustArcTop,
    TrustArcFrame,
    Cookiebot,
    SourcePoint,
    ConsentManager,
    Evidon,
    Onetrust,
    Klaro,
    Uniconsent,
    Conversant,
    Tiktok,
    Airbnb,
    Tumblr,
    Admiral
  ];

  // lib/dom-actions.ts
  var DomActions = class {
    // eslint-disable-next-line no-useless-constructor
    constructor(autoconsentInstance) {
      this.autoconsentInstance = autoconsentInstance;
    }
    click(selector, all = false) {
      const elem = this.elementSelector(selector);
      this.autoconsentInstance.config.logs.rulesteps && console.log("[click]", selector, all, elem);
      if (elem.length > 0) {
        if (all) {
          elem.forEach((e) => e.click());
        } else {
          elem[0].click();
        }
      }
      return elem.length > 0;
    }
    elementExists(selector) {
      const exists = this.elementSelector(selector).length > 0;
      return exists;
    }
    elementVisible(selector, check) {
      const elem = this.elementSelector(selector);
      const results = new Array(elem.length);
      elem.forEach((e, i) => {
        results[i] = isElementVisible(e);
      });
      if (check === "none") {
        return results.every((r) => !r);
      } else if (results.length === 0) {
        return false;
      } else if (check === "any") {
        return results.some((r) => r);
      }
      return results.every((r) => r);
    }
    waitForElement(selector, timeout = 1e4) {
      const interval = 200;
      const times = Math.ceil(timeout / interval);
      this.autoconsentInstance.config.logs.rulesteps && console.log("[waitForElement]", selector);
      return waitFor(() => this.elementSelector(selector).length > 0, times, interval);
    }
    waitForVisible(selector, timeout = 1e4, check = "any") {
      const interval = 200;
      const times = Math.ceil(timeout / interval);
      this.autoconsentInstance.config.logs.rulesteps && console.log("[waitForVisible]", selector);
      return waitFor(() => this.elementVisible(selector, check), times, interval);
    }
    async waitForThenClick(selector, timeout = 1e4, all = false) {
      await this.waitForElement(selector, timeout);
      return this.click(selector, all);
    }
    wait(ms) {
      this.autoconsentInstance.config.logs.rulesteps && this.autoconsentInstance.config.logs.waits && console.log("[wait]", ms);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, ms);
      });
    }
    hide(selector, method) {
      this.autoconsentInstance.config.logs.rulesteps && console.log("[hide]", selector);
      const styleEl = getStyleElement();
      return hideElements(styleEl, selector, method);
    }
    prehide(selector) {
      const styleEl = getStyleElement("autoconsent-prehide");
      this.autoconsentInstance.config.logs.lifecycle && console.log("[prehide]", styleEl, location.href);
      return hideElements(styleEl, selector, "opacity");
    }
    undoPrehide() {
      const existingElement = getStyleElement("autoconsent-prehide");
      this.autoconsentInstance.config.logs.lifecycle && console.log("[undoprehide]", existingElement, location.href);
      if (existingElement) {
        existingElement.remove();
      }
      return !!existingElement;
    }
    async createOrUpdateStyleSheet(cssText, styleSheet) {
      if (!styleSheet) {
        styleSheet = new CSSStyleSheet();
      }
      styleSheet = await styleSheet.replace(cssText);
      return styleSheet;
    }
    removeStyleSheet(styleSheet) {
      if (styleSheet) {
        styleSheet.replace("");
        return true;
      }
      return false;
    }
    querySingleReplySelector(selector, parent = document) {
      if (selector.startsWith("aria/")) {
        return [];
      }
      if (selector.startsWith("xpath/")) {
        const xpath = selector.slice(6);
        const result = document.evaluate(xpath, parent, null, XPathResult.ANY_TYPE, null);
        let node = null;
        const elements = [];
        while (node = result.iterateNext()) {
          elements.push(node);
        }
        return elements;
      }
      if (selector.startsWith("text/")) {
        return [];
      }
      if (selector.startsWith("pierce/")) {
        return [];
      }
      if (parent.shadowRoot) {
        return Array.from(parent.shadowRoot.querySelectorAll(selector));
      }
      return Array.from(parent.querySelectorAll(selector));
    }
    querySelectorChain(selectors) {
      let parent = document;
      let matches3;
      for (const selector of selectors) {
        matches3 = this.querySingleReplySelector(selector, parent);
        if (matches3.length === 0) {
          return [];
        }
        parent = matches3[0];
      }
      return matches3;
    }
    elementSelector(selector) {
      if (typeof selector === "string") {
        return this.querySingleReplySelector(selector);
      }
      return this.querySelectorChain(selector);
    }
  };

  // node_modules/@ghostery/adblocker/dist/esm/crc32.js
  (() => {
    let c = 0;
    const table = new Int32Array(256);
    for (let n = 0; n !== 256; n += 1) {
      c = n;
      c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
      c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
      c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
      c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
      c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
      c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
      c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
      c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
      table[n] = c;
    }
    return table;
  })();
  new Int8Array(new Int16Array([1]).buffer)[0] === 1;

  // node_modules/@ghostery/adblocker-extended-selectors/dist/esm/parse.js
  var TOKENS = {
    attribute: /\[\s*(?:(?<namespace>\*|[-\w]*)\|)?(?<name>[-\w\u{0080}-\u{FFFF}]+)\s*(?:(?<operator>\W?=)\s*(?<value>.+?)\s*(?<caseSensitive>[iIsS])?\s*)?\]/gu,
    id: /#(?<name>(?:[-\w\u{0080}-\u{FFFF}]|\\.)+)/gu,
    class: /\.(?<name>(?:[-\w\u{0080}-\u{FFFF}]|\\.)+)/gu,
    comma: /\s*,\s*/g,
    // must be before combinator
    combinator: /\s*[\s>+~]\s*/g,
    // this must be after attribute
    "pseudo-element": /::(?<name>[-\w\u{0080}-\u{FFFF}]+)(?:\((?:¶*)\))?/gu,
    // this must be before pseudo-class
    "pseudo-class": /:(?<name>[-\w\u{0080}-\u{FFFF}]+)(?:\((?<argument>¶*)\))?/gu,
    type: /(?:(?<namespace>\*|[-\w]*)\|)?(?<name>[-\w\u{0080}-\u{FFFF}]+)|\*/gu
    // this must be last
  };
  var TOKENS_WITH_PARENS = /* @__PURE__ */ new Set(["pseudo-class", "pseudo-element"]);
  /* @__PURE__ */ new Set([...TOKENS_WITH_PARENS, "attribute"]);
  var TOKENS_FOR_RESTORE = Object.assign({}, TOKENS);
  TOKENS_FOR_RESTORE["pseudo-element"] = RegExp(TOKENS["pseudo-element"].source.replace("(?<argument>\xB6*)", "(?<argument>.*?)"), "gu");
  TOKENS_FOR_RESTORE["pseudo-class"] = RegExp(TOKENS["pseudo-class"].source.replace("(?<argument>\xB6*)", "(?<argument>.*)"), "gu");

  // node_modules/@ghostery/adblocker-extended-selectors/dist/esm/extended.js
  var SelectorType;
  (function(SelectorType2) {
    SelectorType2[SelectorType2["Normal"] = 0] = "Normal";
    SelectorType2[SelectorType2["Extended"] = 1] = "Extended";
    SelectorType2[SelectorType2["Invalid"] = 2] = "Invalid";
  })(SelectorType || (SelectorType = {}));

  // node_modules/@ghostery/adblocker/dist/esm/utils.js
  var HASH_INTERNAL_MULT = 37;
  var HASH_SEED = 5011;
  function fastHashBetween(str, begin, end) {
    let hash = HASH_SEED;
    for (let i = begin; i < end; i += 1) {
      hash = hash * HASH_INTERNAL_MULT ^ str.charCodeAt(i);
    }
    return hash >>> 0;
  }
  function fastHash(str) {
    if (typeof str !== "string") {
      return HASH_SEED;
    }
    if (str.length === 0) {
      return HASH_SEED;
    }
    return fastHashBetween(str, 0, str.length);
  }

  // node_modules/@ghostery/adblocker/dist/esm/request.js
  ({
    beacon: fastHash("type:beacon"),
    cspReport: fastHash("type:csp"),
    csp_report: fastHash("type:csp"),
    cspviolationreport: fastHash("type:cspviolationreport"),
    document: fastHash("type:document"),
    eventsource: fastHash("type:other"),
    fetch: fastHash("type:xhr"),
    font: fastHash("type:font"),
    image: fastHash("type:image"),
    imageset: fastHash("type:image"),
    mainFrame: fastHash("type:document"),
    main_frame: fastHash("type:document"),
    manifest: fastHash("type:other"),
    media: fastHash("type:media"),
    object: fastHash("type:object"),
    object_subrequest: fastHash("type:object"),
    other: fastHash("type:other"),
    ping: fastHash("type:ping"),
    prefetch: fastHash("type:other"),
    preflight: fastHash("type:preflight"),
    script: fastHash("type:script"),
    signedexchange: fastHash("type:signedexchange"),
    speculative: fastHash("type:other"),
    stylesheet: fastHash("type:stylesheet"),
    subFrame: fastHash("type:subdocument"),
    sub_frame: fastHash("type:subdocument"),
    texttrack: fastHash("type:other"),
    webSocket: fastHash("type:websocket"),
    web_manifest: fastHash("type:other"),
    websocket: fastHash("type:websocket"),
    xhr: fastHash("type:xhr"),
    xml_dtd: fastHash("type:other"),
    xmlhttprequest: fastHash("type:xhr"),
    xslt: fastHash("type:other")
  });
  (() => {
    const div = typeof document !== "undefined" ? document.createElement("div") : {
      matches: () => {
      }
    };
    const matches3 = (selector) => div.matches(selector);
    const validSelectorRe = /^[#.]?[\w-.]+$/;
    return function isValidCssImpl(selector) {
      if (validSelectorRe.test(selector)) {
        return true;
      }
      try {
        matches3(selector);
      } catch (ex) {
        return false;
      }
      return true;
    };
  })();
  var COSMETICS_MASK;
  (function(COSMETICS_MASK2) {
    COSMETICS_MASK2[COSMETICS_MASK2["unhide"] = 1] = "unhide";
    COSMETICS_MASK2[COSMETICS_MASK2["scriptInject"] = 2] = "scriptInject";
    COSMETICS_MASK2[COSMETICS_MASK2["isUnicode"] = 4] = "isUnicode";
    COSMETICS_MASK2[COSMETICS_MASK2["isClassSelector"] = 8] = "isClassSelector";
    COSMETICS_MASK2[COSMETICS_MASK2["isIdSelector"] = 16] = "isIdSelector";
    COSMETICS_MASK2[COSMETICS_MASK2["isHrefSelector"] = 32] = "isHrefSelector";
    COSMETICS_MASK2[COSMETICS_MASK2["remove"] = 64] = "remove";
    COSMETICS_MASK2[COSMETICS_MASK2["extended"] = 128] = "extended";
    COSMETICS_MASK2[COSMETICS_MASK2["isPureHasSelector"] = 256] = "isPureHasSelector";
  })(COSMETICS_MASK || (COSMETICS_MASK = {}));

  // node_modules/@ghostery/adblocker/dist/esm/filters/network.js
  fastHash("http");
  fastHash("https");
  var NETWORK_FILTER_MASK;
  (function(NETWORK_FILTER_MASK2) {
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["fromDocument"] = 1] = "fromDocument";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["fromFont"] = 2] = "fromFont";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["fromHttp"] = 4] = "fromHttp";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["fromHttps"] = 8] = "fromHttps";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["fromImage"] = 16] = "fromImage";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["fromMedia"] = 32] = "fromMedia";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["fromObject"] = 64] = "fromObject";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["fromOther"] = 128] = "fromOther";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["fromPing"] = 256] = "fromPing";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["fromScript"] = 512] = "fromScript";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["fromStylesheet"] = 1024] = "fromStylesheet";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["fromSubdocument"] = 2048] = "fromSubdocument";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["fromWebsocket"] = 4096] = "fromWebsocket";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["fromXmlHttpRequest"] = 8192] = "fromXmlHttpRequest";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["firstParty"] = 16384] = "firstParty";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["thirdParty"] = 32768] = "thirdParty";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["isReplace"] = 65536] = "isReplace";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["isBadFilter"] = 131072] = "isBadFilter";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["isCSP"] = 262144] = "isCSP";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["isGenericHide"] = 524288] = "isGenericHide";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["isImportant"] = 1048576] = "isImportant";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["isSpecificHide"] = 2097152] = "isSpecificHide";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["isFullRegex"] = 4194304] = "isFullRegex";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["isRegex"] = 8388608] = "isRegex";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["isUnicode"] = 16777216] = "isUnicode";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["isLeftAnchor"] = 33554432] = "isLeftAnchor";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["isRightAnchor"] = 67108864] = "isRightAnchor";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["isException"] = 134217728] = "isException";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["isHostnameAnchor"] = 268435456] = "isHostnameAnchor";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["isRedirectRule"] = 536870912] = "isRedirectRule";
    NETWORK_FILTER_MASK2[NETWORK_FILTER_MASK2["isRedirect"] = 1073741824] = "isRedirect";
  })(NETWORK_FILTER_MASK || (NETWORK_FILTER_MASK = {}));
  NETWORK_FILTER_MASK.fromDocument | NETWORK_FILTER_MASK.fromFont | NETWORK_FILTER_MASK.fromImage | NETWORK_FILTER_MASK.fromMedia | NETWORK_FILTER_MASK.fromObject | NETWORK_FILTER_MASK.fromOther | NETWORK_FILTER_MASK.fromPing | NETWORK_FILTER_MASK.fromScript | NETWORK_FILTER_MASK.fromStylesheet | NETWORK_FILTER_MASK.fromSubdocument | NETWORK_FILTER_MASK.fromWebsocket | NETWORK_FILTER_MASK.fromXmlHttpRequest;
  ({
    beacon: NETWORK_FILTER_MASK.fromPing,
    // fromOther?
    document: NETWORK_FILTER_MASK.fromDocument,
    cspviolationreport: NETWORK_FILTER_MASK.fromOther,
    fetch: NETWORK_FILTER_MASK.fromXmlHttpRequest,
    font: NETWORK_FILTER_MASK.fromFont,
    image: NETWORK_FILTER_MASK.fromImage,
    imageset: NETWORK_FILTER_MASK.fromImage,
    mainFrame: NETWORK_FILTER_MASK.fromDocument,
    main_frame: NETWORK_FILTER_MASK.fromDocument,
    media: NETWORK_FILTER_MASK.fromMedia,
    object: NETWORK_FILTER_MASK.fromObject,
    object_subrequest: NETWORK_FILTER_MASK.fromObject,
    ping: NETWORK_FILTER_MASK.fromPing,
    // fromOther?
    script: NETWORK_FILTER_MASK.fromScript,
    stylesheet: NETWORK_FILTER_MASK.fromStylesheet,
    subFrame: NETWORK_FILTER_MASK.fromSubdocument,
    sub_frame: NETWORK_FILTER_MASK.fromSubdocument,
    webSocket: NETWORK_FILTER_MASK.fromWebsocket,
    websocket: NETWORK_FILTER_MASK.fromWebsocket,
    xhr: NETWORK_FILTER_MASK.fromXmlHttpRequest,
    xmlhttprequest: NETWORK_FILTER_MASK.fromXmlHttpRequest,
    // Other
    cspReport: NETWORK_FILTER_MASK.fromOther,
    csp_report: NETWORK_FILTER_MASK.fromOther,
    eventsource: NETWORK_FILTER_MASK.fromOther,
    manifest: NETWORK_FILTER_MASK.fromOther,
    other: NETWORK_FILTER_MASK.fromOther,
    prefetch: NETWORK_FILTER_MASK.fromOther,
    preflight: NETWORK_FILTER_MASK.fromOther,
    signedexchange: NETWORK_FILTER_MASK.fromOther,
    speculative: NETWORK_FILTER_MASK.fromOther,
    texttrack: NETWORK_FILTER_MASK.fromOther,
    web_manifest: NETWORK_FILTER_MASK.fromOther,
    xml_dtd: NETWORK_FILTER_MASK.fromOther,
    xslt: NETWORK_FILTER_MASK.fromOther
  });

  // node_modules/@ghostery/adblocker/dist/esm/preprocessor.js
  var PreprocessorTokens;
  (function(PreprocessorTokens2) {
    PreprocessorTokens2[PreprocessorTokens2["INVALID"] = 0] = "INVALID";
    PreprocessorTokens2[PreprocessorTokens2["BEGIF"] = 1] = "BEGIF";
    PreprocessorTokens2[PreprocessorTokens2["ELSE"] = 2] = "ELSE";
    PreprocessorTokens2[PreprocessorTokens2["ENDIF"] = 3] = "ENDIF";
  })(PreprocessorTokens || (PreprocessorTokens = {}));

  // node_modules/@ghostery/adblocker/dist/esm/lists.js
  var FilterType;
  (function(FilterType2) {
    FilterType2[FilterType2["NOT_SUPPORTED"] = 0] = "NOT_SUPPORTED";
    FilterType2[FilterType2["NETWORK"] = 1] = "NETWORK";
    FilterType2[FilterType2["COSMETIC"] = 2] = "COSMETIC";
    FilterType2[FilterType2["NOT_SUPPORTED_EMPTY"] = 100] = "NOT_SUPPORTED_EMPTY";
    FilterType2[FilterType2["NOT_SUPPORTED_COMMENT"] = 101] = "NOT_SUPPORTED_COMMENT";
    FilterType2[FilterType2["NOT_SUPPORTED_ADGUARD"] = 102] = "NOT_SUPPORTED_ADGUARD";
  })(FilterType || (FilterType = {}));

  // node_modules/@remusao/small/dist/esm/flv.js
  var CONTENT_TYPE = "video/flv";
  var flv_default = {
    contentType: `${CONTENT_TYPE};base64`,
    aliases: [
      CONTENT_TYPE,
      ".flv",
      "flv"
    ],
    body: "RkxWAQEAAAAJAAAAABIAALgAAAAAAAAAAgAKb25NZXRhRGF0YQgAAAAIAAhkdXJhdGlvbgAAAAAAAAAAAAAFd2lkdGgAP/AAAAAAAAAABmhlaWdodAA/8AAAAAAAAAANdmlkZW9kYXRhcmF0ZQBAaGoAAAAAAAAJZnJhbWVyYXRlAEBZAAAAAAAAAAx2aWRlb2NvZGVjaWQAQAAAAAAAAAAAB2VuY29kZXICAA1MYXZmNTcuNDEuMTAwAAhmaWxlc2l6ZQBAaoAAAAAAAAAACQAAAMM="
  };

  // node_modules/@remusao/small/dist/esm/gif.js
  var CONTENT_TYPE2 = "image/gif";
  var gif_default = {
    contentType: `${CONTENT_TYPE2};base64`,
    aliases: [
      CONTENT_TYPE2,
      ".gif",
      "gif"
    ],
    body: "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
  };

  // node_modules/@remusao/small/dist/esm/html.js
  var CONTENT_TYPE3 = "text/html";
  var html_default = {
    contentType: CONTENT_TYPE3,
    aliases: [
      CONTENT_TYPE3,
      ".html",
      "html",
      ".htm",
      "htm",
      "noopframe",
      "noop.html"
    ],
    body: "<!DOCTYPE html>"
  };

  // node_modules/@remusao/small/dist/esm/ico.js
  var CONTENT_TYPE4 = "image/vnd.microsoft.icon";
  var ico_default = {
    contentType: `${CONTENT_TYPE4};base64`,
    aliases: [
      CONTENT_TYPE4,
      ".ico",
      "ico"
    ],
    body: "AAABAAEAAQEAAAEAGAAwAAAAFgAAACgAAAABAAAAAgAAAAEAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAAA=="
  };

  // node_modules/@remusao/small/dist/esm/jpeg.js
  var CONTENT_TYPE5 = "image/jpeg";
  var jpeg_default = {
    contentType: `${CONTENT_TYPE5};base64`,
    aliases: [
      CONTENT_TYPE5,
      ".jpg",
      "jpg",
      ".jpeg",
      "jpeg"
    ],
    body: "/9j/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/yQALCAABAAEBAREA/8wABgAQEAX/2gAIAQEAAD8A0s8g/9k="
  };

  // node_modules/@remusao/small/dist/esm/javascript.js
  var CONTENT_TYPE6 = "application/javascript";
  var javascript_default = {
    contentType: CONTENT_TYPE6,
    aliases: [
      CONTENT_TYPE6,
      ".js",
      "js",
      "javascript",
      ".jsx",
      "jsx",
      "typescript",
      ".ts",
      "ts",
      "noop.js",
      "noopjs"
    ],
    body: ""
  };

  // node_modules/@remusao/small/dist/esm/json.js
  var CONTENT_TYPE7 = "application/json";
  var json_default = {
    contentType: CONTENT_TYPE7,
    aliases: [
      CONTENT_TYPE7,
      ".json",
      "json"
    ],
    body: "0"
  };

  // node_modules/@remusao/small/dist/esm/mp3.js
  var CONTENT_TYPE8 = "audio/mpeg";
  var mp3_default = {
    contentType: `${CONTENT_TYPE8};base64`,
    aliases: [
      CONTENT_TYPE8,
      ".mp3",
      "mp3",
      "noop-0.1s.mp3",
      "noopmp3-0.1s"
    ],
    body: "/+MYxAAAAANIAAAAAExBTUUzLjk4LjIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
  };

  // node_modules/@remusao/small/dist/esm/mp4.js
  var CONTENT_TYPE9 = "video/mp4";
  var mp4_default = {
    contentType: `${CONTENT_TYPE9};base64`,
    aliases: [
      CONTENT_TYPE9,
      ".mp4",
      "mp4",
      ".m4a",
      "m4a",
      ".m4p",
      "m4p",
      ".m4b",
      "m4b",
      ".m4r",
      "m4r",
      ".m4v",
      "m4v",
      "noop-1s.mp4",
      "noopmp4-1s"
    ],
    body: "AAAAHGZ0eXBpc29tAAACAGlzb21pc28ybXA0MQAAAAhmcmVlAAAC721kYXQhEAUgpBv/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA3pwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcCEQBSCkG//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADengAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAAsJtb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAAAALwABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAB7HRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAAIAAAAAAAAALwAAAAAAAAAAAAAAAQEAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAAC8AAAAAAAEAAAAAAWRtZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAAKxEAAAIAFXEAAAAAAAtaGRscgAAAAAAAAAAc291bgAAAAAAAAAAAAAAAFNvdW5kSGFuZGxlcgAAAAEPbWluZgAAABBzbWhkAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAADTc3RibAAAAGdzdHNkAAAAAAAAAAEAAABXbXA0YQAAAAAAAAABAAAAAAAAAAAAAgAQAAAAAKxEAAAAAAAzZXNkcwAAAAADgICAIgACAASAgIAUQBUAAAAAAfQAAAHz+QWAgIACEhAGgICAAQIAAAAYc3R0cwAAAAAAAAABAAAAAgAABAAAAAAcc3RzYwAAAAAAAAABAAAAAQAAAAIAAAABAAAAHHN0c3oAAAAAAAAAAAAAAAIAAAFzAAABdAAAABRzdGNvAAAAAAAAAAEAAAAsAAAAYnVkdGEAAABabWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAbWRpcmFwcGwAAAAAAAAAAAAAAAAtaWxzdAAAACWpdG9vAAAAHWRhdGEAAAABAAAAAExhdmY1Ni40MC4xMDE="
  };

  // node_modules/@remusao/small/dist/esm/pdf.js
  var CONTENT_TYPE10 = "application/pdf";
  var pdf_default = {
    contentType: `${CONTENT_TYPE10};base64`,
    aliases: [
      CONTENT_TYPE10,
      ".pdf",
      "pdf"
    ],
    body: "JVBERi0xLgoxIDAgb2JqPDwvUGFnZXMgMiAwIFI+PmVuZG9iagoyIDAgb2JqPDwvS2lkc1szIDAgUl0vQ291bnQgMT4+ZW5kb2JqCjMgMCBvYmo8PC9QYXJlbnQgMiAwIFI+PmVuZG9iagp0cmFpbGVyIDw8L1Jvb3QgMSAwIFI+Pg=="
  };

  // node_modules/@remusao/small/dist/esm/png.js
  var CONTENT_TYPE11 = "image/png";
  var png_default = {
    contentType: `${CONTENT_TYPE11};base64`,
    aliases: [
      CONTENT_TYPE11,
      ".png",
      "png"
    ],
    body: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=="
  };

  // node_modules/@remusao/small/dist/esm/svg.js
  var CONTENT_TYPE12 = "image/svg+xml";
  var svg_default = {
    contentType: CONTENT_TYPE12,
    aliases: [
      CONTENT_TYPE12,
      ".svg",
      "svg"
    ],
    body: "https://raw.githubusercontent.com/mathiasbynens/small/master/svg.svg"
  };

  // node_modules/@remusao/small/dist/esm/txt.js
  var CONTENT_TYPE13 = "text/plain";
  var txt_default = {
    contentType: CONTENT_TYPE13,
    aliases: [
      CONTENT_TYPE13,
      ".txt",
      "txt",
      "text",
      "nooptext",
      "noop.txt"
    ],
    body: ""
  };

  // node_modules/@remusao/small/dist/esm/wav.js
  var CONTENT_TYPE14 = "audio/wav";
  var wav_default = {
    contentType: `${CONTENT_TYPE14};base64`,
    aliases: [
      CONTENT_TYPE14,
      ".wav",
      "wav"
    ],
    body: "UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA="
  };

  // node_modules/@remusao/small/dist/esm/webm.js
  var CONTENT_TYPE15 = "video/webm";
  var webm_default = {
    contentType: `${CONTENT_TYPE15};base64`,
    aliases: [
      CONTENT_TYPE15,
      ".webm",
      "webm"
    ],
    body: "GkXfo0AgQoaBAUL3gQFC8oEEQvOBCEKCQAR3ZWJtQoeBAkKFgQIYU4BnQI0VSalmQCgq17FAAw9CQE2AQAZ3aGFtbXlXQUAGd2hhbW15RIlACECPQAAAAAAAFlSua0AxrkAu14EBY8WBAZyBACK1nEADdW5khkAFVl9WUDglhohAA1ZQOIOBAeBABrCBCLqBCB9DtnVAIueBAKNAHIEAAIAwAQCdASoIAAgAAUAmJaQAA3AA/vz0AAA="
  };

  // node_modules/@remusao/small/dist/esm/webp.js
  var CONTENT_TYPE16 = "image/webp";
  var webp_default = {
    contentType: `${CONTENT_TYPE16};base64`,
    aliases: [
      CONTENT_TYPE16,
      ".webp",
      "webp"
    ],
    body: "UklGRhIAAABXRUJQVlA4TAYAAAAvQWxvAGs="
  };

  // node_modules/@remusao/small/dist/esm/wmv.js
  var CONTENT_TYPE17 = "video/wmv";
  var wmv_default = {
    contentType: `${CONTENT_TYPE17};base64`,
    aliases: [
      CONTENT_TYPE17,
      ".wmv",
      "wmv"
    ],
    body: "MCaydY5mzxGm2QCqAGLObOUBAAAAAAAABQAAAAECodyrjEepzxGO5ADADCBTZWgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABcCAAAAAAAAAIA+1d6xnQEAAAAAAAAAAMAF2QEAAAAAAAAAAAAAAAAcDAAAAAAAAAIAAACADAAAgAwAAEANAwC1A79fLqnPEY7jAMAMIFNlLgAAAAAAAAAR0tOruqnPEY7mAMAMIFNlBgAAAAAAQKTQ0gfj0hGX8ACgyV6oUGQAAAAAAAAAAQAoAFcATQAvAEUAbgBjAG8AZABpAG4AZwBTAGUAdAB0AGkAbgBnAHMAAAAAABwATABhAHYAZgA1ADcALgA0ADEALgAxADAAMAAAAJEH3Le3qc8RjuYAwAwgU2WBAAAAAAAAAMDvGbxNW88RqP0AgF9cRCsAV/sgVVvPEaj9AIBfXEQrAAAAAAAAAAAzAAAAAAAAAAEAAAAAAAEAAAABAAAAAigAKAAAAAEAAAABAAAAAQAYAE1QNDMDAAAAAAAAAAAAAAAAAAAAAAAAAEBS0YYdMdARo6QAoMkDSPZMAAAAAAAAAEFS0YYdMdARo6QAoMkDSPYBAAAAAQAKAG0AcwBtAHAAZQBnADQAdgAzAAAAAAAEAE1QNDM2JrJ1jmbPEabZAKoAYs5sMgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQ=="
  };

  // node_modules/@remusao/small/dist/esm/index.js
  (() => {
    const resources = {};
    for (const fake of [
      flv_default,
      gif_default,
      html_default,
      ico_default,
      jpeg_default,
      javascript_default,
      json_default,
      mp3_default,
      mp4_default,
      pdf_default,
      png_default,
      svg_default,
      txt_default,
      wav_default,
      webm_default,
      webp_default,
      wmv_default
    ]) {
      for (const alias of fake.aliases) {
        resources[alias] = fake;
      }
    }
    return resources;
  })();
  function getFilterlistSelectors(styles) {
    if (styles) {
      const selectorsOnly = styles.replace(/\s*{[^\\}]*}\s*/g, ",").replace(/,$/, "");
      return selectorsOnly;
    }
    return "";
  }

  // lib/heuristics.ts
  var DETECT_PATTERNS = [
    /accept cookies/gi,
    /accept all/gi,
    /reject all/gi,
    /only necessary cookies/gi,
    // "only necessary" is probably too broad
    /by clicking.*(accept|agree|allow)/gi,
    /by continuing/gi,
    /we (use|serve)( optional)? cookies/gi,
    /we are using cookies/gi,
    /use of cookies/gi,
    /(this|our) (web)?site.*cookies/gi,
    /cookies (and|or) .* technologies/gi,
    /such as cookies/gi,
    /read more about.*cookies/gi,
    /consent to.*cookies/gi,
    /we and our partners.*cookies/gi,
    /we.*store.*information.*such as.*cookies/gi,
    /store and\/or access information.*on a device/gi,
    /personalised ads and content, ad and content measurement/gi
    // it might be tempting to add the patterns below, but they cause too many false positives. Don't do it :)
    // /cookies? settings/i,
    // /cookies? preferences/i,
  ];
  function checkHeuristicPatterns() {
    const allText = document.documentElement.innerText;
    const patterns = [];
    const snippets2 = [];
    for (const p of DETECT_PATTERNS) {
      const matches3 = allText.match(p);
      if (matches3) {
        patterns.push(p.toString());
        snippets2.push(...matches3.map((m) => m.substring(0, 200)));
      }
    }
    return { patterns, snippets: snippets2 };
  }

  // lib/web.ts
  function filterCMPs(rules, config) {
    return rules.filter((cmp) => {
      return (!config.disabledCmps || !config.disabledCmps.includes(cmp.name)) && // CMP is not disabled
      (config.enableCosmeticRules || !cmp.isCosmetic);
    });
  }
  var AutoConsent = class {
    constructor(sendContentMessage, config = null, declarativeRules = null) {
      this.id = getRandomID();
      this.rules = [];
      this.foundCmp = null;
      this.state = {
        cosmeticFiltersOn: false,
        filterListReported: false,
        lifecycle: "loading",
        prehideOn: false,
        findCmpAttempts: 0,
        detectedCmps: [],
        detectedPopups: [],
        heuristicPatterns: [],
        heuristicSnippets: [],
        selfTest: null
      };
      evalState.sendContentMessage = sendContentMessage;
      this.sendContentMessage = sendContentMessage;
      this.rules = [];
      this.updateState({ lifecycle: "loading" });
      this.addDynamicRules();
      if (config) {
        this.initialize(config, declarativeRules);
      } else {
        if (declarativeRules) {
          this.parseDeclarativeRules(declarativeRules);
        }
        const initMsg = {
          type: "init",
          url: window.location.href
        };
        sendContentMessage(initMsg);
        this.updateState({ lifecycle: "waitingForInitResponse" });
      }
      this.domActions = new DomActions(this);
    }
    initialize(config, declarativeRules) {
      const normalizedConfig = normalizeConfig(config);
      normalizedConfig.logs.lifecycle && console.log("autoconsent init", window.location.href);
      this.config = normalizedConfig;
      if (!normalizedConfig.enabled) {
        normalizedConfig.logs.lifecycle && console.log("autoconsent is disabled");
        return;
      }
      if (declarativeRules) {
        this.parseDeclarativeRules(declarativeRules);
      }
      if (config.enableFilterList) {
        try {
          if (false) ;
        } catch (e) {
          console.error("Error parsing filter list", e);
        }
        if (document.readyState === "loading") {
          window.addEventListener("DOMContentLoaded", () => {
            this.applyCosmeticFilters();
          });
        } else {
          this.applyCosmeticFilters();
        }
      }
      this.rules = filterCMPs(this.rules, normalizedConfig);
      if (config.enablePrehide) {
        if (document.documentElement) {
          this.prehideElements();
        } else {
          const delayedPrehide = () => {
            window.removeEventListener("DOMContentLoaded", delayedPrehide);
            this.prehideElements();
          };
          window.addEventListener("DOMContentLoaded", delayedPrehide);
        }
      }
      if (document.readyState === "loading") {
        const onReady = () => {
          window.removeEventListener("DOMContentLoaded", onReady);
          this.start();
        };
        window.addEventListener("DOMContentLoaded", onReady);
      } else {
        this.start();
      }
      this.updateState({ lifecycle: "initialized" });
    }
    addDynamicRules() {
      dynamicCMPs.forEach((Cmp) => {
        this.rules.push(new Cmp(this));
      });
    }
    parseDeclarativeRules(declarativeRules) {
      if (declarativeRules.consentomatic) {
        Object.keys(declarativeRules.consentomatic).forEach((name) => {
          this.addConsentomaticCMP(name, declarativeRules.consentomatic[name]);
        });
      }
      if (declarativeRules.autoconsent) {
        declarativeRules.autoconsent.forEach((ruleset) => {
          this.addDeclarativeCMP(ruleset);
        });
      }
    }
    addDeclarativeCMP(ruleset) {
      this.rules.push(new AutoConsentCMP(ruleset, this));
    }
    addConsentomaticCMP(name, config) {
      this.rules.push(new ConsentOMaticCMP(`com_${name}`, config));
    }
    // start the detection process, possibly with a delay
    start() {
      scheduleWhenIdle(() => this._start());
    }
    async _start() {
      const logsConfig = this.config.logs;
      logsConfig.lifecycle && console.log(`Detecting CMPs on ${window.location.href}`);
      this.updateState({ lifecycle: "started" });
      const foundCmps = await this.findCmp(this.config.detectRetries);
      this.updateState({ detectedCmps: foundCmps.map((c) => c.name) });
      if (foundCmps.length === 0) {
        logsConfig.lifecycle && console.log("no CMP found", location.href);
        if (this.config.enablePrehide) {
          this.undoPrehide();
        }
        return this.filterListFallback();
      }
      this.updateState({ lifecycle: "cmpDetected" });
      const staticCmps = [];
      const cosmeticCmps = [];
      for (const cmp of foundCmps) {
        if (cmp.isCosmetic) {
          cosmeticCmps.push(cmp);
        } else {
          staticCmps.push(cmp);
        }
      }
      let result = false;
      let foundPopups = await this.detectPopups(staticCmps, async (cmp) => {
        result = await this.handlePopup(cmp);
      });
      if (foundPopups.length === 0) {
        foundPopups = await this.detectPopups(cosmeticCmps, async (cmp) => {
          result = await this.handlePopup(cmp);
        });
      }
      if (foundPopups.length === 0) {
        logsConfig.lifecycle && console.log("no popup found");
        if (this.config.enablePrehide) {
          this.undoPrehide();
        }
        return false;
      }
      if (foundPopups.length > 1) {
        const errorDetails = {
          msg: `Found multiple CMPs, check the detection rules.`,
          cmps: foundPopups.map((cmp) => cmp.name)
        };
        logsConfig.errors && console.warn(errorDetails.msg, errorDetails.cmps);
        this.sendContentMessage({
          type: "autoconsentError",
          details: errorDetails
        });
      }
      return result;
    }
    async findCmp(retries) {
      const logsConfig = this.config.logs;
      this.updateState({ findCmpAttempts: this.state.findCmpAttempts + 1 });
      const foundCMPs = [];
      for (const cmp of this.rules) {
        try {
          if (!cmp.checkRunContext()) {
            continue;
          }
          const result = await cmp.detectCmp();
          if (result) {
            logsConfig.lifecycle && console.log(`Found CMP: ${cmp.name} ${window.location.href}`);
            this.sendContentMessage({
              type: "cmpDetected",
              url: location.href,
              cmp: cmp.name
            });
            foundCMPs.push(cmp);
          }
        } catch (e) {
          logsConfig.errors && console.warn(`error detecting ${cmp.name}`, e);
        }
      }
      this.detectHeuristics();
      if (foundCMPs.length === 0 && retries > 0) {
        await this.domActions.wait(500);
        return this.findCmp(retries - 1);
      }
      return foundCMPs;
    }
    detectHeuristics() {
      if (this.config.enableHeuristicDetection) {
        const { patterns, snippets: snippets2 } = checkHeuristicPatterns();
        if (patterns.length > 0 && (patterns.length !== this.state.heuristicPatterns.length || this.state.heuristicPatterns.some((p, i) => p !== patterns[i]))) {
          this.config.logs.lifecycle && console.log("Heuristic patterns found", patterns, snippets2);
          this.updateState({ heuristicPatterns: patterns, heuristicSnippets: snippets2 });
        }
      }
    }
    /**
     * Detect if a CMP has a popup open. Fullfils with the CMP if a popup is open, otherwise rejects.
     */
    async detectPopup(cmp) {
      const isOpen = await this.waitForPopup(cmp).catch((error) => {
        this.config.logs.errors && console.warn(`error waiting for a popup for ${cmp.name}`, error);
        return false;
      });
      if (isOpen) {
        this.updateState({ detectedPopups: this.state.detectedPopups.concat([cmp.name]) });
        this.sendContentMessage({
          type: "popupFound",
          cmp: cmp.name,
          url: location.href
        });
        return cmp;
      }
      throw new Error("Popup is not shown");
    }
    /**
     * Detect if any of the CMPs has a popup open. Returns a list of CMPs with open popups.
     */
    async detectPopups(cmps, onFirstPopupAppears) {
      const tasks = cmps.map((cmp) => this.detectPopup(cmp));
      await Promise.any(tasks).then((cmp) => {
        this.detectHeuristics();
        onFirstPopupAppears(cmp);
      }).catch(() => {
      });
      const results = await Promise.allSettled(tasks);
      const popups = [];
      for (const result of results) {
        if (result.status === "fulfilled") {
          popups.push(result.value);
        }
      }
      return popups;
    }
    async handlePopup(cmp) {
      this.updateState({ lifecycle: "openPopupDetected" });
      if (this.config.enablePrehide && !this.state.prehideOn) {
        this.prehideElements();
      }
      if (this.state.cosmeticFiltersOn) {
        this.undoCosmetics();
      }
      this.foundCmp = cmp;
      if (this.config.autoAction === "optOut") {
        return await this.doOptOut();
      } else if (this.config.autoAction === "optIn") {
        return await this.doOptIn();
      } else {
        this.config.logs.lifecycle && console.log("waiting for opt-out signal...", location.href);
        return true;
      }
    }
    async doOptOut() {
      const logsConfig = this.config.logs;
      this.updateState({ lifecycle: "runningOptOut" });
      let optOutResult;
      if (!this.foundCmp) {
        logsConfig.errors && console.log("no CMP to opt out");
        optOutResult = false;
      } else {
        logsConfig.lifecycle && console.log(`CMP ${this.foundCmp.name}: opt out on ${window.location.href}`);
        optOutResult = await this.foundCmp.optOut();
        logsConfig.lifecycle && console.log(`${this.foundCmp.name}: opt out result ${optOutResult}`);
      }
      if (this.config.enablePrehide) {
        this.undoPrehide();
      }
      this.sendContentMessage({
        type: "optOutResult",
        cmp: this.foundCmp ? this.foundCmp.name : "none",
        result: optOutResult,
        scheduleSelfTest: this.foundCmp && this.foundCmp.hasSelfTest,
        url: location.href
      });
      if (optOutResult && !this.foundCmp.isIntermediate) {
        this.sendContentMessage({
          type: "autoconsentDone",
          cmp: this.foundCmp.name,
          isCosmetic: this.foundCmp.isCosmetic,
          url: location.href
        });
        this.updateState({ lifecycle: "done" });
      } else {
        this.updateState({ lifecycle: optOutResult ? "optOutSucceeded" : "optOutFailed" });
      }
      return optOutResult;
    }
    async doOptIn() {
      const logsConfig = this.config.logs;
      this.updateState({ lifecycle: "runningOptIn" });
      let optInResult;
      if (!this.foundCmp) {
        logsConfig.errors && console.log("no CMP to opt in");
        optInResult = false;
      } else {
        logsConfig.lifecycle && console.log(`CMP ${this.foundCmp.name}: opt in on ${window.location.href}`);
        optInResult = await this.foundCmp.optIn();
        logsConfig.lifecycle && console.log(`${this.foundCmp.name}: opt in result ${optInResult}`);
      }
      if (this.config.enablePrehide) {
        this.undoPrehide();
      }
      this.sendContentMessage({
        type: "optInResult",
        cmp: this.foundCmp ? this.foundCmp.name : "none",
        result: optInResult,
        scheduleSelfTest: false,
        // self-tests are only for opt-out at the moment
        url: location.href
      });
      if (optInResult && !this.foundCmp.isIntermediate) {
        this.sendContentMessage({
          type: "autoconsentDone",
          cmp: this.foundCmp.name,
          isCosmetic: this.foundCmp.isCosmetic,
          url: location.href
        });
        this.updateState({ lifecycle: "done" });
      } else {
        this.updateState({ lifecycle: optInResult ? "optInSucceeded" : "optInFailed" });
      }
      return optInResult;
    }
    async doSelfTest() {
      const logsConfig = this.config.logs;
      let selfTestResult;
      if (!this.foundCmp) {
        logsConfig.errors && console.log("no CMP to self test");
        selfTestResult = false;
      } else {
        logsConfig.lifecycle && console.log(`CMP ${this.foundCmp.name}: self-test on ${window.location.href}`);
        selfTestResult = await this.foundCmp.test();
      }
      this.sendContentMessage({
        type: "selfTestResult",
        cmp: this.foundCmp ? this.foundCmp.name : "none",
        result: selfTestResult,
        url: location.href
      });
      this.updateState({ selfTest: selfTestResult });
      return selfTestResult;
    }
    async waitForPopup(cmp, retries = 5, interval = 500) {
      const logsConfig = this.config.logs;
      logsConfig.lifecycle && console.log("checking if popup is open...", cmp.name);
      const isOpen = await cmp.detectPopup().catch((e) => {
        logsConfig.errors && console.warn(`error detecting popup for ${cmp.name}`, e);
        return false;
      });
      if (!isOpen && retries > 0) {
        await this.domActions.wait(interval);
        return this.waitForPopup(cmp, retries - 1, interval);
      }
      logsConfig.lifecycle && console.log(cmp.name, `popup is ${isOpen ? "open" : "not open"}`);
      return isOpen;
    }
    prehideElements() {
      const logsConfig = this.config.logs;
      const globalHidden = [
        "#didomi-popup,.didomi-popup-container,.didomi-popup-notice,.didomi-consent-popup-preferences,#didomi-notice,.didomi-popup-backdrop,.didomi-screen-medium"
      ];
      const selectors = this.rules.filter((rule) => rule.prehideSelectors && rule.checkRunContext()).reduce((selectorList, rule) => [...selectorList, ...rule.prehideSelectors], globalHidden);
      this.updateState({ prehideOn: true });
      setTimeout(() => {
        if (this.config.enablePrehide && this.state.prehideOn && !["runningOptOut", "runningOptIn"].includes(this.state.lifecycle)) {
          logsConfig.lifecycle && console.log("Process is taking too long, unhiding elements");
          this.undoPrehide();
        }
      }, this.config.prehideTimeout || 2e3);
      return this.domActions.prehide(selectors.join(","));
    }
    undoPrehide() {
      this.updateState({ prehideOn: false });
      return this.domActions.undoPrehide();
    }
    /**
     * Apply cosmetic filters
     * @returns true if the filters were applied, false otherwise
     */
    async applyCosmeticFilters(styles) {
      if (!this.filtersEngine) {
        return false;
      }
      const logsConfig = this.config?.logs;
      setTimeout(() => {
        if (this.state.cosmeticFiltersOn && !this.state.filterListReported) {
          const cosmeticFiltersWorked = this.domActions.elementVisible(getFilterlistSelectors(styles), "any");
          if (cosmeticFiltersWorked) {
            logsConfig?.lifecycle && console.log("Prehide cosmetic filters matched", location.href);
            this.reportFilterlist();
          } else {
            logsConfig?.lifecycle && console.log("Prehide cosmetic filters didn't match", location.href);
          }
        }
      }, 2e3);
      this.updateState({ cosmeticFiltersOn: true });
      try {
        this.cosmeticStyleSheet = await this.domActions.createOrUpdateStyleSheet(styles, this.cosmeticStyleSheet);
        logsConfig?.lifecycle && console.log("[cosmetics]", this.cosmeticStyleSheet, location.href);
        document.adoptedStyleSheets.push(this.cosmeticStyleSheet);
      } catch (e) {
        this.config.logs && console.error("Error applying cosmetic filters", e);
        return false;
      }
      return true;
    }
    undoCosmetics() {
      this.updateState({ cosmeticFiltersOn: false });
      this.config.logs.lifecycle && console.log("[undocosmetics]", this.cosmeticStyleSheet, location.href);
      this.domActions.removeStyleSheet(this.cosmeticStyleSheet);
    }
    reportFilterlist() {
      this.sendContentMessage({
        type: "cmpDetected",
        url: location.href,
        cmp: "filterList"
      });
      this.sendContentMessage({
        type: "popupFound",
        cmp: "filterList",
        url: location.href
      });
      this.updateState({ filterListReported: true });
    }
    filterListFallback() {
      {
        this.updateState({ lifecycle: "nothingDetected" });
        return false;
      }
    }
    updateState(change) {
      Object.assign(this.state, change);
      this.sendContentMessage({
        type: "report",
        instanceId: this.id,
        url: window.location.href,
        mainFrame: window.top === window.self,
        state: this.state
      });
    }
    async receiveMessageCallback(message) {
      const logsConfig = this.config?.logs;
      if (logsConfig?.messages) {
        console.log("received from background", message, window.location.href);
      }
      switch (message.type) {
        case "initResp":
          this.initialize(message.config, message.rules);
          break;
        case "optIn":
          await this.doOptIn();
          break;
        case "optOut":
          await this.doOptOut();
          break;
        case "selfTest":
          await this.doSelfTest();
          break;
        case "evalResp":
          resolveEval(message.id, message.result);
          break;
      }
    }
  };
  /*! Bundled license information:

  @ghostery/adblocker/dist/esm/codebooks/cosmetic-selector.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/codebooks/network-csp.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/codebooks/network-filter.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/codebooks/network-hostname.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/codebooks/network-redirect.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/codebooks/raw-network.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/codebooks/raw-cosmetic.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/compression.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/punycode.js:
    (*!
     * Copyright Mathias Bynens <https://mathiasbynens.be/>
     *
     * Permission is hereby granted, free of charge, to any person obtaining
     * a copy of this software and associated documentation files (the
     * "Software"), to deal in the Software without restriction, including
     * without limitation the rights to use, copy, modify, merge, publish,
     * distribute, sublicense, and/or sell copies of the Software, and to
     * permit persons to whom the Software is furnished to do so, subject to
     * the following conditions:
     *
     * The above copyright notice and this permission notice shall be
     * included in all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
     * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
     * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
     * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
     * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
     * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
     * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
     *)

  @ghostery/adblocker/dist/esm/data-view.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/config.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/events.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/fetch.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker-extended-selectors/dist/esm/types.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker-extended-selectors/dist/esm/parse.js:
    (*!
     * Based on parsel. Extended by Rémi Berson for Ghostery (2021).
     * https://github.com/LeaVerou/parsel
     *
     * MIT License
     *
     * Copyright (c) 2020 Lea Verou
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *)

  @ghostery/adblocker-extended-selectors/dist/esm/eval.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker-extended-selectors/dist/esm/extended.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker-extended-selectors/dist/esm/index.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/tokens-buffer.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/utils.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/request.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/engine/domains.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/html-filtering.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/filters/cosmetic.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/filters/dsl.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/filters/network.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/lists.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/resources.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/compact-set.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/engine/optimizer.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/engine/reverse-index.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/engine/bucket/filters.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/engine/bucket/cosmetic.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/engine/bucket/network.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/engine/map.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/engine/metadata/categories.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/engine/metadata/organizations.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/engine/metadata/patterns.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/engine/metadata.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/engine/engine.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker/dist/esm/encoding.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)
    (*!
     * Copyright (c) 2008-2009 Bjoern Hoehrmann <bjoern@hoehrmann.de>
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to
     * deal in the Software without restriction, including without limitation the
     * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
     * sell copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
     * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
     * IN THE SOFTWARE.
     *)

  @ghostery/adblocker/dist/esm/index.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)

  @ghostery/adblocker-content/dist/esm/index.js:
    (*!
     * Copyright (c) 2017-present Ghostery GmbH. All rights reserved.
     *
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, You can obtain one at https://mozilla.org/MPL/2.0/.
     *)
  */

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


  if (document.contentType === 'text/html') {
    const consent = new AutoConsent((msg) => {
      return chrome.runtime.sendMessage(
        Object.assign({}, msg, { action: 'autoconsent' }),
      );
    });

    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.action === 'autoconsent') {
        return Promise.resolve(consent.receiveMessageCallback(msg));
      }

      return false;
    });
  }

})();
