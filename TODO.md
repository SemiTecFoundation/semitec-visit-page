# TODO — SemiTec foundation page

Items that need a server, a service or real content before they can be built.
Placeholders in the page are marked "(example)" or "to be confirmed".

## Needs a server or a service
- [ ] **Payments (Support).** Choose a payment provider (one-time "Pulse" and monthly "Clock"), set real amounts, enable the Donate button, add a thank-you return (`?thanks=1` → chip power-on with thank-you message).
- [ ] **Contact form (Connect).** Connect the form to a mail address or form service; until then a `mailto:` link can be set in `SITE_CONTENT.contact.rows[].href`.
- [ ] **"Save the date" on upcoming events.** A button per upcoming event that adds it to the visitor's calendar (.ics file / Google Calendar link). Can be generated in the page, but publish together with the server so links and times are final.
- [ ] **Live view on event days.** On the day of an event, a "LIVE" light on the Events gate in 3D and on the timeline in 2D; optionally a live stream or photo feed. Needs a source for live content.

## At a glance with real numbers (once there is work to show)
- [ ] Turn "SemiTec in brief" (the "At a glance" card in the opening, 2D and 3D) into **SemiTec today** with real, confirmed figures only:
  - students reached, volunteers, mentors
  - published papers and student projects
  - partner universities and companies
  - events held, and the **next upcoming event** (already shown automatically from `SITE_CONTENT.events`)
  - the latest **annual report** (link to the PDF in the reports archive)
  - open calls: roles, programmes, deadlines
- [ ] Keep the mission and the four directions as the fallback when a figure is not yet available; never show estimated numbers.
- [ ] Add the figures to `SITE_CONTENT.story` (e.g. `numbers: [{value, label}]`, `next: [...]`) and render them in `js/story.js` next to the brief.

## Content
- [ ] **Fix the frames** (section images and panels): consistent sizes, placement and look across sections, in 2D and 3D.
- [ ] **Review and clean all text** (English): shorten where too long, consistent tone and terms, no leftover example wording.
- [ ] **Review and clean the Armenian text** with a native speaker: the current Armenian is a draft translation and must not be published as final.
- [ ] Real events (dates, places, recaps, photos) in `SITE_CONTENT.events`.
- [ ] Real projects and reports in the archive (`SITE_CONTENT.memory`) (with links to PDFs for reports).
- [ ] Real partners and supporters, with permission, in `SITE_CONTENT.partners`.
- [ ] Contact details in `SITE_CONTENT.contact`.
- [ ] Ecosystem modules at the end of the 2D page (`SITE_CONTENT.ecosystem`): confirm the kinds of organisations; later each module could open a list of real members (with permission) and link to its own page.
- [ ] Check all Armenian text written for new controls.
- [ ] Replace illustrations in `assets/` with real photos.

## Blog (separate site)
- [ ] **Blog as its own page / site**, outside this page (e.g. `blog.<domain>` or `/blog`). This page only links to it: a "Blog" link in the header and in Connect, and later the latest 2–3 posts as cards in Impact or Events.
- [ ] Design the blog later in the same visual language (paper + chip palette, EN/HY). Decide the platform (static site generator, or a hosted blog with a custom domain) together with the server.
- [ ] Topics to plan: foundation news, student project write-ups, event recaps (can link back to the gallery), "how chips are made" explainers.

## Other things foundations usually have
- [ ] **Legal and trust basics:** registration details, charter, board, privacy policy, code of conduct; a safeguarding policy if school students attend events.
- [ ] **News and newsletter sign-up** (sign-up needs a mail service).
- [ ] **Press kit:** logo files, a few photos, a one-paragraph description of the foundation.
- [ ] **Open calls:** scholarships, grants, volunteer and job openings with deadlines (can appear on the 3D path like upcoming events).
- [ ] **FAQ:** who can join, how donations are used, how to become a partner.

## Ideas specific to semiconductors
- [ ] **Learning mode in 3D:** a switch that labels what you see (metal layers, vias, standard cells, memory block, bond pads, seal ring).
- [ ] **Student design gallery:** each project (RTL, FPGA demo, or a manufactured chip) as a cell in the project archive, with a layout image and a link to its code.
- [ ] **Career paths in chips:** RTL design, verification, physical design, analog, test — what each involves and which programme leads there.
- [ ] **Link to SemiTec Academy:** Initiatives → SemiTec Academy points to the learning app and its course packages.
- [ ] **Map of the local chip community:** companies, universities and labs in Armenia's semiconductor field, as an extension of the partners' gold edge contacts.
- [ ] **Yearly design challenge:** a chip-design competition; the best design goes on a shared manufacturing run; feeds Events and the project archive.

## Later ideas
- [ ] Publish as a static site (custom domain), loading screen for the 3D chip.
- [ ] Analytics: which view (2D / 3D) and which sections people use.
