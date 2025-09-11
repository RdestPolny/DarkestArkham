import React from 'react';
import { Enemy } from '../../types';

interface EnemySpriteProps {
    enemy: Enemy;
}

export const EnemySprite: React.FC<EnemySpriteProps> = ({ enemy }) => {
    return (
        <div 
            title={enemy.name}
            className="w-32 h-48 bg-stone-900/80 border-2 border-red-500/50 shadow-lg shadow-black/50 
                       relative transition-all duration-300 hover:scale-105 hover:border-red-400 enemy-sprite"
            style={{
                clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)'
            }}
        >
           <div className="absolute inset-0 bg-gradient-to-t from-red-900/40 to-transparent flex items-center justify-center">
                <p className="text-4xl text-red-300/50">?</p>
           </div>
           <div className="absolute bottom-2 left-0 right-0 text-center text-sm text-white font-cinzel truncate bg-black/60 px-2 py-1">
               {enemy.name}
           </div>
        </div>
    );
};
