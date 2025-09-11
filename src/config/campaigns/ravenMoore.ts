import { Mission, CampaignRoom } from '../../types';

export const RAVEN_MOORE_CAMPAIGN_ID = 'raven_moore';

export const ravenMooreMissions: Mission[] = [
    {
        id: 'rm_act_1',
        name: 'Act I: The Abandoned Wing',
        description: "Dr. Archie Moore organized an escape, leading dangerous patients into the asylum's long-sealed wing. Your first task is to breach the wing and map out the situation. Expect resistance from the remaining lunatics.",
        difficulty: 'Low',
        length: 'short',
        reward: 500,
        campaignId: RAVEN_MOORE_CAMPAIGN_ID,
        actNumber: 1,
        objective: 'Explore 70% of the abandoned wing.'
    },
    {
        id: 'rm_act_2',
        name: 'Act II: A Trail of Madness',
        description: 'The wing is a maze of despair, but Moore left a trail. His obsession is our guide. Find any notes, patient files, or strange objects he may have been studying before his own descent.',
        difficulty: 'Low',
        length: 'medium',
        reward: 750,
        campaignId: RAVEN_MOORE_CAMPAIGN_ID,
        actNumber: 2,
        objective: "Gather 4 pieces of evidence of Moore's activities."
    },
    {
        id: 'rm_act_3',
        name: "Act III: The Doctor's Diary",
        description: "Whispers and strange symbols are becoming more frequent. Moore's personal office should hold the key. We need his diary to understand what he's become... or what he's becoming.",
        difficulty: 'Medium',
        length: 'medium',
        reward: 1250,
        campaignId: RAVEN_MOORE_CAMPAIGN_ID,
        actNumber: 3,
        objective: "Find Dr. Moore's personal diary."
    },
    {
        id: 'rm_act_4',
        name: 'Act IV: The Ritual Chamber',
        description: "The diary spoke of a ritual and a sacrifice. The kidnapped nurse is in imminent danger. The asylum's sterile halls have twisted into a profane temple. Find her before it's too late.",
        difficulty: 'Medium',
        length: 'long',
        reward: 2000,
        campaignId: RAVEN_MOORE_CAMPAIGN_ID,
        actNumber: 4,
        objective: 'Rescue the kidnapped nurse.'
    },
    {
        id: 'rm_act_5',
        name: 'Act V: The Raven Priest',
        description: "Moore is no longer a man. He has become a vessel for the voice from beyond the stars. He must be stopped, or the entire asylum will become a gateway for something far worse than madness.",
        difficulty: 'High',
        length: 'long',
        reward: 5000,
        campaignId: RAVEN_MOORE_CAMPAIGN_ID,
        actNumber: 5,
        objective: 'Confront and defeat Archie Moore.'
    },
];

export const ravenMooreRooms: CampaignRoom[] = [
    // Neutral / Common Rooms (Acts 1-5)
    { id: 'rm_room_main_corridor', name: 'Main Corridor', description: 'A long, dark corridor. The walls are covered in scratches and unsettling stains. The silence is heavy.', acts: [1,2,3,4,5], type: 'neutral', roomContentType: null },
    { id: 'rm_room_patient_cell', name: 'Patient Cell', description: 'A small, padded room with a single cot bolted to the floor. A discarded straitjacket lies in the corner.', acts: [1,2,3], type: 'neutral', roomContentType: 'curio' },
    { id: 'rm_room_medical_storage', name: 'Medical Storage', description: 'Shelves are lined with dusty vials, yellowed bandages, and strange chemicals. A faint smell of formaldehyde hangs in the air.', acts: [1,2,3,4], type: 'neutral', roomContentType: 'treasure' },

    // Act 1-2 Specific Rooms (Human Insanity)
    { id: 'rm_room_hydrotherapy', name: 'Hydrotherapy Room', description: 'A large, rusted bathtub sits in the center, filled with murky, brown water. The air is thick with the smell of mold and decay.', acts: [1], type: 'special', roomContentType: 'curio', backgroundImage: 'https://i.ibb.co/zTqFXJmG/T-o1.png' },
    { id: 'rm_room_nurses_station', name: "Nurses' Station", description: 'An overturned desk, scattered papers, and a smashed lantern. A logbook lies open, the last entry ending in a frantic scribble.', acts: [1,2], type: 'special', roomContentType: 'curio' },
    { id: 'rm_room_records_archive', name: 'Records Archive', description: 'Piles of water-damaged patient files fill this room. Many are burned or torn, but some might still be legible.', acts: [2], type: 'special', roomContentType: 'treasure' },
    { id: 'rm_room_patient_washroom', name: "Patients' Washroom", description: 'The mirrors are shattered. The walls are covered in frantic, looping text: "THEY ARE WATCHING". The words seem to pulse in the dim light.', acts: [2], type: 'special', roomContentType: 'curio' },
    { id: 'rm_room_emergency_stairs', name: 'Emergency Stairwell', description: 'The door to this stairwell is barely hanging on its hinges, blocked by a pile of debris. Something has been scratching at the other side.', acts: [1,2], type: 'special', roomContentType: 'encounter' },

    // Act 3 Specific Rooms (First Supernatural Signs)
    { id: 'rm_room_moore_office', name: "Doctor Moore's Office", description: "This room is a shrine to madness. Astronomical charts cover every surface, and hundreds of charcoal sketches of ravens are pinned to the walls. His diary lies on the desk.", acts: [3], type: 'special', roomContentType: 'exit' },
    { id: 'rm_room_operating_theater', name: 'Operating Theater', description: 'A single operating table sits under a flickering lamp. The floor is stained with something dark, and scattered among the rusted tools are black feathers.', acts: [3], type: 'special', roomContentType: 'encounter' },
    { id: 'rm_room_asylum_roof', name: 'Asylum Roof', description: 'The wind howls across the crumbling rooftop. In the distance, a lone raven watches you before taking flight into the stormy sky.', acts: [3], type: 'special', roomContentType: 'curio' },

    // Act 4 Specific Rooms (Full Supernatural Reveal)
    { id: 'rm_room_ritual_cell', name: 'Ritual Cell', description: 'The walls of this large cell are covered in spiraling symbols painted in blood. In the center, the kidnapped nurse is tied to a chair, surrounded by a circle of raven feathers.', acts: [4], type: 'special', roomContentType: 'exit' },
    { id: 'rm_room_raven_corridor', name: 'Corridor of Ravens', description: 'Hundreds of ravens perch in the rafters of this hallway. As you enter, they all turn their heads in unison, watching your every move with intelligent, unsettling eyes.', acts: [4], type: 'special', roomContentType: 'encounter' },
    { id: 'rm_room_patient_shrine', name: "Patients' Shrine", description: 'The escaped patients have built a crude altar from bones, bedframes, and the corpses of birds. It seems to hum with a malevolent energy.', acts: [4], type: 'special', roomContentType: 'encounter' },
    { id: 'rm_room_mutation_ward', name: 'Mutation Ward', description: 'In this ward, patients have begun to change. Black feathers sprout from their skin, and their limbs twist into unnatural shapes. They are no longer human.', acts: [4], type: 'special', roomContentType: 'encounter' },

    // Act 5 Specific Rooms (Boss Arena)
    { id: 'rm_room_final_ritual_chamber', name: 'Grand Ritual Chamber', description: "In the asylum's central chamber, a swirling vortex of energy opens towards a sky filled with alien stars. Before it stands what was once Dr. Moore, now a priest to the chaos beyond.", acts: [5], type: 'boss', roomContentType: 'exit' },

    // Trap Rooms (Possible throughout)
    { id: 'rm_room_tool_closet', name: 'Tool Closet', description: 'A cramped closet filled with rusted gardening tools and maintenance supplies. A loose floorboard catches your eye.', acts: [1,2,3,4], type: 'trap', roomContentType: 'curio' },
    { id: 'rm_room_collapsed_hallway', name: 'Collapsed Hallway', description: 'The ceiling of this corridor has caved in, forcing you to find another way around or risk climbing through the unstable rubble.', acts: [1,2,3,4], type: 'trap', roomContentType: 'curio' },
    { id: 'rm_room_ventilation_room', name: 'Ventilation Room', description: 'The humming of the asylum\'s ancient ventilation system fills the air. Strange whispers seem to echo from the vents.', acts: [1,2,3,4], type: 'trap', roomContentType: 'curio' },
    { id: 'rm_room_sanitation_closet', name: 'Sanitation Closet', description: 'The overwhelming stench of ammonia and other cleaning chemicals burns your nostrils. Spilled liquids cover the floor.', acts: [1,2,3,4], type: 'trap', roomContentType: 'curio' },
];