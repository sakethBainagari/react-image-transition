import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import gsap from 'gsap';

// This component handles the explosion effect for a single image
const ExplodingImage = ({ imageUrl, nextImageUrl, segments = 12, onTransitionComplete }) => {
  const { scene, camera } = useThree();
  const groupRef = useRef();
  const fragmentsCompleted = useRef(0);
  const totalFragments = segments * segments;
  
  // Make camera look at center
  useEffect(() => {
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  useEffect(() => {
    // Load textures with crossOrigin option
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    
    // Create a fallback texture in case the URL is malformed
    const fallbackTexture = new THREE.Texture();
    fallbackTexture.needsUpdate = true;
    
    // Function to safely load a texture
    const safeLoadTexture = (url) => {
      return new Promise((resolve) => {
        if (url && url.startsWith('http')) {
          loader.load(
            url,
            (texture) => resolve(texture),
            undefined,
            () => resolve(fallbackTexture)
          );
        } else if (url) {
          try {
            loader.load(
              url,
              (texture) => resolve(texture),
              undefined,
              () => resolve(fallbackTexture)
            );
          } catch (e) {
            console.error("Error loading texture:", e);
            resolve(fallbackTexture);
          }
        } else {
          resolve(fallbackTexture);
        }
      });
    };
    
    const setupScene = async () => {
      if (groupRef.current) {
        scene.remove(groupRef.current);
      }
      
      // Load textures
      const sourceTexture = await safeLoadTexture(imageUrl);
      const targetTexture = await safeLoadTexture(nextImageUrl);
      
      console.log("Loaded textures:", { sourceTexture, targetTexture, imageUrl, nextImageUrl });
      
      // Create fragment group
      groupRef.current = new THREE.Group();
      scene.add(groupRef.current);
      
      // Reset counter
      fragmentsCompleted.current = 0;
      
      // Fragment size
      const fragmentSize = 2 / segments;
      
      // Create fragments
      for (let y = 0; y < segments; y++) {
        for (let x = 0; x < segments; x++) {
          const geometry = new THREE.PlaneGeometry(fragmentSize, fragmentSize);
          
          // Adjust UVs to show only a portion of the texture
          const uvs = geometry.attributes.uv;
          for (let i = 0; i < uvs.count; i++) {
            const u = uvs.getX(i);
            const v = uvs.getY(i);
            uvs.setXY(
              i,
              (x + u) / segments,
              1 - ((y + v) / segments)
            );
          }
          
          const material = new THREE.MeshBasicMaterial({
            map: sourceTexture,
            side: THREE.DoubleSide,
            transparent: true
          });
          
          const mesh = new THREE.Mesh(geometry, material);
          
          // Position each fragment in its correct initial location
          mesh.position.x = (x / segments) * 2 - 1 + (fragmentSize / 2);
          mesh.position.y = 1 - (y / segments) * 2 - (fragmentSize / 2);
          mesh.position.z = 0;
          
          groupRef.current.add(mesh);
          
          // Save original position for final rearrangement
          const originalX = mesh.position.x;
          const originalY = mesh.position.y;
          
          // Define animation for this fragment
          const delay = Math.random() * 0.3;
          const explosionDistance = 3 + Math.random() * 5;
          const direction = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            Math.random() * 2
          ).normalize();
          
          // Create timeline
          const timeline = gsap.timeline({ delay });
          
          // EXPLOSION PHASE
          timeline.to(mesh.position, {
            x: mesh.position.x + direction.x * explosionDistance,
            y: mesh.position.y + direction.y * explosionDistance,
            z: mesh.position.z + direction.z * explosionDistance,
            duration: 1,
            ease: "power3.out"
          });
          
          // Rotate during explosion
          timeline.to(mesh.rotation, {
            x: Math.random() * Math.PI * 4,
            y: Math.random() * Math.PI * 4,
            z: Math.random() * Math.PI * 4,
            duration: 1,
            ease: "power2.out"
          }, "<");
          
          // Slightly scale fragments
          timeline.to(mesh.scale, {
            x: 0.5 + Math.random() * 0.5,
            y: 0.5 + Math.random() * 0.5,
            z: 0.5 + Math.random() * 0.5,
            duration: 1,
            ease: "power2.out"
          }, "<");
          
          // Change texture at peak of explosion
          timeline.call(() => {
            mesh.material.map = targetTexture;
            mesh.material.needsUpdate = true;
          });
          
          // FINAL ARRANGEMENT - Return to grid position
          timeline.to(mesh.position, {
            x: originalX,
            y: originalY,
            z: 0,
            duration: 1,
            ease: "power2.inOut",
            onComplete: () => {
              fragmentsCompleted.current++;
              if (fragmentsCompleted.current === totalFragments) {
                setTimeout(() => {
                  onTransitionComplete();
                }, 300);
              }
            }
          });
          
          // Reset rotation
          timeline.to(mesh.rotation, {
            x: 0,
            y: 0,
            z: 0,
            duration: 1,
            ease: "power2.inOut"
          }, "<");
          
          // Reset scale
          timeline.to(mesh.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 1,
            ease: "power2.inOut"
          }, "<");
        }
      }
    };
    
    setupScene();
    
    return () => {
      if (groupRef.current) {
        scene.remove(groupRef.current);
      }
    };
  }, [scene, camera, imageUrl, nextImageUrl, segments, onTransitionComplete]);
  
  return null;
};

// Main component
const ExplosionTransition = ({ currentImage, nextImage, isVisible, onComplete }) => {
  if (!isVisible) return null;
  
  // Remove quotes from URLs if they exist
  const cleanCurrentImage = currentImage?.replace(/['"]/g, '');
  const cleanNextImage = nextImage?.replace(/['"]/g, '');
  
  console.log("ExplosionTransition:", { cleanCurrentImage, cleanNextImage });
  
  return (
    <div className="explosion-transition" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 3000,
      pointerEvents: 'none',
    }}>
      <Canvas camera={{ position: [0, 0, 3], fov: 60 }}>
        <ambientLight intensity={2} />
        <ExplodingImage 
          imageUrl={cleanCurrentImage} 
          nextImageUrl={cleanNextImage} 
          segments={12} // More fragments for better shattering effect
          onTransitionComplete={onComplete}
        />
      </Canvas>
    </div>
  );
};

export default ExplosionTransition; 