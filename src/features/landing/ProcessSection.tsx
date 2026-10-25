import { Icon, type IconName } from '../../components/Icon';
import { QuantumWave } from './QuantumWave';

const STEPS: Array<{ icon: IconName; title: string; body: string }> = [
  { icon: 'pulse', title: 'Collect', body: 'Raw sensor data & machine signals' },
  { icon: 'brain', title: 'Detect', body: 'AI + quantum anomaly detection' },
  { icon: 'search', title: 'Explain', body: 'Root cause analysis & insights' },
  { icon: 'bolt', title: 'Act', body: 'Alerts, recommendations & automation' },
];

/** Dark Process section: the four steps plus the animated quantum wave canvas. */
export function ProcessSection() {
  return (
    <section
      className="on-dark overflow-hidden bg-brand-dark text-white"
      id="process"
      aria-labelledby="process-h"
      style={{ paddingTop: 'var(--section-y)' }}
    >
      <div className="container-x">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="reveal lg:col-span-5">
            <h2 className="h2 !text-white" id="process-h">From raw signals to <br className="hidden sm:block" />reliable decisions.</h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-gray-300">
              DRYFTQ's quantum-powered platform turns complex industrial data into clear, actionable insights — in real
              time.
            </p>
          </div>
          <ol className="reveal grid grid-cols-2 gap-x-4 gap-y-8 lg:col-span-7 lg:grid-cols-4">
            {STEPS.map((step) => (
              <li key={step.title} className="step">
                <span className="step-icon">
                  <Icon name={step.icon} />
                </span>
                <h3 className="font-bold">{step.title}</h3>
                <p className="mt-1 text-sm leading-snug text-gray-300">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
        <QuantumWave />
      </div>
    </section>
  );
}
