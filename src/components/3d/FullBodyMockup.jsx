import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Text, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { RotateCcw, Camera, Download, Eye } from 'lucide-react';

const FullBodyModel = ({ 
  garmentType, 
  garmentColor, 
  fabricType, 
  frontDesign, 
  backDesign, 
  leftSleeveDesign, 
  rightSleeveDesign,
  designPlacement,
  cameraView 
}) => {
  const meshRef = useRef(null);
  const { camera } = useThree();
  
  useFrame((state) => {
    if (meshRef.current && cameraView === 'front') {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  // Generate model configuration based on inputs
  const modelConfig = useMemo(() => {
    const baseConfig = {
      model_url: `/models/fullbody_${garmentType}_${garmentColor.toLowerCase()}.glb`,
      fabric_texture: `/textures/${fabricType}_${garmentColor.toLowerCase()}.jpg`,
      design_position: {
        placement: designPlacement,
        x: 0,
        y: 0,
        scale: 1
      },
      camera_views: {
        default: "front",
        options: {
          front: { angle: [0, 0, 5], zoom: 1.2 },
          top: { angle: [-30, 0, 0], zoom: 1.1 },
          back: { angle: [0, 180, 0], zoom: 1.2 }
        }
      },
      rotation_enabled: true,
      zoom_enabled: true,
      background_color: "#f8fafc"
    };

    // Set design URL and position based on placement
    let design_url = '';
    switch (designPlacement) {
      case 'front':
        design_url = frontDesign || '';
        baseConfig.design_position = { placement: 'front', x: 0.12, y: 0.18, scale: 0.95 };
        break;
      case 'back':
        design_url = backDesign || '';
        baseConfig.design_position = { placement: 'back', x: 0.12, y: 0.18, scale: 0.95 };
        break;
      case 'left-sleeve':
        design_url = leftSleeveDesign || '';
        baseConfig.design_position = { placement: 'left-sleeve', x: 0.05, y: 0.25, scale: 0.4 };
        break;
      case 'right-sleeve':
        design_url = rightSleeveDesign || '';
        baseConfig.design_position = { placement: 'right-sleeve', x: 0.05, y: 0.25, scale: 0.4 };
        break;
    }

    return { ...baseConfig, design_url };
  }, [garmentType, garmentColor, fabricType, frontDesign, backDesign, leftSleeveDesign, rightSleeveDesign, designPlacement]);

  // Create full-body model geometry
  const modelGeometry = useMemo(() => {
    const group = new THREE.Group();
    
    // Body (torso)
    const bodyGeometry = new THREE.CylinderGeometry(0.8, 0.9, 2.5, 12);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: '#fdbcb4',
      roughness: 0.8,
      metalness: 0.1
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    group.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ 
      color: '#fdbcb4',
      roughness: 0.8,
      metalness: 0.1
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.2;
    group.add(head);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.15, 0.18, 1.8, 8);
    const armMaterial = new THREE.MeshStandardMaterial({ 
      color: '#fdbcb4',
      roughness: 0.8,
      metalness: 0.1
    });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-1.1, 0.8, 0);
    leftArm.rotation.z = 0.3;
    group.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(1.1, 0.8, 0);
    rightArm.rotation.z = -0.3;
    group.add(rightArm);

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.2, 0.25, 2, 8);
    const legMaterial = new THREE.MeshStandardMaterial({ 
      color: '#fdbcb4',
      roughness: 0.8,
      metalness: 0.1
    });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.3, -1.5, 0);
    group.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.3, -1.5, 0);
    group.add(rightLeg);

    // Garment overlay
    const garmentColor = modelConfig.fabric_texture.includes('black') ? '#1f2937' :
                        modelConfig.fabric_texture.includes('white') ? '#ffffff' :
                        modelConfig.fabric_texture.includes('olive') ? '#6b7280' : '#f3f4f6';

    if (garmentType === 'tshirt' || garmentType === 'hoodie') {
      const shirtGeometry = new THREE.CylinderGeometry(0.85, 0.95, 1.8, 12);
      const shirtMaterial = new THREE.MeshStandardMaterial({ 
        color: garmentColor,
        roughness: 0.7,
        metalness: 0.1,
        transparent: true,
        opacity: 0.9
      });
      const shirt = new THREE.Mesh(shirtGeometry, shirtMaterial);
      shirt.position.y = 0.8;
      group.add(shirt);

      // Sleeves
      const sleeveGeometry = new THREE.CylinderGeometry(0.18, 0.22, 1.2, 8);
      const sleeveMaterial = new THREE.MeshStandardMaterial({ 
        color: garmentColor,
        roughness: 0.7,
        metalness: 0.1,
        transparent: true,
        opacity: 0.9
      });
      
      const leftSleeve = new THREE.Mesh(sleeveGeometry, sleeveMaterial);
      leftSleeve.position.set(-1.1, 1.1, 0);
      leftSleeve.rotation.z = 0.3;
      group.add(leftSleeve);
      
      const rightSleeve = new THREE.Mesh(sleeveGeometry, sleeveMaterial);
      rightSleeve.position.set(1.1, 1.1, 0);
      rightSleeve.rotation.z = -0.3;
      group.add(rightSleeve);

      if (garmentType === 'hoodie') {
        // Hood
        const hoodGeometry = new THREE.SphereGeometry(0.5, 16, 8, 0, Math.PI);
        const hoodMaterial = new THREE.MeshStandardMaterial({ 
          color: garmentColor,
          roughness: 0.7,
          metalness: 0.1,
          transparent: true,
          opacity: 0.9
        });
        const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);
        hood.position.set(0, 2.2, -0.2);
        group.add(hood);
      }
    }

    if (garmentType === 'pants') {
      const pantsGeometry = new THREE.CylinderGeometry(0.9, 0.3, 2.2, 8);
      const pantsMaterial = new THREE.MeshStandardMaterial({ 
        color: garmentColor,
        roughness: 0.8,
        metalness: 0.1,
        transparent: true,
        opacity: 0.9
      });
      const pants = new THREE.Mesh(pantsGeometry, pantsMaterial);
      pants.position.y = -1.2;
      group.add(pants);
    }

    return group;
  }, [garmentType, modelConfig.fabric_texture]);

  // Design texture
  const designTexture = useMemo(() => {
    if (!modelConfig.design_url) return null;
    
    const loader = new THREE.TextureLoader();
    const texture = loader.load(modelConfig.design_url);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, [modelConfig.design_url]);

  // Design overlay
  const designOverlay = useMemo(() => {
    if (!designTexture) return null;

    const { x, y, scale } = modelConfig.design_position;
    const geometry = new THREE.PlaneGeometry(0.8 * scale, 0.8 * scale);
    const material = new THREE.MeshBasicMaterial({ 
      map: designTexture, 
      transparent: true,
      alphaTest: 0.1
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // Position based on placement
    switch (designPlacement) {
      case 'front':
        mesh.position.set(x - 0.12, y + 0.5, 0.86);
        break;
      case 'back':
        mesh.position.set(x - 0.12, y + 0.5, -0.86);
        mesh.rotation.y = Math.PI;
        break;
      case 'left-sleeve':
        mesh.position.set(-1.1, y + 0.8, 0.2);
        mesh.rotation.y = -Math.PI / 2;
        mesh.scale.setScalar(0.5);
        break;
      case 'right-sleeve':
        mesh.position.set(1.1, y + 0.8, 0.2);
        mesh.rotation.y = Math.PI / 2;
        mesh.scale.setScalar(0.5);
        break;
    }
    
    return mesh;
  }, [designTexture, modelConfig.design_position, designPlacement]);

  return (
    <group ref={meshRef}>
      <primitive object={modelGeometry} />
      {designOverlay && <primitive object={designOverlay} />}
    </group>
  );
};

const FullBodyMockup = ({
  garmentType = 'tshirt',
  garmentColor = '#ffffff',
  fabricType = 'cotton',
  frontDesign,
  backDesign,
  leftSleeveDesign,
  rightSleeveDesign,
  designPlacement = 'front',
  className = '',
  onConfigChange
}) => {
  const [cameraView, setCameraView] = useState('front');
  const [isRotating, setIsRotating] = useState(false);
  const canvasRef = useRef(null);

  // Generate and emit configuration
  useEffect(() => {
    const config = {
      model_url: `/models/fullbody_${garmentType}_${garmentColor.toLowerCase()}.glb`,
      fabric_texture: `/textures/${fabricType}_${garmentColor.toLowerCase()}.jpg`,
      design_url: designPlacement === 'front' ? frontDesign :
                  designPlacement === 'back' ? backDesign :
                  designPlacement === 'left-sleeve' ? leftSleeveDesign :
                  designPlacement === 'right-sleeve' ? rightSleeveDesign : '',
      design_position: {
        placement: designPlacement,
        x: designPlacement.includes('sleeve') ? 0.05 : 0.12,
        y: designPlacement.includes('sleeve') ? 0.25 : 0.18,
        scale: designPlacement.includes('sleeve') ? 0.4 : 0.95
      },
      camera_views: {
        default: "front",
        options: {
          front: { angle: [0, 0, 5], zoom: 1.2 },
          top: { angle: [-30, 0, 0], zoom: 1.1 },
          back: { angle: [0, 180, 0], zoom: 1.2 }
        }
      },
      rotation_enabled: true,
      zoom_enabled: true,
      background_color: "#f8fafc"
    };

    if (onConfigChange) {
      onConfigChange(config);
    }
  }, [garmentType, garmentColor, fabricType, frontDesign, backDesign, leftSleeveDesign, rightSleeveDesign, designPlacement, onConfigChange]);

  const handleCameraChange = (view) => {
    setCameraView(view);
  };

  const handleToggleRotation = () => {
    setIsRotating(!isRotating);
  };

  const handleSnapshot = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `monofit-preview-${Date.now()}.png`;
      link.href = dataURL;
      link.click();
    }
  };

  return (
    <div className={`relative w-full h-full min-h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden ${className}`}>
      {/* Camera Controls */}
      <div className="absolute top-4 left-4 z-10 flex space-x-2">
        {['front', 'top', 'back'].map((view) => (
          <motion.button
            key={view}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCameraChange(view)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              cameraView === view
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white/80 text-gray-700 hover:bg-white backdrop-blur-sm'
            }`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Action Controls */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggleRotation}
          className={`p-2 rounded-lg transition-colors ${
            isRotating
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-white/80 text-gray-700 hover:bg-white backdrop-blur-sm'
          }`}
          title="Toggle Auto Rotation"
        >
          <RotateCcw className="h-4 w-4" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSnapshot}
          className="p-2 bg-white/80 text-gray-700 hover:bg-white backdrop-blur-sm rounded-lg transition-colors"
          title="Take Snapshot"
        >
          <Camera className="h-4 w-4" />
        </motion.button>
      </div>

      {/* View Indicator */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg">
          <div className="flex items-center space-x-2 text-sm">
            <Eye className="h-4 w-4 text-purple-600" />
            <span className="font-medium text-gray-700 capitalize">{cameraView} View</span>
          </div>
        </div>
      </div>

      {/* Design Placement Indicator */}
      {(frontDesign || backDesign || leftSleeveDesign || rightSleeveDesign) && (
        <div className="absolute bottom-4 right-4 z-10">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <span className="font-medium text-gray-700 capitalize">
                {designPlacement.replace('-', ' ')} Design
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 0, 5], fov: 50 }}
        shadows
        className="w-full h-full"
      >
        <PerspectiveCamera makeDefault position={
          cameraView === 'front' ? [0, 0, 5] :
          cameraView === 'top' ? [0, 5, 2] :
          [0, 0, -5]
        } />
        
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          enableRotate={!isRotating}
          minDistance={3}
          maxDistance={8}
          autoRotate={isRotating}
          autoRotateSpeed={2}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
        />
        
        {/* Lighting Setup */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />
        <pointLight position={[0, 5, 0]} intensity={0.5} />
        
        {/* Environment */}
        <Environment preset="studio" />
        
        {/* Model */}
        <FullBodyModel 
          garmentType={garmentType}
          garmentColor={garmentColor}
          fabricType={fabricType}
          frontDesign={frontDesign}
          backDesign={backDesign}
          leftSleeveDesign={leftSleeveDesign}
          rightSleeveDesign={rightSleeveDesign}
          designPlacement={designPlacement}
          cameraView={cameraView}
        />
        
        {/* Ground Shadow */}
        <ContactShadows 
          position={[0, -2.5, 0]} 
          opacity={0.3} 
          scale={5} 
          blur={2} 
          far={2.5} 
        />
        
        {/* Background */}
        <mesh position={[0, 0, -8]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      </Canvas>

      {/* Loading Overlay */}
      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center pointer-events-none opacity-0 transition-opacity duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading 3D Model...</p>
        </div>
      </div>
    </div>
  );
};

export default FullBodyMockup;