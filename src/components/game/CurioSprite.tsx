import React from 'react';
import { Curio } from '../../types';

interface CurioSpriteProps {
    curio: Curio;
}

export const CurioSprite: React.FC<CurioSpriteProps> = ({ curio }) => {
    return (
        <div 
            title={curio.name}
            className="w-24 h-32 bg-stone-900/80 border-2 border-amber-500/50 shadow-lg shadow-black/50 
                       relative transition-all duration-300 hover:scale-105 hover:border-amber-400 curio-sprite"
            style={{
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
            }}
        >
           <div className="absolute inset-0 bg-gradient-to-t from-amber-900/40 to-transparent flex items-center justify-center">
                <p className="text-4xl text-amber-300/50">?</p>
           </div>
           <div className="absolute bottom-1 left-0 right-0 text-center text-xs text-white font-cinzel truncate bg-black/60 px-2 py-1">
               {curio.name}
           </div>
        </div>
    );
};
