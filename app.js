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
    { title: "Loft conversion", text: "Compare clean Velux rooflights against a dormer option.", status: "Active" },
    { title: "Garden room", text: "Future office or studio at rear of garden.", status: "Later" },
    { title: "Kitchen flow", text: "Potential patio connection / rear opening.", status: "Later" },
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
scene.background = new THREE.Color(0xdfeaf0);
scene.fog = new THREE.Fog(0xdfeaf0, 24, 60);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 120);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.dampingFactor = 0.08;
orbit.target.set(0, 2.4, 0);
orbit.minDistance = 7;
orbit.maxDistance = 34;
orbit.maxPolarAngle = Math.PI * 0.49;

const model = new THREE.Group();
const dims = new THREE.Group();
const context = new THREE.Group();
scene.add(model, dims, context);

const mats = {
  brick: material(0xb86543, 0.82),
  brickLight: material(0xc97750, 0.84),
  tileHang: material(0xaa6045, 0.88),
  roof: material(0x5b6268, 0.9),
  fascia: material(0xf4f1e8, 0.58),
  glass: new THREE.MeshPhysicalMaterial({ color: 0xb8d8e8, roughness: 0.2, transparent: true, opacity: 0.72 }),
  dark: material(0x20262b, 0.7),
  lawn: material(0x80a768, 0.95),
  paving: material(0x858a8d, 0.82),
  hedge: material(0x355f36, 1),
  ghost: new THREE.MeshStandardMaterial({ color: 0x2f7da0, roughness: 0.45, transparent: true, opacity: 0.58 }),
  dormer: material(0xe8ecef, 0.65),
};

function material(color, roughness) {
  return new THREE.MeshStandardMaterial({ color, roughness });
}

function addLights() {
  scene.add(new THREE.HemisphereLight(0xffffff, 0x6b6259, 2.3));
  const sun = new THREE.DirectionalLight(0xfff2d7, 3);
  sun.position.set(-9, 13, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -18;
  sun.shadow.camera.right = 18;
  sun.shadow.camera.top = 18;
  sun.shadow.camera.bottom = -18;
  scene.add(sun);
}

function clear(group) {
  while (group.children.length) {
    const child = group.children.pop();
    child.traverse((obj) => {
      obj.geometry?.dispose?.();
      if (obj.material?.map) obj.material.map.dispose?.();
    });
  }
}

function box(name, size, pos, mat, parent = model) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat);
  mesh.name = name;
  mesh.position.set(...pos);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  outline(mesh, parent);
  return mesh;
}

function outline(mesh, parent) {
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color: 0x27313a, transparent: true, opacity: 0.34 }),
  );
  edges.position.copy(mesh.position);
  edges.rotation.copy(mesh.rotation);
  edges.scale.copy(mesh.scale);
  parent.add(edges);
}

function roof(name, cx, cz, width, depth, eave, ridge) {
  const x0 = cx - width / 2;
  const x1 = cx + width / 2;
  const z0 = cz - depth / 2;
  const z1 = cz + depth / 2;
  const verts = new Float32Array([
    x0, eave, z0, cx, ridge, z0, cx, ridge, z1, x0, eave, z1,
    cx, ridge, z0, x1, eave, z0, x1, eave, z1, cx, ridge, z1,
    x0, eave, z0, x1, eave, z0, cx, ridge, z0,
    x1, eave, z1, x0, eave, z1, cx, ridge, z1,
  ]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
  geo.setIndex([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 11, 12, 13]);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, mats.roof);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  model.add(mesh);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0x1f2933, transparent: true, opacity: 0.42 }));
  model.add(edges);
  box(`${name}-ridge`, [0.1, 0.1, depth + 0.18], [cx, ridge + 0.03, cz], mats.dark);
}

function build() {
  clear(model);
  clear(dims);
  clear(context);
  if (state.showContext) buildContext();
  buildHouse();
  if (state.showDims) buildDims();
  updateMetrics();
  updateBrief();
  save();
}

function buildContext() {
  box("garden", [15, 0.08, 16], [0, -0.04, 0.8], mats.lawn, context);
  box("drive", [5.2, 0.1, 3.2], [1.35, 0, -5.9], mats.paving, context);
  box("rear-patio", [4.0, 0.1, 1.6], [-1.0, 0.02, 4.62], mats.paving, context);
  box("front-hedge", [8.6, 0.9, 0.28], [-0.7, 0.45, -5.2], mats.hedge, context);
  box("rear-boundary", [13, 1.2, 0.16], [0, 0.6, 7.3], mats.brick, context);
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
  const cutAlpha = state.showCutaway ? 0.44 : 1;

  const groundMat = cloneOpacity(mats.brick, state.showCutaway ? 0.55 : 1);
  const firstMat = cloneOpacity(mats.brickLight, cutAlpha);
  const tileMat = cloneOpacity(mats.tileHang, cutAlpha);

  if (state.showGround) {
    box("left ground full depth", [leftW, c.storey, c.depth], [leftX, c.storey / 2, 0], groundMat);
    box("right ground shorter lounge", [rightW, c.storey, c.rightDepth], [rightX, c.storey / 2, rightZ], groundMat);
  }
  if (state.showFirst) {
    box("left first full depth", [leftW, c.storey, c.depth], [leftX, c.storey * 1.5, 0], firstMat);
    box("right first stepped bay", [rightW, c.storey, c.rightDepth], [rightX, c.storey * 1.5, rightZ], tileMat);
  }

  addOpenings(c);
  addPorch(c);
  addChimney(c);

  if (state.showRoof) {
    roof("left main pitched roof", leftX, 0, leftW + 0.35, c.depth + 0.5, eave, c.ridge);
    roof("right shorter pitched roof", rightX, rightZ, rightW + 0.35, c.rightDepth + 0.5, eave, c.ridge - 0.35);
    roof("front cross gable", 0, frontZ - 0.28, 2.55, 1.6, eave + 0.02, c.ridge + 0.18);
    roof("rear garden cross gable", -1.0, c.depth / 2 + 0.12, 2.95, 1.35, eave + 0.02, c.ridge + 0.05);
  }

  addLoftScenario(c);
}

function cloneOpacity(mat, opacity) {
  if (opacity >= 1) return mat;
  const clone = mat.clone();
  clone.transparent = true;
  clone.opacity = opacity;
  return clone;
}

function addOpenings(c) {
  const front = -c.depth / 2 - 0.08;
  const rear = c.depth / 2 + 0.08;
  windowPanel(-2.95, 1.1, front, 1.18, 1.0, 0);
  windowPanel(2.7, 1.1, front, 1.22, 1.0, 0);
  windowPanel(-2.95, 3.65, front, 1.18, 0.9, 0);
  windowPanel(0, 3.78, front, 1.08, 1.0, 0);
  windowPanel(2.7, 3.65, front, 1.18, 0.9, 0);
  doorPanel(0, 1.0, front, 0);

  windowPanel(-1.05, 3.75, rear, 1.08, 1.0, Math.PI);
  windowPanel(2.2, 3.65, rear - 1.7, 1.12, 0.92, Math.PI);
  frenchDoors(-1.05, 1.0, rear, Math.PI);
}

function panelMesh(name, x, y, z, w, h, rot, mat) {
  const mesh = box(name, [w, h, 0.08], [x, y, z], mat);
  mesh.rotation.y = rot;
  return mesh;
}

function windowPanel(x, y, z, w, h, rot) {
  panelMesh("window frame", x, y, z, w + 0.16, h + 0.16, rot, mats.fascia);
  panelMesh("window glass", x, y, z + Math.cos(rot) * 0.025, w, h, rot, mats.glass);
  panelMesh("window transom", x, y + h * 0.2, z + Math.cos(rot) * 0.04, w, 0.045, rot, mats.fascia);
  panelMesh("window mullion", x, y, z + Math.cos(rot) * 0.04, 0.045, h, rot, mats.fascia);
}

function doorPanel(x, y, z, rot) {
  panelMesh("front door", x, y, z, 0.82, 1.82, rot, mats.dark);
  panelMesh("left sidelight", x - 0.62, y + 0.04, z, 0.28, 1.48, rot, mats.glass);
  panelMesh("right sidelight", x + 0.62, y + 0.04, z, 0.28, 1.48, rot, mats.glass);
}

function frenchDoors(x, y, z, rot) {
  panelMesh("rear french doors", x, y, z, 1.7, 1.88, rot, mats.glass);
  panelMesh("rear french frame", x, y, z + Math.cos(rot) * 0.035, 1.9, 2.08, rot, mats.fascia);
}

function addPorch(c) {
  const z = -c.depth / 2 - 0.48;
  box("porch canopy", [1.45, 0.16, 0.82], [0, 2.16, z], mats.fascia);
  box("porch left post", [0.12, 1.35, 0.12], [-0.55, 0.72, z - 0.05], mats.fascia);
  box("porch right post", [0.12, 1.35, 0.12], [0.55, 0.72, z - 0.05], mats.fascia);
  roof("porch pitched roof", 0, z, 1.6, 0.82, 2.24, 2.72);
}

function addChimney(c) {
  box("chimney", [0.48, 1.0, 0.48], [1.15, c.ridge + 0.38, -1.0], mats.brick);
  box("chimney cap", [0.68, 0.14, 0.62], [1.15, c.ridge + 0.95, -1.0], mats.dark);
}

function addLoftScenario(c) {
  const eave = c.storey * 2;
  if (state.scenario === "velux") {
    roofLight(-2.1, eave + 0.92, 1.15);
    roofLight(-1.2, eave + 1.02, 1.15);
    roofLight(-0.3, eave + 0.92, 1.15);
  }
  if (state.scenario === "dormer") {
    box("dormer mass", [3.1, 1.35, 1.28], [-1.55, eave + 0.72, 1.35], mats.dormer);
    roof("dormer small roof", -1.55, 1.35, 3.28, 1.42, eave + 1.42, eave + 1.86);
    windowPanel(-1.55, eave + 0.75, 2.03, 1.35, 0.7, Math.PI);
  }
  if (state.scenario !== "existing") {
    box("loft usable zone", [3.7, 0.08, 3.2], [-1.55, eave + 0.06, 0.8], mats.ghost);
  }
}

function roofLight(x, y, z) {
  const mesh = box("velux rooflight", [0.64, 0.06, 0.9], [x, y, z], mats.glass);
  mesh.rotation.x = -0.6;
}

function buildDims() {
  const c = state.config;
  dimension(`${c.width.toFixed(1)}m width`, [-c.width / 2, 0.08, -4.55], [c.width / 2, 0.08, -4.55]);
  dimension(`${c.depth.toFixed(1)}m left depth`, [-4.85, 0.08, -c.depth / 2], [-4.85, 0.08, c.depth / 2]);
  dimension(`${c.rightDepth.toFixed(1)}m stepped side`, [4.85, 0.08, -c.depth / 2], [4.85, 0.08, -c.depth / 2 + c.rightDepth]);
  dimension(`${c.ridge.toFixed(1)}m ridge est.`, [-5.25, 0.08, -3.65], [-5.25, c.ridge, -3.65]);
}

function dimension(text, a, b) {
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]),
    new THREE.LineBasicMaterial({ color: 0x1f2933 }),
  );
  dims.add(line);
  const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTexture(text), transparent: true }));
  label.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 0.18, (a[2] + b[2]) / 2);
  label.scale.set(1.7, 0.42, 1);
  dims.add(label);
}

function labelTexture(text) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const g = c.getContext("2d");
  g.fillStyle = "rgba(255,255,255,0.92)";
  g.fillRect(0, 0, 512, 128);
  g.strokeStyle = "rgba(31,41,51,0.25)";
  g.strokeRect(2, 2, 508, 124);
  g.fillStyle = "#17202a";
  g.font = "700 38px Arial, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, 256, 66);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function setView(name) {
  const views = {
    front: [9.5, 6.2, -10.5],
    rear: [-8.5, 6.2, 10.5],
    side: [13, 5.2, 1.8],
    top: [0.01, 17, 0.01],
  };
  const p = views[name] || views.front;
  camera.position.set(...p);
  orbit.target.set(0, 2.4, 0);
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
  const scenario = { existing: "Existing shell", velux: "Rooflights", dormer: "Dormer massing" }[state.scenario];
  document.querySelector("#scenarioMetrics").innerHTML = `
    <div><span>Approx footprint</span><strong>${area.toFixed(1)} m²</strong></div>
    <div><span>Scenario</span><strong>${scenario}</strong></div>
    <div><span>Accuracy</span><strong>Rough model</strong></div>
  `;
}

function updateBrief() {
  const scenarioText = {
    existing: "existing house with no loft alteration",
    velux: "Velux rooflight loft conversion retaining the current pitched roof profile",
    dormer: "modest dormer loft conversion with matching grey tiles, white fascia and red brick detailing",
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
