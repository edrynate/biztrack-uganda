# BizTrack Uganda v0.2

An offline-first prototype for small retail shops. It records sales, expenses, other income, products, stock movements, estimates profit, and exports CSV/JSON backups.

## Run it locally (basic testing)

1. Unzip the folder.
2. Open `index.html` in a modern browser.
3. You can test records and stock immediately. LocalStorage persists records in that browser profile.
4. **Offline PWA installation requires HTTPS or localhost.** Opening the HTML file directly does not install the service worker. See deployment instructions below.

## Deploy free (HTTPS needed for install/offline app shell)

One simple route is GitHub Pages:
1. Create a GitHub account and a new repository named `biztrack-uganda`.
2. Upload all files in this folder to the repository root.
3. In repository Settings → Pages, publish from the main branch and root folder.
4. Open the resulting HTTPS URL on your Android phone while online.
5. Wait for the page to load fully; then use Chrome menu → **Add to Home screen** or **Install app** if offered.
6. Open BizTrack once more online, then switch on airplane mode and test opening it from the home-screen icon.

Hosting providers change their menus and terms. Use any HTTPS static host if preferred.

## Important limitations

- Data is stored locally in the browser on this device. It is not synced to a second device or a cloud account.
- Browser/site data clearing, device loss, or browser storage problems can erase records. Use **Records → Download backup** regularly and keep the file somewhere safe.
- This is a prototype, not a secure multi-user accounting system or tax tool. Do not store customer passwords, bank credentials, or sensitive personal information.
- Profit is an estimate: sales + other income − expenses − cost of goods sold. It does not include costs that have not been entered, taxes, depreciation, owner drawings, or other accounting adjustments.
- Restocking updates average unit cost for future sales. Past sale cost remains fixed. Deleting a sale does not automatically restore stock; manually correct stock if needed.
- Test with sample data before relying on this for real shop accounts.

## Included files

- `index.html`: interface
- `app.js`: calculations, records, product/stock logic, backup/export
- `sw.js`: caches the app shell for offline reopening
- `manifest.webmanifest`: installable web app metadata
- `icon.svg`: app icon
