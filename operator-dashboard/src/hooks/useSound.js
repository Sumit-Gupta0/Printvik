import { useEffect, useRef } from 'react';

const useSound = (soundUrl) => {
    const audioRef = useRef(null);

    useEffect(() => {
        audioRef.current = new Audio(soundUrl);
        audioRef.current.preload = 'auto';
    }, [soundUrl]);

    const play = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log('Audio play failed:', e));
        }
    };

    return { play };
};

export default useSound;
