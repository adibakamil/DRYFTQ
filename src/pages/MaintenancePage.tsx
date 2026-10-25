/**
 * Maintenance module — React migration of the legacy
 * `DRYFTQ ALL DASHBOARD/DRYFTQ DASHBOARD 6 (MAINTENANCE)/code.html`.
 *
 * Every value renders from `usePlantState()`; there are no manual event
 * listeners, timers or direct DOM mutations.
 */
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useActions, usePlantState, useToasts } from '../store/context';
import { cx } from '../lib/utils';
import { downloadReport } from '../lib/reports';
import { Icon } from '../components/Icon';
import { EmptyState, Table, Td, Th, Thead, Tr } from '../components/ui';
import type { MaintenanceStatus } from '../lib/types';
import { MaintenanceStatusBadge, PriorityBadge } from '../features/maintenance/Badges';
import { NewTaskModal } from '../features/maintenance/NewTaskModal';
import { TaskModal } from '../features/maintenance/TaskModal';
import {
  ACCENT_BTN,
  COMPLETED_BASELINE,
  METRIC_CARDS,
  MUTED_BTN,
  TASK_FILTERS,
  defaultDraft,
  type NewTaskDraft,
  type TaskFilter,
} from '../features/maintenance/shared';

export default function MaintenancePage() {
  const state = usePlantState();
  const actions = useActions();
  const { notify } = useToasts();
  const [searchParams] = useSearchParams();

  // Local UI state (legacy: `currentMaintStatus`, `activeTaskId`, modal ids).
  const [filter, setFilter] = useState<TaskFilter>('Upcoming');
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    // `?taskId=<id>` opens the task modal once, on mount.
    const param = searchParams.get('taskId');
    return param && state.maintenanceTasks.some((t) => t.id === param) ? param : null;
  });
  const [newOpen, setNewOpen] = useState(() => Boolean(searchParams.get('newForMachine')));
  const [draft, setDraft] = useState<NewTaskDraft>(() => {
    const base = defaultDraft(state.machines);
    // `?newForMachine=<id>` preselects that machine in the modal (once, on mount).
    const preselect = searchParams.get('newForMachine');
    return preselect && state.machines.some((m) => m.id === preselect)
      ? { ...base, machine: preselect }
      : base;
  });
  /** `maintenanceTasks.length` captured when Create was pressed (null = none pending). */
  const pendingAddRef = useRef<number | null>(null);

  // Counts for the filter pills — the Completed pill keeps the legacy
  // `completedCount + 27` archived baseline quirk.
  const counts = useMemo(() => {
    const byStatus = (s: MaintenanceStatus) => state.maintenanceTasks.filter((t) => t.status === s).length;
    return {
      Upcoming: byStatus('Upcoming'),
      'In Progress': byStatus('In Progress'),
      Completed: byStatus('Completed') + COMPLETED_BASELINE,
      All: state.maintenanceTasks.length,
    } satisfies Record<TaskFilter, number>;
  }, [state.maintenanceTasks]);

  const rows = useMemo(
    () => state.maintenanceTasks.filter((t) => filter === 'All' || t.status === filter),
    [state.maintenanceTasks, filter],
  );

  // Live lookup so the open modal always shows the current status after a
  // transition (no stale copies).
  const selected = selectedId ? (state.maintenanceTasks.find((t) => t.id === selectedId) ?? null) : null;

  // Close the dialog only after the store actually accepted the task; on a
  // validation failure the list does not grow, the modal stays open and the
  // action's own error toast explains why.
  useEffect(() => {
    const before = pendingAddRef.current;
    if (before !== null && state.maintenanceTasks.length > before) {
      pendingAddRef.current = null;
      setDraft(defaultDraft(state.machines));
      setNewOpen(false);
    }
  }, [state.maintenanceTasks.length, state.machines]);

  const patchDraft = (patch: Partial<NewTaskDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const closeNewModal = () => {
    pendingAddRef.current = null;
    setNewOpen(false);
  };

  const openNewModal = () => {
    setDraft(defaultDraft(state.machines));
    setNewOpen(true);
  };

  const submitTask = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    pendingAddRef.current = state.maintenanceTasks.length;
    actions.createMaintenanceTask({
      task: draft.task.trim(),
      machine: draft.machine,
      type: draft.type,
      priority: draft.priority,
      technician: draft.technician,
      dueDate: draft.dueDate,
      notes: draft.notes,
    });
  };

  // Legacy `handleStatusTransition()` transitions and closes the modal.
  const transition = (taskId: string, status: MaintenanceStatus) => {
    actions.updateMaintenanceStatus(taskId, status);
    setSelectedId(null);
  };

  const exportCsv = () => {
    const filename = downloadReport('Maintenance Report', state);
    notify({ message: `Exported ${filename} successfully.`, title: 'Report Exported', type: 'success' });
  };

  return (
    <section aria-labelledby="maintenance-heading" className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="maintenance-heading" className="text-lg font-bold text-white">
            Maintenance
          </h2>
          <p className="mt-0.5 text-sm text-slate-400">
            Schedule, track, and complete machine maintenance work orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className={cx(MUTED_BTN, 'shrink-0')} onClick={exportCsv}>
            <Icon name="download" className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button type="button" className={cx(ACCENT_BTN, 'shrink-0')} onClick={openNewModal}>
            <Icon name="plus" className="h-4 w-4" />
            <span>New Maintenance</span>
          </button>
        </div>
      </div>

      {/* Filter pills with live counts */}
      <div role="group" aria-label="Filter tasks by status" className="flex flex-wrap items-center gap-2">
        {TASK_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={cx(
              'rounded-full px-5 py-2 text-xs font-semibold transition-colors',
              filter === f
                ? 'bg-[#FF3D0A] text-white shadow-sm hover:bg-[#e03405]'
                : 'border border-white/10 bg-white/5 text-slate-300 shadow-sm hover:bg-white/10 hover:text-white',
            )}
          >
            {f === 'All' ? 'All Tasks' : f} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Maintenance schedule table */}
      <div className="console-card overflow-hidden">
        <Table tone="dark">
          <Thead tone="dark">
            <Tr className="border-[#0d3459]">
              <Th tone="dark">Task</Th>
              <Th tone="dark">Machine</Th>
              <Th tone="dark">Type</Th>
              <Th tone="dark">Priority</Th>
              <Th tone="dark">Due Date</Th>
              <Th tone="dark">Status</Th>
              <Th tone="dark" className="text-right">
                Action
              </Th>
            </Tr>
          </Thead>
          <tbody>
            {rows.length === 0 ? (
              <Tr className="border-[#0d3459]">
                <Td tone="dark" colSpan={7}>
                  <EmptyState
                    tone="dark"
                    icon="wrench"
                    title={`No tasks currently under "${filter}".`}
                    action={
                      <button
                        type="button"
                        className="text-xs font-bold text-[#FF3D0A] hover:underline"
                        onClick={() => setFilter('All')}
                      >
                        View All Tasks
                      </button>
                    }
                  />
                </Td>
              </Tr>
            ) : (
              rows.map((t) => (
                <Tr
                  key={t.id}
                  className="group cursor-pointer border-[#0d3459] transition-colors hover:bg-white/5"
                  title="Click to manage this work order"
                  onClick={() => setSelectedId(t.id)}
                >
                  <Td tone="dark" className="font-medium text-white transition-colors group-hover:text-[#FF3D0A]">
                    {t.task}
                  </Td>
                  <Td tone="dark" className="font-bold text-white">
                    {t.machine}
                  </Td>
                  <Td tone="dark" className="text-xs text-slate-400">
                    {t.type}
                  </Td>
                  <Td tone="dark">
                    <PriorityBadge priority={t.priority} />
                  </Td>
                  <Td tone="dark" className="text-xs font-medium text-slate-400">
                    {t.dueDate}
                  </Td>
                  <Td tone="dark">
                    <MaintenanceStatusBadge status={t.status} />
                  </Td>
                  <Td tone="dark" className="text-right">
                    <button
                      type="button"
                      className="text-xs font-bold text-[#FF3D0A] hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(t.id);
                      }}
                    >
                      Manage →
                    </button>
                  </Td>
                </Tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Static maintenance KPI cards (legacy fixed values) */}
      <section aria-label="Maintenance Metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRIC_CARDS.map((card) => (
          <article key={card.label} className="console-card flex flex-col justify-between p-5">
            <div>
              <span className="console-label">{card.label}</span>
              <div className="mt-2 text-2xl font-extrabold text-white">{card.value}</div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <Icon name={card.dir} className="h-3.5 w-3.5" />
              <span>{card.delta}</span>
              <span className="ml-1 font-normal text-slate-400">vs last 30 days</span>
            </div>
          </article>
        ))}
      </section>

      <TaskModal task={selected} onClose={() => setSelectedId(null)} onTransition={transition} />

      <NewTaskModal
        open={newOpen}
        machines={state.machines}
        draft={draft}
        onDraft={patchDraft}
        onClose={closeNewModal}
        onSubmit={submitTask}
      />
    </section>
  );
}
