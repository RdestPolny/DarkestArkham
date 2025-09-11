import { Hero, Mission, DungeonMap, Item, HeroAttributes, DungeonNode, CampaignRoom } from '../types';
// FIX: Added LEVEL_XP_REQUIREMENTS to import to provide missing properties for generated heroes.
import { HERO_CLASSES, CLASS_DETAILS, LEVEL_XP_REQUIREMENTS } from '../config/constants';
import { CURIOS_LIST } from '../config/curios';
import { ravenMooreMissions, ravenMooreRooms, RAVEN_MOORE_CAMPAIGN_ID } from '../config/campaigns/ravenMoore';

// Fisher-Yates shuffle algorithm
const shuffleArray = <T>(array: T[]): T[] => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};

const GENERIC_ROOM_DESCRIPTIONS = [
    'A grand ballroom, its chandelier thick with cobwebs. A palpable sense of decay hangs in the air.',
    'A dusty library, where books with leathery covers crumble to dust at the slightest touch. Whispers seem to emanate from the shelves.',
    'The master bedroom, dominated by a large four-poster bed with tattered curtains. A faint, sweet smell of rot lingers here.',
    'A cramped kitchen, utensils rusted and coated in a strange grime. Something scuttles in the walls.',
    'A forgotten study, littered with esoteric texts and strange astronomical charts. A single, guttering candle provides the only light.',
    'A child\'s nursery, where a lone rocking horse sways gently on its own. The wallpaper depicts unsettling fairy tales.',
];

const GENERIC_CORRIDOR_DESCRIPTIONS = [
    'A short, dust-choked hallway. Portraits with gouged-out eyes watch your every move.',
    'A long, narrow passage where the air is unnaturally cold. Your footsteps echo loudly.',
    'The passage is slick with an unnatural slime, making every step treacherous.',
    'A twisting corridor that seems to defy the building\'s architecture. Shadows dance just at the edge of your vision.',
];

const generateMockHeroes = (count: number): Hero[] => {
    return Array.from({ length: count }, (_, i) => {
        const heroClass = HERO_CLASSES[i % HERO_CLASSES.length];
        const classDetails = CLASS_DETAILS[heroClass];
        const skills = shuffleArray([...classDetails.skillPool]).slice(0, 4);

        return {
            id: `mock-hero-${Date.now()}-${i}`,
            name: `Mock Investigator ${i + 1}`,
            heroClass: heroClass,
            level: 1,
            // FIX: Added missing properties to conform to the Hero type.
            xp: 0,
            xpToNextLevel: LEVEL_XP_REQUIREMENTS[1],
            hp: 25,
            maxHp: 25,
            stress: 0,
            maxStress: 100,
            backstory: 'Drawn to Arkham by whispers of the occult, this individual seeks answers best left unfound.',
            ...classDetails.baseStats,
            skills: skills,
            items: [null, null, null],
            statusEffects: [],
        };
    });
};

const generateMockItems = (count: number): Item[] => {
    return Array.from({ length: count}, (_, i) => {
        const effects: Partial<Record<keyof HeroAttributes, number>> = {};
        const attributes: (keyof HeroAttributes)[] = ['damage', 'defense', 'dodge', 'critChance', 'perception', 'wisdom'];
        const randomAttr = attributes[Math.floor(Math.random() * attributes.length)];
        effects[randomAttr] = Math.floor(Math.random() * 3) + 1; // Add +1 to +3 of a random stat

        return {
            id: `mock-item-${Date.now()}-${i}`,
            name: `Mysterious Artifact ${i+1}`,
            slot: 'trinket',
            description: 'An object of unknown origin, humming with a faint, unsettling energy.',
            effects: effects,
            cost: 100 + Math.floor(Math.random() * 150),
        };
    });
};

export const generateHeroes = (count: number): Hero[] => {
    return generateMockHeroes(count);
};

export const generateMissions = (): Mission[] => {
    return ravenMooreMissions;
};

export const generateItems = (count: number): Item[] => {
    return generateMockItems(count);
};

const getRoomsForAct = (campaignId: string | undefined, act: number | undefined): { rooms: CampaignRoom[], corridors: CampaignRoom[] } => {
    if (campaignId === RAVEN_MOORE_CAMPAIGN_ID && act !== undefined) {
        const allValidRooms = ravenMooreRooms.filter(room => room.acts.includes(act));
        return {
            rooms: allValidRooms.filter(r => !r.name.toLowerCase().includes('corridor')),
            corridors: allValidRooms.filter(r => r.name.toLowerCase().includes('corridor')),
        };
    }
    // Fallback to generic descriptions
    const mapToCampaignRoom = (desc: string, type: 'room' | 'corridor'): CampaignRoom => ({
        id: `generic_${type}`, name: 'Generic Room', description: desc, acts: [], type: 'neutral', roomContentType: null
    });
    return {
        rooms: GENERIC_ROOM_DESCRIPTIONS.map(d => mapToCampaignRoom(d, 'room')),
        corridors: GENERIC_CORRIDOR_DESCRIPTIONS.map(d => mapToCampaignRoom(d, 'corridor')),
    };
};

export const generateDungeon = (difficulty: 'Low' | 'Medium' | 'High', mission: Mission): DungeonMap => {
    const map: DungeonMap = {};
    let nodeIdCounter = 0;

    // 1. Determine target room count based on mission length
    const lengthSettings = {
        short: { count: 8 + Math.floor(Math.random() * 3), encounters: 2, treasures: 1 },  // 8-10 rooms
        medium: { count: 15 + Math.floor(Math.random() * 4), encounters: 4, treasures: 2 }, // 15-18 rooms
        long: { count: 19 + Math.floor(Math.random() * 7), encounters: 7, treasures: 3 }, // 19-25 rooms
    };
    const { count: targetRoomCount, encounters, treasures } = lengthSettings[mission.length];
    
    // 2. Get available room templates for the current act
    const { rooms: campaignRooms, corridors: campaignCorridors } = getRoomsForAct(mission?.campaignId, mission?.actNumber);

    const allRoomNodes: DungeonNode[] = [];
    
    // Helper to create nodes
    const createNode = (type: 'room' | 'corridor', roomType: DungeonNode['roomType'] = null): DungeonNode => {
        const id = `${type}-${nodeIdCounter++}`;
        
        let sourcePool = type === 'room' ? campaignRooms : campaignCorridors;
        if (sourcePool.length === 0) { // Fallback to generic if no campaign rooms
             const genericDescriptions = type === 'room' ? GENERIC_ROOM_DESCRIPTIONS : GENERIC_CORRIDOR_DESCRIPTIONS;
             const description = genericDescriptions[Math.floor(Math.random() * genericDescriptions.length)];
             return { id, type, roomType, description, exits: {} };
        }

        const roomTemplate = sourcePool[Math.floor(Math.random() * sourcePool.length)];
        const finalRoomType = roomTemplate.roomContentType || roomType;

        return { id, type, roomType: finalRoomType, description: roomTemplate.description, backgroundImage: roomTemplate.backgroundImage, exits: {} };
    };
    
    // Helper to link nodes
    const linkNodes = (from: DungeonNode, to: DungeonNode, fromDir: keyof DungeonNode['exits'], toDir: keyof DungeonNode['exits']) => {
        from.exits[fromDir] = to.id;
        to.exits[toDir] = from.id;
    };

    // 3. Build the map structure
    let startNode = createNode('room', 'start');
    startNode.id = 'start';
    startNode.description = 'The entrance to this forsaken place. The only way out is through.';
    map[startNode.id] = startNode;
    allRoomNodes.push(startNode);
    
    let growthPoints: DungeonNode[] = [startNode];

    while (allRoomNodes.length < targetRoomCount && growthPoints.length > 0) {
        let originNode = growthPoints[Math.floor(Math.random() * growthPoints.length)];

        const availableExits = (['up', 'down', 'left', 'right'] as const).filter(dir => !originNode.exits[dir]);
        
        if (availableExits.length === 0) {
            growthPoints = growthPoints.filter(n => n.id !== originNode.id); // No more room to grow from here
            continue;
        }

        const direction = availableExits[Math.floor(Math.random() * availableExits.length)];
        // FIX: Added 'as const' to ensure correct type inference for oppositeDir.
        const oppositeDir = ({ up: 'down', down: 'up', left: 'right', right: 'left' } as const)[direction];

        const corridor = createNode('corridor');
        const newRoom = createNode('room');
        map[corridor.id] = corridor;
        map[newRoom.id] = newRoom;
        
        linkNodes(originNode, corridor, direction, oppositeDir);
        linkNodes(corridor, newRoom, direction, oppositeDir);

        allRoomNodes.push(newRoom);
        growthPoints.push(newRoom);
    }
    
    // 4. Designate the exit room (furthest from start)
    const distances: { [key: string]: number } = {};
    // FIX: Correctly typed 'queue' as an array of tuples and initialized it as a nested array for pathfinding.
    const queue: [string, number][] = [['start', 0]];
    const visited = new Set<string>(['start']);
    let furthestNodeId = 'start';
    let maxDistance = 0;

    while (queue.length > 0) {
        const [currentId, distance] = queue.shift()!;
        distances[currentId] = distance;

        if (distance > maxDistance && map[currentId].type === 'room') {
            maxDistance = distance;
            furthestNodeId = currentId;
        }

        Object.values(map[currentId].exits).forEach(neighborId => {
            if (neighborId && !visited.has(neighborId)) {
                visited.add(neighborId);
                queue.push([neighborId, distance + 1]);
            }
        });
    }
    if (map[furthestNodeId] && map[furthestNodeId].type === 'room') {
        map[furthestNodeId].roomType = 'exit';
        map[furthestNodeId].description = 'The final chamber. Your objective is complete, and a path to safety is clear.';
    }

    // 5. Populate room content
    const contentRooms = allRoomNodes.filter(r => r.roomType !== 'start' && r.roomType !== 'exit');
    shuffleArray(contentRooms);
    
    let assignedEncounters = 0;
    let assignedTreasures = 0;

    contentRooms.forEach(room => {
        if (assignedEncounters < encounters) {
            room.roomType = 'encounter';
            assignedEncounters++;
        } else if (assignedTreasures < treasures) {
            room.roomType = 'treasure';
            assignedTreasures++;
        } else {
            room.roomType = 'curio';
        }
    });

    const curioRooms = allRoomNodes.filter(r => r.roomType === 'curio');
    const shuffledCurios = shuffleArray([...CURIOS_LIST]);
    curioRooms.forEach((room, index) => {
        room.curioId = shuffledCurios[index % shuffledCurios.length].id;
    });

    return map;
};