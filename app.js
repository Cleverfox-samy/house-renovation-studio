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
  showCutaway: false,
  config: {
    width: 8.3,
    depth: 7.3,
    rightDepth: 5.6,
    leftWidth: 4.3,
    storey: 2.5,
    ridge: 7.0,
  },
  ideas: [
    { title: "Loft conversion", text: "Compare Velux rooflights against a more useful dormer mass.", status: "Active" },
    { title: "Garden room", text: "Future studio/office at the rear of the garden.", status: "Later" },
    { title: "Kitchen flow", text: "Potential rear opening and stronger patio connection.", status: "Later" },
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

const dom = {
  showGround: document.querySelector("#showGround"),
  showFirst: document.querySelector("#showFirst"),
  showRoof: document.querySelector("#showRoof"),
  showDims: document.querySelector("#showDims"),
  showContext: document.querySelector("#showContext"),
  showCutaway: document.querySelector("#showCutaway"),
  houseWidth: document.querySelector("#houseWidth"),
  houseDepth: document.querySelector("#houseDepth"),
  ridgeHeight: document.querySelector("#ridgeHeight"),
  storeyHeight: document.querySelector("#storeyHeight"),
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe8eef1);
scene.fog = new THREE.Fog(0xe8eef1, 22, 58);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 120);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.dampingFactor = 0.08;
orbit.target.set(0, 2.65, 0);
orbit.minDistance = 7.5;
orbit.maxDistance = 32;
orbit.maxPolarAngle = Math.PI * 0.49;

const model = new THREE.Group();
const dims = new THREE.Group();
const context = new THREE.Group();
scene.add(context, model, dims);

const mats = createMaterials();

function createMaterials() {
  return {
    brick: new THREE.MeshStandardMaterial({ color: 0xb76443, map: brickTexture(), roughness: 0.82 }),
    brickDark: new THREE.MeshStandardMaterial({ color: 0x96513a, roughness: 0.86 }),
    tileHang: new THREE.MeshStandardMaterial({ color: 0xaa5d42, map: hangingTileTexture(), roughness: 0.9 }),
    roof: new THREE.MeshStandardMaterial({ color: 0x555d63, map: roofTexture(), roughness: 0.88 }),
    ridge: new THREE.MeshStandardMaterial({ color: 0x252c31, roughness: 0.72 }),
    fascia: new THREE.MeshStandardMaterial({ color: 0xf5f2e9, roughness: 0.56 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xbad8e5,
      roughness: 0.18,
      metalness: 0,
      transparent: true,
      opacity: 0.68,
      transmission: 0.05,
    }),
    door: new THREE.MeshStandardMaterial({ color: 0x18201d, roughness: 0.68 }),
    lawn: new THREE.MeshStandardMaterial({ color: 0x86aa70, roughness: 0.96 }),
    paving: new THREE.MeshStandardMaterial({ color: 0x878984, roughness: 0.84 }),
    hedge: new THREE.MeshStandardMaterial({ color: 0x355f38, roughness: 1 }),
    ghost: new THREE.MeshStandardMaterial({ color: 0x2d82a2, roughness: 0.4, transparent: true, opacity: 0.42 }),
    dormer: new THREE.MeshStandardMaterial({ color: 0xe9edf0, roughness: 0.62 }),
    line: new THREE.LineBasicMaterial({ color: 0x1d2730, transparent: true, opacity: 0.38 }),
    whiteLine: new THREE.LineBasicMaterial({ color: 0xf7f2e8, transparent: true, opacity: 0.9 }),
  };
}

function textureCanvas(draw) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const g = c.getContext("2d");
  draw(g, c.width, c.height);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function brickTexture() {
  const tex = textureCanvas((g, w, h) => {
    g.fillStyle = "#b86543";
    g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 32) {
      g.fillStyle = "rgba(255,232,206,0.28)";
      g.fillRect(0, y, w, 3);
      for (let x = y % 64 ? -48 : 0; x < w; x += 96) {
        g.fillStyle = "rgba(70,34,24,0.22)";
        g.fillRect(x, y + 3, 3, 29);
        g.fillStyle = "rgba(255,210,170,0.09)";
        g.fillRect(x + 8, y + 8, 68, 4);
      }
    }
  });
  tex.repeat.set(2.2, 2.5);
  return tex;
}

function roofTexture() {
  const tex = textureCanvas((g, w, h) => {
    g.fillStyle = "#555d63";
    g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 24) {
      g.fillStyle = "rgba(255,255,255,0.16)";
      g.fillRect(0, y, w, 2);
      g.fillStyle = "rgba(0,0,0,0.18)";
      g.fillRect(0, y + 19, w, 3);
    }
  });
  tex.repeat.set(1.2, 2.8);
  return tex;
}

function hangingTileTexture() {
  const tex = textureCanvas((g, w, h) => {
    g.fillStyle = "#a85b40";
    g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 44) {
      g.fillStyle = "rgba(255,220,190,0.15)";
      g.fillRect(0, y, w, 3);
      for (let x = 0; x < w; x += 38) {
        g.beginPath();
        g.arc(x + 19, y + 30, 17, Math.PI, 0, true);
        g.strokeStyle = "rgba(50,26,20,0.28)";
        g.lineWidth = 4;
        g.stroke();
      }
    }
  });
  tex.repeat.set(1.3, 1.8);
  return tex;
}

function addLights() {
  scene.add(new THREE.HemisphereLight(0xffffff, 0x696156, 2.45));
  const key = new THREE.DirectionalLight(0xfff2d8, 3.4);
  key.position.set(-8, 12, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -18;
  key.shadow.camera.right = 18;
  key.shadow.camera.top = 18;
  key.shadow.camera.bottom = -18;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xc9e3ff, 0.7);
  fill.position.set(8, 6, -9);
  scene.add(fill);
}

function clear(group) {
  while (group.children.length) {
    const child = group.children.pop();
    child.traverse((obj) => obj.geometry?.dispose?.());
  }
}

function addBox(parent, name, size, pos, mat, opts = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat);
  mesh.name = name;
  mesh.position.set(...pos);
  mesh.rotation.set(...(opts.rotation || [0, 0, 0]));
  mesh.castShadow = opts.shadow !== false;
  mesh.receiveShadow = true;
  parent.add(mesh);
  if (opts.edges !== false) addEdges(parent, mesh, opts.edgeMaterial || mats.line);
  return mesh;
}

function addEdges(parent, mesh, mat = mats.line) {
  const edge = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), mat);
  edge.position.copy(mesh.position);
  edge.rotation.copy(mesh.rotation);
  edge.scale.copy(mesh.scale);
  parent.add(edge);
}

function addPrism(parent, name, vertices, indices, mat, edgeMat = mats.line) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(vertices.flat()), 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  const edge = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
  parent.add(edge);
  return mesh;
}

function roofZ(name, cx, cz, width, depth, eave, ridge) {
  const x0 = cx - width / 2;
  const x1 = cx + width / 2;
  const z0 = cz - depth / 2;
  const z1 = cz + depth / 2;
  addPrism(
    model,
    name,
    [
      [x0, eave, z0], [cx, ridge, z0], [x1, eave, z0],
      [x0, eave, z1], [cx, ridge, z1], [x1, eave, z1],
    ],
    [0, 3, 4, 0, 4, 1, 1, 4, 5, 1, 5, 2, 0, 1, 2, 3, 5, 4, 0, 2, 5, 0, 5, 3],
    mats.roof,
  );
  addBox(model, `${name}-ridge-cap`, [0.12, 0.12, depth + 0.12], [cx, ridge + 0.04, cz], mats.ridge, { edges: false });
  addBox(model, `${name}-left-fascia`, [0.11, 0.16, depth + 0.16], [x0 - 0.03, eave - 0.04, cz], mats.fascia, { edges: false });
  addBox(model, `${name}-right-fascia`, [0.11, 0.16, depth + 0.16], [x1 + 0.03, eave - 0.04, cz], mats.fascia, { edges: false });
}

function roofX(name, cx, cz, width, depth, eave, ridge) {
  const x0 = cx - width / 2;
  const x1 = cx + width / 2;
  const z0 = cz - depth / 2;
  const z1 = cz + depth / 2;
  addPrism(
    model,
    name,
    [
      [x0, eave, z0], [x0, ridge, cz], [x0, eave, z1],
      [x1, eave, z0], [x1, ridge, cz], [x1, eave, z1],
    ],
    [0, 3, 4, 0, 4, 1, 1, 4, 5, 1, 5, 2, 0, 1, 2, 3, 5, 4, 0, 2, 5, 0, 5, 3],
    mats.roof,
  );
  addBox(model, `${name}-ridge-cap`, [width + 0.12, 0.12, 0.12], [cx, ridge + 0.04, cz], mats.ridge, { edges: false });
}

function build() {
  clear(model);
  clear(dims);
  clear(context);
  if (state.showContext) buildContext();
  buildHouse();
  if (state.showDims) buildDimensions();
  updateMetrics();
  updateBrief();
  save();
}

function buildContext() {
  addBox(context, "lawn plane", [15.5, 0.08, 16.5], [0, -0.04, 0.65], mats.lawn, { edges: false });
  addBox(context, "front drive", [5.6, 0.09, 3.2], [1.45, 0.02, -5.95], mats.paving, { edges: false });
  addBox(context, "front path", [1.05, 0.1, 4.25], [-0.65, 0.03, -5.28], mats.paving, { edges: false });
  addBox(context, "rear patio", [4.2, 0.1, 1.65], [-1.15, 0.03, 4.58], mats.paving, { edges: false });
  addBox(context, "rear boundary wall", [12.8, 1.1, 0.18], [0, 0.55, 7.35], mats.brickDark, { edges: false });
  addBox(context, "front hedge", [8.4, 0.95, 0.32], [-0.85, 0.48, -5.25], mats.hedge, { edges: false });
  addTree(-4.8, 5.1, 1.4);
  addTree(4.7, 4.7, 1.0);
}

function addTree(x, z, scale) {
  addBox(context, "tree trunk", [0.16 * scale, 1.2 * scale, 0.16 * scale], [x, 0.6 * scale, z], mats.brickDark, { edges: false });
  const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.72 * scale, 1), mats.hedge);
  crown.position.set(x, 1.55 * scale, z);
  crown.castShadow = true;
  context.add(crown);
}

function buildHouse() {
  const c = state.config;
  const leftW = c.leftWidth;
  const rightW = c.width - leftW;
  const leftX = -c.width / 2 + leftW / 2;
  const rightX = -c.width / 2 + leftW + rightW / 2;
  const frontZ = -c.depth / 2;
  const rightZ = frontZ + c.rightDepth / 2;
  const eave = c.storey * 2;
  const alpha = state.showCutaway ? 0.48 : 1;
  const groundMat = withOpacity(mats.brick, state.showCutaway ? 0.55 : 1);
  const firstMat = withOpacity(mats.brick, alpha);
  const tileMat = withOpacity(mats.tileHang, alpha);

  if (state.showGround) {
    addBox(model, "left ground full-depth wing", [leftW, c.storey, c.depth], [leftX, c.storey / 2, 0], groundMat);
    addBox(model, "right ground shorter lounge", [rightW, c.storey, c.rightDepth], [rightX, c.storey / 2, rightZ], groundMat);
  }

  if (state.showFirst) {
    addBox(model, "left first full-depth wing", [leftW, c.storey, c.depth], [leftX, c.storey * 1.5, 0], firstMat);
    addBox(model, "right first shorter tile-hung bay", [rightW, c.storey, c.rightDepth], [rightX, c.storey * 1.5, rightZ], tileMat);
    addTileBand(-2.95, frontZ - 0.065);
    addTileBand(2.7, frontZ - 0.065);
  }

  addOpenings(c);
  addFrontGable(c);
  addRearGable(c);
  addPorch(c);
  addChimney(c);

  if (state.showRoof) {
    roofZ("left longitudinal roof", leftX, 0, leftW + 0.42, c.depth + 0.54, eave, c.ridge);
    roofZ("right longitudinal roof", rightX, rightZ, rightW + 0.42, c.rightDepth + 0.54, eave, c.ridge - 0.35);
    roofZ("front central projecting gable roof", 0, frontZ + 0.22, 2.65, 2.1, eave + 0.05, c.ridge + 0.18);
    roofZ("rear garden projecting gable roof", -1.05, c.depth / 2 - 0.18, 3.0, 1.9, eave + 0.05, c.ridge + 0.05);
  }

  addScenario(c);
}

function withOpacity(mat, opacity) {
  if (opacity === 1) return mat;
  const clone = mat.clone();
  clone.transparent = true;
  clone.opacity = opacity;
  return clone;
}

function addFrontGable(c) {
  const z = -c.depth / 2 - 0.18;
  addBox(model, "front central projecting wall", [2.65, c.storey * 2, 0.42], [0, c.storey, z], mats.brick);
  addTriangleFace("front gable triangle", 0, z - 0.23, 2.65, c.storey * 2, c.ridge + 0.1, 0, mats.brick);
  addWindow(0, 3.77, z - 0.25, 1.08, 1.02, 0);
  addDoor(0, 0.98, z - 0.27, 0);
}

function addRearGable(c) {
  const z = c.depth / 2 + 0.18;
  addBox(model, "rear central garden wall", [3.0, c.storey * 2, 0.38], [-1.05, c.storey, z], mats.brick);
  addTriangleFace("rear gable triangle", -1.05, z + 0.21, 3.0, c.storey * 2, c.ridge, Math.PI, mats.brick);
  addWindow(-1.05, 3.72, z + 0.25, 1.06, 1.0, Math.PI);
  addFrenchDoors(-1.05, 1.02, z + 0.27, Math.PI);
}

function addTriangleFace(name, cx, z, width, eave, ridge, rotY, mat) {
  const half = width / 2;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array([-half, 0, 0, half, 0, 0, 0, ridge - eave, 0]), 3),
  );
  geo.setIndex([0, 1, 2]);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(cx, eave, z);
  mesh.rotation.y = rotY;
  mesh.castShadow = true;
  model.add(mesh);
  const edge = new THREE.LineSegments(new THREE.EdgesGeometry(geo), mats.whiteLine);
  edge.position.copy(mesh.position);
  edge.rotation.copy(mesh.rotation);
  model.add(edge);
}

function addTileBand(x, z) {
  addBox(model, "decorative hanging tile panel", [1.82, 1.08, 0.08], [x, 3.72, z], mats.tileHang, { edges: false });
}

function addOpenings(c) {
  const front = -c.depth / 2 - 0.11;
  const rear = c.depth / 2 + 0.1;
  addWindow(-2.95, 1.12, front, 1.22, 1.0, 0);
  addWindow(2.7, 1.12, front, 1.25, 1.0, 0);
  addWindow(-2.95, 3.72, front - 0.02, 1.16, 0.92, 0);
  addWindow(2.7, 3.72, front - 0.02, 1.16, 0.92, 0);
  addWindow(c.width / 2 + 0.08, -0.72, 3.7, 0.98, 0.92, Math.PI / 2, true);
  addWindow(2.2, 3.66, rear - 1.7, 1.08, 0.9, Math.PI);
}

function panel(name, x, y, z, w, h, rotY, mat, side = false) {
  const mesh = addBox(model, name, side ? [0.08, h, w] : [w, h, 0.08], [x, y, z], mat, { edges: false });
  mesh.rotation.y = side ? 0 : rotY;
  return mesh;
}

function addWindow(x, y, z, w, h, rotY, side = false) {
  panel("window outer frame", x, y, z, w + 0.18, h + 0.18, rotY, mats.fascia, side);
  panel("window glass", x, y, z + Math.cos(rotY) * 0.035, w, h, rotY, mats.glass, side);
  panel("window transom", x, y + h * 0.22, z + Math.cos(rotY) * 0.05, w, 0.045, rotY, mats.fascia, side);
  panel("window mullion", x, y, z + Math.cos(rotY) * 0.05, 0.045, h, rotY, mats.fascia, side);
}

function addDoor(x, y, z, rotY) {
  panel("front black door", x, y, z, 0.82, 1.82, rotY, mats.door);
  panel("front left sidelight", x - 0.62, y + 0.04, z, 0.28, 1.48, rotY, mats.glass);
  panel("front right sidelight", x + 0.62, y + 0.04, z, 0.28, 1.48, rotY, mats.glass);
}

function addFrenchDoors(x, y, z, rotY) {
  panel("rear french glass", x, y, z, 1.65, 1.88, rotY, mats.glass);
  panel("rear french frame", x, y, z + Math.cos(rotY) * 0.035, 1.88, 2.08, rotY, mats.fascia);
  panel("rear french split", x, y, z + Math.cos(rotY) * 0.055, 0.055, 1.82, rotY, mats.fascia);
}

function addPorch(c) {
  const z = -c.depth / 2 - 0.57;
  addBox(model, "porch left post", [0.12, 1.28, 0.12], [-0.56, 0.7, z], mats.fascia, { edges: false });
  addBox(model, "porch right post", [0.12, 1.28, 0.12], [0.56, 0.7, z], mats.fascia, { edges: false });
  addBox(model, "porch soffit", [1.46, 0.14, 0.82], [0, 2.08, z + 0.08], mats.fascia, { edges: false });
  roofZ("porch roof", 0, z + 0.08, 1.6, 0.88, 2.2, 2.72);
}

function addChimney(c) {
  addBox(model, "chimney stack", [0.48, 0.98, 0.48], [1.15, c.ridge + 0.38, -1.05], mats.brick);
  addBox(model, "chimney cap", [0.68, 0.16, 0.62], [1.15, c.ridge + 0.95, -1.05], mats.ridge, { edges: false });
}

function addScenario(c) {
  const eave = c.storey * 2;
  if (state.scenario === "velux") {
    addRooflight(-2.05, eave + 0.95, 0.9);
    addRooflight(-1.2, eave + 1.08, 0.9);
    addRooflight(-0.35, eave + 0.95, 0.9);
  }
  if (state.scenario === "dormer") {
    addBox(model, "dormer body", [3.15, 1.28, 1.16], [-1.45, eave + 0.66, 1.18], mats.dormer);
    roofX("dormer roof", -1.45, 1.18, 3.3, 1.32, eave + 1.3, eave + 1.72);
    addWindow(-1.45, eave + 0.66, 1.8, 1.35, 0.66, Math.PI);
  }
  if (state.scenario !== "existing") {
    addBox(model, "loft usable floor highlight", [3.75, 0.06, 3.1], [-1.45, eave + 0.05, 0.85], mats.ghost, { edges: false });
  }
}

function addRooflight(x, y, z) {
  const light = addBox(model, "velux rooflight", [0.62, 0.06, 0.9], [x, y, z], mats.glass, { edges: false });
  light.rotation.x = -0.58;
  addBox(model, "velux frame", [0.72, 0.045, 1.0], [x, y - 0.02, z], mats.ridge, { edges: false, rotation: [-0.58, 0, 0] });
}

function buildDimensions() {
  const c = state.config;
  dimension(`${c.width.toFixed(1)}m width`, [-c.width / 2, 0.1, -4.55], [c.width / 2, 0.1, -4.55]);
  dimension(`${c.depth.toFixed(1)}m left depth`, [-4.85, 0.1, -c.depth / 2], [-4.85, 0.1, c.depth / 2]);
  dimension(`${c.rightDepth.toFixed(1)}m stepped side`, [4.85, 0.1, -c.depth / 2], [4.85, 0.1, -c.depth / 2 + c.rightDepth]);
  dimension(`${c.ridge.toFixed(1)}m ridge est.`, [-5.25, 0.1, -3.65], [-5.25, c.ridge, -3.65]);
}

function dimension(text, a, b) {
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]), mats.line);
  dims.add(line);
  const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTexture(text), transparent: true, depthTest: false }));
  label.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 0.18, (a[2] + b[2]) / 2);
  label.scale.set(1.8, 0.44, 1);
  dims.add(label);
}

function labelTexture(text) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const g = c.getContext("2d");
  g.fillStyle = "rgba(255,255,255,0.94)";
  g.fillRect(0, 0, 512, 128);
  g.strokeStyle = "rgba(31,41,51,0.22)";
  g.strokeRect(2, 2, 508, 124);
  g.fillStyle = "#17202a";
  g.font = "700 36px Arial, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, 256, 66);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function setView(name) {
  const views = {
    front: [9.2, 6.4, -10.2],
    rear: [-8.6, 6.2, 10.3],
    side: [13, 5.5, 1.8],
    top: [0.01, 18, 0.01],
  };
  camera.position.set(...(views[name] || views.front));
  orbit.target.set(0, 2.6, 0);
  orbit.update();
}

function resize() {
  const rect = wrap.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / rect.height;
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
  const scenario = { existing: "Existing shell", velux: "Velux study", dormer: "Dormer suite" }[state.scenario];
  document.querySelector("#scenarioMetrics").innerHTML = `
    <div><span>Approx footprint</span><strong>${area.toFixed(1)} m2</strong></div>
    <div><span>Scenario</span><strong>${scenario}</strong></div>
    <div><span>Model quality</span><strong>Concept design</strong></div>
  `;
}

function updateBrief() {
  const scenarioText = {
    existing: "the existing house with no loft alteration",
    velux: "a Velux rooflight loft conversion retaining the pitched roof profile",
    dormer: "a modest dormer loft conversion with matching grey tiles, white fascia and red brick detailing",
  }[state.scenario];
  document.querySelector("#renderBrief").value = `Photorealistic architectural render of a red-brick detached UK new-build house. Use private reference photos for the central front gable, grey pitched roof, white fascia, hanging tile panels, black front door, porch canopy, chimney and stepped rear garden elevation. Show ${scenarioText}. Keep it realistic, planning-friendly, domestic, and true to UK materials.`;
}

function renderIdeas() {
  document.querySelector("#ideasList").innerHTML = state.ideas
    .map((idea) => `<div class="idea-card"><div><h3>${idea.title}</h3><p>${idea.text}</p></div><span class="status-pill">${idea.status}</span></div>`)
    .join("");
}

function save() {
  localStorage.setItem("houseStudioState", JSON.stringify({ config: state.config, ideas: state.ideas, scenario: state.scenario }));
}

function bind() {
  for (const [key, el] of Object.entries(dom)) {
    if (key.startsWith("show")) {
      el.checked = state[key];
      el.addEventListener("change", () => {
        state[key] = el.checked;
        build();
      });
    }
  }
  dom.houseWidth.value = state.config.width;
  dom.houseDepth.value = state.config.depth;
  dom.ridgeHeight.value = state.config.ridge;
  dom.storeyHeight.value = state.config.storey;

  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
  document.querySelector("#resetView").addEventListener("click", () => setView("front"));
  document.querySelector("#applyMeasurements").addEventListener("click", () => {
    state.config.width = Number(dom.houseWidth.value) || state.config.width;
    state.config.depth = Number(dom.houseDepth.value) || state.config.depth;
    state.config.ridge = Number(dom.ridgeHeight.value) || state.config.ridge;
    state.config.storey = Number(dom.storeyHeight.value) || state.config.storey;
    build();
  });

  document.querySelectorAll("[data-scenario]").forEach((button) => {
    button.classList.toggle("active", button.dataset.scenario === state.scenario);
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-scenario]").forEach((b) => b.classList.remove("active"));
      button.classList.add("active");
      state.scenario = button.dataset.scenario;
      build();
    });
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
    setTimeout(() => (button.textContent = "Copy Render Brief"), 1100);
  });

  document.querySelector("#addIdea").addEventListener("click", () => {
    const title = prompt("Idea name");
    if (!title) return;
    const text = prompt("Short note") || "New renovation idea.";
    state.ideas.unshift({ title, text, status: "New" });
    renderIdeas();
    save();
  });
}

addLights();
bind();
renderIdeas();
resize();
setView("front");
build();
animate();
window.addEventListener("resize", resize);
