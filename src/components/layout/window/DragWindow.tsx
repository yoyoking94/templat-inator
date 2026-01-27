import { useRef, useState, useLayoutEffect, useCallback, useEffect } from 'react';

export interface DragWindowProps {
    title: string;
    children: React.ReactNode;
    onClose?: () => void;
    onFocus?: () => void;
    onDragStart?: () => void;
    onDragMove?: (x: number, y: number) => void;
    onDragEnd?: (x: number, y: number) => void;
    zIndex?: number;
    initialX: number;
    initialY: number;
    width?: number;
    height?: number;
    maxY?: number;
    isMinimized?: boolean;
}

const DragWindow = ({
    title,
    children,
    onClose,
    onFocus,
    onDragStart,
    onDragMove,
    onDragEnd,
    zIndex = 1,
    initialX,
    initialY,
    width = 500,
    height = 300,
    maxY,
    isMinimized = false,
}: DragWindowProps) => {
    const windowRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{ x: number; y: number }>({ x: initialX, y: initialY });
    const [dimensions, setDimensions] = useState({ width, height });
    const [isDragging, setIsDragging] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const dragOffsetRef = useRef({ x: 0, y: 0 });
    const hasBeenDraggedRef = useRef(false);

    useEffect(() => {
        // Déclencher l'animation d'ouverture
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 10);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPosition({ x: initialX, y: initialY });
        setDimensions({ width, height });
    }, [initialX, initialY, width, height, isMinimized]);

    const constrainPosition = useCallback((x: number, y: number) => {
        const maxX = window.innerWidth - dimensions.width;
        const effectiveMaxY = maxY ? maxY - dimensions.height : window.innerHeight - dimensions.height;

        return {
            x: Math.max(0, Math.min(x, maxX)),
            y: Math.max(0, Math.min(y, effectiveMaxY)),
        };
    }, [dimensions.width, dimensions.height, maxY]);

    useLayoutEffect(() => {
        if (isDragging) {
            document.body.classList.add('dragging');
        } else {
            document.body.classList.remove('dragging');
        }

        if (windowRef.current && !isVisible) {
            windowRef.current.style.transform = `translate(${position.x}px, ${position.y}px) scale(0)`;
        } else if (windowRef.current && isVisible) {
            windowRef.current.style.transform = `translate(${position.x}px, ${position.y}px) scale(1)`;
        }

        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging && windowRef.current) {
                e.preventDefault();
                const newX = e.clientX - dragOffsetRef.current.x;
                const newY = e.clientY - dragOffsetRef.current.y;
                const constrained = constrainPosition(newX, newY);

                windowRef.current.style.transform = `translate(${constrained.x}px, ${constrained.y}px) scale(1)`;
                setPosition(constrained);

                if (onDragMove) {
                    onDragMove(constrained.x + dimensions.width / 2, constrained.y + dimensions.height / 2);
                }
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (isDragging && windowRef.current) {
                e.preventDefault();
                const touch = e.touches[0];
                const newX = touch.clientX - dragOffsetRef.current.x;
                const newY = touch.clientY - dragOffsetRef.current.y;
                const constrained = constrainPosition(newX, newY);

                windowRef.current.style.transform = `translate(${constrained.x}px, ${constrained.y}px) scale(1)`;
                setPosition(constrained);

                if (onDragMove) {
                    onDragMove(constrained.x + dimensions.width / 2, constrained.y + dimensions.height / 2);
                }
            }
        };

        const handleMouseUp = (e: MouseEvent) => {
            if (isDragging) {
                const finalX = e.clientX - dragOffsetRef.current.x;
                const finalY = e.clientY - dragOffsetRef.current.y;
                const constrained = constrainPosition(finalX, finalY);
                setPosition(constrained);
                hasBeenDraggedRef.current = true;

                if (onDragEnd) {
                    onDragEnd(constrained.x + dimensions.width / 2, constrained.y + dimensions.height / 2);
                }
            }
            setIsDragging(false);
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (isDragging && e.changedTouches[0]) {
                const touch = e.changedTouches[0];
                const finalX = touch.clientX - dragOffsetRef.current.x;
                const finalY = touch.clientY - dragOffsetRef.current.y;
                const constrained = constrainPosition(finalX, finalY);
                setPosition(constrained);
                hasBeenDraggedRef.current = true;

                if (onDragEnd) {
                    onDragEnd(constrained.x + dimensions.width / 2, constrained.y + dimensions.height / 2);
                }
            }
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
        }

        return () => {
            document.body.classList.remove('dragging');
            if (isDragging) {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
                window.removeEventListener('touchmove', handleTouchMove);
                window.removeEventListener('touchend', handleTouchEnd);
            }
        };
    }, [isDragging, position.x, position.y, isVisible, constrainPosition, dimensions.width, dimensions.height, onDragMove, onDragEnd]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.window-title-bar')) {
            e.preventDefault();
            dragOffsetRef.current = {
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            };
            setIsDragging(true);
            if (onFocus) {
                onFocus();
            }
            if (onDragStart) {
                onDragStart();
            }
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if ((e.target as HTMLElement).closest('.window-title-bar')) {
            e.preventDefault();
            const touch = e.touches[0];
            dragOffsetRef.current = {
                x: touch.clientX - position.x,
                y: touch.clientY - position.y,
            };
            setIsDragging(true);
            if (onFocus) {
                onFocus();
            }
            if (onDragStart) {
                onDragStart();
            }
        }
    };

    return (
        <div
            ref={windowRef}
            className="absolute bg-white border-2 border-black shadow-lg overflow-hidden hoverable"
            style={{
                width: `${dimensions.width}px`,
                height: `${dimensions.height}px`,
                zIndex,
                willChange: 'transform',
                transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                transformOrigin: 'center center',
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            <div className="window-title-bar bg-black text-white px-4 py-2 flex justify-between items-center select-none cursor-none">
                <span className="font-bold text-sm">{title}</span>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="px-2 rounded transition-colors hoverable cursor-none"
                        aria-label="Fermer"
                    >
                        X
                    </button>
                )}
            </div>
            <div
                className="p-4 overflow-auto transition-opacity duration-300"
                style={{
                    height: `calc(100% - 40px)`,
                    opacity: isMinimized ? 0 : 1
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default DragWindow;
