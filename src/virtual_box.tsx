import React from 'react';

// Information on Virtual Box
interface VirtualBoxInfo {
    crosshairPosition: {x: number, y: number};
}

const VirtualBox: React.FC<VirtualBoxInfo> = ({ crosshairPosition }) => {
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
            height: '200px',
            width: '200px',
            position: 'relative',
            zIndex: 4
          }}
        />
    );
};

export default VirtualBox;