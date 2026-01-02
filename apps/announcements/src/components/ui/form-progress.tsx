import * as React from 'react';
import { cn } from '@repo/ui/lib/utils';

export interface FormProgressStep {
  id: string;
  label: string;
  completed: boolean;
}

export interface FormProgressProps {
  steps: FormProgressStep[];
  currentStep: number;
  className?: string;
}

/**
 * FormProgress provides visual progress indication for multi-step forms.
 * It displays a horizontal progress bar with step indicators and labels.
 * 
 * @example
 * <FormProgress
 *   steps={[
 *     { id: 'entity', label: 'Entity Info', completed: true },
 *     { id: 'buyback', label: 'Buy-Back Details', completed: false },
 *     { id: 'compliance', label: 'Compliance', completed: false },
 *   ]}
 *   currentStep={1}
 * />
 */
export const FormProgress = React.forwardRef<HTMLDivElement, FormProgressProps>(
  ({ steps, currentStep, className }, ref) => {
    return (
      <nav ref={ref} aria-label="Form progress" className={cn('w-full', className)}>
        <ol className="flex items-center justify-between w-full">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = step.completed || index < currentStep;
            const isLast = index === steps.length - 1;

            return (
              <li
                key={step.id}
                className={cn('flex items-center', !isLast && 'flex-1')}
              >
                <div className="flex flex-col items-center">
                  {/* Step indicator */}
                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                      isCompleted && 'bg-primary border-primary text-primary-foreground',
                      isActive && !isCompleted && 'border-primary text-primary',
                      !isActive && !isCompleted && 'border-muted text-muted-foreground'
                    )}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  
                  {/* Step label */}
                  <span
                    className={cn(
                      'mt-2 text-xs font-medium text-center',
                      isActive && 'text-primary',
                      isCompleted && 'text-foreground',
                      !isActive && !isCompleted && 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-4 transition-colors',
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    )}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);

FormProgress.displayName = 'FormProgress';
