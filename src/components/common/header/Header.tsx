import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type Props = {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Header = (props: Props) => {
  return (
    <header className="w-full p-4 border-b-2 border-black bg-white">
      <h1 className="text-pixel-lg text-center uppercase mb-2">
        Yovish Moonesamy
      </h1>
      <p className="text-pixel-sm text-center">
        Dev Web Alternant
      </p>
      <p className="text-pixel-xs text-center mt-1 opacity-70">
        Next.js · React · TypeScript
      </p>
    </header>
  );
}

export default Header;
