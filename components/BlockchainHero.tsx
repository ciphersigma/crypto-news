'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const BlockchainHero: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create subtle floating geometric shapes - MUCH more subtle
    const shapes: THREE.Mesh[] = [];
    const createShape = (geometry: THREE.BufferGeometry, color: number, position: [number, number, number]): THREE.Mesh => {
      const material = new THREE.MeshPhongMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.05, // Very subtle
        wireframe: false
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      
      // Very subtle wireframe
      const wireframe = new THREE.WireframeGeometry(geometry);
      const line = new THREE.LineSegments(wireframe, new THREE.LineBasicMaterial({ 
        color: color, 
        transparent: true, 
        opacity: 0.15 // Subtle wireframe
      }));
      mesh.add(line);
      
      scene.add(mesh);
      return mesh;
    };

    // Create fewer, larger, more spread out shapes
    shapes.push(createShape(new THREE.OctahedronGeometry(3), 0x00d4ff, [-20, 8, -15]));
    shapes.push(createShape(new THREE.TetrahedronGeometry(2.5), 0x00ff88, [18, -5, -12]));
    shapes.push(createShape(new THREE.IcosahedronGeometry(2.8), 0xff6b35, [-12, -8, -18]));
    shapes.push(createShape(new THREE.DodecahedronGeometry(2.2), 0xf7931e, [22, 12, -20]));

    // Much more subtle particle field
    const particleCount = 80; // Reduced count
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x00d4ff,
      size: 0.8, // Smaller particles
      transparent: true,
      opacity: 0.3, // More subtle
      sizeAttenuation: true
    });

    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 120;     // x - more spread
      positions[i + 1] = (Math.random() - 0.5) * 60;  // y  
      positions[i + 2] = (Math.random() - 0.5) * 120; // z - more spread
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Subtle lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x00d4ff, 0.5);
    directionalLight.position.set(30, 30, 20);
    scene.add(directionalLight);

    const rimLight = new THREE.DirectionalLight(0xff6b35, 0.2);
    rimLight.position.set(-30, 15, -20);
    scene.add(rimLight);

    // Camera positioning - further back
    camera.position.set(0, 0, 35);

    // Animation variables
    let time = 0;
    let animationId: number;
    let isAnimating = true;
    
    // Very gentle animation
    const animate = (): void => {
      if (!isAnimating) return;
      
      animationId = requestAnimationFrame(animate);
      time += 0.003; // Slower animation

      // Very gentle rotation of shapes
      shapes.forEach((shape, index) => {
        shape.rotation.x = time * (0.1 + index * 0.02);
        shape.rotation.y = time * (0.08 + index * 0.01);
        
        // Very subtle floating
        shape.position.y += Math.sin(time * 1.5 + index) * 0.008;
      });

      // Gentle particle drift
      particles.rotation.y = time * 0.02;

      // Very subtle camera movement
      camera.position.x = Math.sin(time * 0.1) * 1;
      camera.position.y = Math.cos(time * 0.08) * 0.5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    // Start animation
    animate();
    setIsLoaded(true);

    // Handle resize
    const handleResize = (): void => {
      if (!camera || !renderer) return;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      isAnimating = false;
      
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      window.removeEventListener('resize', handleResize);
      
      if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
      scene.clear();
      
      shapes.forEach(shape => {
        if (shape.geometry) shape.geometry.dispose();
        if (shape.material) {
          if (Array.isArray(shape.material)) {
            shape.material.forEach(material => material.dispose());
          } else {
            shape.material.dispose();
          }
        }
      });
      
      particlesGeometry.dispose();
      particlesMaterial.dispose();
    };
  }, []);

  return (
    <div className="hero-container">
      {/* 3D Background */}
      <div 
        ref={mountRef} 
        className={`hero-canvas ${isLoaded ? 'loaded' : ''}`}
      />
      
      {/* Content */}
      <div className="hero-content">
        {/* Navigation */}
        <nav className="hero-nav">
          <div className="hero-logo">
            CryptoNews<span className="hero-logo-accent">3D</span>
          </div>
          <div className="hero-nav-links">
            <a href="#">Latest</a>
            <a href="#">Bitcoin</a>
            <a href="#">Ethereum</a>
            <a href="#">DeFi</a>
          </div>
          <button className="hero-subscribe-btn">
            Subscribe
          </button>
        </nav>

        {/* Hero Content */}
        <div className="hero-main">
          <div className="hero-inner">
            <h1 className="hero-title">
              <span className="hero-title-line">Next-Gen</span>
              <span className="hero-title-line hero-title-gradient">
                Crypto News
              </span>
            </h1>
            
            <p className="hero-description">
              Real-time blockchain news with AI-powered summaries. 
              Stay ahead of the market with instant updates.
            </p>
            
            <div className="hero-buttons">
              <button className="hero-primary-btn">
                Start Reading
              </button>
              <button className="hero-secondary-btn">
                View Demo
              </button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="hero-stats">
          <div className="hero-stats-grid">
            <div className="hero-stat-card">
              <div className="hero-stat-number blue">247</div>
              <div className="hero-stat-label">Articles Today</div>
            </div>
            <div className="hero-stat-card">
              <div className="hero-stat-number cyan">12.5K</div>
              <div className="hero-stat-label">Active Readers</div>
            </div>
            <div className="hero-stat-card">
              <div className="hero-stat-number teal">98%</div>
              <div className="hero-stat-label">Accuracy Rate</div>
            </div>
            <div className="hero-stat-card">
              <div className="hero-stat-number green">Live</div>
              <div className="hero-stat-label">Real-time Updates</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="hero-scroll">
        <div className="hero-scroll-mouse">
          <div className="hero-scroll-dot"></div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainHero;