# personal-site

Mohammed Ashfaq's site, served by GitHub Pages at <https://mohammedashfaq.com>.

Plain HTML, one stylesheet, one script. No build step, no dependencies — edit
and push.

## Layout

- `index.html` — the site. Also filed with Apple as the **Support URL** for
  *What Do I Cook Today*.
- `whatdoicooktoday/privacy/` — that app's privacy policy, filed with Apple as
  its **Privacy Policy URL**. Apple's reviewers fetch it over HTTPS, so it must
  stay publicly reachable, with no login, at this exact path.
- `style.css` — shared by both pages. The document typography used by the
  privacy page is scoped to `body > .wrap` at the bottom of the file, so the
  home page and the policy can be styled independently without touching the
  policy's markup.
- `assets/` — portrait, favicons, and the app icon.
- `CNAME` — binds the custom domain. Deleting it reverts the site to
  `<user>.github.io` and breaks both URLs filed with Apple.

## The dinner picker on the home page

The demo in the "What Do I Cook Today" section runs the same selection rule as
the app (`src/suggest.ts` in
[menti-ashfaq/whatdoicooktoday](https://github.com/menti-ashfaq/whatdoicooktoday)):
dishes are weighted by `(days since cooked + 1)²`, a never-cooked dish counts as
90 days stale, and rerolls ignore the weighting 40% of the time. If that rule
changes in the app, `script.js` here should be updated to match.

The dish list on this page is hard-coded sample data. Nothing is stored or sent
anywhere — no analytics, no cookies, no network requests.

## Before restructuring this site

The two paths above are referenced from a live App Store listing, so they are
not free to move. Changing either means updating App Store Connect first and
leaving a redirect behind. The app's own source lives separately at
<https://github.com/menti-ashfaq/whatdoicooktoday>.
