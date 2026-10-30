# TODO — SemiTec foundation page

Items that need a server, a service or real content before they can be built.
Placeholders in the page are marked "(example)" or "to be confirmed".

## Needs a server or a service
- [ ] **Actions on the page that need a server:** *Suggest a topic*, *Propose a project*, *Propose an idea*, the contact form, partner/supporter requests — today they only lead to Get Involved; when the server is ready, each becomes a real form that sends.
- [ ] **Load the content from a database:** programs and their cards, projects, events, meetings, news, reports, partners and the "SemiTec today" figures should come from the platform's database (with an admin to edit them), instead of `content.js`. Measure first: list every kind of record the page shows and the fields it needs, so the database and the page agree.
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

## Design (2D and 3D)
- [ ] **A good final logo** for SemiTec Foundation (with versions for the header, the chip, the favicon and dark backgrounds), then use it everywhere on the page.
- [ ] **No empty paths in 3D:** every path and sub-path must carry its own information along the road (cards with text, pictures and links, like *Education and open knowledge: SemiTec Academy* and the other Programs paths). A path that has nothing to show yet should not be a path.
- [x] **About without side paths** (done: six cards; review the texts and pictures): *Who we are*, *Why we exist*, *Our mission*, *Our vision*, *Our values* and *Our story: Mount Aragats* become cards along the main road of the About section (click to open text and pictures, in 2D as a row of cards) instead of six side paths with little on them. Focus is done the same way; next: Impact and Transparency.
- [ ] Unify the look of cards, panels, buttons and windows across 2D and 3D (sizes, spacing, corner radius, shadows), and check every screen size (phone, tablet, laptop, large screen).
- [ ] Replace the illustrations (section pictures, program icons) with real photos or a consistent illustration set.

## Content
- [ ] **News & Events records:** confirm the dates of the news items (the Academy release is 20 Oct 2026; *First course* and *Academy Templates* are dated October 2026), and add real events to `SITE_CONTENT.events` (`id`, `date`, `type`: lecture / meeting / workshop, `title`, `place`, `text`, optional `link`, `photos`) and news to `SITE_CONTENT.news`. Later both come from the database.
- [ ] Filters on News & Events (All · Lectures · Meetings · Workshops, and News if it stays) once there are enough items; "Add to calendar" for upcoming events (see the server section).
- [ ] **Meetings with industry engineers:** define the series: how often (e.g. monthly), where, who hosts, the first topics and engineers; then add each meeting to `SITE_CONTENT.events`.
- [ ] **Programs: update the texts of paths 2, 3, 4 and 5** (Mentorship and project supervision, Research and technical challenges, Meetings with industry engineers, Hackathons). Review the new texts for *Mentorship and project supervision*, *Research and technical challenges* (grants) and *Meetings with industry engineers*; replace the illustrations in `assets/programs/` with photos of real lectures and meetings when there are some.
- [ ] Programs merged: *Educational programs* and *Open knowledge* are now part of **Education and open knowledge: SemiTec Academy**; review the combined text.
- [ ] **Update the logo, colours and styles** to look more professional: a final logo (and its variants), a refined colour palette, consistent typography, spacing and component styles across 2D, 3D and phones.
- [ ] **Every 3D path with its own boards:** like SemiTec Academy (`showcase`), give each path details, pictures or links along its loop instead of repeating the section picture.
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

## Articles and news: the next platform, not the visit page
- [ ] **No blog on the visit page.** Articles (project write-ups, lecture recaps, explainers) belong to the next Foundation platform, with its database and editors. The visit page only links to it when it exists.
- [ ] **Decide whether the visit page keeps News at all.** Today News & Events shows three news items (Academy release, first course, Academy Templates). Options: (a) keep a short list of the latest few items here; (b) drop News and keep only Upcoming / Past events, with news living on the platform; (c) move these items into Programs (e.g. the Academy path) as facts, not news. Decide together with the platform plan.
- [ ] If News moves to the platform: remove `SITE_CONTENT.news`, the News list in 2D, the news cards on the 3D road and the "News" cell on the chip map; keep a link to the platform's news instead.

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
