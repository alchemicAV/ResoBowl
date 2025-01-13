import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface BowlDimensions {
  innerDiameter: number;
  outerDiameter: number;
  thickness: number;
}

interface Bowl3DPreviewProps {
  dimensions: BowlDimensions;
  shape: 'hemisphere' | 'parabolic';
}

const Bowl3DPreview: React.FC<Bowl3DPreviewProps> = ({ dimensions, shape }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(1, 1, 1);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight1.position.set(5, 5, 5);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);

    const createBowlGeometry = (isOuter: boolean) => {
      const segments = 64;
      const points: THREE.Vector2[] = [];
      
      // Scale bowl relative to a 1-meter grid
      const scale = 0.5; // This makes a 1-meter diameter bowl appear as 0.5 units on the grid
      const baseRadius = isOuter ? 
        (dimensions.outerDiameter / dimensions.innerDiameter) : 1;
      const depth = baseRadius * 0.75;
      
      // Scale everything by the actual dimensions in meters
      const finalScale = scale * (isOuter ? dimensions.outerDiameter : dimensions.innerDiameter);
      
      const steps = 50;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        let x, y;

        // Only using hemisphere shape for now
        const angle = (t * Math.PI) / 2;
        x = (Math.sin(angle) * baseRadius) * finalScale;
        y = (-Math.cos(angle) * depth) * finalScale;

        /* Parabolic shape code kept for future reference
        else {
          const maxRadius = baseRadius * scale;
          x = maxRadius * (1 - t);
          y = t * depth * scale;
        }
        */

        points.push(new THREE.Vector2(Math.abs(x), y));
      }

      return new THREE.LatheGeometry(points, segments);
    };

    const innerGeometry = createBowlGeometry(false);
    const outerGeometry = createBowlGeometry(true);

    const innerMaterial = new THREE.MeshPhongMaterial({
      color: 0x666666,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      shininess: 100,
      specular: 0x444444
    });

    const outerMaterial = new THREE.MeshPhongMaterial({
      color: 0x888888,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
      shininess: 100,
      specular: 0x444444
    });

    const innerBowl = new THREE.Mesh(innerGeometry, innerMaterial);
    const outerBowl = new THREE.Mesh(outerGeometry, outerMaterial);

    // Create fixed-size grid (1 meter between lines)
    const gridSize = 2; // 2 meters total size
    const gridDivisions = 2; // 2 divisions = 1 meter between lines
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x888888, 0xcccccc);
    
    // Calculate bowl depth in scaled units
    const bowlDepth = dimensions.innerDiameter * 0.75 * 0.5; // using same scale as in createBowlGeometry
    gridHelper.position.y = -bowlDepth; // Position grid at bottom of bowl

    scene.add(gridHelper);
    scene.add(innerBowl);
    scene.add(outerBowl);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      scene.remove(innerBowl);
      scene.remove(outerBowl);
      scene.remove(gridHelper);
      innerGeometry.dispose();
      outerGeometry.dispose();
      innerMaterial.dispose();
      outerMaterial.dispose();
      renderer.dispose();
    };
  }, [dimensions, shape]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-[400px] border rounded bg-white"
      style={{ touchAction: 'none' }}
    />
  );
};

export default Bowl3DPreview;