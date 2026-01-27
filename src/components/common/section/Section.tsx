import type { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  id?: string;
  ariaLabel?: string;
}

const Section = ({ children, id, ariaLabel }: SectionProps) => {
  return (
    <section id={id} aria-label={ariaLabel}>
      {children}
    </section>
  );
};

export default Section;
