import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      {...props}
      className={cn('h-8 w-8', props.className)}
    >
      <path
        fill="#fec200"
        d="m183.33 216.64l-42.1-72.92h84.21l-42.11 72.92Z"
      />
      <path
        fill="#ffffff"
        d="m120.31 39.36l-100.31 173.28h72.93l69.49-120.36l-42.11-72.92Z"
      />
    </svg>
  );
}
