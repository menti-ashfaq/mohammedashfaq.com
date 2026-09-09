# personal-site

Mohammed Ashfaq's site, served by GitHub Pages at <https://mohammedashfaq.com>.

- `index.html` — landing page. Also filed with Apple as the **Support URL** for
  *What Do I Cook Today*.
- `whatdoicooktoday/privacy/` — that app's privacy policy, filed with Apple as
  its **Privacy Policy URL**. Apple's reviewers fetch it over HTTPS, so it must
  stay publicly reachable, with no login, at this exact path.
- `CNAME` — binds the custom domain. Deleting it reverts the site to
  `<user>.github.io` and breaks both URLs filed with Apple.

Plain HTML and one stylesheet, no build step. Edit and push.

## Before restructuring this site

The two paths above are referenced from a live App Store listing, so they are
not free to move. Changing either means updating App Store Connect first and
leaving a redirect behind. The app's own source lives separately at
<https://github.com/menti-ashfaq/whatdoicooktoday>.
