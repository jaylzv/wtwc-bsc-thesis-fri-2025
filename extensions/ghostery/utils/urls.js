import { debugMode } from './debug.js';

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


const GHOSTERY_DOMAIN = debugMode ? 'ghosterystage.com' : 'ghostery.com';

const HOME_PAGE_URL = `https://www.${GHOSTERY_DOMAIN}/`;

const SIGNON_PAGE_URL = `https://www.${GHOSTERY_DOMAIN}/signin`;
const CREATE_ACCOUNT_PAGE_URL = `https://www.${GHOSTERY_DOMAIN}/register`;
const ACCOUNT_PAGE_URL = `https://www.${GHOSTERY_DOMAIN}/account`;

const WTM_PAGE_URL = `https://www.${GHOSTERY_DOMAIN}/whotracksme`;
const SUPPORT_PAGE_URL = `https://www.${GHOSTERY_DOMAIN}/support`;

export { ACCOUNT_PAGE_URL, CREATE_ACCOUNT_PAGE_URL, GHOSTERY_DOMAIN, HOME_PAGE_URL, SIGNON_PAGE_URL, SUPPORT_PAGE_URL, WTM_PAGE_URL };
