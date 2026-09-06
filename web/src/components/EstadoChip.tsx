interface EstadoChipProps {
  label: string;
  colorClass: string;
}

export default function EstadoChip({ label, colorClass }: EstadoChipProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${colorClass}`}>
      {label}
    </span>
  );
}
