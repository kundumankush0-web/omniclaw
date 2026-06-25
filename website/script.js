// Initialize Lucide Icons
lucide.createIcons();

// --- THREE.JS SCENE SETUP ---
const canvas = document.querySelector('#three-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- 3D OBJECT (OmniClaw Core) ---
const geometry = new THREE.IcosahedronGeometry(2, 1);
const material = new THREE.MeshStandardMaterial({
    color: 0x00f2ff,
    wireframe: true,
    emissive: 0x00f2ff,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.8
});
const core = new THREE.Mesh(geometry, material);
scene.add(core);

// Inner Core
const innerGeo = new THREE.IcosahedronGeometry(1.2, 0);
const innerMat = new THREE.MeshStandardMaterial({
    color: 0x7000ff,
    emissive: 0x7000ff,
    emissiveIntensity: 1,
    metalness: 1,
    roughness: 0
});
const innerCore = new THREE.Mesh(innerGeo, innerMat);
scene.add(innerCore);

// --- PARTICLES ---
const particlesGeometry = new THREE.BufferGeometry();
const count = 2000;
const positions = new Float32Array(count * 3);

for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 20;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: 0x00f2ff,
    transparent: true,
    opacity: 0.5
});
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x00f2ff, 2);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const purpleLight = new THREE.PointLight(0x7000ff, 2);
purpleLight.position.set(-5, -5, 5);
scene.add(purpleLight);

camera.position.z = 6;

// --- MOUSE PARALLAX ---
let mouseX = 0;
let mouseY = 0;

window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

// --- ANIMATION LOOP ---
const clock = new THREE.Clock();

function animate() {
    const elapsedTime = clock.getElapsedTime();

    // Rotate Cores
    core.rotation.y = elapsedTime * 0.2;
    core.rotation.x = elapsedTime * 0.1;
    
    innerCore.rotation.y = -elapsedTime * 0.4;
    innerCore.rotation.z = elapsedTime * 0.2;

    // Pulse Effect
    const pulse = Math.sin(elapsedTime * 2) * 0.1 + 1;
    innerCore.scale.set(pulse, pulse, pulse);

    // Mouse Parallax Effect
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 2 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    // Animate Particles
    particles.rotation.y = elapsedTime * 0.05;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

// --- HANDLE RESIZE ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- SCROLL REVEAL ---
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// --- WORKFLOW STEPS INTERACTION ---
const steps = document.querySelectorAll('.step');
let currentStep = 0;

function rotateSteps() {
    steps.forEach(s => s.classList.remove('active'));
    steps[currentStep].classList.add('active');
    currentStep = (currentStep + 1) % steps.length;
}

setInterval(rotateSteps, 3000);

// --- NAVBAR SCROLL EFFECT ---
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        nav.style.padding = '1rem 0';
        nav.style.background = 'rgba(5, 5, 5, 0.95)';
    } else {
        nav.padding = '1.5rem 0';
        nav.style.background = 'rgba(5, 5, 5, 0.8)';
    }
});

// --- TERMINAL TYPING EFFECT (SIMULATION) ---
const terminalLines = document.querySelectorAll('.terminal-line');
terminalLines.forEach((line, index) => {
    line.style.opacity = '0';
    setTimeout(() => {
        line.style.opacity = '1';
        line.style.transition = 'opacity 0.5s ease';
    }, 1000 + (index * 800));
});
