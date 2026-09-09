import { type ReactNode } from 'react';
import ScrollHintTable from '@/components/ScrollHintTable';
import { cn } from '@/lib/utils';

export interface StickyColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface Props<T> {
  rows: T[];
  rowKey: (row: T) => string;
  renderSticky: (row: T, index: number) => ReactNode;
  stickyHeader: string;
  columns: StickyColumn<T>[];
  className?: string;
  emptyText?: string;
  onRowClick?: (row: T) => void;
}

function StickyTable<T>({
  rows,
  rowKey,
  renderSticky,
  stickyHeader,
  columns,
  className,
  emptyText = 'Данных пока нет',
  onRowClick,
}: Props<T>) {
  return (
    <ScrollHintTable className={className}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            <th className="sticky left-0 z-10 bg-card px-3 py-3 text-left">{stickyHeader}</th>
            {columns.map((c) => (
              <th key={c.key} className={cn('whitespace-nowrap px-2.5 py-3 text-right', c.className)}>
                {c.header}
              </th>
            ))}
            <th className="w-1 px-1" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const Comp = onRowClick ? 'button' : 'tr';
            return (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-t border-border text-[0.86rem]',
                  onRowClick && 'cursor-pointer transition-colors hover:bg-secondary/40',
                )}
              >
                <td className="sticky left-0 z-10 bg-card px-3 py-2.5">{renderSticky(row, i)}</td>
                {columns.map((c) => (
                  <td key={c.key} className={cn('tabnum whitespace-nowrap px-2.5 py-2.5 text-right', c.className)}>
                    {c.render(row)}
                  </td>
                ))}
                <td className="w-1 px-1" />
              </tr>
            );
          })}
          {!rows.length && (
            <tr>
              <td colSpan={columns.length + 2} className="px-4 py-8 text-center text-[0.85rem] text-muted-foreground">
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </ScrollHintTable>
  );
}

export default StickyTable;
