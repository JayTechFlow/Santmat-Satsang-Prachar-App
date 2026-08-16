interface NavSectionProps {
  title: string;
}

export function NavSection({ title }: NavSectionProps) {
  return (
    <div className="nav-section-title">
      {title}
    </div>
  );
}