"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const thermometerVariants = cva(
    "relative flex flex-col items-center justify-center font-sans",
    {
        variants: {
            size: {
                sm: "w-[100px] h-[200px]",
                md: "w-[150px] h-[300px]",
                lg: "w-[200px] h-[400px]",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
);

interface ThermometerProps extends VariantProps<typeof thermometerVariants> {
    percentage: number;
    className?: string;
}

export function Thermometer({ percentage, size, className }: ThermometerProps) {
    const safePercentage = Math.min(Math.max(percentage, 0), 100);

    // SVG Coordinates mapping based on percentage
    // 0% -> y = 240 (bottom of tube), 100% -> y = 40 (top of tube)
    const calculateY = (percent: number) => {
        const minY = 40;
        const maxY = 240;
        return maxY - (percent / 100) * (maxY - minY);
    };

    const currentY = calculateY(safePercentage);

    // Determine color based on percentage
    const fillColor = useMemo(() => {
        if (safePercentage <= 33) return "#ef4444"; // Red
        if (safePercentage <= 66) return "#facc15"; // Yellow
        return "#22c55e"; // Green
    }, [safePercentage]);

    return (
        <div className={cn(thermometerVariants({ size }), className)}>
            <svg
                viewBox="0 0 100 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-md"
            >
                {/* Thermometer Outline/Glass */}
                <path
                    d="M35 40 C35 25 65 25 65 40 L65 240 C75 245 80 260 75 275 C70 290 55 295 40 290 C25 285 20 270 25 255 C30 245 35 240 35 240 Z"
                    fill="#f3f4f6"
                    stroke="#d1d5db"
                    strokeWidth="4"
                    className="transition-colors duration-500"
                />

                {/* Liquid level */}
                <mask id="liquid-mask">
                    <path
                        d="M35 40 C35 25 65 25 65 40 L65 240 C75 245 80 260 75 275 C70 290 55 295 40 290 C25 285 20 270 25 255 C30 245 35 240 35 240 Z"
                        fill="white"
                    />
                </mask>

                <g mask="url(#liquid-mask)">
                    <motion.rect
                        x="0"
                        y={currentY}
                        width="100"
                        height={300 - currentY}
                        fill={fillColor}
                        initial={{ y: 240, height: 60 }}
                        animate={{ y: currentY, height: 300 - currentY }}
                        transition={{ type: "spring", stiffness: 40, damping: 20 }}
                    />
                    {/* Base bulb fill (always present so the bottom doesn't look empty when bouncing to 0) */}
                    <circle cx="50" cy="265" r="25" fill={fillColor} className="transition-colors duration-500" />
                </g>

                {/* Shine overlay */}
                <path
                    d="M40 45 L40 240"
                    stroke="white"
                    strokeWidth="6"
                    strokeLinecap="round"
                    className="opacity-40"
                />
                <circle cx="42" cy="258" r="8" fill="white" className="opacity-40" />

                {/* Markings */}
                <line x1="68" y1="40" x2="75" y2="40" stroke="#9ca3af" strokeWidth="2" />
                <line x1="68" y1="90" x2="75" y2="90" stroke="#9ca3af" strokeWidth="2" />
                <line x1="68" y1="140" x2="75" y2="140" stroke="#9ca3af" strokeWidth="2" />
                <line x1="68" y1="190" x2="75" y2="190" stroke="#9ca3af" strokeWidth="2" />
                <line x1="68" y1="240" x2="75" y2="240" stroke="#9ca3af" strokeWidth="2" />
            </svg>
        </div>
    );
}
