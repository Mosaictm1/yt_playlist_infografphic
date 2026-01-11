'use client';

import { motion } from 'framer-motion';
import { Check, Loader2, Clock } from 'lucide-react';

interface ProcessingStep {
    id: string;
    label: string;
    labelAr: string;
}

const STEPS: ProcessingStep[] = [
    { id: 'transcript', label: 'Getting transcript', labelAr: 'استخراج النص' },
    { id: 'analyze', label: 'Analyzing content', labelAr: 'تحليل المحتوى' },
    { id: 'design', label: 'Generating design', labelAr: 'إنشاء التصميم' },
    { id: 'image', label: 'Generating image', labelAr: 'إنشاء الصورة' },
];

interface ProcessingStepsProps {
    currentStep?: string;
    progress: number;
    videoTitle?: string;
}

export default function ProcessingSteps({ currentStep, progress, videoTitle }: ProcessingStepsProps) {
    // Determine step index based on currentStep or progress
    let currentStepIndex = -1;

    if (currentStep) {
        if (currentStep.includes('transcript')) currentStepIndex = 0;
        else if (currentStep.includes('Analyzing') || currentStep.includes('analyze')) currentStepIndex = 1;
        else if (currentStep.includes('design') || currentStep.includes('prompt')) currentStepIndex = 2;
        else if (currentStep.includes('image') || currentStep.includes('Generating image')) currentStepIndex = 3;
    } else {
        // Estimate from progress
        if (progress < 25) currentStepIndex = 0;
        else if (progress < 50) currentStepIndex = 1;
        else if (progress < 75) currentStepIndex = 2;
        else currentStepIndex = 3;
    }

    return (
        <div className="space-y-4">
            {videoTitle && (
                <div className="text-sm text-gray-400 mb-4 text-right" dir="rtl">
                    جاري معالجة: <span className="text-white">{videoTitle}</span>
                </div>
            )}

            <div className="space-y-3">
                {STEPS.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const isPending = index > currentStepIndex;

                    return (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isCurrent ? 'glass border border-purple-500/30' :
                                    isCompleted ? 'bg-green-500/10' : 'bg-white/5'
                                }`}
                        >
                            {/* Status icon */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500/20' :
                                    isCurrent ? 'bg-purple-500/20' : 'bg-white/10'
                                }`}>
                                {isCompleted && <Check className="w-4 h-4 text-green-400" />}
                                {isCurrent && <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />}
                                {isPending && <Clock className="w-4 h-4 text-gray-500" />}
                            </div>

                            {/* Step info */}
                            <div className="flex-1">
                                <p className={`text-sm font-medium ${isCompleted ? 'text-green-400' :
                                        isCurrent ? 'text-white' : 'text-gray-500'
                                    }`}>
                                    {step.labelAr}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {step.label}
                                </p>
                            </div>

                            {/* Step number */}
                            <div className={`text-sm ${isCompleted ? 'text-green-400' :
                                    isCurrent ? 'text-purple-400' : 'text-gray-600'
                                }`}>
                                {index + 1}/{STEPS.length}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Overall progress bar */}
            <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>التقدم الكلي</span>
                    <span>{progress}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>
        </div>
    );
}
