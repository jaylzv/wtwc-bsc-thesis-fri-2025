### Contents

### List Of Used Abbreviations

- HTTP - Hyper Text Transfer Protocol
- GDPR - General Data Protection Regulation
- CCPA - California Consumer Privacy Act
- JS - JavaScript
- FQDN - Fully Qualified Domain Name
- TOR - The Onion Router
- HTML - Hyper Text Markup Language

### Abstract

[OK]

This bachelor’s thesis explores alternatives to cookie-based tracking and examines the global shift toward lesser-known methods of consumer tracking. These emerging techniques often blur the lines of legality and ethics. By analyzing and deconstructing how these methods operate and their implications, this study aims to provide readers with a comprehensive understanding of this evolving trend, enabling them to form their own conclusions and respond accordingly. As mentor viš. pred. dr. David Jelenc aptly defines: "Cookieless tracking doesn’t tell us what it is but rather tells us what it isn’t.”

### Chapter 1 - Introduction

[OK]

### 1.1 What are cookies and how do they function

[OK]

HTTP cookies are small blocks of data that websites store on a user's device via the web browser. They are designed to hold a modest amount of data specific to a particular client and website, allowing servers to deliver a tailored experience to users. When a user visits a website, the server generates a cookie and sends it to the user's browser, which stores it locally. Upon subsequent visits to the same website, the browser includes the cookie in its requests, enabling the server to recall previous interactions. This mechanism facilitates essential web functionalities such as session management, personalization, and tracking. For instance, cookies can retain user preferences, maintain login sessions, and monitor browsing activities to enhance user experience. However, it's important to note that while cookies play a crucial role in the modern web, they also raise privacy and security considerations, as they can be used to track user behavior across multiple sites. [[ref]](https://en.wikipedia.org/wiki/HTTP_cookie)[[ref]](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)

### 1.2 Cookie based tracking and privacy regulations

[OK]

Alternative/cookieless tracking methods are relatively unknown to the vast public. As a lot of people by now have seen a cookie banner, have an article about cookies or cookie based tracking show up on their social media feeds or have read an article about cookies work. Cookies have been around for 30 years now and most of the people have at least heard of them or have a rough idea of what they do. Even though first-party cookies are in the most part essential for websites to work, third-party cookies are mostly used for tracking, data gathering purposes, and these third-party cookies are what the general public thinks of when they hear the word “cookies”.

However, growing privacy concerns, stricter regulations like the GDPR and CCPA, and advancements in browser privacy settings are making cookie-based tracking increasingly ineffective. Regulations now require explicit user consent for tracking cookies, leading to widespread adoption of cookie banners and opt-out mechanisms. At the same time, major browsers like Safari and Firefox have implemented intelligent tracking prevention [[ref]](https://clearcode.cc/blog/intelligent-tracking-prevention/) and enhanced anti-tracking measures or enhanced tracking protection [[ref]](https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop), while Google Chrome is set to phase out third-party cookies altogether. As a result, advertisers and data-driven businesses face significant challenges in maintaining their tracking capabilities, pushing the industry toward alternative, cookieless tracking methods. [[ref]](https://clym.io/blog/understanding-the-impact-of-ccpa-and-cpra-on-your-websites-cookie-policy-steps-for-ccpa-compliance-in-2024)[[ref]](https://cain-co.com/blog/2022-06-28-cookieless-tracking-b2b-marketing.php)

### 1.3 Alternatives to Cookie-Based Tracking and Motives

[OK]

The industry's shift toward cookieless tracking methods is driven by growing privacy concerns and stricter data protection laws. Techniques such as fingerprinting and server-side tracking are increasingly employed to gather user data without relying on traditional cookies. However, these methods often bypass user consent mechanisms, raising significant ethical and legal issues. [[ref]](https://arxiv.org/abs/2102.08779)

Despite regulations like the GDPR aiming to ensure transparent and fair data usage, compliance remains inconsistent. Research indicates that approximately 30% of European businesses are still not compliant with GDPR. [[ref]](https://moosend.com/blog/gdpr-stats/)

This transition to cookieless tracking resembles a continuous "cat and mouse" game. As browsers enhance security and implement measures to resist tracking methods, companies and developers often find new workarounds to achieve their goals. For instance, the United Kingdom Information Commissioner's Office criticized Google for allowing advertisers to track users' digital "fingerprints," a practice that complicates efforts by privacy-conscious users to block online monitoring. [[ref]](https://www.theguardian.com/technology/2024/dec/19/google-advertisers-digital-fingerprints-ico-uk-data-regulator)

The shift has also led many companies to adopt lesser-known tracking methods that operate in legal gray areas where laws are less specific. While cookieless tracking reduces reliance on user-stored data, making it harder for users to block tracking entirely, it comes with significant drawbacks:

- It is often unclear how companies use the data collected through cookieless methods, making transparency an issue.
- Many of these methods may not comply with privacy regulations like GDPR, leaving users vulnerable.
- Laws designed to address traditional cookie-based tracking have inadvertently driven the adoption of less-regulated alternatives.

In this thesis, we will explore and explain the most common cookieless tracking methods, how they work, their potential ethical and legal implications, and what users can do to protect their privacy in these situations.

### Chapter 2 - Cookieless tracking methods

[OK]

In this part of the thesis, we explore the most known as well as lesser known cookieless tracking methods. What they are, how they are used, how they work and what can be done about them. Starting off with the most well known one in this field: Fingerprinting.

### 2.1 Fingerprinting

[OK]

Fingerprinting is a method used to uniquely identify an entity—such as a device, user, or data set—by analyzing its distinct characteristics or patterns. For example, in device fingerprinting, information like browser type, screen resolution, and installed plugins is combined to create a unique identifier for tracking or fraud prevention. In data fingerprinting, algorithms like hashes or checksums generate a unique representation of data to verify integrity or detect duplicates. Fingerprinting is widely used for online tracking, authentication, and data validation but raises privacy concerns due to its ability to persistently identify users without consent. [[ref]](https://en.wikipedia.org/wiki/Fingerprint_(computing))

A measurement that is used here to measure the amount of uniqueness or unpredictability in the data collected for identifying a device or user is entropy [[ref]](https://en.wikipedia.org/wiki/Entropy_(information_theory)). It quantifies how much information the collected attributes provide about the entity being tracked. The higher the entropy, the higher the uniqueness of that device. For example, someone that has a 1920x1080 screen resolution has low entropy because a wide number of people use it.

Entropy is measured in bits where each bit represents a binary choice. Combining data like browser type, language, screen resolution, installed plugins, and timezone may result in a fingerprint with over 20 bits of entropy, which can uniquely identify most users. For example, tracking users by their browser (4 options, 2 bits of entropy) and screen resolution (8 options, 3 bits of entropy) provides a total of 5 bits of entropy, allowing differentiation among 32 unique users [[ref]](https://en.wikipedia.org/wiki/Entropy_(information_theory)). This example assumes that all options are equally likely to appear which rarely happens in practice.

As per one of the better known privacy browsers, Brave - fingerprinting is very difficult to defend against, even though they offer a lot of mitigation solutions for fingerprinting [[ref]](https://brave.com/privacy-updates/3-fingerprint-randomization/).

There are a lot of different fingerprinting methods that are used to create a fingerprint and track the user without them ever knowing.

### 2.1.1 Device Fingerprinting

[OK]

A device fingerprint [[ref]](https://en.wikipedia.org/wiki/Device_fingerprint) or machine fingerprint is information collected about the software and hardware of a remote computing device for the purpose of identification. The information is usually assimilated into a brief identifier using a fingerprinting algorithm [[ref]](https://en.wikipedia.org/wiki/Fingerprint_(computing)).

Applications that are locally installed on a device are allowed to gather a great amount of information about the software and the hardware of the device, often including unique identifiers such as the [MAC address](https://en.wikipedia.org/wiki/MAC_address) and [serial numbers](https://en.wikipedia.org/wiki/Serial_number) assigned to the machine hardware.

Diverse and stable information can also be gathered below the application layer, by leveraging the protocols that are used to transmit data.

Even if they are not designed to gather and share identifying information, local applications might unwillingly expose identifying information to the remote parties with which they interact.

The most prominent example is that of web browsers, which have been proved to expose diverse and stable information in such an amount to allow remote identification, this is called the browser fingerprint [[ref]](https://en.wikipedia.org/wiki/Device_fingerprint#Browser_fingerprint).

### 2.1.2 Browser Fingerprinting

[OK]

A browser fingerprint is information collected specifically by interaction with the web browser of the device. Device fingerprints can be used to fully or partially identify individual devices even when persistent (and zombie cookies) cannot be read or stored in the browser, the client IP address is hidden, or one switches to another browser on the same device. [[ref]](https://en.wikipedia.org/wiki/Device_fingerprint#Browser_fingerprint)

A lot of different attributes can be used to create a fingerprint

- **Browser version**. Browsers provide their name and version, together with some compatibility information, in the User-Agent request header. Being a statement freely given by the client, it should not be trusted when assessing its identity. Instead, the type and version of the browser can be inferred from the observation of quirks in its behavior: for example, the order and number of [HTTP header fields](https://en.wikipedia.org/wiki/List_of_HTTP_header_fields) is unique to each browser family and, most importantly, each browser family and version differs in its implementation of [HTML5](https://en.wikipedia.org/wiki/HTML5), [CSS](https://en.wikipedia.org/wiki/CSS)  and [JavaScript](https://en.wikipedia.org/wiki/JavaScript).
- **Browser extensions**. A combination of [extensions](https://en.wikipedia.org/wiki/Browser_extension) or [plugins](<https://en.wikipedia.org/wiki/Plugin_(computing)>) unique to a browser can be added to a fingerprint directly.[[10]](https://en.wikipedia.org/wiki/Device_fingerprint#cite_note-Nikiforakis2013-10): 545  Extensions may also modify how any other browser attributes behave, adding additional complexity to the user's fingerprint.
- **Hardware properties**. User agents[[ref]](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/User-Agent) may provide [system hardware](https://en.wikipedia.org/wiki/Computer_hardware) information, such as phone [model](<https://en.wikipedia.org/wiki/Product_(business)#Product_model>), in the HTTP header.  Properties about the user's [operating system](https://en.wikipedia.org/wiki/Operating_system), [screen size](https://en.wikipedia.org/wiki/Screen_size), [screen orientation](https://en.wikipedia.org/wiki/Screen_orientation), and [display aspect ratio](https://en.wikipedia.org/wiki/Display_aspect_ratio) can be also retrieved by using [JavaScript](https://en.wikipedia.org/wiki/JavaScript) to observe the result of [CSS](https://en.wikipedia.org/wiki/CSS) media queries.
- **Browsing history**. The fingerprinter could determine which sites the browser had previously visited within a list it provided, by querying the list using JavaScript with the CSS selector `:visited`. Typically, a list of 50 popular websites were sufficient to generate a unique user history profile, as well as provide information about the user's interests. However, browsers have since then mitigated this risk.
- **Font metrics**. The letter bounding boxes differ between browsers based on [anti-aliasing](https://en.wikipedia.org/wiki/Spatial_anti-aliasing) and [font hinting](https://en.wikipedia.org/wiki/Font_hinting) configuration and can be measured by JavaScript.
- **Canvas fingerprinting** which is explained below in 2.1.2.
- **Hardware benchmarking**. [Benchmark tests](<https://en.wikipedia.org/wiki/Benchmark_(computing)>) can be used to determine whether a user's CPU utilizes [AES-NI](https://en.wikipedia.org/wiki/AES_instruction_set) or [Intel Turbo Boost](https://en.wikipedia.org/wiki/Intel_Turbo_Boost) by comparing the [CPU time](https://en.wikipedia.org/wiki/CPU_time) used to execute various simple or [cryptographic algorithms](https://en.wikipedia.org/wiki/Encryption). Specialized [APIs](https://en.wikipedia.org/wiki/Application_programming_interface) can also be used, such as the Battery API, which constructs a short-term fingerprint based on the actual battery state of the device,[[48]](https://en.wikipedia.org/wiki/Device_fingerprint#cite_note-Olejnik2016-48): 256  or OscillatorNode, which can be invoked to produce a waveform based on user entropy. A device's hardware ID, which is a [cryptographic hash function](https://en.wikipedia.org/wiki/Cryptographic_hash_function) specified by the device's [vendor](https://en.wikipedia.org/wiki/Vendor), can also be queried to construct a fingerprint.

**Mitigation [[ref]](https://en.wikipedia.org/wiki/Device_fingerprint#Mitigation_methods_for_browser_fingerprinting):**

- **Spoofed fingerprints**. [Spoofing](<https://en.wikipedia.org/wiki/Spoofing_(anti-piracy_measure)>) some of the information exposed to the fingerprinter (e.g. the [user agent](https://en.wikipedia.org/wiki/User_agent)) may create a reduction in diversity, but the contrary could be also achieved if the spoofed information differentiates the user from all the others who do not use such a strategy more than the real browser information. Spoofing the information differently at each site visit, for example by perturbating the sound and canvas rendering with a small amount of random noise, allows a reduction of stability.
- **Blocking scripts**. Blindly blocking client-side scripts served from third-party domains, and possibly also first-party domains (e.g. by disabling JavaScript or using [NoScript](https://en.wikipedia.org/wiki/NoScript)) can sometimes render websites unusable. The preferred approach is to block only third-party domains that seem to track people, either because they are found on a blacklist of tracking domains (the approach followed by most [ad blockers](https://en.wikipedia.org/wiki/Ad_blocker)) or because the intention of tracking is inferred by past observations (the approach followed by [Privacy Badger](https://en.wikipedia.org/wiki/Privacy_Badger)).

### 2.1.3 Canvas Fingerprinting

[OK]

Canvas fingerprinting is one of a number of browser fingerprinting techniques for tracking online users that allow websites to identify and track visitors using the HTML5 canvas element instead of browser cookies or other similar means [[ref]](https://en.wikipedia.org/wiki/Canvas_fingerprinting). The HTML5 Canvas is the [single largest fingerprinting threat](https://en.wikipedia.org/wiki/The_Tor_Project) browsers face today [[ref]](https://en.wikipedia.org/wiki/Canvas_fingerprinting).

It works by exploting the HTML5 canvas element.

1. When a user visits a page → the fingerprinting script first draws text with the font and size of its choice and adds background colors.
2. Next, the script calls Canvas API’s ToDataURL method to get the canvas pixel data in dataURL format
   - which is basically a Base64 encoded representation of the binary pixel data.
3. Finally, the script takes the hash of the text-encoded pixel data
   - **which serves as the fingerprint**

The technique is effectively fingerprinting the GPU. Variations in which the GPU or graphics driver is installed may cause fingerprint variation. While not sufficient to identify individual users by itself, this fingerprint could be combined with other entropy sources to provide a unique identifier

Mitigation [[ref]](https://en.wikipedia.org/wiki/Canvas_fingerprinting#Mitigation):

- Browser add-ons like [Privacy Badger](https://en.wikipedia.org/wiki/Privacy_Badger), [DoNotTrackMe](https://en.wikipedia.org/wiki/DoNotTrackMe), or [Adblock Plus](https://en.wikipedia.org/wiki/Adblock_Plus) manually enhanced with EasyPrivacy list are able to block third-party ad network trackers and can be configured to block canvas fingerprinting, provided that the tracker is served by a third party server (as opposed to being implemented by the visited website itself). Canvas Defender, a browser add-on, spoofs Canvas fingerprints.
- The LibreWolf browser project includes technology to block access to the HTML5 canvas by default, only allowing it in specific instances green-lit by the user.
- [T](<https://en.wikipedia.org/wiki/Tor_(anonymity_network)#Tor_Browser>)or Browser notifies the user of canvas read attempts and provides the option to return blank image data to prevent fingerprinting. However, Tor Browser is currently unable to distinguish between legitimate uses of the canvas element and fingerprinting efforts, so its warning cannot be taken as proof of a website's intent to identify and track its visitors.

### 2.2 Redirect/Bounce Tracking

[OK]

Bounce tracking is a technique used by Web trackers. It involves inserting an intermediary link between you and the website you want to visit, allowing a tracker to know you and / or your interests, and thus use this data to sell more targeted ads. This technique is also sometimes known as “redirect tracking.” [[ref]](https://brave.com/glossary/bounce-tracking/)

### 2.2.1 How bounce tracking works

[OK]

When you click a bounce-tracked link, your [browser](https://brave.com/glossary/browser/) first goes to a [tracking](https://brave.com/glossary/tracker/) site, which quickly redirects you to the real site. This redirect happens so quickly that you likely won’t even notice. You generally can’t tell if a link will take you to a bounce tracker, even if you hover over the link before clicking it and look at the [URL](https://brave.com/glossary/url/) your browser shows. That URL might be for the real site the link is meant to go to, but it may be swapped out for a bounce-tracked link just as you click on it.

Bounce tracking works even in browsers that block third-party [cookies](https://brave.com/glossary/cookie/), which more and more browsers are doing. While your [browser](https://brave.com/glossary/browser/) is on the bounce tracker’s site, however briefly, the tracker can set first-party cookies, which are much less likely to be blocked. This ensures that the bounce tracker can reliably identify your browser any time it passes through, and thus build a more complete profile of your browsing activity.

The technique works by injecting additional sites between a site you’re visiting, and the site to which you intend to navigate. These intermediate sites over time learn what sites you’ve visited, and so can perform the same kinds of tracking sites used to use third-party cookies for.

During the brief “bounce” from the tracking site to the real site you intended to visit, the tracking site has a chance to set first-party cookies, to see which URL you came from, and to see which URL you’re going to. That information can be useful for advertising purposes, such as measuring the effectiveness of sponsored links. [[ref]](https://brave.com/glossary/bounce-tracking/)

### 2.2.2 Bounce tracking mitigation

[OK]

There are some browser [extensions](https://brave.com/glossary/extension/) that can do debouncing. However, extensions can [introduce privacy and performance risks](https://brave.com/learn/browser-extension-safety/). Extensions are developed by third-party developers who may or may not be trustworthy. They may collect data about your browsing activity. And they might slow down your browser, drain your battery life, or both.

Some browsers try to mitigate the risks of extensions by limiting what they’re allowed to do. But that creates a different problem: With limited capabilities, extensions might not be able to fully block bounce tracking. There’s a fundamental tradeoff between safe extensions and powerful extensions.

Some browsers, like Brave, can recognize when you’re about to visit a bounce tracking site, and instead take you straight to the real URL. This feature—called “[debouncing](https://brave.com/privacy-updates/11-debouncing/)”—is built directly into the Brave browse [[ref]](https://brave.com/privacy-updates/11-debouncing/). Debouncing that’s built into a browser avoids this tradeoff entirely. Or other browsers, like Firefox, periodically clear cookies and site data set by known trackers [[ref]](https://developer.mozilla.org/en-US/docs/Web/Privacy/Redirect_tracking_protection).

### 2.3 Link Decorating

[OK]

Link decorating is the process of appending additional information, such as tracking parameters or metadata, to a URL. This is often used to attribute traffic sources, enable analytics, or facilitate cross-domain tracking by carrying context (e.g., user IDs, campaign data) across links. [[ref]](https://www.usenix.org/conference/usenixsecurity24/presentation/munir)

### 2.3.1 How link decorating works

[OK]

A URL, such as `https://a.site.example/YYY/ZZZ/pixel.jpg?ISBN=XXX&UID=ABC123#xyz`, consists of several parts [[ref]](https://www.usenix.org/conference/usenixsecurity24/presentation/munir):

- **Base URL**: `https://a.site.example` (scheme and FQDN combined).
- **Resource Path**: `/YYY/ZZZ` identifies a server-side resource, with `pixel.jpg` being the resource file.
- **Query Parameters**: `ISBN=XXX&UID=ABC123` are key-value pairs after the `?` delimiter, separated by `&`.
- **Fragments**: `xyz` follows the `#` delimiter and may act similarly to query parameters.

### 2.3.2 Mitigation

[OK]

To address the abuse of link decorations, several countermeasures have been developed [[ref]](https://www.usenix.org/conference/usenixsecurity24/presentation/munir):

- **Filter List Approaches**: Browsers like Brave, Firefox, and Safari use manually curated lists to strip known tracking parameters from URLs. These lists, while effective for some cases, cannot scale with the rapid evolution of tracking techniques.
- **Machine Learning-Based Solutions**: PURL (pronounced purel-l) uses a supervised classifier to detect and sanitize tracking link decorations by analyzing webpage execution across multiple layers (HTML, JavaScript, network requests, and storage). It achieves 98.74% accuracy while minimizing website breakage compared to traditional methods.
- **Browser Extensions**: Tools such as uBlock Origin and AdGuard offer advanced parameter removal capabilities, using rules and regular expressions to sanitize URLs.
- **Emerging Standards**: Privacy-focused measures, like blocking third-party cookies, indirectly mitigate link decoration abuse by reducing trackers’ reliance on decorated URLs.

These approaches highlight the importance of balancing functionality with privacy, as overly aggressive sanitization may break legitimate website features.

### 2.4 Other Methods

[OK]

While we covered the most known, used and advanced methods of cookieless tracking, there are also other ways to utilize already existing software to achieve the purpose of tracking without cookies.

### 2.4.1 ETags

[OK]

ETags (Entity Tags) are HTTP headers used for caching and tracking. When a browser requests a resource, the server assigns a unique ETag to identify the resource version. The browser caches the resource with the ETag. On subsequent requests, the browser sends the ETag back in the `If-None-Match` header, allowing the server to recognize returning users by matching ETags, even if cookies are disabled. This is used to save bandwith if content doesn’t change on the website but also can enable persistent user tracking via browser cache without relying on traditional client-side storage. [[ref]](https://lucb1e.com/randomprojects/cookielesscookies/)

### 2.4.2 TCP/IP stack fingerprinting

[OK]

TCP/IP stack fingerprinting is the remote detection of the characteristics of a [TCP/IP stack](https://en.wikipedia.org/wiki/TCP/IP_stack) implementation. The combination of parameters may then be used to infer the remote machine's operating system (aka, OS fingerprinting), or incorporated into a [device fingerprint](https://en.wikipedia.org/wiki/Device_fingerprint). [[ref]](https://en.wikipedia.org/wiki/TCP/IP_stack_fingerprinting)
Certain parameters within the [TCP protocol](https://en.wikipedia.org/wiki/TCP_protocol) definition are left up to the implementation. Different operating systems, and different versions of the same operating system, set different defaults for these values. By collecting and examining these values, one may differentiate among various operating systems and implementations of TCP/IP. [[ref]](https://en.wikipedia.org/wiki/TCP/IP_stack_fingerprinting)

### Chapter 3 - Counteractive measures

[OK]

Counteractive measures can vary from mild counteractive measures like downloading extensions to extreme like using the TOR Browser via the onion network, both with it’s pros and cons. Usually, proper functionality with good user experience and best possible privacy are on the opposite sides of the spectrum. In this section we will look at counteractive measures, what do they mean, and which ones best apply to different needs and purposes.

### 3.1 - Browsers

[OK]

For the theoretical part of this thesis, we will not examine the underlying engines of these browsers, since even though the Google Chrome browser and Brave browser rely on the same engine - Chromium, they are both very different privacy-wise. We will look at the final browser products to form conclusions, since that’s what the majority of users are using in their every day life.

By examining the following browsers: Google Chrome (66.64%), Safari (13.92%), Microsoft Edge (4.55%), Mozilla Firefox (2.18%), Brave (1%) and , we will be covering about 90% of the total browser usage share worldwide [[ref]](https://en.wikipedia.org/wiki/Usage_share_of_web_browsers)[[ref]](https://taptwicedigital.com/blog/brave-usage). Both mobile and desktop included.

In part 3.1.6 we will also examine globally lesser used browsers and the benefits and drawbacks of using those browsers.

The protection a web browser can provide is important because, as highlighted in, more than 75% of tracking activities are made previous to the cookie consent banner or when user rejects all of them. [[ref]](https://www.sciencedirect.com/science/article/pii/S2214212623002272)

### 3.1.1 - Google Chrome

[OK]

Google has begun to gradually improve its users’ privacy protection starting in 2019 through a proposal called Privacy SandBox. Privacy SandBox is Google’s new initiative to develop a set of open standards to improve [Internet privacy](https://www.sciencedirect.com/topics/computer-science/internet-privacy) on the web. Currently, this initiative is still in development and looking for new ideas, but some measures have already been implemented. The main measures implemented in the latest versions of Chrome are the SameSite header, the Referrer-Policy header, and cache partitioning. [[ref]](https://www.sciencedirect.com/science/article/pii/S2214212623002272)

In addition to these measures, Google has introduced the **Privacy Budget** [[ref]](https://developers.google.com/privacy-sandbox/protections/privacy-budget), a concept designed to limit fingerprinting techniques by restricting the amount of entropy available to websites. Moreover, the **User-Agent Reduction** initiative gradually reduces the information exposed in the User-Agent string, further mitigating passive fingerprinting risks. These efforts align with broader industry trends, such as Mozilla’s Total Cookie Protection and Apple's Intelligent Tracking Prevention (ITP), reinforcing privacy as a core web standard.

As of 2025, despite Google's **Privacy Budget** and **Privacy Sandbox** initiatives, Chrome still offers minimal built-in privacy protection by default. It does not obscure unique device attributes, making **fingerprinting easy**, nor does it **remove tracking parameters from URLs**. Chrome also **fails to block major tracking scripts, pixels, and cookies**, and does not prevent **cross-session tracking** by third-party trackers. As a result, users remain highly exposed to various tracking techniques unless they manually adjust settings or use extensions. [[ref]](https://privacytests.org/)

### 3.1.2 - Safari

[OK]

Apple Safari uses some privacy protection mechanisms to improve users’ online privacy. These include Intelligent Tracking Prevention (ITP), which blocks cross-site tracking cookies and provides insight into tracking attempts via a privacy report. Fingerprinting prevention reduces the data accessible to websites for unique identification, while Enhanced ITP further limits cookie use and storage. Cross-site tracking and sandboxing prevention provides isolation and security between websites. In addition, Apple’s App Tracking Transparency (ATT) obtains user consent for tracking, and enhanced privacy settings allow for [customization](https://www.sciencedirect.com/topics/computer-science/customisation). [[ref]](https://www.sciencedirect.com/science/article/pii/S2214212623002272) Intelligent Tracking Prevention (ITP) is enabled in Safari by default, so there’s no need to configure anything to get Safari’s enhanced protection mechanism.

In recent updates, Safari has introduced the **Distraction Control** feature, allowing users to hide distracting elements such as cookie preference pop-ups while browsing. This feature enhances the browsing experience by reducing interruptions and clutter on web pages. [[ref]](https://www.theverge.com/2024/8/5/24213899/apple-safari-distraction-control-hide) Additionally, Safari's **Link Tracking Protection** detects and removes tracking parameters from link URLs, preventing third-party sites from tracking users' navigation behavior. This feature is automatically enabled in Mail, Messages, and when browsing with Safari in Private Mode, further strengthening user privacy. [[ref]](https://en.wikipedia.org/wiki/IOS_17) These advancements reflect Apple's ongoing commitment to user privacy, continually updating Safari's features to address emerging tracking techniques and enhance user control over personal data.

Despite these privacy-focused features, Safari performs poorly on many benchmarks [[ref]](https://privacytests.org/), often lagging behind browsers like Brave and Firefox in areas such as tracker blocking, fingerprinting resistance, and network privacy protections. This is primarily because Safari relies on Apple's proprietary privacy mechanisms rather than incorporating more aggressive third-party tracking protection lists or advanced anti-fingerprinting techniques. However, Safari remains a solid choice for Apple users due to its deep integration with macOS and iOS, leveraging system-wide privacy features like Private Relay (for iCloud+ users) [[ref]](https://support.apple.com/en-us/102602) and App Tracking Transparency (ATT) [[ref]](https://developer.apple.com/documentation/apptrackingtransparency). These Apple-exclusive enhancements provide a level of privacy protection that, while not perfect, is still more effective than many mainstream browsers. Moreover, since Safari is optimized for Apple's ecosystem, it offers better battery efficiency and performance compared to third-party browsers on Apple devices.

### 3.1.3 - Microsoft Edge

[OK]

Microsoft Edge offers a suite of privacy features designed to enhance users' online security. The browser includes built-in **tracking prevention** that blocks trackers and cookies, with customizable levels—Basic, Balanced, and Strict—to tailor the degree of blocking. **Microsoft Defender SmartScreen** protects against malicious websites and phishing attempts by checking visited URLs against a dynamic list of reported threats. **InPrivate Browsing** ensures that browsing history, cookies, and site data are not saved after the session ends. Additionally, Edge provides **enhanced password protection**, alerting users if their saved passwords are found in online breaches, and offers safeguards against downloading malware. **Family safety settings** allow for content filtering and activity reporting, while the **Do Not Track** setting enables users to request that websites do not track their browsing activity. The **Tracking Prevention** dashboard offers insights and customization options, and features like **Secure DNS** and the ability to delete browser data further bolster privacy. [[ref]](https://learn.microsoft.com/en-us/legal/microsoft-edge/privacy).

Despite these robust features, Microsoft Edge has faced criticism regarding user privacy. Research indicates that Edge sends hardware identifiers, such as the device's unique hardware UUID, to Microsoft servers, creating persistent identifiers that can be challenging to change or delete. This practice raises concerns about potential tracking across different installations and applications. Additionally, Edge has been observed importing data from other browsers without explicit user consent, leading to allegations of unauthorized data collection. The browser's integration with Windows 10 and 11 has also been scrutinized for redirecting certain web links to Edge, disregarding users' default browser preferences. Furthermore, features like the "follow creators" function were criticized for privacy issues, as they involved sending users' browsing data to Microsoft. In response to these concerns, Microsoft has made adjustments, such as removing the "follow creators" feature and providing options to disable certain data collection practices. [[ref]](https://en.wikipedia.org/wiki/Microsoft_Edge) [[ref]](https://www.windowscentral.com/software-apps/browsing/microsoft-is-taking-away-this-edge-feature-you-never-should-have-used-if-you-care-about-privacy)

Microsoft Edge, like Google Chrome, fails many privacy tests, particularly those from [PrivacyTests.org](https://privacytests.org/), where it allows third-party trackers and lacks strong fingerprinting protection. Research [[ref]](https://www.windowscentral.com/software-apps/browsing/microsoft-is-taking-away-this-edge-feature-you-never-should-have-used-if-you-care-about-privacy) highlights concerns about Edge sending hardware identifiers to Microsoft and collecting browsing data without clear consent. Despite offering security features like SmartScreen and tracking prevention, its deep integration with Microsoft services makes it a weaker choice for privacy-conscious users compared to Firefox or Brave.

### 3.1.4 - Mozilla Firefox

[OK]

Mozilla Firefox employs several privacy protection mechanisms to strengthen users' online privacy. **Enhanced Tracking Protection (ETP)** blocks third-party trackers and cookies, preventing advertisers from monitoring users' browsing habits. **Total Cookie Protection** isolates cookies in separate containers, ensuring that each website stores cookies independently, thereby preventing cross-site tracking. **Fingerprinting Protection** minimizes the device information accessible to websites, reducing the ability to uniquely identify and track users based on their hardware and software configurations. Additionally, **DNS over HTTPS (DoH)** encrypts DNS traffic, preventing intermediaries from monitoring the websites users visit. The browser's **Privacy Protections Dashboard** provides insights and customization options, allowing users to manage their privacy settings effectively. [[ref]](https://support.mozilla.org/en-US/products/firefox/privacy-and-security)

Despite these robust features, Firefox has faced criticism regarding certain privacy practices. In September 2024, the advocacy group NOYB filed a complaint alleging that Mozilla's **Privacy Preserving Attribution** feature tracks user behavior without explicit consent, potentially violating EU privacy laws. Mozilla defended the feature, stating it aims to help websites understand ad performance without collecting individual user data. [[ref]](https://www.reuters.com/technology/mozilla-hit-with-privacy-complaint-over-firefox-user-tracking-2024-09-25) Additionally, concerns have been raised about Firefox's telemetry data collection, which gathers information about browser performance and usage. While Mozilla asserts that this data is anonymized and used to improve user experience, some users are apprehensive about the potential for data to be linked back to individual users. [[ref]](https://www.privateinternetaccess.com/blog/the-firefox-browser-is-a-privacy-nightmare-on-desktop-and-mobile) Furthermore, certain privacy features in Firefox are not enabled by default, requiring users to manually adjust settings to achieve optimal privacy protection. This reliance on user initiative may result in less tech-savvy individuals not fully benefiting from the browser's privacy capabilities.

Mozilla Firefox, while strong on privacy, is not without issues. It fails some benchmarks [[ref]](https://privacytests.org/), particularly in blocking advanced fingerprinting techniques by default. A [2024 complaint by NOYB](https://www.reuters.com/technology/mozilla-hit-with-privacy-complaint-over-firefox-user-tracking-2024-09-25) alleges that Firefox’s **Privacy Preserving Attribution** tracks users without explicit consent, potentially violating EU laws [[ref]](https://www.reuters.com/technology/mozilla-hit-with-privacy-complaint-over-firefox-user-tracking-2024-09-25/). Additionally, [Private Internet Access](https://www.privateinternetaccess.com/blog/the-firefox-browser-is-a-privacy-nightmare-on-desktop-and-mobile) highlights concerns about telemetry data collection, though Mozilla states this is anonymized and used for improvements. Some privacy features, such as strict fingerprinting protection, require manual activation, making Firefox less private out of the box compared to browsers like Brave [[ref]](https://www.privateinternetaccess.com/blog/the-firefox-browser-is-a-privacy-nightmare-on-desktop-and-mobile/).

### 3.1.5 - Brave

[OK]

Brave positions itself as a privacy-centric browser, offering multiple layers of protection to enhance users' online privacy.

The first layer, **Brave Shields**, blocks trackers, cross-site cookies, fingerprinting attempts, and more. Users can view and manage these protections by clicking the Shields icon in the address bar of any page they visit.

The second layer comprises **advanced privacy protections**, including reduced network server calls, partitioning, and blocking bounce tracking. These features are built directly into the browser to minimize data exposure.

The third layer involves Brave's **policies and practices**, emphasizing data minimization by not collecting user data in the first place. Brave aims to adhere to—and exceed—government data protections like GDPR and CCPA, supporting and contributing to the online privacy community. [[ref]](https://brave.com/privacy-features/)

For extra security - Tor can be enabled in the Brave browser for even further enhanced private browsing [[ref]](https://community.brave.com/t/tor-in-brave-browser/508262).

Despite these robust features, Brave has faced criticism regarding certain aspects of its privacy practices. Some users have expressed concerns about the browser's integration of cryptocurrency services, such as the Brave Rewards program and the built-in crypto wallet, viewing them as unnecessary additions that could introduce potential security risks [[ref]](https://www.reddit.com/r/privacy/comments/sh4si9/looking_for_a_real_argument_against_brave/). However, these features are optional and can be disabled in the settings.

Additionally, Brave's use of the Chromium engine has raised questions about its reliance on Google's infrastructure, which some argue could pose privacy risks despite Brave's efforts to mitigate them through various customizations [[ref]](https://community.brave.com/t/brave-browser-and-chromium-google-browser/544243). Furthermore, while Brave's aggressive ad and tracker blocking enhances privacy, it has led to compatibility issues on certain websites, requiring users to adjust Shields settings to access content properly.

These concerns highlight the importance of user awareness and the need to customize settings according to individual privacy preferences.

### 3.1.6 - Other browsers

[OK]

**LibreWolf**: A community-driven fork of Firefox, LibreWolf focuses on enhancing privacy and security by removing telemetry, disabling features like Pocket, and blocking sponsored shortcuts. By default, it deletes cookies and history upon closing, though this can be adjusted. However, users may experience compatibility issues with certain websites, and the absence of auto-updating necessitates manual updates to maintain security. [[ref]](https://en.wikipedia.org/wiki/LibreWolf) It has one of the highest scores on privacy focused benchmarks. [[ref]](https://privacytests.org/)

**Mullvad Browser**: Developed collaboratively by Mullvad VPN and the Tor Project, this browser aims to minimize tracking and fingerprinting without routing traffic through the Tor network. It's designed to be used with a VPN, offering privacy benefits similar to the Tor Browser but with potentially improved performance. Users should be aware that, like other privacy-focused browsers, some websites may not function optimally due to strict privacy protections. [[ref]](https://mullvad.net/en/browser) It has one of the highest scores on privacy focused [[ref]](https://privacytests.org/), but coming with drawbacks of a lot of sites not functioning properly.

**Opera**: A feature-rich browser that includes a built-in VPN, ad blocker, and tracker blocker to enhance user privacy. However, Opera has faced criticism due to its ownership by a Chinese consortium, raising concerns about data privacy and security. Additionally, being closed-source means its code isn't publicly auditable, which may be a drawback for users seeking transparency. [[ref]](https://en.wikipedia.org/wiki/Opera_(web_browser)) It also performs poorly on privacy focused benchmarks. [[ref]](https://privacytests.org/)

**Ungoogled Chromium**: This browser offers a Chromium experience stripped of Google services integration, aiming to improve privacy. While it removes dependencies on Google, it lacks built-in protections against fingerprinting and may require manual configuration to enhance privacy. The absence of automatic updates can also pose security risks if users do not update regularly [[ref]](https://github.com/ungoogled-software/ungoogled-chromium). The only difference on privacy focused benchmarks is that Ungoogled Chromium blocks known tracking cookies [[ref]](https://privacytests.org/).

**Vivaldi**: Created by former Opera developers, Vivaldi is a highly customizable browser offering features like tab stacking, page tiling, and built-in notes. It includes an ad and tracker blocker, but as a closed-source application, its privacy claims cannot be independently verified. Users who prioritize open-source software may view this as a limitation. It also performs very pooryl on privacy focused benchmarks [[ref]](https://privacytests.org/).

**Tor Browser:** Developed by the Tor Project, Tor Browser is designed to provide users with enhanced online anonymity by routing internet traffic through the Tor network's encrypted, multi-layered relay system. This process conceals users' IP addresses and encrypts their data, making it challenging for third parties to monitor online activities. The browser includes security settings that allow users to disable certain web features that can compromise privacy, such as JavaScript and cookies. However, users should be aware that while Tor Browser offers significant privacy protections, it is not entirely foolproof. Engaging in activities like installing additional plugins or opening documents downloaded through Tor while online can potentially expose one's IP address. Additionally, some websites may not function properly due to the browser's strict security measures. Users are advised to follow best practices, such as avoiding the use of browser plugins and ensuring that sensitive activities are conducted over secure connections, to maintain anonymity. [[ref]](https://support.torproject.org/faq/staying-anonymous/) Tor also performs excellently on privacy focused benchmarks [[ref]](https://privacytests.org/).

### 3.1.7 - Privacy focused benchmarks table comparison

[OK]

Based on the information from PrivacyTests.org [[ref]](https://privacytests.org/), here's a broad overview of how various browsers perform in terms of privacy and security:

| Browser     | Version | State Partitioning | Fingerprinting Resistance | IP Address Protection | Tracker Blocking | HTTPS Enforcement |
| ----------- | ------- | ------------------ | ------------------------- | --------------------- | ---------------- | ----------------- |
| Brave       | 1.64    | Yes                | Partial                   | Yes                   | Yes              | Yes               |
| Chrome      | 123.0   | Partial            | No                        | No                    | No               | Yes               |
| Edge        | 123.0   | Partial            | No                        | No                    | No               | Yes               |
| Firefox     | 124.0   | Yes                | Partial                   | No                    | Yes              | Yes               |
| LibreWolf   | 124.0   | Yes                | Yes                       | Yes                   | Yes              | Yes               |
| Mullvad     | 13.0    | Yes                | Yes                       | Yes                   | Yes              | Yes               |
| Opera       | 109.0   | Partial            | No                        | No                    | No               | Yes               |
| Safari      | 17.4    | Partial            | No                        | No                    | No               | Yes               |
| Tor Browser | 13.0    | Yes                | Yes                       | Yes                   | Yes              | Yes               |
| Ungoogled   | 123.0   | Partial            | No                        | No                    | No               | Yes               |
| Vivaldi     | 6.6     | Partial            | No                        | No                    | No               | Yes               |

- **State Partitioning:** Indicates whether the browser isolates data (like cookies and cache) between websites to prevent tracking.
- **Fingerprinting Resistance:** Refers to the browser's ability to prevent websites from uniquely identifying users based on device and browser characteristics.
- **IP Address Protection:** Denotes whether the browser has features to mask or protect the user's IP address, such as built-in VPNs or integration with Tor.
- **Tracker Blocking:** Shows if the browser blocks third-party trackers by default.
- **HTTPS Enforcement:** Indicates if the browser enforces secure connections (HTTPS) by default.

### 3.1.8 - Conclusion

[OK]

Out of the most popular browsers, only Firefox, Brave and Safari are reasonable options for privacy. The problems here are that Firefox doesn’t offer the privacy features out of the box, which means that non-tech savvy individuals will have harder time configuring the browser to get the best privacy features out of it. Firefox is available on Windows, macOS and Linux, while Safari is only available on macOS. While this does give it an advantage since it’s only within the Apple Ecosystem using the privacy features we mentioned in 3.1.2 of this thesis, it has a harder accessibility and not everyone will have access to this browser, as Windows has a global market share of 72% [[ref]](https://gs.statcounter.com/os-market-share/desktop/worldwide).

Out of the lesser known browsers, Mullvad, Librewolf and Tor Browser perform excellently on privacy based benchmarks, and are widely known as secure within the tech community of this niche, they are less known and usually require a higher tech knowledge of using these browsers, as because of their intense privacy settings, a lot of sites appear broken.

Out of all of the browsers that we covered, one particularly mixes both privacy and functionality the best, has good privacy settings out of the box so that non-tech savvy individuals can use it and also offers even further privacy security for using it in private browsing - that browser is **the Brave browser**. It’s good for regular users as the Brave browser is based on the Chromium engine. While this is deemed as it’s main setback for privacy, it offers the regular user to get the same experience as the most popular browser - Google Chrome [[ref]](https://gs.statcounter.com/browser-market-share), while being secure online. And it’s also good for advanced users as they can also use Tor in private browsing for further and extended privacy on the internet.

### 3.2 - Extensions

[OK]

Browser extensions have become key tools in enhancing user privacy, particularly against emerging tracking techniques like fingerprinting and cookieless tracking. These extensions block or modify data exchanged between users and websites, preventing unauthorized tracking without compromising user experience. As cookieless tracking advances, browser extensions remain crucial in protecting user privacy. This section examines their role, effectiveness, and the innovations driving their development in the fight against modern tracking methods.

### 3.2.1 - uBlock Origin

[OK]

uBlock Origin (uBO) is a CPU and memory-efficient [wide-spectrum content blocker](https://github.com/gorhill/uBlock/wiki/Blocking-mode) for Chromium and Firefox. It blocks ads, trackers, coin miners, popups, annoying anti-blockers, malware sites, and more by default using [EasyList](https://easylist.to/#easylist), [EasyPrivacy](https://easylist.to/#easyprivacy), [Peter Lowe's Blocklist](https://pgl.yoyo.org/adservers/), [Online Malicious URL Blocklist](https://gitlab.com/malware-filter/urlhaus-filter#malicious-url-blocklist), and uBO [filter lists](https://github.com/uBlockOrigin/uAssets/tree/master/filters). There are many other lists available to block even more. Hosts files are also supported. uBO uses the EasyList filter syntax and [extends](https://github.com/gorhill/uBlock/wiki/Static-filter-syntax#extended-syntax) the syntax to work with custom rules and filters.

While uBlock Origin is highly effective in blocking unwanted content, it relies on predefined filter lists, which may require regular updates to address new tracking methods. Additionally, some users may find the advanced features and customization options complex to navigate. There is also a potential for website breakage, necessitating manual adjustments to the extension's settings. [[ref]](https://github.com/gorhill/uBlock)

### 3.2.2 - Privacy Badger

[OK]

Privacy Badger is a browser extension that automatically learns to block invisible trackers. It sends the [Global Privacy Control](https://globalprivacycontrol.org/) signal to opt you out of data sharing and selling, and the [Do Not Track](https://www.eff.org/issues/do-not-track) signal to tell companies not to track you. If trackers ignore these signals, Privacy Badger will learn to block them. Besides automatic tracker blocking, Privacy Badger comes with privacy features like [click-to-activate replacements](https://www.eff.org/deeplinks/2024/01/privacy-badger-puts-you-control-widgets) for potentially useful trackers (video players, comments widgets, etc.), and link cleaning on [Facebook](https://www.eff.org/deeplinks/2018/05/privacy-badger-rolls-out-new-ways-fight-facebook-tracking) and [Google](https://www.eff.org/deeplinks/2023/09/new-privacy-badger-prevents-google-mangling-more-your-links-and-invading-your).

Although, turning on the Do Not Track signal does more harm than good in this case, since the Do Not Track HTTP header is deprecated [[ref]](https://en.wikipedia.org/wiki/Do_Not_Track). Meaning that by sending this signal, it does nothing since a lot of companies did not respect it because of lack of legislation and as of 2025, Apple Safari [[ref]](https://en.wikipedia.org/wiki/Safari_(web_browser)) and Mozilla Firefox [[ref]](https://en.wikipedia.org/wiki/Firefox) have removed it all together. While the DNT HTTP header does not provide protection against privacy, it also adds an extra bit for fingerprinting.

For what Privacy Badger is trying to do, uBlock Origin is a better option in this use case scenario. Although both can work together on the same browser well, with Privacy Badger included, we are providing extra information for fingerprinting.

### 3.2.3 - CanvasBlocker

[OK]

CanvasBlocker is an add-on that allows users to prevent websites from using certain JavaScript APIs to fingerprint them. Users can choose to block the APIs entirely on some or all websites (which may break some websites) or just block or fake their fingerprinting-friendly readout API.

While effective in preventing canvas fingerprinting, CanvasBlocker may cause compatibility issues with websites that rely on the blocked APIs for legitimate functionality. Users may need to whitelist certain sites or adjust settings to balance privacy and usability. [[ref]](https://github.com/kkapsner/CanvasBlocker) [[ref]](https://phoenixnap.com/blog/best-security-extensions-for-chrome)

### 3.2.4 - ClearURLs

[OK]

**ClearURLs** is an add-on based on the new WebExtensions technology and is optimized for *Firefox* and some *Chrome* based browsers. This extension will automatically remove tracking elements from URLs to help protect your privacy when browsing the Internet, which is regularly updated [[ref]](https://gitlab.com/ClearURLs/rules/-/raw/master/data.min.json).

However, some users have reported that ClearURLs can cause issues with certain websites, such as breaking functionality or preventing access. Additionally, while it effectively removes known tracking elements, it may not catch all tracking methods, especially as new techniques emerge. Users should be aware of these limitations and consider using ClearURLs in conjunction with other privacy tools for comprehensive protection. [[ref]](https://github.com/ClearURLs/Addon)

### 3.2.5 - Ghostery

[OK]

Ghostery enables its users to detect and control [JavaScript](https://en.wikipedia.org/wiki/JavaScript) "tags" and "trackers" to remove JavaScript bugs and [beacons](https://en.wikipedia.org/wiki/Web_beacon) that are embedded in many [web pages](https://en.wikipedia.org/wiki/Web_page) which allow for the collection of a user's browsing habits via [HTTP cookies](https://en.wikipedia.org/wiki/HTTP_cookies), as well as participating in more sophisticated forms of tracking such as [canvas fingerprinting](https://en.wikipedia.org/wiki/Canvas_fingerprinting). [[ref]](https://en.wikipedia.org/wiki/Ghostery)

Ghostery offers a lot of functionality, for example [[ref]](https://github.com/ghostery/ghostery-extension):

- Block all ads on websites, including YouTube and Facebook, to focus on the information that matters.
- Stop trackers from collecting your personal data.
- Automatically remove intrusive cookie pop-ups and express dissent to online tracking.
- Get detailed tracker information on any website you visit, including the number of trackers, their type, and the company operating them.
- Preview tracker information on search engine result pages to make informed choices.
- Inspect the largest database of trackers, updated fast and reliably for all users.

In a study done by Carnegie, Mellon University, where they compared three different privacy focused browser extensions (Ghostery, DNTMe, Disconnect and a placebo tool), they found that Ghostery detected the most trackers out of the four (232 unique trackers, 3.81 average per website) [[ref]](https://scholar.google.si/scholar_url?url=https://www.ndss-symposium.org/wp-content/uploads/2017/09/watching-them-watching-me-browser-extensions-impact-on-user-privacy-awareness-and-concerns.pdf&hl=en&sa=X&ei=TR-pZ4a-K-zDieoPw9LtuAk&scisig=AFWwaeaOTM2AABfLU8euq8Kn-8zI&oi=scholarr).

And, in another study done by The University of Lahore, they discovered that by default, Ghostery does not provide protection; if appropriately set enabled and configured, it offers the best protection from third-party trackers (93.99% of third-party trackers blocked), is faster than the baseline, with page loading 32.37% acceleration and provides the best trade-off among web page quality and protection. This study concludes that out of all of the extensions reviewed (Ghostery, Privacy Badger, Disconnect), if configured, Ghostery shows best results on all benchmarks - protection, least bandwith usage and fastest page loading acceleration [[ref]](https://journals.uol.edu.pk/pakjet/article/view/712).

The biggest hassle here with Ghostery is that users have to create an account and configure Ghostery themselves.

### 3.2.6 - Conclusion

[OK]

To begin with, skipping **Privacy Badger** is a good idea, as it offers less functionality than **uBlock Origin** while adding the **Do Not Track** HTTP header, which is deprecated and can increase fingerprinting entropy.

**CanvasBlocker** takes a chaotic approach by generating a different canvas fingerprint every time you visit a page, which, although seemingly counterintuitive, can actually make you more identifiable. If fingerprinting is a major concern, a more robust solution would be using the **Brave browser**.

The behavior provided by **ClearURLs** is already integrated into recent versions of **uBlock Origin**, so installing **ClearURLs** alongside **uBlock Origin** is unnecessary and can increase your fingerprintability.

This leaves us with a comparison between **Ghostery** and **uBlock Origin**. Both are open-source and block trackers, but they differ in focus and ease of use. **Ghostery** emphasizes tracker detection and user awareness, offering detailed insights and anti-fingerprinting features, but it requires an account and manual configuration to enable privacy-focused settings. **uBlock Origin**, on the other hand, is a **set-and-forget** solution that works effectively right out of the box, with robust script blocking, extensive filter lists, and low resource usage. **Conclusion:** While **Ghostery** can be useful for understanding trackers, **uBlock Origin** is the more efficient, privacy-preserving choice for most users, offering better protection against fingerprinting with minimal setup.

### 3.3 - Search Engines

[OK]

Search engines are a primary means of accessing information on the internet, but they often track users for personalized results and targeted advertising. While cookies have traditionally been used for tracking, search engines are increasingly adopting cookieless tracking methods, such as fingerprinting and browser history analysis, to gather data without relying on cookies. This section explores how search engines contribute to cookieless tracking and the privacy implications of these practices. [[ref]](https://en.wikipedia.org/wiki/Search_engine_privacy)

### 3.3.1 - Google Search

[OK]

Google Search collects and utilizes extensive user data to enhance its services and deliver personalized experiences. This data collection includes search queries, location information, and browsing history, which are used to refine search results and target advertising. While these practices aim to improve user experience, they have raised significant privacy concerns. [[ref]](https://en.wikipedia.org/wiki/Privacy_concerns_with_Google)

Critics argue that Google's data retention policies and the integration of user information across various services can lead to potential overreach and misuse of personal data. For instance, in 2012, Google consolidated its privacy policies, allowing for the sharing of user data across multiple platforms like YouTube, Gmail, and Maps. This move was widely criticized for creating an environment that discourages internet innovation by making users more fearful online. [[ref]](https://en.wikipedia.org/wiki/Privacy_concerns_with_Google)

Furthermore, Google's advertising practices have been scrutinized for privacy implications. The company has been known to place long-term cookies on users' devices to store preferences, enabling the tracking of search terms and retention of data for extended periods. [[ref]](https://en.wikipedia.org/wiki/Google_Search)

In response to these concerns, Google has implemented tools to give users more control over their data. Features like the Privacy Checkup and My Activity allow users to manage, export, and delete their information. However, the effectiveness of these measures is often debated, as the default settings still favor data collection, and navigating these tools can be complex for the average user. [[ref]](https://myaccount.google.com/privacycheckup)

### 3.3.2 - DuckDuckGo

[OK]

DuckDuckGo is a search engine that prioritizes user privacy by not tracking or storing personal information. Unlike traditional search engines, it does not save your search history, IP address, or any other personal data. This approach ensures that your searches remain anonymous and are not used to create user profiles or target advertisements. DuckDuckGo offers a privacy-centric alternative to traditional search engines by not collecting or sharing personal data, providing tools to enhance online privacy, and offering additional services for comprehensive protection. [[ref]](https://duckduckgo.com/privacy)

In addition to its search engine, DuckDuckGo offers a privacy-focused web browser that includes features such as tracker blocking, automatic HTTPS upgrading, and a "Fire Button" that allows users to clear all tabs and data with one tap. These tools are designed to provide a safer and more private browsing experience. [[ref]](https://duckduckgo.com/duckduckgo-help-pages/privacy/web-tracking-protections)

While DuckDuckGo provides robust privacy protections, it's important to note that it cannot prevent tracking by external websites or internet service providers once you navigate away from its platform. To achieve more comprehensive privacy, combining the use of DuckDuckGo with additional tools like a reputable VPN is recommended.

### 3.3.3 - Bing

[OK]

Both **Google Chrome** and **Bing** prioritize data collection for personalization and advertising rather than privacy. They track searches, browsing activity, and location data, integrating this information across their respective ecosystems (**Google services for Chrome, Microsoft services for Bing**). While both offer privacy controls, they require manual configuration and do not default to privacy-friendly settings. Chrome collects more extensive data, including full web activity, whereas Bing is limited to searches and Microsoft services. [[ref]](https://support.microsoft.com/en-us/microsoft-edge/microsoft-edge-browsing-activity-for-personalized-advertising-and-experiences-37aa831e-6372-238e-f33f-7cd3f0e53679)

Bing, Microsoft's search engine, collects user data such as search queries, IP addresses, and location information to enhance its services and deliver personalized experiences. This data collection enables Bing to refine search results and target advertising. Microsoft asserts that it does not sell or rent personal information to third parties. [[ref]](https://support.microsoft.com/en-us/microsoft-edge/microsoft-edge-browsing-activity-for-personalized-advertising-and-experiences-37aa831e-6372-238e-f33f-7cd3f0e53679)

However, Bing has faced criticism regarding its privacy practices. In December 2022, France's data privacy watchdog, the Commission Nationale de l'Informatique et des Libertés (CNIL), fined Microsoft €60 million for imposing advertising cookies on users without obtaining their explicit consent. The CNIL highlighted that Bing had not set up a simple system allowing users to refuse cookies as easily as accepting them, thereby violating data protection laws. [[ref]](https://www.france24.com/en/technology/20221222-france-fines-microsoft-60-million-euros-over-imposing-ad-cookies-on-users)

Additionally, concerns have been raised about Bing's data collection methods. Microsoft's terms state that Bing can collect and process data in various forms, including text that has been inked or typed, voice data, and images. When users are signed in, some products may display a user's name or username and their profile photo as part of their use of Microsoft products, including in communications, social interactions, and public posts. This extensive data collection has led to privacy concerns among users. [[ref]](https://privacy.commonsense.org/evaluation/Microsoft-Bing)

Furthermore, Bing has been criticized for its collaboration with the National Security Agency (NSA) on internet surveillance. Leaked NSA documents revealed that Microsoft was the first company to participate in the PRISM surveillance program, which authorizes the government to secretly access data of non-US citizens hosted by American companies without a warrant. Microsoft has denied participation in such a program. [[ref]](https://en.wikipedia.org/wiki/Criticism_of_Microsoft)

In response to these concerns, Microsoft has implemented tools to give users more control over their data. Features like the Microsoft privacy dashboard allow users to manage, export, and delete their information. However, the effectiveness of these measures is often debated, as the default settings still favor data collection, and navigating these tools can be complex for the average user. [[ref]](https://privacy.commonsense.org/evaluation/Microsoft-Bing)

In summary, while Bing offers personalized search experiences by collecting user data, it has faced significant criticism and legal challenges regarding its privacy practices. Users concerned about their privacy may need to explore alternative search engines that prioritize data protection and offer more transparent data handling practices.

### 3.3.4 - Brave Search

[OK]

Brave Search is a privacy-focused search engine developed by Brave Software, Inc., designed to prioritize user privacy and security. Unlike traditional search engines, Brave Search does not collect personal information such as IP addresses or search history, ensuring that user searches remain anonymous. This approach prevents the creation of user profiles and eliminates the possibility of targeted advertisements based on search behavior. [[ref]](https://search.brave.com/help/privacy-policy)

A distinguishing feature of Brave Search is its independence from major tech companies. It operates on its own independent index, reducing reliance on third-party data sources and minimizing potential privacy risks associated with external data providers. This independence allows Brave Search to maintain greater control over its data collection practices and uphold its commitment to user privacy. [[ref]](https://search.brave.com/help/index)

In addition to its search engine, Brave offers a web browser that integrates seamlessly with Brave Search, providing a comprehensive solution for users seeking a secure and private browsing experience. The Brave browser includes features such as tracker blocking, automatic HTTPS upgrading, and a built-in ad blocker, further enhancing user privacy and security. [[ref]](https://brave.com/privacy-features)

However, some users have raised concerns regarding Brave's privacy practices. Discussions in the Brave Community have highlighted issues related to integrations with multiple companies, AI features, and sync settings, suggesting that these tools, while intended to improve user experience, may introduce potential risks for personal data. [[ref]](https://community.brave.com/t/concerned-feedback-brave-browsers-privacy-and-security-issues/575988)

Additionally, critiques have been made about Brave's approach to privacy, with some arguing that the company uses privacy as a marketing tool while potentially engaging in tracking practices. [[ref]](https://community.brave.com/t/are-there-any-valid-privacy-or-security-concerns-in-this-discussion/507472)

In summary, Brave Search, in conjunction with the Brave browser, offers a robust solution for users prioritizing privacy and data protection. Its commitment to not collecting personal information and its independence from major tech companies make it a compelling choice for those seeking to maintain anonymity online.

### 3.3.5 - Startpage

[OK]

Startpage is a privacy-focused search engine that emphasizes user anonymity and data protection. It provides search results from Google without tracking or storing personal information, ensuring that your search history remains private. Startpage does not record your IP address or search queries, maintaining your anonymity. The 'Anonymous View' feature allows you to visit websites from your search results through a proxy, preventing the sites from tracking your IP address and protecting your browsing activity. Startpage does not use cookies to track your activity or create user profiles, ensuring that your searches are not used for targeted advertising. All searches and browsing are conducted over secure HTTPS connections, safeguarding your data from potential interception. [[ref]](https://www.startpage.com/en/privacy-policy)

However, in October 2019, Privacy One Group, owned by adtech company System1, acquired a majority stake in Startpage. An initial lack of transparency surrounding the deal caused some concern among privacy researchers, leading to its removal from the PrivacyTools review website. After responding to questions from PrivacyTools team members, Startpage was able to clarify that the acquisition would not impact their privacy-focused mission, and its recommendation was ultimately restored. According to the company, its "founders may unilaterally reject any potential technical change that could negatively affect user privacy". By maintaining its headquarters and operations in the Netherlands, Startpage continues to be protected by Dutch and European Union (EU) privacy laws. [[ref]](https://en.wikipedia.org/wiki/Startpage.com)

In summary, while Startpage offers robust privacy features, users should remain informed about its ownership structure and consider how it aligns with their personal privacy preferences.

### 3.3.6 - Search Engines in other parts of the world

[OK]

**Yandex (Russia):** Yandex collects user data, including search queries and location information, to personalize search results and advertisements. [[ref]](https://en.wikipedia.org/wiki/Yandex)

**Naver (South Korea):** Naver gathers user data such as search history and location to enhance search functionalities and deliver targeted advertising. [[ref]](https://en.wikipedia.org/wiki/Naver)

**Baidu (China):** Baidu collects user data, including search queries and location information, to personalize search results and advertisements. [[ref]](https://en.wikipedia.org/wiki/Baidu)

**Yahoo! Japan:** Yahoo! Japan collects user data, including search queries and location information, to personalize search results and advertisements. [[ref]](https://en.wikipedia.org/wiki/Yahoo_Japan)

**Yahoo! Taiwan:** Yahoo! Taiwan collects user data, including search queries and location information, to personalize search results and advertisements. [[ref]](https://en.wikipedia.org/wiki/Yahoo_Kimo)

**Qwant (France):** Qwant emphasizes user privacy by not tracking search history or personal information, aiming to provide an unbiased search experience. [[ref]](https://en.wikipedia.org/wiki/Qwant)

**Seznam (Czech Republic):** Seznam collects user data, including search queries and location information, to personalize search results and advertisements. [[ref]](https://en.wikipedia.org/wiki/Seznam.cz)

Mojeek (United Kingdom): Mojeek is a UK-based search engine known for its focus on privacy and independence from other major search indexes. [[ref]](https://en.wikipedia.org/wiki/Mojeek)

### 3.3.7 - Conclusion

[OK]

Privacy-conscious users should approach mainstream search engines like **Google Search** and **Bing** with caution, as both heavily rely on extensive data collection to fuel personalization and advertising. Despite offering privacy controls, their default configurations favor data retention and behavioral tracking. These practices often involve cookieless tracking techniques such as fingerprinting, IP logging, and search query profiling, which pose significant privacy concerns.

**Qwant** and **Mojeek** offer fully privacy-focused experiences. **Qwant** is based in Europe and emphasizes neutrality, while **Mojeek** is one of the few search engines with its own independent index. However, both can deliver less accurate or exhaustive search results compared to mainstream engines.

**DuckDuckGo** is a well-rounded option, combining privacy-friendly policies with generally reliable search results. It is widely trusted within the privacy community. However, it still relies partially on Bing’s search index, which means it is not fully independent.

**Startpage** is ideal for users who prefer Google’s search results without the associated tracking. It acts as a privacy wrapper around Google, but concerns persist due to its acquisition by adtech company **System1**. Nevertheless, Startpage continues to operate under strict European privacy laws, offering robust anonymity.

**Brave Search** stands out for its independence, operating on its own search index rather than relying on Google or Bing. This enhances privacy but can result in less comprehensive search coverage, especially for niche queries.

With search engine’s the answer is slightly more complex, as there is not one concrete solution here, but multiple excellent solutions, tailored to what the user’s priorities are.

| User Priority                                                                                      | Search Engine    |
| -------------------------------------------------------------------------------------------------- | ---------------- |
| Maximum privacy above all else                                                                     | Mojeek and Qwant |
| Good privacy, independent search result and generally trusted                                      | Brave Search     |
| Good privacy, generally trusted and used by the public with solid search results                   | DuckDuckGo       |
| Good privacy, slightly less trusted but offering excellent search results similar to Google Search | Startpage        |

These search engines will cover most if not all of the needs of the general user and users can easily switch between search engines based on what they need at the moment, regardless of their browser.

### 3.4 - Conclusion on Counteractive Measures

[OK]

Based on the research conducted, the most effective solution for browsing the web privately—suitable for both everyday users and those seeking higher privacy—combines high accuracy, a good user experience, and robust privacy and security. This solution is to use the **Brave browser** with **uBlock Origin** installed, alongside one of the privacy-focused search engines discussed in **Section 3.3.7**, depending on the user’s specific priorities.

Additionally, **Brave** offers an intuitive feature that allows users to easily switch between search engines by simply typing `:` followed by a shortcut (e.g., `:br` for Brave Search, `:g` for Google, `:q` for Qwant, `:d` for DuckDuckGo, etc.) directly in the search bar, further enhancing convenience and flexibility.
