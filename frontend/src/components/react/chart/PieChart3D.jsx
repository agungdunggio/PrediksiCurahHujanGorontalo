import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import LightingEffect from '../lightning/LighningEfect.jsx';

gsap.registerPlugin(ScrollTrigger);

function PieSlice({
    data, startAngle, color, isHovered, onPointerOver, onPointerOut, index
  }) {
    const angle = (data.value / 100) * Math.PI * 2;
    const sliceRef = useRef();
  
    useEffect(() => {
      gsap.from(sliceRef.current.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1,
        ease: 'back.out(1.7)',
        delay: index * 0.1,
      });
    }, []);

    useEffect(() => {
        if (sliceRef.current && sliceRef.current.geometry) {
          sliceRef.current.geometry.computeBoundingBox();
        }
      }, []);
  
    useEffect(() => {
      if (isHovered) {
        gsap.to(sliceRef.current.scale, {
          x: 1.15,
          y: 1.15,
          z: 1.15,
          duration: 0.3,
          ease: 'power2.out',
        });
      } else {
        gsap.to(sliceRef.current.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    }, [isHovered]);
  
    return (
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={(e) => {
          document.body.style.cursor = 'pointer';
          onPointerOver(e);
        }}
        onPointerOut={(e) => {
          document.body.style.cursor = 'default';
          onPointerOut(e);
        }}
        ref={sliceRef}
      >
        <cylinderGeometry args={[2.8, 2.8, 3, 64, 1, false, startAngle, angle]} />
        <meshStandardMaterial
          color={color}
          roughness={0.25}
          metalness={0.6}
          emissive={isHovered ? color : '#000000'}
          emissiveIntensity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    );
  }

const PieChart3D = () => {
  const containerRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [mousePos, setMousePos] = useState({ x: null, y: null });

  const data = [
    { type: 'Data Train', value: 80, raw: 1404 },
    { type: 'Data Test', value: 20, raw: 351 },
  ];

  const colors = ['#00FFFF', '#FF00FF'];

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 100 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          once: true,
        },
      }
    );
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX + 50 , y: e.clientY - 250 });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  let accumulatedAngle = 0;

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '400px', opacity: 0, position: 'relative', pointerEvents: 'auto', }}
    >
      {/* Tooltip */}
      {hoveredIndex !== null && mousePos.x !== null && (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
            position: 'fixed',
            left: mousePos.x + 12,
            top: mousePos.y + 12,
            background: 'rgba(30, 30, 30, 0.8)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            padding: '10px 14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            fontSize: 13,
            pointerEvents: 'none',
            zIndex: 9999,
            }}
        >
            <div style={{ fontWeight: '600', marginBottom: 6 }}>
            {data[hoveredIndex].type}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
                style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: colors[hoveredIndex],
                }}
            />
            <span>{data[hoveredIndex].value}%</span>
            </div>
            <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>
                Data: {data[hoveredIndex].raw}
            </div>
        </motion.div>
        )}

      <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
        {/* 💡 Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 2, 6]} intensity={2.5} castShadow />
        <directionalLight position={[-7, 2, -6]} intensity={2.5} castShadow />

        {/* <LightingEffect
            position={[-6, 6, -6]}
            color="#00FFFF"
            rotation={[-Math.PI / 4, 0, 0]}
            coneSize={[7, 10]}
            opacity={0.2}
        /> */}

        {/* Support Light Merah dari kanan belakang */}
        {/* <LightingEffect
            position={[6, 6, -6]}
            color="#FF3366"
            rotation={[-Math.PI / 4, 0, 0]}
            coneSize={[7, 10]}
            opacity={0.2}
        /> */}
        
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.2, -1]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial color="#000000" roughness={0.8} metalness={0.2} />
        </mesh>

        <pointLight position={[0, -5, 5]} intensity={0.8} />

        <OrbitControls enableZoom={false} />
        <group>
          {data.map((item, index) => {
            const startAngle = accumulatedAngle;
            const angle = (item.value / 100) * Math.PI * 2;
            accumulatedAngle += angle;

            return (
              <React.Fragment key={item.type}>
                <PieSlice
                  data={item}
                  startAngle={startAngle}
                  color={colors[index]}
                  isHovered={hoveredIndex === index}
                  onPointerOver={() => setHoveredIndex(index)}
                  onPointerOut={() => setHoveredIndex(null)}
                />
              </React.Fragment>
            );
          })}
        </group>
      </Canvas>
    </div>
  );
};

export default PieChart3D;
