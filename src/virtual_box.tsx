import React from 'react';

// Information on Virtual Box
interface VirtualBoxInfo {
    onObjectInside: (isInside: boolean) => void;
}

const VirtualBox: React.FC<VirtualBoxInfo> = ({ onObjectInside }) => {
    const boxRef = React.useRef<HTMLDivElement>(null);

    // Will check if the cursor is within the bounds of the box
    const checkObjectInside = (objPosition: {x: number, y: number}) => {
        if (!boxRef.current) return;

        const box = boxRef.current.getBoundingClientRect();
        const isInside = 
        objPosition.x >= box.left &&
        objPosition.x <= box.right &&
        objPosition.y >= box.top &&
        objPosition.y <= box.bottom;

        onObjectInside(isInside);
    };

    return (
        <div
          ref={boxRef}
          style={{
            border: '2px dashed black',
            height: '200px',
            width: '200px',
            position: 'relative',
            zIndex: 6
          }}
        />
    );
};

export default VirtualBox;