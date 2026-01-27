import React, { useState, useLayoutEffect } from 'react';
import dynamic from 'next/dynamic';
import Section from '../section/Section';
import Nav from '@/components/common/nav/Nav';

const DragWindow = dynamic(
    () => import('@/components/layout/window/DragWindow'),
    {
        ssr: false,
        loading: () => <div>Chargement...</div>
    }
);

type Props = Record<string, never>;

interface WindowState {
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

const NAV_HEIGHT = 80;
const MINIMIZED_WIDTH = 200;
const MINIMIZED_HEIGHT = 60;
const MINIMIZED_MARGIN = 10;
const VERTICAL_OFFSET = 120; // Décalage vers le bas pour toutes les fenêtres

const Main = ({ }: Props) => {
    const [windows, setWindows] = useState([...INITIAL_WINDOWS]);
    const [maxZIndex, setMaxZIndex] = useState(5);
    const [globalMinimized, setGlobalMinimized] = useState(false);
    const [draggedWindowId, setDraggedWindowId] = useState<number | null>(null);
    const [showExpandHint, setShowExpandHint] = useState(false);
    const [screenSize, setScreenSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1200,
        height: typeof window !== 'undefined' ? window.innerHeight : 800
    });

    const getInitialPosition = (id: number, windowW: number, windowH: number) => {
        const screenWidth = screenSize.width;
        const screenHeight = screenSize.height;
        const margin = 20;
        const availableHeight = screenHeight - NAV_HEIGHT;

        if (screenWidth < 768) {
            const safeWidth = Math.min(windowW, screenWidth - 40);
            return {
                x: (screenWidth - safeWidth) / 2,
                y: Math.min(margin + (id - 1) * 80 + VERTICAL_OFFSET, availableHeight - windowH - margin),
                width: safeWidth,
                height: windowH
            };
        }

        let centerX = 0;
        let centerY = 0;

        if (id === 1) {
            centerX = screenWidth / 2;
            centerY = availableHeight / 2 + VERTICAL_OFFSET;
        } else if (id === 2) {
            centerX = margin + 250;
            centerY = margin + 175 + VERTICAL_OFFSET;
        } else if (id === 3) {
            centerX = screenWidth - margin - 250;
            centerY = margin + 175 + VERTICAL_OFFSET;
        } else if (id === 4) {
            centerX = margin + 300;
            centerY = availableHeight - 310 - margin + VERTICAL_OFFSET;
        } else if (id === 5) {
            centerX = screenWidth - margin - 200;
            centerY = availableHeight - 230 - margin + VERTICAL_OFFSET;
        }

        const x = Math.max(margin, Math.min(centerX - windowW / 2, screenWidth - windowW - margin));
        const y = Math.max(margin, Math.min(centerY - windowH / 2, availableHeight - windowH - margin));

        return { x, y, width: windowW, height: windowH };
    };

    const getMinimizedPosition = (index: number) => {
        return {
            x: MINIMIZED_MARGIN,
            y: NAV_HEIGHT + 60 + MINIMIZED_MARGIN + index * (MINIMIZED_HEIGHT + MINIMIZED_MARGIN), // Ajout de 60px pour baisser les fenêtres minimisées
            width: MINIMIZED_WIDTH,
            height: MINIMIZED_HEIGHT
        };
    };


    useLayoutEffect(() => {
        const handleResize = () => {
            setScreenSize({ width: window.innerWidth, height: window.innerHeight });
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
        setWindows(prevWindows =>
            prevWindows.map(w => {
                if (w.id === id) {
                    // Si on est en mode minimisé global et que la fenêtre était agrandie, on la minimise au lieu de la fermer
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
        setWindows(prevWindows =>
            prevWindows.map(w =>
                w.id === id ? { ...w, zIndex: newZIndex } : w
            )
        );
    };

    const toggleMinimizeAll = () => {
        setGlobalMinimized(!globalMinimized);
        setWindows(prevWindows =>
            prevWindows.map(w => ({
                ...w,
                isMinimized: !globalMinimized
            }))
        );
    };

    const handleDragMove = (id: number, x: number, y: number) => {
        if (globalMinimized) {
            // Définir quelle fenêtre est en train d'être draggée
            setDraggedWindowId(id);

            // Vérifier si la fenêtre est actuellement minimisée
            const draggedWindow = windows.find(w => w.id === id);

            if (draggedWindow?.isMinimized) {
                // Vérifier si on est dans la zone centrale
                const centerX = screenSize.width / 2;
                const centerY = screenSize.height / 2;
                const distanceFromCenter = Math.sqrt(
                    Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
                );

                // Afficher l'indicateur dès qu'on drag (zone très large)
                if (distanceFromCenter < 800) {
                    setShowExpandHint(true);
                } else {
                    setShowExpandHint(false);
                }

                // Mais agrandir seulement si on drop dans la zone restreinte (200px)
                // Cette vérification reste dans handleDragEnd
            } else {
                setShowExpandHint(false);
            }
        }
    };



    const handleDragEnd = (id: number, x: number, y: number) => {
        setDraggedWindowId(null);

        if (globalMinimized && showExpandHint) {
            // Vérifier qu'on est bien dans la zone centrale (200px) pour agrandir
            const centerX = screenSize.width / 2;
            const centerY = screenSize.height / 2;
            const distanceFromCenter = Math.sqrt(
                Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
            );

            if (distanceFromCenter < 400) {
                setWindows(prevWindows =>
                    prevWindows.map(w => {
                        if (w.id === id) {
                            const initialWindow = INITIAL_WINDOWS.find(iw => iw.id === id);
                            const newWidth = (initialWindow?.width || 500) * 1.5;
                            const newHeight = (initialWindow?.height || 400) * 1.5;

                            return {
                                ...w,
                                isMinimized: false,
                                width: newWidth,
                                height: newHeight,
                            };
                        }
                        return w;
                    })
                );
            }
        }
        setShowExpandHint(false);
    };


    return (
        <>
            {/* Bouton carré en bas à gauche, aligné avec le centre de la nav */}
            <button
                onClick={toggleMinimizeAll}
                className="fixed bottom-0 left-0 z-50 w-3 h-3 bg-black border-2 border-white hover:bg-gray-800 transition-colors flex items-center justify-center hoverable cursor-none"
                style={{
                    left: '3%',
                    bottom: '3%',
                    transform: 'translateX(-50%)',
                }}
                aria-label={globalMinimized ? "Restaurer toutes les fenêtres" : "Minimiser toutes les fenêtres"}
            >
                <span className="text-white text-2xl"></span>
            </button>

            {/* Rectangle indicateur d'agrandissement */}
            {showExpandHint && draggedWindowId && (() => {
                const originalWindow = INITIAL_WINDOWS.find(w => w.id === draggedWindowId);
                return (
                    <div
                        className="fixed pointer-events-none z-40 border border-black/30 bg-transparent transition-opacity"
                        style={{
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: `${originalWindow?.width || 500}px`,
                            height: `${originalWindow?.height || 400}px`,
                        }}
                    >
                        <div className="flex items-center justify-center h-full">
                            <div className="bg-black/70 text-white/90 px-2 py-1 text-xs font-mono">
                                Relâcher pour agrandir
                            </div>
                        </div>
                    </div>
                );
            })()}


            {windows.map((window, index) => {
                const position = window.isMinimized
                    ? getMinimizedPosition(index)
                    : getInitialPosition(window.id, window.width, window.height);

                return window.visible ? (
                    <DragWindow
                        key={window.id}
                        title={window.title}
                        initialX={position.x}
                        initialY={position.y}
                        width={position.width}
                        height={position.height}
                        maxY={screenSize.height - NAV_HEIGHT}
                        onClose={() => closeWindow(window.id)}
                        onFocus={() => handleWindowFocus(window.id)}
                        onDragMove={(x, y) => handleDragMove(window.id, x, y)}
                        onDragEnd={(x, y) => handleDragEnd(window.id, x, y)}
                        zIndex={window.zIndex}
                        isMinimized={window.isMinimized}
                    >
                        <Section>
                            Contenu de {window.title}
                        </Section>
                    </DragWindow>
                ) : null;
            })}

            <Nav windows={windows} onToggleWindow={toggleWindow} />
        </>
    );
};

export default Main;
