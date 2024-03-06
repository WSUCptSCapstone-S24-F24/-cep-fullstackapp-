import React from 'react';

// Information on Virtual Box
interface VirtualBoxInfo {
    crosshairPosition: {x: number, y: number};
    height: string;
    width: string;
    top?: string;
    left?: string;
    right?: string;
}

const VirtualBox: React.FC<VirtualBoxInfo> = ({ crosshairPosition, height, width, top = '0', left = '0', right='0'}) => {
    const boxRef = React.useRef<HTMLDivElement>(null);
    const [isInside, setIsInside] = React.useState(false);

    React.useEffect(() =>{
        if (!boxRef.current) return;

        // Will check if the crosshair is within the bounds of the virtual box
        const box = boxRef.current.getBoundingClientRect();
        const isInside = 
        crosshairPosition.x >= box.left &&
        crosshairPosition.x <= box.right &&
        crosshairPosition.y >= box.top &&
        crosshairPosition.y <= box.bottom;

        setIsInside(isInside);
    }, [crosshairPosition])

    return (
        <div
          ref={boxRef}
          style={{
            border: `2px solid ${isInside ? 'red' : 'green'}`, // Will change box color depending on if crosshair is inside the bounds of the box
            height: height,
            width: width,
            position: 'relative',
            top: top,
            left: left,
            right: right,
            zIndex: 4
          }}
        />
    );
};

export default VirtualBox;