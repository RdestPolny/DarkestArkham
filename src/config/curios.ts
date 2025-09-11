import { Curio } from '../types';

export const CURIOS_LIST: Curio[] = [
    {
        id: 'chest_decrepit',
        name: 'Decrepit Chest',
        description: 'An old, iron-bound chest. It might hold forgotten treasures, or just dust.',
        outcomes: [
            {
                chance: 0.5,
                description: "It's empty. The hinges groan in disappointment.",
                effects: []
            },
            {
                chance: 0.4,
                description: 'You find a lesser trinket, tarnished but functional.',
                effects: [{ type: 'item', itemType: 'trinket_low' }]
            },
            {
                chance: 0.1,
                description: 'A trove! You find a valuable trinket and a handful of gold!',
                effects: [{ type: 'item', itemType: 'trinket_high' }, { type: 'gold', amount: 150 }]
            }
        ]
    },
    {
        id: 'altar_eldritch',
        name: 'Eldritch Altar',
        description: 'A stone altar covered in unsettling runes and old, dark stains.',
        outcomes: [
            {
                chance: 0.5,
                description: 'A wave of nausea overcomes them. The mind recoils!',
                effects: [{ type: 'damage_stress', amount: 20 }]
            },
            {
                chance: 0.3,
                description: 'A strange calm washes over them, pushing back the dread.',
                effects: [{ type: 'heal_stress', amount: 15 }]
            },
            {
                chance: 0.2,
                description: 'The runes glow, imbuing them with unnatural vigor.',
                effects: [{ type: 'apply_status', status: { type: 'buff', stat: 'damage', duration: 3, potency: 5 } }]
            }
        ]
    },
    {
        id: 'bookshelf_dusty',
        name: 'Dusty Bookshelf',
        description: 'Tomes bound in strange leather line this shelf. Knowledge and madness are often intertwined.',
        outcomes: [
            {
                chance: 0.4,
                description: 'The texts are rambling and incoherent, a waste of time.',
                effects: []
            },
            {
                chance: 0.4,
                description: 'They glean a moment of insight from a cryptic passage!',
                effects: [{ type: 'apply_status', status: { type: 'buff', stat: 'wisdom', duration: 3, potency: 10 } }]
            },
            {
                chance: 0.2,
                description: 'The forbidden knowledge within is too much to bear!',
                effects: [{ type: 'damage_stress', amount: 15 }]
            }
        ]
    },
    {
        id: 'bones_pile',
        name: 'Pile of Bones',
        description: 'The skeletal remains of a less fortunate adventurer.',
        outcomes: [
            {
                chance: 0.6,
                description: 'Picked clean. There is nothing of value here.',
                effects: []
            },
            {
                chance: 0.3,
                description: 'They find a small pouch of gold clutched in a bony hand.',
                effects: [{ type: 'gold', amount: 75 }]
            },
            {
                chance: 0.1,
                description: 'Something stirs in the bones! A spectral hand lashes out!',
                effects: [{ type: 'damage_hp', amount: 10 }]
            }
        ]
    },
    {
        id: 'mirror_ornate',
        name: 'Ornate Mirror',
        description: 'A large, silver mirror. The reflection is not quite right.',
        outcomes: [
            {
                chance: 0.5,
                description: 'Their reflection stares back, mocking them. A chill runs down their spine.',
                effects: [{ type: 'damage_stress', amount: 5 }]
            },
            {
                chance: 0.3,
                description: 'Looking away, they feel strangely invigorated, their wounds seeming less severe.',
                effects: [{ type: 'heal_hp', amount: 10 }]
            },
            {
                chance: 0.2,
                description: 'Their reflection shimmers, showing a more agile, evasive form.',
                effects: [{ type: 'apply_status', status: { type: 'buff', stat: 'dodge', duration: 3, potency: 15 } }]
            }
        ]
    }
];

export const CURIOS_MAP = CURIOS_LIST.reduce((acc, curio) => {
    acc[curio.id] = curio;
    return acc;
}, {} as Record<string, Curio>);
