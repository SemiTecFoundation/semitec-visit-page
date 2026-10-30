# SemiTec — Read or Travel · Memory (VisitPageMemory)

The foundation page. The older prototype folders (VisitPage, VisitPage3D, VisitPageCircuit, VisitPageSignal, VisitPageDual) have been removed. Open `index.html`. Open items that need a server or real content are in **[TODO.md](TODO.md)**.

## The 2D opening: the story of the chip

This is the **story version** (folder `VisitPageStory`; on GitHub under `/story/`). The first screen after the overview is pinned while you scroll, so the page itself stays still:

1. **The empty chip** floats in the middle as an object, with the SemiTec Foundation name and logo on it: no window, no zoom or drag, only a slow float. The name and logo stay through "At a glance" and fade away as the first section lands on the chip.
2. **At a glance:** the chip moves aside (to the left, or to the top on phones). On the right comes "SemiTec today": numbers (volunteers, students reached, published papers, entrepreneurs supported, partner universities, events held) and what's next (next event, open roles, plans, latest report).
3. **One card per section:** each card introduces a section (title and a short text). Then it **flies into the chip and becomes that section's block**, from Purpose to Connect, with Support as the power unit.
4. **Connections:** the signal route draws itself through every block, and Support's power rails appear.
5. **Edge contacts:** the pads appear around the edge. Gold is for partners, copper for supporters, and **+** marks a free contact, with links to become a partner or supporter.
6. **Two ways to explore:** read on, or enter the 3D journey.

In this part the chip's blocks show only their section's name (the subsections appear once the page continues). Scrolling back un-builds the chip. You can click a block at any time to go to its section. Then the page releases, and at the switching point the map docks on the left (desktop) or becomes the strip or badge (phones).

**Edit:**
- The numbers and the "what's next" items are in `SITE_CONTENT.story` in `content.js`. They are placeholders.
- The next event comes from `SITE_CONTENT.events`.
- The length of the story is the height of `.choose.story` in `css/read.css`, about 60% of a screen per card.

## The 3D opening: the same story, then the journey

The 3D view starts with the same story over the risen 3D chip: the empty chip with the SemiTec Foundation name, "At a glance", the section cards flying into their blocks, the connections and the edge contacts. The last card is **Start the journey**.

- **Moving through it:** while the story shows, the wheel, a swipe, the arrow keys or Space move through it, and the page itself doesn't scroll.
- **Into the journey:** after the last card, scrolling on (or **Start the journey**, or **Skip the intro** in the corner, or Esc) fades the story and glides the camera down into the journey.
- **Back:** scrolling up at the very start of the journey opens the story again at its last steps.
- **Switching views:** during the story, switching between 2D and 3D keeps the same step and the same picture.
- **Direct links:** opening 3D at a section (a link, the section bar, "Travel this path in 3D") skips the story.

**Code:** `js/story.js` (shared by both views) and `mode-signal.js` (marked ▸STORY).

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

## Memory: gallery, projects, reports

The chip's memory is the foundation's archive. Each section with a **memory bank** gets a memory block. An item is "written" into its bank once its date has passed, and each cell is addressed by year.month (e.g. `2026.06`).

| Bank | Section | Colour | Source |
|---|---|---|---|
| Gallery | Events | gold | past `SITE_CONTENT.events` (automatic) |
| Project archive | Impact | teal | `SITE_CONTENT.memory` items with `bank: "projects"` |
| Reports archive | Trust | copper | `SITE_CONTENT.memory` items with `bank: "reports"` |

- **3D:** each bank is a memory block standing just after its section's gate, with one lit cell per item and a board with "Open …". **Upcoming events** are gold posts on the approach to Events; the soonest is met first.
- **2D:** Events shows the upcoming timeline next to the gallery. Impact and Trust show their memory panels, and each section's tile on the map shows one lit bit per stored item.
- **Memory view** (dialog) switches between all banks. Opening a cell shows its image, date and summary.
- Add a bank in `SITE_CONTENT.memoryBanks` (`id`, `section`, `color`: gold / teal / copper, `title`, `intro`, `open`), then add items to `SITE_CONTENT.memory` (`id`, `bank`, `date`, `title`, `summary`, `media`, optional `url`).
- Preview another day: add `?today=2027-01-15` to the address.

## Sound

Off by default. The speaker button in the header turns it on, and the choice is remembered. Everything is synthesised in the browser (`js/sound.js`, no audio files):
- a low electrical hum that rises and brightens while you travel
- a clock tick when you reach a new section
- soft tones when the memory view opens or a cell is read
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

Each section has a scroll-linked reveal: title words rise, the image unmasks with a small parallax, chips and cards appear one after another, and the large section number moves more slowly than the page. These play backwards when you scroll up. Submenus are expandable **path cards** showing their items and nested paths. Each card has **Travel this path in 3D ↗**, which opens the 3D view directly inside that loop.

## Support (donations)

Support sits between Trust and Connect, so the reports are right before it. On the 2D page it has a power-unit panel: **Pulse · give once** / **Clock · give monthly**, three amount slots, a Donate button and "Where the support goes" (which opens Trust → Reports). The amounts and the payment link are placeholders: the button stays disabled until a payment provider is chosen. Its submenus: give once, give monthly, fund a lab kit, donate equipment, give your time. In 3D, reaching Support powers on the chip: every trace brightens.

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
content.js          ← EDIT CONTENT HERE (both views) + CHIP_LAYOUT for the 2D map
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
