# Signature Box Drag & Resize Feature

## What's New

The signature box designer (`approvalSignSetup.vue`) now supports **full drag-and-drop box editing**:

### User Actions

1. **Click to place:** Select an approver → click on document → a box appears centered at the click
2. **Drag to move:** Click inside a box → drag it to reposition
3. **Resize:** Click on the **blue corner circles** → drag to resize from that corner
4. **Delete:** Right sidebar delete button or via sidebar

### Visual Feedback

- **Boxes:** Orange semi-transparent rectangle with label + coordinates
- **Resize handles:** Blue circles at the 4 corners (NW, NE, SW, SE)
- **Cursor:** Crosshair over PDF canvas

---

## Technical Details

### Coordinate System

All coordinates are stored in **PDF viewport scale (1.0)** space, not display pixels:
- Frontend renders at scale 1.5 (via `PdfEmbedView.vue` convention)
- Box coordinates are scaled: `displayPx / boxScaleX` → PDF coord
- Backend receives PDF-native coordinates

### Drag Logic

**Single box tracked:** `dragIndex` = currently active box
**Resize vs. Move:** Determined by which corner was clicked
- **Corner click:** enters resize mode → adjust width/height from that corner, keep opposite corner fixed
- **Body click:** enter drag mode → move box, keep size

### Precision

- Minimum box size: 30×20 px (display coords)
- Resize handle snap radius: 12 px (touch-friendly)
- Coordinates rounded to 2 decimals before saving

---

## Code Changes

### New State Variables
```js
let resizeIndex = -1;          // which box is being resized (-1 = none)
let resizeCorner = "";         // ne | nw | se | sw
let mouseDown = false;         // drag/resize in progress
let lastOverIndex = -1;        // for future hover effects
const RESIZE_HANDLE = 12;      // handle size in display px
```

### New Methods
- `hitTest(e)` → returns box index under cursor, -1 if none
- `getResizeCorner(m, x, y, w, h)` → which corner (if any) was clicked
- `onMouseDown(e)` → start drag/resize
- `onMouseMove(e)` → update box position/size
- `onMouseUp(e)` → end drag/resize
- Updated `redrawBoxes()` → draws corner handles + refreshed labels

### Template Changes
- Canvas: `@mousedown="onMouseDown"`, `@mousemove="onMouseMove"`, `@mouseleave="onMouseUp"`
- Cursor: `style="cursor: crosshair;"`

---

## UX Flow

```
[Creator selects approver]
  ↓
[Clicks document] → box placed
  ↓
[Drag from center] → moves box
  ↓
[Drag from corner handle] → resizes
  ↓
[Click "Save Boxes"] → posts to backend
```

---

## Browser Compatibility

- Works on all modern browsers with HTML5 Canvas + mouse events
- Touch events NOT yet supported (can add later via `@touchstart`, `@touchmove`, `@touchend`)

---

## Known Quirks

1. **Resize handles overlap on small boxes** — handles are 12px diameter, so tiny boxes (30×20) show overlapping circles. Can be improved with corner outline instead of circles.
2. **Multiple rapid clicks** — if you click-drag-release very fast and the page hasn't re-rendered, the click-to-place may fire after drag completes. Fixed by `hitTest` in `placeBoxAt` to skip if box is under cursor.
3. **No undo/redo** — changes are immediate. Can save a copy via "Load PDF" to start over.

---

## Testing

1. Open signature box setup dialog
2. Load a PDF
3. Select an approver
4. Click on document → box appears
5. Drag from center of box → moves
6. Drag from blue corner circles → resizes from that corner
7. Drag another approver's box if they have one
8. Click "Save Boxes" → coordinates saved to backend

All coordinates are in PDF-viewport space (scale 1.0), so backend `stampSignatureOnPdf()` will use these directly.
