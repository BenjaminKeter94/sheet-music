
import React, { useEffect, useRef } from 'react';
import abcjs from 'abcjs';

interface Props {
  abcNotation: string;
}

const SheetMusicRenderer: React.FC<Props> = ({ abcNotation }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      abcjs.renderAbc(containerRef.current, abcNotation, {
        responsive: 'resize',
        paddingbottom: 30,
        paddingtop: 30,
        paddingleft: 10,
        paddingright: 10,
        scale: 1.2
      });
    }
  }, [abcNotation]);

  return (
    <div className="bg-white p-4 md:p-8 rounded-xl shadow-inner border border-stone-200 min-h-[400px]">
      <div ref={containerRef} className="abcjs-container" />
    </div>
  );
};

export default SheetMusicRenderer;
