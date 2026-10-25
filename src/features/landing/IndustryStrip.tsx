import { Icon, type IconName } from '../../components/Icon';

const INDUSTRIES: Array<{ icon: IconName; label: string }> = [
  { icon: 'car', label: 'Automotive' },
  { icon: 'chip', label: 'Electronics' },
  { icon: 'pill', label: 'Pharma' },
  { icon: 'factory', label: 'Heavy Manufacturing' },
  { icon: 'bolt', label: 'Energy' },
];

/** Industry strip between the hero and the services section. */
export function IndustryStrip() {
  return (
    <section className="border-y border-gray-200 bg-white" aria-label="Industries served">
      <div
        className="container-x flex flex-col items-center gap-3 py-5 lg:flex-row lg:justify-between lg:gap-8"
        style={{ minHeight: '72px' }}
      >
        <p className="text-xs font-bold uppercase tracking-wider text-gray-600 lg:border-r lg:border-gray-300 lg:pr-8">
          Built for precision-driven industries
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 lg:justify-between lg:gap-x-8">
          {INDUSTRIES.map((item) => (
            <li key={item.label} className="strip-item">
              <Icon name={item.icon} />
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
