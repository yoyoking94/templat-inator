import { useState, useLayoutEffect } from 'react';
import { getInitialPosition, getMinimizedPosition } from '@/utils/windowPositions';

export interface WindowState {
    id: number;
    title: string;
    visible: boolean;
    zIndex: number;
    width: number;
    height: number;
    isMinimized: boolean;
}

const INITIAL_WINDOWS: WindowState[] = [
    { id: 1, title: 'A PROPOS DE MOI', visible: true, zIndex: 5, width: 500, height: 400, isMinimized: false },
    { id: 2, title: 'PARCOURS', visible: false, zIndex: 2, width: 450, height: 350, isMinimized: false },
    { id: 3, title: 'COMPETENCES', visible: false, zIndex: 3, width: 550, height: 380, isMinimized: false },
    { id: 4, title: 'PROJETS', visible: false, zIndex: 4, width: 600, height: 450, isMinimized: false },
    { id: 5, title: 'CONTACT', visible: false, zIndex: 1, width: 400, height: 300, isMinimized: false },
];

export const useWindowManager = () => {
    const [windows, setWindows] = useState<WindowState[]>(INITIAL_WINDOWS);
    const [maxZIndex, setMaxZIndex] = useState(5);
    const [globalMinimized, setGlobalMinimized] = useState(false);
    const [draggedWindowId, setDraggedWindowId] = useState<number | null>(null);
    const [showExpandHint, setShowExpandHint] = useState(false);
    const [screenSize, setScreenSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1200,
        height: typeof window !== 'undefined' ? window.innerHeight : 800,
    });

    useLayoutEffect(() => {
        const handleResize = () => {
            setScreenSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleWindow = (id: number) => {
        setWindows((prevWindows) =>
            prevWindows.map((w) => {
                if (w.id === id) {
                    if (!w.visible) {
                        const newZIndex = maxZIndex + 1;
                        setMaxZIndex(newZIndex);
                        return { ...w, visible: true, zIndex: newZIndex };
                    }
                    return { ...w, visible: false };
                }
                return w;
            })
        );
    };

    const closeWindow = (id: number) => {
        setWindows((prevWindows) =>
            prevWindows.map((w) => {
                if (w.id === id) {
                    if (globalMinimized && !w.isMinimized) {
                        return { ...w, isMinimized: true };
                    }
                    return { ...w, visible: false };
                }
                return w;
            })
        );
    };

    const handleWindowFocus = (id: number) => {
        const newZIndex = maxZIndex + 1;
        setMaxZIndex(newZIndex);
        setWindows((prevWindows) =>
            prevWindows.map((w) => (w.id === id ? { ...w, zIndex: newZIndex } : w))
        );
    };

    const toggleMinimizeAll = () => {
        setGlobalMinimized(!globalMinimized);
        setWindows((prevWindows) =>
            prevWindows.map((w) => ({ ...w, isMinimized: !globalMinimized }))
        );
    };

    const handleDragMove = (id: number, x: number, y: number) => {
        if (globalMinimized) {
            setDraggedWindowId(id);

            const draggedWindow = windows.find((w) => w.id === id);
            if (draggedWindow?.isMinimized) {
                const centerX = screenSize.width / 2;
                const centerY = screenSize.height / 2;
                const distanceFromCenter = Math.sqrt(
                    Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
                );

                if (distanceFromCenter < 800) {
                    setShowExpandHint(true);
                } else {
                    setShowExpandHint(false);
                }
            }
        } else {
            setShowExpandHint(false);
        }
    };

    const handleDragEnd = (id: number, x: number, y: number) => {
        setDraggedWindowId(null);

        if (globalMinimized && showExpandHint) {
            const centerX = screenSize.width / 2;
            const centerY = screenSize.height / 2;
            const distanceFromCenter = Math.sqrt(
                Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
            );

            if (distanceFromCenter < 400) {
                setWindows((prevWindows) =>
                    prevWindows.map((w) => {
                        if (w.id === id) {
                            const initialWindow = INITIAL_WINDOWS.find((iw) => iw.id === id);
                            const newWidth = (initialWindow?.width || 500) * 1.5;
                            const newHeight = (initialWindow?.height || 400) * 1.5;
                            return { ...w, isMinimized: false, width: newWidth, height: newHeight };
                        }
                        return w;
                    })
                );
            }

            setShowExpandHint(false);
        }
    };

    return {
        windows,
        globalMinimized,
        draggedWindowId,
        showExpandHint,
        screenSize,
        toggleWindow,
        closeWindow,
        handleWindowFocus,
        toggleMinimizeAll,
        handleDragMove,
        handleDragEnd,
        getInitialPosition: (id: number, windowW: number, windowH: number) =>
            getInitialPosition(id, windowW, windowH, screenSize),
        getMinimizedPosition,
    };
};
