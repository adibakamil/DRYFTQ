import { useMemo, useState } from 'react';
import { Button, EmptyState, SearchInput, Table, Td, Th, Thead, Tr } from '../components/ui';
import { Icon } from '../components/Icon';
import { usePlantState } from '../store/context';
import { matchesQuery } from '../lib/utils';
import { EditRoleModal } from '../features/team/EditRoleModal';
import { InviteMemberModal } from '../features/team/InviteMemberModal';
import { MemberStatusBadge, RoleBadge } from '../features/team/RoleBadge';
import { RemoveMemberDialog } from '../features/team/RemoveMemberDialog';
import {
  ACCENT_BTN,
  AVATAR_FALLBACK,
  PILL_ACTIVE,
  PILL_IDLE,
  ROLE_FILTERS,
  memberEmail,
  type RoleFilter,
} from '../features/team/shared';

/**
 * Team Management module (legacy `DRYFTQ DASHBOARD 8(TEAM MANAGEMENT)/code.html`).
 * The shell owns the page title, global search, bell and operator pill — this
 * component renders the module body only.
 */
export default function TeamPage() {
  const state = usePlantState();

  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [query, setQuery] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const team = state.team;

  const metrics = useMemo(
    () => [
      { id: 'metric-total', label: 'Total Members', value: team.length },
      { id: 'metric-active', label: 'Active Users', value: team.filter((m) => m.status === 'Active').length },
      { id: 'metric-admins', label: 'Admins', value: team.filter((m) => m.role === 'Admin').length },
      { id: 'metric-viewers', label: 'Viewers', value: team.filter((m) => m.role === 'Viewer').length },
    ],
    [team],
  );

  const rows = useMemo(
    () =>
      team.filter(
        (member) =>
          (roleFilter === 'ALL' || member.role === roleFilter) &&
          matchesQuery(query, member.name, member.email, member.department),
      ),
    [team, roleFilter, query],
  );

  // Read state inside the render (no stale member snapshots after an action).
  const editingMember = useMemo(
    () => (editingId ? (team.find((m) => m.id === editingId) ?? null) : null),
    [team, editingId],
  );
  const removingMember = useMemo(
    () => (removingId ? (team.find((m) => m.id === removingId) ?? null) : null),
    [team, removingId],
  );

  return (
    <>
      {/* Page header */}
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Team Management</h2>
          <p className="mt-1 text-sm text-slate-400">
            Manage plant operations personnel, access tiers, and engineering roles
          </p>
        </div>
        <Button
          variant="primary"
          className={`${ACCENT_BTN} px-6 py-2.5 text-sm font-bold tracking-wide shadow-lg shadow-orange-900/30`}
          icon={<Icon name="plus" className="h-4 w-4" strokeWidth={3} />}
          onClick={() => setInviteOpen(true)}
        >
          Invite Member
        </Button>
      </header>

      {/* Metric tiles */}
      <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.id} className="console-card flex flex-col justify-center p-5">
            <span className="mb-2 text-sm font-semibold text-slate-400">{metric.label}</span>
            <span id={metric.id} className="text-4xl font-extrabold tracking-tight text-white">
              {metric.value}
            </span>
          </div>
        ))}
      </section>

      {/* Role filter + search */}
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter members by role">
          {ROLE_FILTERS.map((filter) => {
            const active = roleFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                aria-pressed={active}
                className={`role-filter-btn ${active ? PILL_ACTIVE : PILL_IDLE}`}
                onClick={() => setRoleFilter(filter.value)}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <SearchInput
          id="member-search"
          aria-label="Search team members"
          placeholder="Search by name, email, department..."
          className="w-full md:w-72 [&_input]:border-white/10 [&_input]:bg-white/5 [&_input]:text-white [&_input]:placeholder-slate-500"
          value={query}
          onChange={setQuery}
          onClear={() => setQuery('')}
        />
      </div>

      {/* Members table */}
      <section className="console-card p-6">
        <Table tone="dark">
          <Thead tone="dark">
            <Tr className="border-[#0d3459]">
              <Th tone="dark">Member</Th>
              <Th tone="dark" className="pl-2">
                Role
              </Th>
              <Th tone="dark">Department</Th>
              <Th tone="dark">Status</Th>
              <Th tone="dark">Last Active</Th>
              <Th tone="dark" className="text-right">
                Actions
              </Th>
            </Tr>
          </Thead>
          <tbody className="text-sm">
            {rows.map((member) => (
              <Tr key={member.id} className="border-[#0d3459]">
                <Td tone="dark" className="py-4 pr-4">
                  <div className="flex items-center gap-3.5">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/10">
                      <img
                        src={member.avatar || AVATAR_FALLBACK}
                        alt={member.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[15px] font-bold text-white">{member.name}</span>
                      <span className="block text-xs text-slate-400">{memberEmail(member)}</span>
                    </div>
                  </div>
                </Td>
                <Td tone="dark" className="pl-2">
                  <RoleBadge role={member.role} />
                </Td>
                <Td tone="dark" className="text-slate-400">
                  {member.department || 'Plant Operations'}
                </Td>
                <Td tone="dark">
                  <MemberStatusBadge status={member.status} />
                </Td>
                <Td tone="dark" className="text-slate-400">
                  {member.lastActive || 'Recently'}
                </Td>
                <Td tone="dark" className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      title="Change Role"
                      aria-label={`Change role for ${member.name}`}
                      className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200 transition hover:bg-white/20"
                      onClick={() => setEditingId(member.id)}
                    >
                      Edit Role
                    </button>
                    <button
                      type="button"
                      title="Remove Member"
                      aria-label={`Remove ${member.name}`}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                      onClick={() => setRemovingId(member.id)}
                    >
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>

        {rows.length === 0 && (
          <EmptyState
            tone="dark"
            icon="users"
            title="No team members match criteria"
            message="Try adjusting your role filter or search term"
          />
        )}
      </section>

      <InviteMemberModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
      <EditRoleModal member={editingMember} onClose={() => setEditingId(null)} />
      <RemoveMemberDialog member={removingMember} onClose={() => setRemovingId(null)} />
    </>
  );
}
