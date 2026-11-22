# SemiTec Foundation — Visit page

The SemiTec Foundation website: one page with a 2D reading view and a 3D journey. Open `index.html`, or the live preview at https://semitecfoundation.github.io/semitec-visit-page/. Open items that need a server or real content are in **[TODO.md](TODO.md)**.

## Content database

On the server the page's content comes from `db/site.json`, written by the **SemiTec Content Manager** (a separate application in `semitec-content-manager`, with its own users). Every save there rewrites that file, so changes appear at once, without git.

- `js/db.js` reads `db/site.json` and puts it over `SITE_CONTENT` before the other scripts start. The scripts are listed in `index.html` and started in that order; `core.js` and `sound.js` wait for the `st:scripts-ready` signal.
- `db/` is in `.gitignore`: it belongs to the server, and the 5-minute git pull leaves it alone.
- **`content.js` is the fallback.** It is used when `db/site.json` is missing, unreadable or takes over 3 seconds, which also covers opening the page from disk and the GitHub Pages preview. While a database exists, editing text in `content.js` does not change the site: edit it in the content manager. Only new `ui` keys still come through from `content.js`.

## Static content integration (November 2026)

The bilingual editorial source is `semitec-static-website-content.md`. Its copy is integrated into `content.js` using the existing sections, cards, 2D reading view and 3D journey. The four Aragats pillars remain in Focus. Existing section and legacy program URLs are retained. The draft's section names also resolve as hash aliases.

News, events, partners and archive records have no static sample entries. Programs, resources and opportunities show the supplied evergreen introductions and empty states because their APIs do not exist yet. Future admin integration must supply published, localized records; this change does not implement a backend. Unverified Academy product descriptions and news records were removed from public static copy. The contact form and donation controls remain unavailable, and the unverified mailbox is not published. Copyright uses the current application year.

Validation: `node validate.cjs` and JavaScript syntax checks pass. Browser layout verification remains pending because no connected browser was available.

## 2D view: one name per section, tabs (November 2026)

- **One name per section.** A numbered section's heading uses its menu name (`label`), the same name the chip and the bottom bar show. Its `eyebrow` is not shown. Section 02 is now **Our Symbol** and section 03 **Directions**.
- **Short names.** Paths and chip cells may have `short` (EN/HY). It is used on the chip map and on the tabs; the full `title` stays on the page.
- **No section illustrations** in the 2D view. The chip map beside the text is the section's picture.
- **Paths as tabs.** A section's paths are a row of tabs with one path shown at a time. A link to a path (`#section/path`) opens its tab. The 3D view is unchanged.

Live site: `npm run import -- --section focus,initiatives,events,impact,people,transparency,donate,support` in the content manager.

## Focus Areas: five directions (November 2026)

The Focus Areas section (`initiatives`) has five side paths, one per direction, and no cards. The six charter directions and the separate program paths were removed. The intro explains the gap the directions close.

| Path | Direction | Extra |
|---|---|---|
| `labs` | University Laboratories | `deck: "labs"` |
| `academy` | SemiTec Academy: the digital library (courses, trainings, materials) | `deck: "library"`; cards: Academy app, Learning materials, Academy Templates, Explore the building blocks |
| `projects` | Diploma & Research Projects | `deck: "projects"` |
| `hackathons` | Hackathons & Conferences | `deck: "hackathons"`, `eventTypes: hackathon, conference` |
| `meetings` | Engineer Meetings & Guest Lectures | `deck: "meetings"`, `eventTypes: meeting, lecture` |

Old addresses still work: `#initiatives/library` and `#interactive-lab` open SemiTec Academy, and `#initiatives/mentorship` and `#initiatives/challenges` open projects.

**The presentation (`expo/`).** This is the foundation's self-running presentation. A node with `deck` gets a **Watch** button, which opens the presentation in a window in both views:
- `deck: "all"` plays the whole story (the Focus Areas section uses it);
- `labs`, `library`, `projects`, `hackathons` and `meetings` play only their chapter, so the slides explain and the path text keeps to status, facts and links.

The window loads `expo/index.html?embed=1&autoplay=1&chapter=…&lang=…`. Esc or × closes it and stops it. On its own, `expo/index.html` is the full expo version, with its own README.

**Events on a path.** A node with `eventTypes` lists the upcoming events of those types, or "No dates announced yet". The event types `hackathon` and `conference` were added.

Both fields are in the content manager's schema. To update the live site, run this on the server in the content manager's folder after pulling:

```sh
npm run import -- --section initiatives
```

It replaces only this section and adds the two event types, keeps every other edit, and keeps the previous version in History.

## Earlier content source (Oct 2026)

All text comes from the document "SemiTec Foundation — Public Website Content & Structure".
- Section ids are unchanged; long texts are paragraphs (`text`) in sections and path cards.
- Partners, events and archive items are empty on purpose: add only confirmed records.
- Program records are reserved for backend/admin publication. Existing cards still use `showcase: [{title, intro, details, items, links, media}]`; clicking a static editorial card opens its details and gallery in either view.
- The contact form does not send yet; it says so on the page.
- The Armenian text is a draft and needs a native review before publishing.

## The opening: how a chip is made (2D and 3D)

The first screen after the overview is a film of a chip being made, rendered in Blender (Cycles), with the
foundation's story told beside it. It is played one step at a time:

- **Steps:** sand → crystal growth → slicing → oxidation and coating → photolithography → etching and doping →
  metal interconnect → wafer test → dicing → packaging and bonding. Each step is a short move of the camera to the
  next station (the text changes) and then the work of that step (the text stays and the process runs by itself).
- **Moving through it:** a short scroll, a swipe or the arrow keys start the next step; it plays to its end by
  itself and stops exactly on its last frame. While it plays the page does not move on, and scrolling again only makes
  it faster. Scrolling up plays the steps backwards.
- **The text:** the story cards ("SemiTec in brief", the sections, the connections, the edge contacts) stand beside
  the film without frames, right and left in turn; above each one, a line says which step of the fab is shown.
  Texts of the steps: `fab*` keys in `SITE_CONTENT.ui` (`content.js`).
- **The end:** the package opens and the camera looks straight down at the die. The die is a picture of the chip
  map, so the page lays the chip map exactly over it, the map fades in and tilts up: one object from the film to the
  page. Then come the two ways to explore (read on, or enter the 3D journey).
- **Skip the intro** (bottom right, in both views) goes straight to the end of the opening.
- **3D view:** the same film and story on the dark board; the inside of the chip is not seen until the dive. After
  the last card, scrolling on dives into the chip map and opens into the 3D chip; scrolling up at the very start of
  the journey plays the dive in reverse. At the end of the journey it is the other way round: the camera rises out of
  the chip first, then the chip comes in from very large and shrinks to its place, as if leaving its inside.

**Files:** `js/film.js` (the player), `js/story.js` (the text and the hand-off to the map), `js/core.js` (one step
per gesture), `assets/film/` (`film.mp4`, `film-rev.mp4`, stills of the rests, `film-meta.js`). The video holds the
picture in its top half and 1 − its transparency in the bottom half; two canvases lay them over the page with blend
modes, so the film has no background. The Blender scripts are in `tools/film/` (see its README).

## The 2D ending: the package and the ecosystem

After Connect, the ending has **four switching points**, like the opening. Each is a short timed animation, and scrolling back above a point plays it in reverse:
1. **Topology:** when the ending reaches the header (Connect has moved up), the map flies to the middle of the screen and shows the whole chip, with **every partner's and supporter's name** around its edges. On wide screens, the **partners are listed on the left and the supporters on the right**, each with a logo; the initials stand in until a `logo` image is set in `SITE_CONTENT.partners`. Top / 3D and zoom work here as everywhere else.
2. **Partners:** the chip, as a 3D object, turns over to its underside, the I/O side ("Everyone connected to the chip"). There, every partner's and supporter's name stands fixed next to its contact: gold for partners, copper for supporters. Free contacts carry a **+**.
3. **Package:** the chip turns back to its front and goes to the top view, then shrinks into place in one animation, the circuit board darkens and the **package lid closes over it**: SemiTec logo and gold leads on every side. Only four labelled contacts stay outside:
   - top: **+ Become a partner** and **+ Become a supporter**
   - bottom: **Contact us** and **Email**
4. **Ecosystem:** the modules connect to the package's side leads one after another: universities, research institutes, researchers & mentors, schools & students, industry companies, startups, government & public bodies, international & diaspora. A dashed **"+ Your organisation"** module is the free slot. Then the buttons to become a partner or supporter, or go back to the beginning, appear.

**Names and free contacts on the map:**
- **Names:** partners' and supporters' names sit just outside the chip's edges, each joined to its pad by a thin line. They show when you're close enough to read them, and always in the ending.
- **Free contacts:** every free contact shows a **+**. Hovering over it shows "+ Become a partner" or "+ Become a supporter", and clicking it opens the invitation.

**The same ending in 3D:** after the journey reaches the chip edge (the seal ring and the bond pads), the page keeps scrolling through the same three switching points:
1. The camera rises out of the trace and the view becomes the **chip's topology**, with all the names: the same chip map as in 2D.
2. The chip turns over to its I/O side with the partners' names.
3. The package closes over it.
4. The ecosystem connects.

Space continues into the ending. "Back to the beginning" glides to the start of the journey.

- **Edit the modules** in `SITE_CONTENT.ecosystem` in `content.js`. Each has an id, a bilingual title and note, a colour (gold, teal or copper) and the path it links to. There can be up to 8 (4 per side on wide screens; on phones they sit above and below the package). The traces are routed automatically so they never cross.
- **Code:**
  - the ending itself: `js/ecosystem.js` (one instance per view), with styles at the end of `css/read.css`
  - the 2D switching points and the map's flight: `placeDock()` in `js/mode-read.js` and `setOutro()` in `js/chipmap.js`
  - the timing of each step (delays, durations): the `st-topo` / `st-pack` / `st-eco` rules in `css/read.css`
  - the 3D part: `updateOutro()` in `js/mode-signal.js`, marked ▸ENDING

## Free contacts: invitations on the chip's edge

Every edge of the chip carries contact pads. **Gold** pads (top and left edges) belong to partners and **copper** pads (bottom and right edges, next to the power unit) to supporters. Pads already taken have a bond wire and a name. **Free pads** have no wire and a dashed outline, and invite the visitor in:
- **2D map:** clicking a free pad opens "This contact is waiting for a partner / supporter" with **Become a partner** (Connect → Become a partner) or **Become a supporter** (Support).
- **3D ending:** the pad row has free, unwired pads at both ends with "+ Become a partner / supporter" labels. Clicking one glides you to that section.
- **People section:** the gold pad strip ends with two dashed "+ Become a partner / supporter" chips.

As partners are added to `SITE_CONTENT.partners`, they take the free slots automatically.

## Archive: gallery, projects, reports

The chip's archive blocks hold the foundation's records. Each section with an archive bank gets its own block. (In the code these are called `memoryBanks` and `memory`.) An item is "written" into its bank once its date has passed, and each cell is addressed by year.month (e.g. `2026.06`).

| Bank | Section | Colour | Source |
|---|---|---|---|
| Gallery | Events | gold | past `SITE_CONTENT.events` (automatic) |
| Project archive | Impact | teal | `SITE_CONTENT.memory` items with `bank: "projects"` |
| Reports archive | Trust | copper | `SITE_CONTENT.memory` items with `bank: "reports"` |

- **3D:** each bank is an archive block standing just after its section's gate, with one lit cell per item and a board with "Open …". **Upcoming events** are gold posts on the approach to Events; the soonest is met first.
- **2D:** Events shows the upcoming timeline next to the gallery. Impact and Trust show their archive panels, and each section's tile on the map shows one lit bit per stored item.
- **Archive view** (dialog) switches between all banks. Opening a cell shows its image, date and summary.
- Add a bank in `SITE_CONTENT.memoryBanks` (`id`, `section`, `color`: gold / teal / copper, `title`, `intro`, `open`), then add items to `SITE_CONTENT.memory` (`id`, `bank`, `date`, `title`, `summary`, `media`, optional `url`).
- Preview another day: add `?today=2027-01-15` to the address.

## Sound

Off by default. The speaker button in the header turns it on, and the choice is remembered. Everything is synthesised in the browser (`js/sound.js`, no audio files):
- a low electrical hum that rises and brightens while you travel
- a clock tick when you reach a new section
- soft tones when the archive view opens or a cell is read
- a rising chord when the chip powers on (Support and the finale)
- a filtered whoosh when switching between 2D and 3D

Browsers only allow sound after a click or key press, so a remembered "on" starts at the visitor's first interaction.

---

One page and one content file, shown two ways. Switch with **2D Read / 3D Travel** in the header. Open `index.html` in a browser; it needs no installs or build step.

- **2D · Read** is a long, readable page. Next to it is an **interactive chip map** you can zoom, drag and open full screen.
- **3D · Travel** is the Signal journey (originally the separate Signal prototype): the WebGL chip, side-path loops, image boards and the "Explore sections" dialog.

Both views read `content.js` (the Signal content: 9 sections including **Support**, their submenus and nested submenus, images, EN/HY text). They also share the header, language, bottom section bar and the current location.

## The 2D chip map

The floorplan is **generated from `content.js`** (`js/chiplayout.js`), so adding a section or submenu can never cause overlaps:
- each main section is an equal tile, in two rows; the second row reads right to left, so the signal bus snakes between them
- submenus are cells inside their tile; "+2" marks nested paths. Cell names appear once you zoom in far enough to read them
- **Support is the chip's power unit** along the bottom edge. Its gold power rails feed every tile and light up when you reach Support

Settings such as columns, gaps and which section is the power unit are in `CHIP_LAYOUT` at the end of `content.js`.


| Action | How |
|---|---|
| Move | Drag with the mouse, swipe sideways on a phone, or use the arrow keys |
| Zoom | **Ctrl / ⌘ + scroll**, trackpad pinch, two-finger pinch, the **+ / −** buttons, or double-click. Plain scrolling still scrolls the page; the map shows a hint |
| Top / 3D | Flat top view (text stays sharp at any zoom) or tilted 3D chip. The choice is remembered |
| Full screen | ⤢ button or "Explore sections" in the header. Plain scrolling zooms here. Esc closes it |
| Minimap | Appears when zoomed in. Shows where you are; click or drag it to move there |
| More detail when closer | At closer zoom each block lists its submenus. Click one to open that section with its card expanded |
| Follow page / Free view | While you read, the camera stays on the current block and flies to the next one near the end of each section. Once you move the map yourself it switches to **Free view**. **Follow page**, or reaching the next section, brings it back |

The gold trace and signal move with your reading position, and the block you're reading lifts and glows.

## The 2D page

Each section has a scroll-linked reveal: title words rise, the image unmasks with a small parallax, chips and cards appear one after another, and the large section number moves more slowly than the page. These play backwards when you scroll up. Submenus are expandable **path cards** showing their items and nested paths. Sections and path cards have no separate "3D" links: the way into 3D is the 2D / 3D switch at the top (it keeps your place), or the 3D choice in the story's last card, "Read the page, or travel through the chip."

## Support (donations)

Support sits between Trust and Connect, so the reports are right before it. On the 2D page it has a power-unit panel: **Pulse · give once** / **Clock · give monthly**, three amount slots, a Donate button and "Where the support goes" (which opens Trust → Reports). The amounts and the payment link are placeholders: the button stays disabled until a payment provider is chosen. Its submenus: give once, give monthly, fund a lab kit, donate equipment, give your time. In 3D, reaching Support powers on the chip: every trace brightens.

## About and Focus: cards instead of side paths

Focus works the same way (education, research, industry collaboration, community). About's topics (who we are, why we exist, mission, vision, values, our story) are `showcase` cards on the section itself (`SITE_CONTENT.sections[purpose].showcase`), not side paths:
- **2D:** a row of cards (three per line) under the section text; a card opens large (details + picture). The About block on the chip map lists them; a cell scrolls to its card (`#purpose/values`).
- **3D:** the cards stand along About's road one after another (`JOURNEY_SETTINGS.mainCardGap` apart); each comes up as you approach it and fades once passed, so only one or two show at a time. A card opens large.
- `validate.cjs` uses a test-only nested path under About for its journey geometry checks.

## News & Events

No side paths: the section shows records.
- **Upcoming events** (`SITE_CONTENT.events`, date in the future): cards with a date badge; with none, an honest "Next events will be announced here" and *Propose an event*. In 3D they are the gold posts on the approach to the section, and the reading panel shows the next one.
- **Past events** (date passed): photo cards and the gallery; with none, a short note. An empty archive shows no board in 3D.
- **News** (`SITE_CONTENT.news`, date `YYYY-MM-DD` or `YYYY-MM`): a dated list in 2D, newest first; in 3D the latest four stand along the section's road as cards.
- Every event and news item opens large (details, pictures, links). Event pictures come from `photos`, or from its type (`SITE_CONTENT.eventTypes`) until there are photos.
- The chip-map block lists Upcoming, Past, News and Propose (`cells`); a cell scrolls to that group.

## Menu during the opening story (3D)

Choosing a section in the bottom menu while the opening story is on screen leaves the story and travels to that section; the start (◉) goes back to the story's first step.

## Gates, section names and side paths (3D)

- Each section's **name stands on its gate** (`.gate-name`, projected onto the gate's beam). Crossing a gate is where the reading panel changes to that section. The section pictures that used to float on the right of the main route are gone.
- On the main route the **side paths branch off around the middle of a section**, between its gates (`JOURNEY_SETTINGS.mainBranchAhead`, 0 = the middle). Choosing a section arrives just past its gate (`arriveBeforeMiddle`), with the paths sign ahead.
- A side path off the main route **comes back a little before where it left** (`loopReturnBack`, near the start of the section), so after it the paths sign is ahead again and another path can be chosen. Its last stretch settles exactly onto the main route; the repeated stretch is joined back into one when the visit is cleaned up.
- When the camera is past the branch point without having seen the sign (coming back from a side path, or arriving there), the sign stays a little ahead of the camera until the next gate, so another path can be chosen without scrolling back.
- Choosing a side path from the reading panel before that middle point travels on to the middle first, then turns onto the path; after the middle it turns where you are.
- A path's text always shows in the 3D reading panel, in an area that scrolls within a fixed height (no "Read more"); the buttons keep a fixed place above the bottom bar.

## 3D journey changes

- Scrolling is about 1.6× slower (`pixelsPerUnit` 30, was 18) with softer camera easing (`js/journey.js`).
- Choosing a side path glides the camera forward into it, stopping about a fifth of the way around the loop with the turn in view. "Continue the journey", "Return to…" and the section bar use the same glide, so every jump feels like travel. Any wheel, touch or scroll key takes over immediately.
- Loops alternate sides by depth: level 1 (e.g. SemiTec Academy) turns left, level 2 (Programs) turns right with a teal signal lane, level 3 turns left again. The side-path sign appears on the side the loop will turn. Every loop still returns to its own junction.

## Partners & supporters — the chip's gold edge contacts

`SITE_CONTENT.partners` in `content.js` lists partners (`kind: "partner"`) and supporters (`kind: "supporter"`). Each has a bilingual name and an optional `url`. They appear in three places:
- **2D map:** gold bond pads along the top edge of the die, with bond wires, and pin-style names when zoomed in. Click a pad for a small card (website if `url` is set, else the Partners section or Support).
- **2D page:** a row of gold pads under People.
- **3D finale:** the journey now has an end. After Connect the die stops at a gold seal ring; beyond it is a row of bond pads with wire bonds to the package leads, one pad per partner/supporter, with their names above. The chip powers on again as you arrive. Click a name to open it.

The names are placeholders; only show real ones with permission.

## Contact

Connect has a contact block (email, phone, address, social media) from `SITE_CONTENT.contact` and a feedback form (name, email, message). Sending is not connected yet; the button stays disabled until a form service or mail address is chosen.

## Keys

- **Space** = next stop, **Shift+Space** = previous stop in 3D. Inside a side path, Space returns to the junction and continues; Shift+Space goes back to where the path began. The 2D page keeps normal Space scrolling.
- **M** switches view, **[ ]** previous / next section, **Esc** closes the full-screen map or a partner card.

## The transition

- **2D → 3D:** the map camera dives into the current block. The map window grows to fill the screen while it fades into the WebGL chip, and the 3D camera arrives from above and settles at trace level.
- **3D → 2D:** the 3D camera rises to a top-down view of the chip. The screen shrinks back into the map window, which lifts back out of the block.
- Both directions keep your place, including an open submenu or loop.

The growing and shrinking window uses View Transitions (Chrome, Edge and Safari 18+). Firefox gets a quick fade instead. With reduced motion turned on, the switch is instant.

## Other

- `?mode=2d` or `?mode=3d` plus `#events/upcoming` (any path) opens straight there. The last view used is remembered, and the default is 2D.
- Keys: **M** switches view, **[ ]** go to the previous / next section.
- The 3D chip is built in the background after the 2D page loads, so the first switch is quick.

## Files

```
index.html          shell: header + switch, 3D layers, 2D page, bottom bar, dialogs
content.js          the fallback content (both views) + CHIP_LAYOUT for the 2D map
js/db.js            reads the content database, then starts the other scripts
db/                 written by the content manager on the server (not in git)
css/base.css        colours for both views, header, switch, bottom bar, dialogs, transition
css/read.css        2D page and chip map
css/signal.css      3D view (Signal styles, scoped to the 3D view)
js/core.js          shared: language, location, bottom bar, view switching
js/sound.js         optional synthesised sound (off by default)
js/chiplayout.js    generates the floorplan from content.js (also used by validate.cjs)
js/chipmap.js       the interactive map
js/mode-read.js     2D view
js/ecosystem.js     2D ending: the package and the ecosystem modules
js/mode-signal.js   3D view (Signal's script.js; changes are marked ▸DUAL)
js/journey.js       Signal route geometry (unchanged)
js/scene.js         Signal WebGL chip (+ camera "lift" for the transition, marked ▸DUAL)
assets/             illustrations
validate.cjs        node validate.cjs: Signal's checks + floorplan overlap checks + alternating-loop checks
EDITING.md          how to edit (adapted from Signal)
```


## Ideas for next steps

1. **Real content and photos.** Every image and text slot is a placeholder, and the image boards in 3D and the image in each 2D section use the same `media` key.
2. **Search on the map.** Typing "workshop" would highlight the block and the path.
3. **Sharper 3D-view text when zoomed far in:** the browser blurs text on tilted surfaces at very high zoom. Top view is always sharp.
4. **An "auto tour" button** in 3D for events or booth screens.

The text is still example content. Names, events, partners, reports and donation or contact details must be confirmed before publication. The Armenian strings added for the new controls should be checked.

## 3D view (Travel) — same content as 2D
- The reading card of each main section shows the same blocks as the 2D page (`ST.secHTML` in `js/mode-read.js`), in dark colours, in a scrolling area; "More" and cards open the same side panel (`ST.drawerOpen`).
- Boards along the road are text only (no old pictures) and open the side panel; News & Events shows the example events there.
- Landmarks (`buildLandmarks` in `js/scene.js`): Aragats as contour rings beside the road at Our Symbol (shared contours from `expo/js/aragats.js`), a five-plank bridge over a gap and five direction blocks with status lights at Directions, five coloured event stations at News & Events. Their labels (`lm-tag`) open the pillar, travel into the direction, or open an example event.
