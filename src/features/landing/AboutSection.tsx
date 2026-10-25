import { Icon, type IconName } from '../../components/Icon';

const CAPABILITIES: Array<{ icon: IconName; title: string; body: string; itemClass: string }> = [
  {
    icon: 'clock',
    title: 'Real-time Monitoring',
    body: 'Track machines, processes and KPIs in real time with minimal latency.',
    itemClass: 'reveal py-8 first:pt-0 md:px-8 md:py-2 md:first:pl-0 md:last:pr-0',
  },
  {
    icon: 'shield',
    title: 'Quality Assurance',
    body: 'Detect defects and process variations early to maintain consistent quality.',
    itemClass: 'reveal py-8 md:px-8 md:py-2',
  },
  {
    icon: 'trend',
    title: 'Predictive Operations',
    body: 'Reduce unplanned downtime and optimize performance with AI-driven predictions.',
    itemClass: 'reveal py-8 last:pb-0 md:px-8 md:py-2 md:first:pl-0 md:last:pr-0',
  },
];

/** About / factory-floor section. */
export function AboutSection() {
  return (
    <section className="section-y" id="about" aria-labelledby="about-h">
      <div className="container-x">
        <div className="section-head reveal">
          <h2 className="h2" id="about-h">
            Designed for the realities of the factory floor.
          </h2>
          <p className="lead mt-3">Built for industrial environments. Engineered for real-world impact.</p>
        </div>
        <ul className="grid divide-y divide-gray-200 md:grid-cols-3 md:divide-x md:divide-y-0">
          {CAPABILITIES.map((item) => (
            <li key={item.title} className={item.itemClass}>
              <span className="icon-badge mb-4">
                <Icon name={item.icon} />
              </span>
              <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
              <p className="text-[15px] leading-relaxed text-gray-600">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
