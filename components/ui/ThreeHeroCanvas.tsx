import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeHeroCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene & Camera Setup
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 5;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 3. Texture Loader & Materials
    const textureLoader = new THREE.TextureLoader();
    
    // Load the generated azulejo texture
    const azulejoTexture = textureLoader.load('/imagens/azulejo_maranhense_3d.png');
    azulejoTexture.wrapS = THREE.RepeatWrapping;
    azulejoTexture.wrapT = THREE.RepeatWrapping;

    // Glazed ceramic tile material
    const tileMaterial = new THREE.MeshStandardMaterial({
      map: azulejoTexture,
      roughness: 0.15, // Glazed shiny ceramic look
      metalness: 0.05,
      bumpMap: azulejoTexture,
      bumpScale: 0.03, // Subtle surface roughness
    });

    // 4. Mesh (The Tile)
    // Box geometry with small depth to look like a solid ceramic tile
    const tileGeometry = new THREE.BoxGeometry(2.2, 2.2, 0.12);
    
    // Assign materials (only front face gets the detailed azulejo texture, sides get simple white/clay ceramic)
    const clayMaterial = new THREE.MeshStandardMaterial({
      color: 0xe6dfd5, // Terracotta/clay backing color
      roughness: 0.8,
      metalness: 0.0,
    });

    const materials = [
      clayMaterial, // Right
      clayMaterial, // Left
      clayMaterial, // Top
      clayMaterial, // Bottom
      tileMaterial, // Front (azulejo texture)
      clayMaterial  // Back
    ];

    const tileMesh = new THREE.Mesh(tileGeometry, materials);
    tileMesh.position.set(0, 0, 0);
    tileMesh.castShadow = true;
    tileMesh.receiveShadow = true;
    scene.add(tileMesh);

    // 5. Particle System (Background cultural dust/sparks)
    const particleCount = prefersReducedMotion ? 50 : 350;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      // Random coordinates in space
      positions[i] = (Math.random() - 0.5) * 12; // X
      positions[i + 1] = (Math.random() - 0.5) * 8; // Y
      positions[i + 2] = (Math.random() - 0.5) * 6 - 2; // Z
      
      // Speed of drifting
      speeds[i / 3] = 0.05 + Math.random() * 0.1;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Create soft round glowing points using a programmatically generated canvas texture
    const createCircleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.5, 'rgba(184, 60, 60, 0.5)'); // Terracotta glow
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 16, 16);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.18,
      map: createCircleTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 6. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    // Point Light representing the interactive cursor light
    const pointLight = new THREE.PointLight(0xfff5e6, 2.5, 12);
    pointLight.position.set(0, 0, 3);
    pointLight.castShadow = true;
    scene.add(pointLight);

    // Subtle colored directional lights for rim reflections (Navy/Terracotta contrast)
    const blueLight = new THREE.DirectionalLight(0x4f86ab, 1.5);
    blueLight.position.set(-4, 3, 2);
    scene.add(blueLight);

    const terracottaLight = new THREE.DirectionalLight(0xb83c3c, 2.0);
    terracottaLight.position.set(4, -3, 2);
    scene.add(terracottaLight);

    // 7. Mouse and Scroll Tracking
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const scroll = { y: 0, targetY: 0 };

    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse positions between -1 and 1
      mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const handleScroll = () => {
      scroll.targetY = window.scrollY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    // 8. Animation Loop
    let clock = new THREE.Clock();
    
    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();

      // Lerp mouse coordinates for smooth inertia
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;
      
      // Lerp scroll for custom parallax physics
      scroll.y += (scroll.targetY - scroll.y) * 0.1;

      // Disable dynamic animations if user prefers reduced motion
      if (!prefersReducedMotion) {
        // Rotate the Tile mesh based on mouse
        tileMesh.rotation.y = elapsedTime * 0.15 + mouse.x * 0.4;
        tileMesh.rotation.x = Math.sin(elapsedTime * 0.2) * 0.1 + mouse.y * 0.4;
        
        // Move the tile back and rotate as user scrolls down
        tileMesh.position.z = -scroll.y * 0.003;
        tileMesh.position.y = -scroll.y * 0.001;
        tileMesh.rotation.z = scroll.y * 0.0005;

        // Position the point light to follow the mouse cursor dynamically
        pointLight.position.x = mouse.x * 4;
        pointLight.position.y = mouse.y * 3;
        pointLight.position.z = 2.5 + Math.sin(elapsedTime * 0.5) * 0.5;

        // Update background particles drift
        const positionsArr = particleGeometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          const idx = i * 3;
          // Drift particles upward
          positionsArr[idx + 1] += speeds[i] * 0.02;
          
          // Add micro wave movement
          positionsArr[idx] += Math.sin(elapsedTime + i) * 0.002;

          // Parallax depth response
          positionsArr[idx + 2] = positions[idx + 2] + scroll.y * 0.002;

          // Reset particle if it drifts too high
          if (positionsArr[idx + 1] > 5) {
            positionsArr[idx + 1] = -5;
          }
        }
        particleGeometry.attributes.position.needsUpdate = true;
      } else {
        // Static slow rotation
        tileMesh.rotation.y = elapsedTime * 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handling
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      // Dispose resources
      tileGeometry.dispose();
      tileMaterial.dispose();
      clayMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-10"
      style={{ mixBlendMode: 'normal' }}
    />
  );
};
