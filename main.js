function handleLogin(response) {
    console.log("Google login success", response);
    document.getElementById("login-screen").style.display = "none";
    init();
}

let loggedIn = false;

function handleLogin(response) {
    console.log("Logged in");
    document.getElementById("login-screen").style.display = "none";
    loggedIn = true;
    init();
}
async function fetchData() {
    const response = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vT44IwXP9zrBQ-XQaJeEz6aA2AoTp_F3lSxKUddPBUzslCP6Kl2TMqwpI673diqw3EVPf1ePgxKuhGr/pub?output=csv");
    const text = await response.text();
    return parseCSV(text);
}

function parseCSV(data) {
    const rows = data.split("\n").slice(1);
    return rows.map(row => {
        const cols = row.split(",");
        return {
            name: cols[0],
            role: cols[1],
            company: cols[2],
            networth: parseInt(cols[3])
        };
    });
}
let camera, scene, renderer;
let objects = [];
let targets = { table: [], sphere: [], helix: [], grid: [] };

async function init() {
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 3000;

    scene = new THREE.Scene();

    const data = await fetchData();

    data.forEach((item, i) => {
        const element = document.createElement("div");
        element.className = "element";

        // Net worth coloring
        if (item.networth < 100000) element.style.background = "rgba(255,0,0,0.6)";
        else if (item.networth < 200000) element.style.background = "rgba(255,165,0,0.6)";
        else element.style.background = "rgba(0,255,0,0.6)";

        const name = document.createElement("div");
        name.className = "name";
        name.textContent = item.name;

        const details = document.createElement("div");
        details.className = "details";
        details.innerHTML = `${item.role}<br>${item.company}<br>RM ${item.networth}`;

        element.appendChild(name);
        element.appendChild(details);

        const objectCSS = new THREE.CSS3DObject(element);
        objectCSS.position.x = Math.random() * 4000 - 2000;
        objectCSS.position.y = Math.random() * 4000 - 2000;
        objectCSS.position.z = Math.random() * 4000 - 2000;

        scene.add(objectCSS);
        objects.push(objectCSS);
    });

    renderer = new THREE.CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("container").appendChild(renderer.domElement);

    createLayouts(data.length);
    transform(targets.table, 2000);
    animate();
}
function createLayouts(count) {
    for (let i = 0; i < count; i++) {
        const object = new THREE.Object3D();
        object.position.x = (i % 20) * 160 - 1500;
        object.position.y = -(Math.floor(i / 20) % 10) * 200 + 800;
        targets.table.push(object);
    }
    const vector = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
        const phi = Math.acos(-1 + (2 * i) / count);
        const theta = Math.sqrt(count * Math.PI) * phi;

        const object = new THREE.Object3D();
        object.position.setFromSphericalCoords(800, phi, theta);
        vector.copy(object.position).multiplyScalar(2);
        object.lookAt(vector);

        targets.sphere.push(object);
    }
    for (let i = 0; i < count; i++) {
        const angle = i * 0.35;
        const radius = i % 2 === 0 ? 500 : 650;

        const object = new THREE.Object3D();
        object.position.x = Math.sin(angle) * radius;
        object.position.y = (i * 8) - 400;
        object.position.z = Math.cos(angle) * radius;

        targets.helix.push(object);
    }
    for (let i = 0; i < count; i++) {
        const object = new THREE.Object3D();
        object.position.x = ((i % 5) * 400) - 800;
        object.position.y = (-(Math.floor(i / 5) % 4) * 400) + 800;
        object.position.z = (Math.floor(i / 20)) * 400 - 800;

        targets.grid.push(object);
    }
}
function transform(targets, duration) {
    TWEEN.removeAll();

    objects.forEach((object, i) => {
        const target = targets[i];

        new TWEEN.Tween(object.position)
            .to({
                x: target.position.x,
                y: target.position.y,
                z: target.position.z
            }, duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
    });
}
document.getElementById("table").onclick = () => transform(targets.table, 2000);
document.getElementById("sphere").onclick = () => transform(targets.sphere, 2000);
document.getElementById("helix").onclick = () => transform(targets.helix, 2000);
document.getElementById("grid").onclick = () => transform(targets.grid, 2000);
function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    renderer.render(scene, camera);
}
