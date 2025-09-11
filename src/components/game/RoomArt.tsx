import React from 'react';
import { DungeonNode } from '../../types';

export const RoomArt: React.FC<{ node: DungeonNode }> = ({ node }) => {
    const seed = node.id.replace(/[^a-zA-Z0-9]/g, '');
    let imageUrl = node.backgroundImage || `https://picsum.photos/seed/${seed}/800/400`;
    let filter = 'brightness-50';

    if (node.roomType === 'treasure') {
        filter = 'brightness-75 sepia-[.5]';
    } else if (node.roomType === 'encounter') {
        filter = 'brightness-40 contrast-125';
    }

    return (
        <div className="w-full h-full bg-cover bg-center border-4 border-stone-800 shadow-inner shadow-black" style={{backgroundImage: `url('${imageUrl}')`}}>
            <div className={`w-full h-full ${filter}`}></div>
        </div>
    );
};