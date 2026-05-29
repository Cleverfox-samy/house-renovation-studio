# House Renovation Studio

Open `index.html` in a browser to use the local renovation model.

What it does now:

- Interactive Three.js/WebGL whole-house massing model based on rough dimensions.
- Toggle ground floor, first floor, roof, dimensions, and site context.
- Switch loft scenarios between existing roof, Velux, and rear dormer.
- Edit core measurements and keep them saved in the browser.
- Export the current model view as a PNG.
- Generate a photoreal render brief to use with private reference photos in an image tool.

Important caveat: this is not a surveyed model. The current geometry is a working planning model based on rough measurements. The next accuracy jump comes from adding real room sizes, loft ridge height, truss photos, and confirmed front/rear/side dimensions in a private copy.

Note: the 3D engine loads Three.js from a CDN. It is intended to run hosted on Netlify/GitHub Pages or with an internet connection.
