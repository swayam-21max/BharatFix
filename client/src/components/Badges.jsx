export function StatusBadge({ status }) {
    const label = status?.replace(/_/g, ' ') || 'N/A';
    return <span className={`badge badge-${status?.toLowerCase()}`}>{label}</span>;
}

export function PriorityBadge({ priority }) {
    return <span className={`badge badge-${priority?.toLowerCase()}`}>{priority}</span>;
}

export function RoleBadge({ role }) {
    return <span className={`badge badge-${role?.toLowerCase()}`}>{role}</span>;
}
