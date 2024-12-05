import { useRef } from 'react';

export const useFocalLength = () => {
  const focalLengthRef = useRef(0);

  const updateFocalLength = (value: number) => {
    focalLengthRef.current = value;
  };

  return { focalLengthRef, updateFocalLength };
};
