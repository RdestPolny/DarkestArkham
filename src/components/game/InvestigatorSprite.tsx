import React from 'react';
import { Hero } from '../../types';

interface InvestigatorSpriteProps {
    hero: Hero;
}

// Use the provided PNG sprite for the Private Detective class
const classSprites: { [key: string]: string } = {
    'Private Detective': 'https://i.ibb.co/wZJkscCD/Det-sprite.png'
};


export const InvestigatorSprite: React.FC<InvestigatorSpriteProps> = ({ hero }) => {
    const spriteUrl = classSprites[hero.heroClass];
    
    const baseClasses = "w-28 h-56 bg-stone-900/80 border-2 shadow-lg shadow-black/50 relative transition-all duration-300 hover:scale-105";
    const clipPathStyle = { clipPath: 'polygon(50% 0%, 85% 10%, 100% 30%, 100% 100%, 0 100%, 0 30%, 15% 10%)' };

    // Render specific sprite if available
    if (spriteUrl) {
        return (
            <div
                title={hero.name}
                className={`${baseClasses} border-cyan-300/50 hover:border-cyan-200`}
                style={clipPathStyle}
            >
                <div
                    className="absolute inset-0 bg-no-repeat"
                    style={{
                        backgroundImage: `url('${spriteUrl}')`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center bottom'
                    }}
                ></div>
                <div className="absolute bottom-2 left-0 right-0 text-center text-sm text-white font-cinzel truncate bg-black/60 px-2 py-1">
                    {hero.name}
                </div>
            </div>
        );
    }

    // Fallback for other classes
    return (
        <div 
            title={hero.name}
            className={`${baseClasses} border-cyan-300/50 hover:border-cyan-200`}
            style={clipPathStyle}
        >
           <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/30 to-transparent"></div>
           <div className="absolute bottom-2 left-0 right-0 text-center text-sm text-white font-cinzel truncate bg-black/60 px-2 py-1">
               {hero.name}
           </div>
        </div>
    );
};
