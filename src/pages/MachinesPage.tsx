/**
 * Machines module — React migration of the legacy
 * `DRYFTQ ALL DASHBOARD/DRYFTQ DASHBOARD 3(MACHINES)/code.html`.
 *
 * Every value renders from `usePlantState()`; there are no manual event
 * listeners, timers or direct DOM mutations.
 */
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useActions, usePlantState } from '../store/context';
import { cx, matchesQuery, numOr } from '../lib/utils';
import { Icon } from '../components/Icon';
import { EmptyState, SearchInput, Table, Td, Th, Thead, Tr } from '../components/ui';
import { AddMachineModal } from '../features/machines/AddMachineModal';
import { MachineDetailsModal } from '../features/machines/MachineDetailsModal';
import { StatusPill } from '../features/machines/StatusPill';
import {
  ACCENT_BTN,
  DEFAULT_DRAFT,
  STATUS_FILTERS,
  compareMachines,
  metricText,
  type MachineDraft,
  type SortDir,
  type SortField,
  type StatusFilter,
} from '../features/machines/shared';

export default function MachinesPage() {
  const state = usePlantState();
  const actions = useActions();
  const [searchParams] = useSearchParams();

  // Local UI state (legacy: `#machine-search`, filter/sort globals, modal ids).
  const [query, setQuery] = useState(() => searchParams.get('search') ?? '');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    // `?machine=<id>` opens the details modal once, on mount.
    const param = searchParams.get('machine');
    return param && state.machines.some((m) => m.id === param) ? param : null;
  });
  const [addOpen, setAddOpen] = useState(false);
  const [draft, setDraft] = useState<MachineDraft>(DEFAULT_DRAFT);
  /** `machines.length` captured when Save was pressed (null = no save pending). */
  const pendingAddRef = useRef<number | null>(null);

  const rows = useMemo(() => {
    const filtered = state.machines.filter(
      (m) =>
        (statusFilter === 'All' || m.status === statusFilter) &&
        matchesQuery(query, m.id, m.name, m.line, m.status),
    );
    return filtered.sort((a, b) => compareMachines(a, b, sortField, sortDir));
  }, [state.machines, statusFilter, query, sortField, sortDir]);

  const counts = useMemo(
    () =>
      STATUS_FILTERS.map((status) => ({
        status,
        count: status === 'All' ? state.machines.length : state.machines.filter((m) => m.status === status).length,
      })),
    [state.machines],
  );

  const selected = selectedId ? (state.machines.find((m) => m.id === selectedId) ?? null) : null;

  // Close the add dialog only after the store actually accepted the machine;
  // on a validation failure the list does not grow, the modal stays open and
  // the action's own error toast explains why.
  useEffect(() => {
    const before = pendingAddRef.current;
    if (before !== null && state.machines.length > before) {
      pendingAddRef.current = null;
      setDraft(DEFAULT_DRAFT);
      setAddOpen(false);
    }
  }, [state.machines.length]);

  const patchDraft = (patch: Partial<MachineDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const closeAddModal = () => {
    pendingAddRef.current = null;
    setAddOpen(false);
  };

  const submitMachine = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    pendingAddRef.current = state.machines.length;
    actions.addMachine({
      id: draft.id.trim(),
      name: draft.name.trim(),
      line: draft.line,
      status: draft.status,
      load: draft.load.trim() ? `${draft.load.trim()}%` : undefined,
      temp: numOr(draft.temp, 65),
      vibration: numOr(draft.vibration, 1.2),
      power: draft.power.trim(),
    });
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortIcon = (field: SortField): string => (field === sortField ? (sortDir === 'asc' ? '↑' : '↓') : '↕');

  const sortableHeader = (field: SortField, label: string) => (
    <Th
      tone="dark"
      aria-sort={sortField === field ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
      className="cursor-pointer select-none hover:text-slate-200"
    >
      <button type="button" className="flex items-center gap-1" onClick={() => toggleSort(field)}>
        {label}
        <span aria-hidden="true">{sortIcon(field)}</span>
      </button>
    </Th>
  );

  const clearFilters = () => {
    setQuery('');
    setStatusFilter('All');
  };

  return (
    <section aria-labelledby="machines-heading" className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="machines-heading" className="text-lg font-bold text-white">
            Machines
          </h2>
          <p className="mt-0.5 text-sm text-slate-400">Monitor and manage your plant machines</p>
        </div>
        <button type="button" className={cx(ACCENT_BTN, 'shrink-0')} onClick={() => setAddOpen(true)}>
          <Icon name="plus" className="h-4 w-4" />
          <span>Add New Machine</span>
        </button>
      </div>

      {/* Search */}
      <div className="max-w-xl">
        <SearchInput
          id="machine-search"
          placeholder="Search machines by name, ID or line..."
          value={query}
          onChange={setQuery}
          onClear={() => setQuery('')}
          className="[&_input]:border-white/10 [&_input]:bg-white/5 [&_input]:text-white [&_input]:placeholder-slate-500"
        />
      </div>

      {/* Status filter pills */}
      <div role="group" aria-label="Filter machines by status" className="flex flex-wrap items-center gap-2">
        {counts.map(({ status, count }) => (
          <button
            key={status}
            type="button"
            aria-pressed={statusFilter === status}
            onClick={() => setStatusFilter(status)}
            className={cx(
              'rounded-lg px-4 py-1.5 text-sm transition-colors',
              statusFilter === status
                ? 'bg-[#FF3D0A] font-semibold text-white shadow-sm'
                : 'border border-[#0d3459] bg-white/5 font-medium text-slate-300 hover:bg-white/10 hover:text-white',
            )}
          >
            {status} ({count})
          </button>
        ))}
      </div>

      {/* Machines table */}
      <div className="console-card overflow-hidden">
        <Table tone="dark">
          <Thead tone="dark">
            <Tr className="border-[#0d3459]">
              {sortableHeader('id', 'Machine')}
              {sortableHeader('status', 'Status')}
              {sortableHeader('load', 'Load')}
              {sortableHeader('temp', 'Temperature')}
              {sortableHeader('vibration', 'Vibration')}
              <Th tone="dark">Power</Th>
              <Th tone="dark">Last Maintenance</Th>
            </Tr>
          </Thead>
          <tbody>
            {rows.length === 0 ? (
              <Tr className="border-[#0d3459]">
                <Td tone="dark" colSpan={7}>
                  <EmptyState
                    tone="dark"
                    title="No machines match the selected filter criteria."
                    action={
                      <button
                        type="button"
                        className="text-xs font-bold text-[#FF3D0A] hover:underline"
                        onClick={clearFilters}
                      >
                        Clear Filters
                      </button>
                    }
                  />
                </Td>
              </Tr>
            ) : (
              rows.map((m) => (
                <Tr
                  key={m.id}
                  className="group cursor-pointer border-[#0d3459] transition-colors hover:bg-white/5"
                  title="Click to view machine details"
                  onClick={() => setSelectedId(m.id)}
                >
                  <Td tone="dark" className="font-bold text-white">
                    <span className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        className="font-bold text-white transition-colors hover:text-[#FF3D0A]"
                        onClick={() => setSelectedId(m.id)}
                      >
                        {m.id}
                      </button>
                      <span className="text-[11px] font-normal text-slate-400 transition-colors group-hover:text-[#FF3D0A]">
                        {m.line} →
                      </span>
                    </span>
                  </Td>
                  <Td tone="dark">
                    <StatusPill status={m.status} />
                  </Td>
                  <Td tone="dark" className="font-medium text-slate-300">
                    {metricText(m.load, '')}
                  </Td>
                  <Td tone="dark" className="font-medium text-slate-300">
                    {metricText(m.temp, '°C')}
                  </Td>
                  <Td tone="dark" className="font-medium text-slate-300">
                    {metricText(m.vibration, ' mm/s')}
                  </Td>
                  <Td tone="dark" className="font-medium text-slate-300">
                    {metricText(m.power, '')}
                  </Td>
                  <Td tone="dark" className="font-normal text-slate-400">
                    {metricText(m.lastMaint, '')}
                  </Td>
                </Tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <MachineDetailsModal machine={selected} onClose={() => setSelectedId(null)} />

      <AddMachineModal
        open={addOpen}
        draft={draft}
        onDraft={patchDraft}
        onClose={closeAddModal}
        onSubmit={submitMachine}
      />
    </section>
  );
}
