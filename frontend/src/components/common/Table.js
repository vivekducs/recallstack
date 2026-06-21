// frontend/src/components/common/Table.js
'use client';

export default function Table({
  headers = [],
  data = [],
  renderCell,
  className = '',
  ...props
}) {
  const getAlignClass = (align) => {
    if (align === 'right') return 'text-right';
    if (align === 'center') return 'text-center';
    return 'text-left';
  };

  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white/40 dark:bg-neutral-900/40 backdrop-blur-md ${className}`}>
      <table className="w-full border-collapse text-sm text-[var(--color-text-primary)]" {...props}>
        
        {/* Header Row */}
        <thead>
          <tr className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.06] dark:border-white/[0.06] select-none">
            {headers.map((header) => (
              <th
                key={header.key}
                className={`text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] ${getAlignClass(header.align)}`}
                style={{ padding: 'calc(var(--density-padding, 16px) * 0.75) var(--density-padding, 16px)' }}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Data Rows */}
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              className="border-b border-black/[0.04] dark:border-white/[0.04] last:border-b-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors duration-200"
            >
              {headers.map((header) => (
                <td
                  key={header.key}
                  className={`text-[var(--color-text-secondary)] ${getAlignClass(header.align)}`}
                  style={{ padding: 'calc(var(--density-padding, 16px) * 0.75) var(--density-padding, 16px)' }}
                >
                  {renderCell 
                    ? renderCell(row, header.key, rowIndex)
                    : row[header.key]
                  }
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={headers.length} className="p-8 text-center text-[var(--color-text-secondary)] italic">
                No data available in table
              </td>
            </tr>
          )}
        </tbody>

      </table>
    </div>
  );
}

