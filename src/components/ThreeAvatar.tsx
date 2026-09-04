"use client";

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Trail, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

function AvatarCore({ isSpeaking }: { isSpeaking: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      
      if (isSpeaking) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.getElapsedTime() * 10) * 0.05);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
    
    if (ringRef1.current && ringRef2.current) {
      ringRef1.current.rotation.x = state.clock.getElapsedTime() * (isSpeaking ? 2 : 0.5);
      ringRef1.current.rotation.y = state.clock.getElapsedTime() * (isSpeaking ? 1.5 : 0.2);
      
      ringRef2.current.rotation.x = state.clock.getElapsedTime() * (isSpeaking ? -1.5 : -0.3);
      ringRef2.current.rotation.z = state.clock.getElapsedTime() * (isSpeaking ? 2 : 0.4);
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <MeshDistortMaterial 
          color={isSpeaking ? "#3b82f6" : "#4f46e5"} 
          attach="material" 
          distort={isSpeaking ? 0.4 : 0.2} 
          speed={isSpeaking ? 5 : 2} 
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
      
      <mesh ref={ringRef1}>
        <torusGeometry args={[1.5, 0.02, 16, 100]} />
        <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={2} />
      </mesh>
      
      <mesh ref={ringRef2}>
        <torusGeometry args={[1.8, 0.01, 16, 100]} />
        <meshStandardMaterial color="#a78bfa" emissive="#8b5cf6" emissiveIntensity={2} />
      </mesh>
    </Float>
  );
}

export default function ThreeAvatar({ isSpeaking }: { isSpeaking: boolean }) {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#4f46e5" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <AvatarCore isSpeaking={isSpeaking} />
      </Canvas>
    </div>
  );
}
