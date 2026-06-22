export default function SectionHeader({ eyebrow, title, description, align = 'left', as: Heading = 'h2' }) {
  return (
    <div className={`section-header section-header--${align}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <Heading>{title}</Heading>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
