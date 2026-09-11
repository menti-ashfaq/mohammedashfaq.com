# personal-site

Mohammed Ashfaq's site, served by GitHub Pages at <https://mohammedashfaq.com>.

Plain HTML, CSS, and JS. No build step, no dependencies — edit and push.

## Layout

- `index.html` — the home page. Also filed with Apple as the **Support URL** for
  *What Do I Cook Today*.
- `whatdoicooktoday/` — a playable demo of that app. Linked from Projects only.
- `whatdoicooktoday/privacy/` — that app's privacy policy, filed with Apple as
  its **Privacy Policy URL**. Apple's reviewers fetch it over HTTPS, so it must
  stay publicly reachable, with no login, at this exact path. Do not edit its
  markup.
- `style.css` — shared by all pages. Privacy-page typography is scoped to
  `body > .wrap` at the bottom of the file, so the home page and the policy can
  be styled independently without touching the policy's markup.
- `script.js` — shared chrome (theme, nav, portrait coin-flip, headline swap).
- `picker.js` — dinner-picker logic, loaded only on `/whatdoicooktoday/`.
- `assets/` — portrait, favicons, and the app icon.
- `CNAME` — binds the custom domain. Deleting it reverts the site to
  `<user>.github.io` and breaks both URLs filed with Apple.

## Colour

The site palette is cool slate with a signal blue. The *What Do I Cook Today*
app has its own warm palette, and that warm set is redeclared on `.phone` only
— so the mockup looks like the real app while the rest of the site does not. It
stays light in both site themes because the app ships light-only
(`userInterfaceStyle: "light"` in its `app.json`). Changing the site's colours
means editing the tokens on `:root`; the mockup will not follow, which is
deliberate.

## The dinner picker

The demo at `/whatdoicooktoday/` runs the same selection rule as the app
(`src/suggest.ts` in
[menti-ashfaq/whatdoicooktoday](https://github.com/menti-ashfaq/whatdoicooktoday)):
dishes are weighted by `(days since cooked + 1)²`, a never-cooked dish counts as
90 days stale, and rerolls ignore the weighting 40% of the time. If that rule
changes in the app, `picker.js` here should be updated to match.

The dish list is hard-coded sample data. Nothing is stored or sent anywhere —
no analytics, no cookies, no network requests.

## Before restructuring this site

The Support URL (`/`) and Privacy Policy URL (`/whatdoicooktoday/privacy/`) are
referenced from a live App Store listing, so they are not free to move.
Changing either means updating App Store Connect first and leaving a redirect
behind. The app's own source lives separately at
<https://github.com/menti-ashfaq/whatdoicooktoday>.
