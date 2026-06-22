interface Props { status: string; }

const cfg: Record<string, { cls: string; dot: string; label: string }> = {
  active:   { cls: 'tag tag-green',  dot: '#1A7F4B', label: 'Active' },
  expiring: { cls: 'tag tag-amber',  dot: '#B45309', label: 'Expiring' },
  expired:  { cls: 'tag tag-red',    dot: '#C0392B', label: 'Expired' },
};

export default function StatusBadge({ status }: Props) {
  const s = cfg[status] ?? cfg.active;
  return (
    <span className={s.cls}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}
