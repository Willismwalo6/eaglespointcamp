# Eagles Point Camp website

Open `index.html` to preview, or upload this whole folder to any web host (no build step, no database).

## Before you launch
1. **Domain**: replace `https://www.eaglespointcamp.co.ke` in every `.html`, `sitemap.xml` and `robots.txt` with your real domain.
2. **Photos**: every picture in `images/` is a placeholder illustration. Replace a file with your own photo **using the same file name** (.jpg) and it appears automatically. Export at the sizes below, around 80% JPEG quality, and update the `alt` text in the HTML if the subject changes.
3. **Facts to confirm**: rooms/beds/amenities, policies (check-in times, payment, cancellation), the camp story, and the map pin (search "Eagles Point Camp" in Google Maps and, if the pin is off, replace the `q=` value in the map iframe).
4. **Rates**: the 2026 rates are on the home page cards, each room section and the "2026 Rates" section of the Accommodation page. Edit them there when they change.
5. **Social media**: add Facebook/Instagram links in the footer `.socials` block of each page.
6. **Legal pages** are sensible drafts; have a lawyer review them.

## Photos
The site now uses your own photographs (`images/photo-<number>.jpg`, plus `-800` versions for phones). Browsers pick the right size automatically (`srcset`). To swap one, replace both files of the same name, or change the `src` in the HTML.
- Your originals were at most 1400px wide, so the full-width slideshow and banner images were enlarged to 1920px with sharpening. Send the original, full-size camera files for the crispest result on large screens.
- Slideshow focal points are set per photo with `style="--pos:x% y%"` on each `<img>`.
- Guest reviews are on the home page (section "Guest reviews").

Booking number: WhatsApp 0719215135 (set once per page as `254719215135`; also in `js/main.js`).
