# mohammedashfaq.com

Static site served by GitHub Pages at <https://mohammedashfaq.com>.

- `index.html` — landing page, also used as the App Store **Support URL**.
- `whatdoicooktoday/privacy/` — privacy policy for the *What Do I Cook Today* iOS
  app, used as the App Store **Privacy Policy URL**. Apple's reviewers fetch this
  over HTTPS, so it must stay publicly reachable with no login.
- `CNAME` — binds the custom domain. Deleting it reverts the site to
  `<user>.github.io` and breaks the URLs filed with Apple.

Plain HTML and one stylesheet, no build step. Edit and push.
