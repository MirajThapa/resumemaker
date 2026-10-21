# Japanese Résumé Maker (履歴書 + 職務経歴書)

Fill in one form, get two A4 PDFs: 履歴書 (rirekisho) and 職務経歴書 (career history).

## Run
```
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Structure
- `src/RirekishoMaker.jsx` – main app: form (Part 1), shared state, live previews, PDF button
- `src/Shokumu.jsx` – 職務経歴書 form, sheet and styles
- `src/exportPdf.js` – converts a sheet to a multi-page A4 PDF (html2canvas + jsPDF)

## Notes
- Input is saved in the browser's localStorage. "Clear all" resets it.
- Your browser may ask to allow multiple downloads the first time.
- PDFs are image-based, so text is not selectable.
