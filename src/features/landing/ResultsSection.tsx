import { Icon, type IconName } from '../../components/Icon';

const RESULTS: Array<{ icon: IconName; title: string; body: string }> = [
  { icon: 'down', title: 'Downtime', body: 'Less unplanned stops, more productive hours.' },
  { icon: 'trash', title: 'Scrap & Waste', body: 'Higher yield, lower material loss.' },
  { icon: 'up', title: 'Process Stability', body: 'Consistent quality, better performance.' },
];

/** Results / outcomes section. */
export function ResultsSection() {
  return (
    <section className="section-y" id="results" aria-labelledby="results-h">
      <div className="container-x">
        <div className="section-head reveal">
          <h2 className="h2" id="results-h">
            Real results for a more reliable tomorrow.
          </h2>
          <p className="lead mt-3">Measurable outcomes. Lasting impact.</p>
        </div>
        <ul className="grid gap-5 md:grid-cols-3 md:gap-6">
          {RESULTS.map((result) => (
            <li
              key={result.title}
              className="card card-hover reveal flex items-start gap-4 p-6 md:flex-col md:items-center md:text-center"
            >
              <span className="icon-badge">
                <Icon name={result.icon} />
              </span>
              <div>
                <h3 className="text-base font-bold">{result.title}</h3>
                <p className="mt-1 text-[15px] leading-snug text-gray-600">{result.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
