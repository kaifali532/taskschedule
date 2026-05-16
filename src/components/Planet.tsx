import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Planet() {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);
  const glowRef1 = useRef<THREE.Mesh>(null);
  const glowRef2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Floating motion
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.1;
    }

    // Slow rotation
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.002;
      planetRef.current.rotation.x += 0.001;
    }
    
    // Ring rotation
    if (ringRef.current) {
      ringRef.current.rotation.z -= 0.001;
    }

    // Counter-rotate glow layers slightly
    if (glowRef1.current) {
      glowRef1.current.rotation.y -= 0.001;
    }
    if (glowRef2.current) {
      glowRef2.current.rotation.y += 0.0015;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Intense Inner Core */}
      <mesh>
        <sphereGeometry args={[1.9, 32, 32]} />
        <meshBasicMaterial 
          color="#1e1b4b" 
        />
      </mesh>

      {/* Main Wireframe Planet */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[2, 128, 128]} />
        <meshBasicMaterial 
          color="#818cf8" 
          wireframe
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Saturn-style Layered Rings */}
      <group ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
        <mesh>
          <torusGeometry args={[2.8, 0.01, 16, 300]} />
          <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.7} />
        </mesh>
        <mesh>
          <torusGeometry args={[3.0, 0.01, 16, 300]} />
          <meshBasicMaterial color="#71717a" wireframe transparent opacity={0.6} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh>
          <torusGeometry args={[3.2, 0.01, 16, 300]} />
          <meshBasicMaterial color="#4f46e5" wireframe transparent opacity={0.5} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh>
          <torusGeometry args={[3.4, 0.01, 16, 300]} />
          <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.4} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh>
          <torusGeometry args={[3.6, 0.01, 16, 300]} />
          <meshBasicMaterial color="#818cf8" wireframe transparent opacity={0.3} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>

      {/* Outer Glow Layer 1 */}
      <mesh ref={glowRef1} scale={1.1}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial 
          color="#4f46e5" 
          wireframe
          transparent 
          opacity={0.15} 
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Outer Glow Layer 2 (Atmosphere) */}
      <mesh ref={glowRef2}>
        <sphereGeometry args={[2.2, 128, 128]} />
        <meshBasicMaterial 
          color="#6366f1" 
          transparent 
          opacity={0.05} 
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}
