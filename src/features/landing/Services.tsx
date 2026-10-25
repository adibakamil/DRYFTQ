import { Icon, type IconName } from '../../components/Icon';

const SERVICES: Array<{ icon: IconName; title: string; body: string }> = [
  {
    icon: 'pulse',
    title: 'Early Drift Detection',
    body: 'Spot subtle process deviations before they turn into costly downtime, waste or quality loss.',
  },
  {
    icon: 'brain',
    title: 'Human + Machine Intelligence',
    body: 'Combines real machine data with human expertise and quantum models for deeper, faster insights.',
  },
  {
    icon: 'target',
    title: 'Actionable Root Cause',
    body: 'Go beyond alerts with clear explanations and precise root cause analysis for faster resolution.',
  },
];

/** The three service pillars. */
export function Services() {
  return (
    <section className="section-y" id="services" aria-labelledby="services-h">
      <div className="container-x">
        <div className="section-head reveal">
          <h2 className="h2" id="services-h">
            See drift before it becomes downtime.
          </h2>
          <p className="lead mt-3">Real-time intelligence for a more stable, efficient and profitable operation.</p>
        </div>
        <ul className="grid gap-5 md:grid-cols-3 md:gap-6">
          {SERVICES.map((service) => (
            <li key={service.title} className="card card-hover reveal p-6 md:p-7">
              <span className="icon-badge mb-5">
                <Icon name={service.icon} />
              </span>
              <h3 className="mb-2 text-lg font-bold">{service.title}</h3>
              <p className="text-[15px] leading-relaxed text-gray-600">{service.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
