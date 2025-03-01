# Bachelor's thesis repository: Privacy-Preserving Cookieless Tracking: Techniques, Challenges, and Innovations

## Passing Arguments

Arguments can be passed when running the main script like so:

```bash
npm run main -- <args>
```

Possible arguments are:

- **link_decorating**
  - Runs tests related to link decorating, which appends tracking parameters or metadata to a URL.
- **fingerprinting**
  - Runs tests related to fingerprinting, which uniquely identifies an entity by analyzing its distinct characteristics.
- **bounce_tracking**
  - Runs tests related to bounce tracking, which involves inserting an intermediary link to track user interests.
- **debug**
  - Runs the script in debug mode for troubleshooting and development purposes.

### Example Usage

To run all tests:

```bash
npm run main -- all
```

To run fingerprinting tests only:

```bash
npm run main -- fingerprinting
```

To run link decorating and bounce tracking tests:

```bash
npm run main -- link_decorating bounce_tracking
```

To run bounce tracking in debug mode:

```bash
npm run main -- bounce_tracking debug
```
