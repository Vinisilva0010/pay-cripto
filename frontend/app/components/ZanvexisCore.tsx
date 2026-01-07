"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float } from "@react-three/drei";

// O NÚCLEO (A Esfera que se mexe)
function EnergyOrb({ status }: { status: string }) {
  const meshRef = useRef<any>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Efeito de respiração (Muda de tamanho suavemente)
    const t = state.clock.getElapsedTime();
    meshRef.current.scale.y = 1 + Math.sin(t) * 0.1;
    
    // Rotação constante
    meshRef.current.rotation.x = t * 0.2;
    meshRef.current.rotation.y = t * 0.3;
  });

  // CORES DA NARRATIVA
  // Pendente = Azul Cyber (Energia Fria)
  // Pago = Verde Esmeralda (Sucesso/Acesso Liberado)
  const color = status === "confirmed" ? "#10B981" : "#3B82F6";
  
  // Velocidade da distorção (Mais agitado se pago)
  const speed = status === "confirmed" ? 4 : 1.5;

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere args={[1, 100, 200]} scale={2.2} ref={meshRef}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.4} // O quanto ele se deforma
          speed={speed} // Velocidade da deformação
          roughness={0.2}
          metalness={0.8} // Aparência metálica high-end
        />
      </Sphere>
    </Float>
  );
}

// O PALCO (Luzes e Câmera)
export default function ZanvexisCore({ status }: { status: string }) {
  return (
    <div className="absolute inset-0 w-full h-full -z-10 opacity-60">
      <Canvas camera={{ position: [0, 0, 5] }}>
        {/* Luz Ambiente Suave */}
        <ambientLight intensity={0.5} />
        {/* Luz Direcional para dar brilho e sombra */}
        <directionalLight position={[10, 10, 5]} intensity={1.5} color={status === "confirmed" ? "#10B981" : "#3B82F6"} />
        <pointLight position={[-10, -10, -5]} intensity={1} color="#ffffff" />
        
        <EnergyOrb status={status} />
      </Canvas>
    </div>
  );
}