export const materials = {
    wood: {
        id: 'wood',
        name: 'Wood',
        description: 'A hard, fibrous material from trees.',
        properties: {
            strength: 7, // 0-10
            flexibility: 3, // 0-10
            buoyancy: true, // floats
            waterproof: false, // absorbs water eventually, but for P3 context usually considered "not waterproof" or "absorbent" depending on finish. Let's stick to raw wood -> absorbent/not waterproof.
            transparency: 'opaque', // opaque, translucent, transparent
        },
        color: '#8B4513',
        texture: 'wood-grain'
    },
    metal: {
        id: 'metal',
        name: 'Metal',
        description: 'A solid material that is typically hard, shiny, malleable, fusible, and ductile.',
        properties: {
            strength: 10,
            flexibility: 2, // some metals bend, but generally rigid in this context
            buoyancy: false, // sinks
            waterproof: true,
            transparency: 'opaque',
        },
        color: '#C0C0C0',
        texture: 'metallic'
    },
    ceramic: {
        id: 'ceramic',
        name: 'Ceramic',
        description: 'A brittle material made by firing clay.',
        properties: {
            strength: 5, // hard but brittle
            flexibility: 0,
            buoyancy: false,
            waterproof: true, // glazed ceramic is waterproof
            transparency: 'opaque',
        },
        color: '#E0E0E0',
        texture: 'smooth'
    },
    rubber: {
        id: 'rubber',
        name: 'Rubber',
        description: 'A tough elastic polymeric substance.',
        properties: {
            strength: 6,
            flexibility: 10,
            buoyancy: true,
            waterproof: true,
            transparency: 'opaque',
        },
        color: '#333333',
        texture: 'matte'
    },
    glass: {
        id: 'glass',
        name: 'Glass',
        description: 'A hard, brittle substance, typically transparent.',
        properties: {
            strength: 4, // brittle
            flexibility: 0,
            buoyancy: false,
            waterproof: true,
            transparency: 'transparent',
        },
        color: 'rgba(200, 230, 255, 0.5)',
        texture: 'glassy'
    },
    plastic: {
        id: 'plastic',
        name: 'Plastic',
        description: 'A synthetic material made from a wide range of organic polymers.',
        properties: {
            strength: 6,
            flexibility: 7, // varies, but generally flexible
            buoyancy: true,
            waterproof: true,
            transparency: 'translucent', // varies, but let's use translucent for variety or make it selectable. Let's go with transparent/translucent.
        },
        color: '#FF6B6B',
        texture: 'smooth'
    },
    fabric: {
        id: 'fabric',
        name: 'Fabric',
        description: 'Cloth or other material produced by weaving or knitting fibers.',
        properties: {
            strength: 3, // tears
            flexibility: 10,
            buoyancy: true, // usually floats initially then sinks if absorbs? For P3, usually "absorbent" and "floats" (light).
            waterproof: false,
            transparency: 'opaque', // or translucent depending on weave.
        },
        color: '#4ECDC4',
        texture: 'fabric'
    }
};
