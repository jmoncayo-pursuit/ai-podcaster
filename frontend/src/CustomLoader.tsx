import React from 'react';

const CustomLoader: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <span
    className='custom-loader'
    style={{ width: size, height: size, display: 'inline-block' }}
    aria-label='Loading...'
  >
    <span className='custom-loader-inner' />
  </span>
);

export default CustomLoader;
