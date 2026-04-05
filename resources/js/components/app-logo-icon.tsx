import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 40 42" xmlns="http://www.w3.org/2000/svg">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M20 2L4 10v15.5C4 33.5 11 40.5 20 42c9-1.5 16-8.5 16-16.5V10L20 2zm0 4.2l11.5 6.2v13.1c0 5.5-4.5 10.5-11.5 12.5-7-2-11.5-7-11.5-12.5V12.2L20 6.2z"
            />
            <path
                d="M13 20.5l4 4 7-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
