import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";

const canvas = document.querySelector("#houseCanvas");
const wrap = document.querySelector(".canvas-wrap");

const state = {
  scenario: "existing",
  showGround: true,
  showFirst: true,
  showRoof: true,
  showDims: true,
  showContext: true,
  config: {
    width: 8.3,
    depth: 7.3,
    rightDepth: 5.6,
    leftWidth: 4.3,
    storey: 2.5,
    ridge: 7.0,
  },
  ideas: [
    {
      title: "Loft conversion",
      text: "Velux preferred, dormer if ridge/headroom is too tight.",
      status: "Active",
    },
    {
      title: "Garden room",
      text: "Future office or studio at rear of garden.",
      status: "Later",
    },
    {
      title: "Kitchen flow",
      text: "Potential rear opening / patio connection.",
      status: "Later",
    },
  ],
};

const saved = localStorage.getItem("houseStudioState");
if (saved) {
  try {
    const parsed = JSON.parse(saved);
    Object.assign(state.config, parsed.config || {});
    if (Array.isArray(parsed.ideas)) state.ideas = parsed.ideas;
    if (parsed.scenario) state.scenario = parsed.scenario;
  } catch {
    localStorage.removeItem("houseStudioState");
  }
}

const controlsDom = {
  rotation: document.querySelector("#rotation"),
  tilt: document.querySelector("#tilt"),
  zoom: document.querySelector("#zoom"),
  showGround: document.querySelector("#showGround"),
  showFirst: document.querySelector("#showFirst"),
  showRoof: document.querySelector("#showRoof"),
  showDims: document.querySelector("#showDims"),
  showContext: document.querySelector("#showContext"),
  houseWidth: document.querySelector("#houseWidth"),
  houseDepth: document.querySelector("#houseDepth"),
  ridgeHeight: document.querySelector("#ridgeHeight"),
  storeyHeight: document.querySelector("#storeyHeight"),
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd9e7ef);
scene.fog = new THREE.Fog(0xd9e7ef, 18, 42);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  preserveDrawingBuffer: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
camera.position.set(9.5, 7.5, 10.5);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.dampingFactor = 0.08;
orbit.target.set(0, 2.6, 0);
orbit.minDistance = 7;
orbit.maxDistance = 28;
orbit.maxPolarAngle = Math.PI * 0.48;

const root = new THREE.Group();
const dimsRoot = new THREE.Group();
const contextRoot = new THREE.Group();
scene.add(root, dimsRoot, contextRoot);

const materials = makeMaterials();

function makeMaterials() {
  return {
    brick: new THREE.MeshStandardMaterial({
      map: makeBrickTexture(),
      roughness: 0.82,
      color: 0xc06b45,
    }),
    tileHang: new THREE.MeshStandardMaterial({
      map: makeTileHangTexture(),
      roughness: 0.86,
      color: 0xb7603f,
    }),
    roof: new THREE.MeshStandardMaterial({
      map: makeRoofTexture(),
      roughness: 0.9,
      color: 0x62686c,
    }),
    fascia: new THREE.MeshStandardMaterial({ color: 0xf4f1e8, roughness: 0.65 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xbfd8e5,
      roughness: 0.18,
      metalness: 0,
      transmission: 0.15,
      transparent: true,
      opacity: 0.78,
    }),
    frame: new THREE.MeshStandardMaterial({ color: 0xf7f7f2, roughness: 0.48 }),
    door: new THREE.MeshStandardMaterial({ color: 0x17201d, roughness: 0.7 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x22272d, roughness: 0.7 }),
    lawn: new THREE.MeshStandardMaterial({ color: 0x7fa466, roughness: 0.95 }),
    paving: new THREE.MeshStandardMaterial({ color: 0x7c7f82, roughness: 0.86 }),
    patio: new THREE.MeshStandardMaterial({ color: 0x8e8d88, roughness: 0.85 }),
    hedge: new THREE.MeshStandardMaterial({ color: 0x365f36, roughness: 1 }),
    whiteGhost: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.35,
      transparent: true,
      opacity: 0.72,
    }),
    loftBlue: new THREE.MeshStandardMaterial({
      color: 0x2f7397,
      roughness: 0.45,
      transparent: true,
      opacity: 0.82,
    }),
  };
}

function makeBrickTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const g = c.getContext("2d");
  g.fillStyle = "#b96342";
  g.fillRect(0, 0, c.width, c.height);
  for (let y = 0; y < c.height; y += 32) {
    g.fillStyle = "rgba(255,255,255,0.34)";
    g.fillRect(0, y, c.width, 3);
    for (let x = (y / 32) % 2 ? -48 : 0; x < c.width; x += 96) {
      g.fillStyle = "rgba(70,35,24,0.18)";
      g.fillRect(x, y + 3, 3, 29);
      g.fillStyle = "rgba(255,210,170,0.10)";
      g.fillRect(x + 5, y + 6, 72, 4);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.2, 2.8);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeRoofTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const g = c.getContext("2d");
  g.fillStyle = "#5a6065";
  g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 22) {
    g.fillStyle = "rgba(255,255,255,0.20)";
    g.fillRect(0, y, 512, 2);
    g.fillStyle = "rgba(0,0,0,0.12)";
    g.fillRect(0, y + 17, 512, 3);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1.4, 2.8);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeTileHangTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const g = c.getContext("2d");
  g.fillStyle = "#ae5c3f";
  g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 45) {
    for (let x = 0; x < 512; x += 36) {
      g.beginPath();
      g.arc(x + 18, y + 30, 18, Math.PI, 0, true);
      g.strokeStyle = "rgba(71,34,23,0.32)";
      g.lineWidth = 4;
      g.stroke();
    }
    g.fillStyle = "rgba(255,230,200,0.18)";
    g.fillRect(0, y, 512, 3);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1.2, 1.6);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function box(name, size, position, material, parent = root) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function plane(name, size, position, rotation, material, parent = root) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(...size), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addLights() {
  scene.add(new THREE.HemisphereLight(0xf2f7ff, 0x6b665d, 2.2));
  const sun = new THREE.DirectionalLight(0xfff4dc, 3.2);
  sun.position.set(-8, 12, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -16;
  sun.shadow.camera.right = 16;
  sun.shadow.camera.top = 16;
  sun.shadow.camera.bottom = -16;
  scene.add(sun);
}

function clearGroup(group) {
  while (group.children.length) {
    const child = group.children.pop();
    child.traverse?.((obj) => {
      obj.geometry?.dispose?.();
    });
  }
}

function rebuild() {
  clearGroup(root);
  clearGroup(dimsRoot);
  clearGroup(contextRoot);
  if (state.showContext) buildContext();
  buildHouse();
  if (state.showDims) buildDimensions();
  updateMetrics();
  updateBrief();
  saveProject();
}

function buildContext() {
  box("lawn", [15, 0.08, 16], [0, -0.04, 0.8], materials.lawn, contextRoot);
  box("front-drive", [5.4, 0.09, 3.2], [1.45, 0, -5.95], materials.paving, contextRoot);
  box("front-path", [1.0, 0.1, 4.4], [-0.8, 0.02, -5.2], materials.patio, contextRoot);
  box("rear-patio", [4.0, 0.1, 1.65], [-1.2, 0.02, 4.5], materials.patio, contextRoot);
  box("garden-wall", [13, 1.15, 0.18], [0, 0.58, 7.15], materials.brick, contextRoot);
  box("front-hedge", [8.0, 1.0, 0.34], [-0.9, 0.52, -5.45], materials.hedge, contextRoot);
  box("right-fence", [0.16, 1.4, 10.4], [5.0, 0.7, 1.2], materials.dark, contextRoot);
}

function buildHouse() {
  const c = state.config;
  const leftWidth = c.leftWidth;
  const rightWidth = c.width - c.leftWidth;
  const leftX = -c.width / 2 + leftWidth / 2;
  const rightX = -c.width / 2 + leftWidth + rightWidth / 2;
  const frontZ = -c.depth / 2;
  const leftCenterZ = 0;
  const rightCenterZ = frontZ + c.rightDepth / 2;
  const groundH = c.storey;
  const firstH = c.storey;
  const eave = groundH + firstH;
  const ridge = c.ridge;

  if (state.showGround) {
    box("ground-left-full-depth", [leftWidth, groundH, c.depth], [leftX, groundH / 2, leftCenterZ], materials.brick);
    box("ground-right-shorter-lounge", [rightWidth, groundH, c.rightDepth], [rightX, groundH / 2, rightCenterZ], materials.brick);
    addGroundOpenings(c);
  }

  if (state.showFirst) {
    box("first-left-full-depth", [leftWidth, firstH, c.depth], [leftX, groundH + firstH / 2, leftCenterZ], materials.brick);
    box("first-right-shorter-lounge", [rightWidth, firstH, c.rightDepth], [rightX, groundH + firstH / 2, rightCenterZ], materials.tileHang);
    addFirstFloorOpenings(c);
    addTileBands(c);
  }

  addFrontGableProjection(c);
  addRearGardenGable(c);
  addPorch();

  if (state.showRoof) {
    addGableRoof(leftX, 0, leftWidth + 0.2, c.depth + 0.55, eave, ridge, "main-left-roof");
    addGableRoof(rightX, rightCenterZ, rightWidth + 0.2, c.rightDepth + 0.55, eave, ridge - 0.4, "right-short-roof");
    addGableRoof(0, frontZ - 0.33, 2.6, 1.75, eave + 0.05, ridge + 0.25, "front-cross-gable");
    addGableRoof(-1.1, c.depth / 2 + 0.1, 3.1, 1.55, eave + 0.05, ridge + 0.1, "rear-cross-gable");
    addChimney(c);
  }

  addScenario(c);
}

function addGableRoof(cx, cz, width, depth, eave, ridge, name) {
  const x0 = cx - width / 2;
  const x1 = cx + width / 2;
  const z0 = cz - depth / 2;
  const z1 = cz + depth / 2;
  const y0 = eave;
  const yr = ridge;
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    x0, y0, z0, cx, yr, z0, cx, yr, z1, x0, y0, z1,
    cx, yr, z0, x1, y0, z0, x1, y0, z1, cx, yr, z1,
    x0, y0, z0, x1, y0, z0, cx, yr, z0,
    x1, y0, z1, x0, y0, z1, cx, yr, z1,
  ]);
  const indices = [
    0, 1, 2, 0, 2, 3,
    4, 5, 6, 4, 6, 7,
    8, 9, 10,
    11, 12, 13,
  ];
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, materials.roof);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  root.add(mesh);

  box(`${name}-left-fascia`, [0.12, 0.18, depth + 0.18], [x0, y0 - 0.08, cz], materials.fascia);
  box(`${name}-right-fascia`, [0.12, 0.18, depth + 0.18], [x1, y0 - 0.08, cz], materials.fascia);
  box(`${name}-ridge-cap`, [0.12, 0.12, depth + 0.12], [cx, yr + 0.03, cz], materials.dark);
}

function addFrontGableProjection(c) {
  const frontZ = -c.depth / 2 - 0.18;
  box("central-front-brick-gable", [2.7, c.storey * 2, 0.38], [0, c.storey, frontZ], materials.brick);
  addWindow(0, frontZ - 0.205, 3.75, 0, 1.08, 1.0);
  addDoor(0, frontZ - 0.21, 1.05);
}

function addRearGardenGable(c) {
  const rearZ = c.depth / 2 + 0.18;
  box("rear-garden-gable-wall", [3.1, c.storey * 2, 0.36], [-1.05, c.storey, rearZ], materials.brick);
  addWindow(-1.05, rearZ + 0.205, 3.7, Math.PI, 1.05, 1.0);
  addFrenchDoors(-1.05, rearZ + 0.21, 1.0);
}

function addPorch() {
  box("porch-left-post", [0.12, 1.45, 0.12], [-0.56, 0.72, -4.25], materials.fascia);
  box("porch-right-post", [0.12, 1.45, 0.12], [0.56, 0.72, -4.25], materials.fascia);
  box("porch-soffit", [1.45, 0.14, 0.82], [0, 2.16, -4.04], materials.fascia);
  addGableRoof(0, -4.06, 1.65, 0.9, 2.22, 2.73, "porch-roof");
}

function addChimney(c) {
  box("chimney", [0.48, 1.05, 0.48], [1.15, c.ridge + 0.33, -1.1], materials.brick);
  box("chimney-cap", [0.68, 0.16, 0.62], [1.15, c.ridge + 0.92, -1.1], materials.dark);
}

function addTileBands(c) {
  const y = c.storey + 1.18;
  box("front-left-tile-band", [1.85, 1.2, 0.08], [-2.95, y, -c.depth / 2 - 0.24], materials.tileHang);
  box("front-right-tile-band", [2.0, 1.2, 0.08], [2.75, y, -c.depth / 2 - 0.24], materials.tileHang);
  box("right-side-tile-hung-panel", [0.08, 1.55, 3.6], [c.width / 2 + 0.05, c.storey + 1.35, -0.8], materials.tileHang);
}

function addGroundOpenings(c) {
  const frontZ = -c.depth / 2 - 0.215;
  addWindow(-2.95, frontZ, 1.1, 0, 1.2, 1.05);
  addWindow(2.75, frontZ, 1.1, 0, 1.25, 1.05);
  addWindow(c.width / 2 + 0.055, -0.7, 1.15, Math.PI / 2, 0.95, 1.0);
}

function addFirstFloorOpenings(c) {
  const frontZ = -c.depth / 2 - 0.22;
  addWindow(-2.95, frontZ, 3.62, 0, 1.16, 0.9);
  addWindow(2.75, frontZ, 3.62, 0, 1.16, 0.9);
  addWindow(c.width / 2 + 0.06, -0.55, 3.7, Math.PI / 2, 1.0, 0.9);
}

function addWindow(x, z, y, rotY, w, h) {
  const frame = box("window-frame", [w + 0.16, h + 0.16, 0.08], [x, y, z], materials.frame);
  frame.rotation.y = rotY;
  const glass = box("window-glass", [w, h, 0.09], [x, y, z + Math.cos(rotY) * 0.01], materials.glass);
  glass.rotation.y = rotY;
  const mullionV = box("window-mullion-v", [0.045, h, 0.1], [x, y, z + Math.cos(rotY) * 0.02], materials.frame);
  mullionV.rotation.y = rotY;
  const mullionH = box("window-mullion-h", [w, 0.045, 0.1], [x, y + h * 0.22, z + Math.cos(rotY) * 0.02], materials.frame);
  mullionH.rotation.y = rotY;
}

function addDoor(x, z, y) {
  const door = box("front-door", [0.82, 1.82, 0.1], [x, y, z], materials.door);
  door.rotation.y = 0;
  box("door-sidelight-left", [0.28, 1.5, 0.1], [x - 0.62, y + 0.08, z], materials.glass);
  box("door-sidelight-right", [0.28, 1.5, 0.1], [x + 0.62, y + 0.08, z], materials.glass);
}

function addFrenchDoors(x, z, y) {
  box("rear-french-door-left", [0.78, 1.9, 0.1], [x - 0.42, y, z], materials.glass);
  box("rear-french-door-right", [0.78, 1.9, 0.1], [x + 0.42, y, z], materials.glass);
  box("rear-door-frame", [1.86, 2.08, 0.09], [x, y, z], materials.frame);
}

function addScenario(c) {
  if (state.scenario === "velux") {
    addRooflight(-2.0, 1.2, 5.9, -0.62);
    addRooflight(-1.2, 1.2, 6.08, -0.62);
    addRooflight(-0.4, 1.2, 5.9, -0.62);
  }

  if (state.scenario === "dormer") {
    box("side-dormer-body", [3.3, 1.45, 1.45], [-2.05, 5.68, 1.45], materials.whiteGhost);
    addGableRoof(-2.05, 1.45, 3.5, 1.65, 6.38, 6.95, "side-dormer-roof");
    addWindow(-2.05, 2.22, 5.92, Math.PI, 1.6, 0.78);
  }
}

function addRooflight(x, z, y, rotX) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.06, 0.92), materials.glass);
  mesh.name = "velux-rooflight";
  mesh.position.set(x, y, z);
  mesh.rotation.x = rotX;
  mesh.castShadow = true;
  root.add(mesh);
}

function buildDimensions() {
  const c = state.config;
  addDimension(`${c.width.toFixed(1)}m`, [-c.width / 2, 0.08, -4.5], [c.width / 2, 0.08, -4.5]);
  addDimension(`${c.depth.toFixed(1)}m left depth`, [-4.85, 0.08, -c.depth / 2], [-4.85, 0.08, c.depth / 2]);
  addDimension(`${c.rightDepth.toFixed(1)}m right depth`, [4.85, 0.08, -c.depth / 2], [4.85, 0.08, -c.depth / 2 + c.rightDepth]);
  addDimension(`${c.ridge.toFixed(1)}m ridge`, [-5.2, 0.08, -3.65], [-5.2, c.ridge, -3.65]);
}

function addDimension(text, start, end) {
  const lineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(...start),
    new THREE.Vector3(...end),
  ]);
  const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0x22313f }));
  dimsRoot.add(line);

  const mid = new THREE.Vector3(
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2 + 0.12,
    (start[2] + end[2]) / 2,
  );
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeLabelTexture(text), transparent: true }));
  sprite.position.copy(mid);
  sprite.scale.set(1.5, 0.38, 1);
  dimsRoot.add(sprite);
}

function makeLabelTexture(text) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const g = c.getContext("2d");
  g.fillStyle = "rgba(255,255,255,0.9)";
  g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = "rgba(31,41,51,0.28)";
  g.strokeRect(2, 2, c.width - 4, c.height - 4);
  g.fillStyle = "#17202a";
  g.font = "700 42px Inter, Arial, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, c.width / 2, c.height / 2 + 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function resize() {
  const { width, height } = wrap.getBoundingClientRect();
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function animate() {
  orbit.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function updateMetrics() {
  const c = state.config;
  const area = c.leftWidth * c.depth + (c.width - c.leftWidth) * c.rightDepth;
  const scenario = {
    existing: "Reference model",
    velux: "Clean roofline",
    dormer: "More headroom",
  }[state.scenario];
  document.querySelector("#scenarioMetrics").innerHTML = `
    <div><span>Approx footprint</span><strong>${area.toFixed(1)} m²</strong></div>
    <div><span>Scenario</span><strong>${scenario}</strong></div>
    <div><span>Engine</span><strong>Three.js WebGL</strong></div>
  `;
}

function updateBrief() {
  const scenarioText = {
    existing: "existing house with no loft alteration",
    velux: "Velux rooflight loft conversion, retaining the current sloped roofline",
    dormer: "modest side/rear dormer loft conversion with matching grey roof tiles, white fascia, and red brick/tile-hung detailing",
  }[state.scenario];
  document.querySelector("#renderBrief").value = `Photorealistic architectural render of a red-brick detached UK new-build house. Match the private reference photos for the central front brick gable, white fascia, grey tiled pitched roofs, red hanging tiles on the upper side bays, black front door, small porch canopy, chimney, stepped rear garden elevation with French doors, lawn and patio. Show ${scenarioText}. Keep the design plausible for UK planning, realistic materials, natural daylight, accurate proportions, no fantasy architecture.`;
}

function renderIdeas() {
  document.querySelector("#ideasList").innerHTML = state.ideas
    .map(
      (idea) => `
        <div class="idea-card">
          <div>
            <h3>${idea.title}</h3>
            <p>${idea.text}</p>
          </div>
          <span class="status-pill">${idea.status}</span>
        </div>
      `,
    )
    .join("");
}

function saveProject() {
  localStorage.setItem(
    "houseStudioState",
    JSON.stringify({
      config: state.config,
      ideas: state.ideas,
      scenario: state.scenario,
    }),
  );
}

function setCameraFromInputs() {
  const rot = (Number(controlsDom.rotation.value) * Math.PI) / 180;
  const tilt = (Number(controlsDom.tilt.value) * Math.PI) / 180;
  const distance = 30 - Number(controlsDom.zoom.value) * 0.16;
  camera.position.set(Math.sin(rot) * distance, Math.sin(tilt) * distance, Math.cos(rot) * distance);
  camera.lookAt(orbit.target);
  orbit.update();
}

function bindControls() {
  controlsDom.houseWidth.value = state.config.width;
  controlsDom.houseDepth.value = state.config.depth;
  controlsDom.ridgeHeight.value = state.config.ridge;
  controlsDom.storeyHeight.value = state.config.storey;
  controlsDom.zoom.value = 92;
  controlsDom.rotation.value = -35;
  controlsDom.tilt.value = 32;

  for (const key of ["showGround", "showFirst", "showRoof", "showDims", "showContext"]) {
    controlsDom[key].checked = state[key];
    controlsDom[key].addEventListener("change", () => {
      state[key] = controlsDom[key].checked;
      rebuild();
    });
  }

  for (const key of ["rotation", "tilt", "zoom"]) {
    controlsDom[key].addEventListener("input", setCameraFromInputs);
  }

  document.querySelectorAll("[data-scenario]").forEach((button) => {
    button.classList.toggle("active", button.dataset.scenario === state.scenario);
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-scenario]").forEach((b) => b.classList.remove("active"));
      button.classList.add("active");
      state.scenario = button.dataset.scenario;
      rebuild();
    });
  });

  document.querySelector("#applyMeasurements").addEventListener("click", () => {
    state.config.width = Number(controlsDom.houseWidth.value) || state.config.width;
    state.config.depth = Number(controlsDom.houseDepth.value) || state.config.depth;
    state.config.ridge = Number(controlsDom.ridgeHeight.value) || state.config.ridge;
    state.config.storey = Number(controlsDom.storeyHeight.value) || state.config.storey;
    rebuild();
  });

  document.querySelector("#resetView").addEventListener("click", () => {
    controlsDom.rotation.value = -35;
    controlsDom.tilt.value = 32;
    controlsDom.zoom.value = 92;
    orbit.target.set(0, 2.6, 0);
    setCameraFromInputs();
  });

  document.querySelector("#exportImage").addEventListener("click", () => {
    renderer.render(scene, camera);
    const link = document.createElement("a");
    link.download = `house-studio-${state.scenario}.png`;
    link.href = renderer.domElement.toDataURL("image/png");
    link.click();
  });

  document.querySelector("#copyBrief").addEventListener("click", async () => {
    await navigator.clipboard.writeText(document.querySelector("#renderBrief").value);
    const button = document.querySelector("#copyBrief");
    button.textContent = "Copied";
    setTimeout(() => {
      button.textContent = "Copy Render Brief";
    }, 1100);
  });

  document.querySelector("#addIdea").addEventListener("click", () => {
    const title = prompt("Idea name");
    if (!title) return;
    const text = prompt("Short note") || "New renovation idea.";
    state.ideas.unshift({ title, text, status: "New" });
    saveProject();
    renderIdeas();
  });
}

addLights();
bindControls();
renderIdeas();
resize();
setCameraFromInputs();
rebuild();
animate();
window.addEventListener("resize", () => {
  resize();
  renderer.render(scene, camera);
});
