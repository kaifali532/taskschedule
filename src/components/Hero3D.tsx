import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Planet from './Planet';
import { motion } from 'motion/react';

export default function Hero3D() {
  return (
    <div className="absolute inset-0 w-full h-full z-0 bg-transparent select-none">
      <Canvas className="absolute inset-0 z-0" style={{ width: '100%', height: '100%' }} camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]}>
        {/* Environment & Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 5, 5]} intensity={2.0} color="#3b82f6" />
        <pointLight position={[-10, -5, -5]} intensity={1.0} color="#6366f1" />

        <Suspense fallback={null}>
          <Stars count={3000} factor={4} />
          <Planet />
        </Suspense>
        
        {/* Allow slight rotation by user but restrict zoom/pan to keep it clean */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 2 + 0.2}
          minPolarAngle={Math.PI / 2 - 0.2}
        />
      </Canvas>

      {/* HTML Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)] opacity-80 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center">
            {/* Clean glowing text */}
            <motion.h1 
              className="text-7xl sm:text-[96px] lg:text-[150px] font-black tracking-widest leading-none text-white mb-4 sm:mb-6 select-none pointer-events-none"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{
                textShadow: '0 0 40px rgba(59,130,246,0.8), 0 0 80px rgba(59,130,246,0.5)',
              }}
            >
              ETHARA.AI
            </motion.h1>

            <motion.p
              className="text-lg tracking-[0.4em] text-white/70 mt-4 drop-shadow-[0_0_10px_rgba(99,102,241,0.8)] select-none pointer-events-none"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            >
              TEAMTASKSCHEDULE
            </motion.p>
        </div>
      </div>
    </div>
  );
}
