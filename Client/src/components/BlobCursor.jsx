'use client';

import { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import './BlobCursor.css';

export default function BlobCursor({
    blobType = 'circle',
    fillColor = '#ffffff',
    trailCount = 3,
    sizes = [30, 50, 40],
    innerSizes = [10, 15, 12],
    innerColor = 'rgba(255,255,255,0.6)',
    opacities = [0.4, 0.3, 0.2],
    shadowColor = 'rgba(255,255,255,0)',
    shadowBlur = 0,
    shadowOffsetX = 0,
    shadowOffsetY = 0,
    filterId = 'blob',
    filterStdDeviation = 30,
    filterColorMatrixValues = '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 35 -10',
    useFilter = true,
    fastDuration = 0.1,
    slowDuration = 0.5,
    fastEase = 'power3.out',
    slowEase = 'power1.out',
    zIndex = 9999
}) {
    const containerRef = useRef(null);
    const blobsRef = useRef([]);

    const updateOffset = useCallback(() => {
        if (!containerRef.current) return { left: 0, top: 0 };
        const rect = containerRef.current.getBoundingClientRect();
        return { left: rect.left, top: rect.top };
    }, []);

    const handleMove = useCallback(
        e => {
            const x = 'clientX' in e ? e.clientX : e.touches[0]?.clientX;
            const y = 'clientY' in e ? e.clientY : e.touches[0]?.clientY;

            if (x === undefined || y === undefined) return;

            blobsRef.current.forEach((el, i) => {
                if (!el) return;
                const isLead = i === 0;
                gsap.to(el, {
                    x: x,
                    y: y,
                    duration: isLead ? fastDuration : slowDuration,
                    ease: isLead ? fastEase : slowEase
                });
            });
        },
        [fastDuration, slowDuration, fastEase, slowEase]
    );

    // Set initial position to center of screen
    useEffect(() => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        blobsRef.current.forEach((el) => {
            if (el) {
                gsap.set(el, { x: centerX, y: centerY });
            }
        });
    }, []);

    useEffect(() => {
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('touchmove', handleMove);

        return () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('touchmove', handleMove);
        };
    }, [handleMove]);

    return (
        <div
            ref={containerRef}
            className="blob-container"
            style={{ zIndex }}
        >
            {useFilter && (
                <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                    <filter id={filterId}>
                        <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation={filterStdDeviation} />
                        <feColorMatrix in="blur" values={filterColorMatrixValues} />
                    </filter>
                </svg>
            )}

            <div className="blob-main" style={{ filter: useFilter ? `url(#${filterId})` : undefined }}>
                {Array.from({ length: trailCount }).map((_, i) => (
                    <div
                        key={i}
                        ref={el => (blobsRef.current[i] = el)}
                        className="blob"
                        style={{
                            width: sizes[i],
                            height: sizes[i],
                            borderRadius: blobType === 'circle' ? '50%' : '0%',
                            backgroundColor: fillColor,
                            opacity: opacities[i],
                            boxShadow: `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px 0 ${shadowColor}`
                        }}
                    >
                        <div
                            className="inner-dot"
                            style={{
                                width: innerSizes[i],
                                height: innerSizes[i],
                                top: (sizes[i] - innerSizes[i]) / 2,
                                left: (sizes[i] - innerSizes[i]) / 2,
                                backgroundColor: innerColor,
                                borderRadius: blobType === 'circle' ? '50%' : '0%'
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
