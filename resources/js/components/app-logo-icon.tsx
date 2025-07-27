import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <div className="flex items-center justify-center ">
            <img src="/Logo.png" alt="logo" className="w-full h-full object-cover" />
        </div>
    );
}
