// Initialize Lucide Icons
lucide.createIcons();

// --- THREE.JS SCENE SETUP ---
const canvas = document.querySelector('#three-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- 3D OBJECTS (OmniClaw Core) ---
// Main Icosahedron
const geometry = new THREE.IcosahedronGeometry(2, 2);
const material = new THREE.MeshStandardMaterial({
    color: 0x00f2ff,
    wireframe: false,
    emissive: 0x00f2ff,
    emissiveIntensity: 0.3,
    metalness: 0.8,
    roughness: 0.2,
    transparent: true,
    opacity: 0.9
});
const core = new THREE.Mesh(geometry, material);
scene.add(core);

// Inner Pulsing Core
const innerGeo = new THREE.IcosahedronGeometry(1.2, 1);
const innerMat = new THREE.MeshStandardMaterial({
    color: 0x7000ff,
    emissive: 0x7000ff,
    emissiveIntensity: 0.8,
    metalness: 1,
    roughness: 0.1,
    transparent: true,
    opacity: 0.8
});
const innerCore = new THREE.Mesh(innerGeo, innerMat);
scene.add(innerCore);

// Outer Ring
const ringGeo = new THREE.TorusGeometry(3, 0.1, 32, 100);
const ringMat = new THREE.MeshStandardMaterial({
    color: 0x00f2ff,
    emissive: 0x00f2ff,
    emissiveIntensity: 0.5,
    metalness: 1,
    roughness: 0
});
const ring = new THREE.Mesh(ringGeo, ringMat);
ring.rotation.x = Math.PI * 0.3;
scene.add(ring);

// --- PARTICLES ---
const particlesGeometry = new THREE.BufferGeometry();
const count = 3000;
const positions = new Float32Array(count * 3);
const velocities = new Float32Array(count * 3);

for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 30;
    positions[i + 1] = (Math.random() - 0.5) * 30;
    positions[i + 2] = (Math.random() - 0.5) * 30;
    
    velocities[i] = (Math.random() - 0.5) * 0.02;
    velocities[i + 1] = (Math.random() - 0.5) * 0.02;
    velocities[i + 2] = (Math.random() - 0.5) * 0.02;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x00f2ff,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true
});
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0x00f2ff, 2);
pointLight1.position.set(5, 5, 5);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x7000ff, 2);
pointLight2.position.set(-5, -5, 5);
scene.add(pointLight2);

const pointLight3 = new THREE.PointLight(0x00ff00, 1);
pointLight3.position.set(0, 0, -10);
scene.add(pointLight3);

camera.position.z = 6;

// --- MOUSE PARALLAX ---
let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;

window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

// --- SCROLL TRACKING ---
let scrollY = 0;
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
});

// --- ANIMATION LOOP ---
const clock = new THREE.Clock();

function animate() {
    const elapsedTime = clock.getElapsedTime();

    // Smooth mouse movement
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    // Rotate Cores
    core.rotation.y = elapsedTime * 0.15;
    core.rotation.x = elapsedTime * 0.08;
    
    innerCore.rotation.y = -elapsedTime * 0.3;
    innerCore.rotation.z = elapsedTime * 0.15;
    
    ring.rotation.x = Math.PI * 0.3 + elapsedTime * 0.1;
    ring.rotation.z = elapsedTime * 0.05;

    // Pulse Effect
    const pulse = Math.sin(elapsedTime * 2) * 0.15 + 1;
    innerCore.scale.set(pulse, pulse, pulse);
    
    const ringPulse = Math.sin(elapsedTime * 1.5) * 0.1 + 1;
    ring.scale.set(ringPulse, ringPulse, ringPulse);

    // Mouse Parallax Effect
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 2 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    // Scroll Effect
    const scrollFactor = Math.min(scrollY / 1000, 1);
    camera.position.z = 6 + scrollFactor * 2;

    // Animate Particles
    const positionAttribute = particlesGeometry.getAttribute('position');
    const positions = positionAttribute.array;
    
    for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];
        
        // Wrap around
        if (positions[i] > 15) positions[i] = -15;
        if (positions[i] < -15) positions[i] = 15;
        if (positions[i + 1] > 15) positions[i + 1] = -15;
        if (positions[i + 1] < -15) positions[i + 1] = 15;
        if (positions[i + 2] > 15) positions[i + 2] = -15;
        if (positions[i + 2] < -15) positions[i + 2] = 15;
    }
    positionAttribute.needsUpdate = true;

    // Animate lights
    pointLight1.position.x = Math.sin(elapsedTime * 0.5) * 8;
    pointLight2.position.y = Math.cos(elapsedTime * 0.5) * 8;

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

// --- NAVBAR SCROLL EFFECT ---
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// --- SMOOTH SCROLL TO SECTIONS ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// --- TERMINAL TYPING EFFECT ---
const terminalLines = document.querySelectorAll('.terminal-line');
terminalLines.forEach((line, index) => {
    line.style.opacity = '0';
    setTimeout(() => {
        line.style.opacity = '1';
        line.style.transition = 'opacity 0.5s ease';
    }, 1000 + (index * 200));
});

// --- FEATURE CARD STAGGER ---
const featureCards = document.querySelectorAll('.feature-card');
featureCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
});

// --- PARALLAX SCROLL EFFECT ---
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    parallaxElements.forEach(el => {
        const speed = el.getAttribute('data-parallax');
        el.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// --- INTERACTIVE STATS ---
const statBoxes = document.querySelectorAll('.stat-box');
statBoxes.forEach((box, index) => {
    box.addEventListener('mouseenter', () => {
        box.style.transform = 'scale(1.05) rotate(2deg)';
    });
    box.addEventListener('mouseleave', () => {
        box.style.transform = 'scale(1) rotate(0deg)';
    });
});

// --- GLOW EFFECT ON MOUSE MOVE ---
document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    
    const glowElements = document.querySelectorAll('.glass');
    glowElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const elX = rect.left + rect.width / 2;
        const elY = rect.top + rect.height / 2;
        
        const distance = Math.sqrt(Math.pow(x - elX, 2) + Math.pow(y - elY, 2));
        
        if (distance < 200) {
            const intensity = (200 - distance) / 200;
            el.style.boxShadow = `0 0 ${20 * intensity}px rgba(0, 242, 255, ${0.3 * intensity})`;
        } else {
            el.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
        }
    });
});

// --- MOBILE MENU TOGGLE ---
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        const navLinks = document.querySelector('.nav-links');
        const navCta = document.querySelector('.nav-cta');
        
        if (navLinks) navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        if (navCta) navCta.style.display = navCta.style.display === 'flex' ? 'none' : 'flex';
    });
}

console.log('🔮 Omni Claw website loaded successfully!');
