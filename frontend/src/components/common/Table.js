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
    <div className={`w-full overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] ${className}`}>
      <table className="w-full border-collapse text-sm text-[var(--color-text-primary)]" {...props}>
        
        {/* Header Row: bg light gray (#F5F5F5) / dark gray (#2A2A2A), 600 weight, padding 12px, border bottom 2px */}
        <thead>
          <tr className="bg-[#F5F5F5] dark:bg-[#2A2A2A] border-b-2 border-[var(--color-border)] select-none">
            {headers.map((header) => (
              <th
                key={header.key}
                className={`font-semibold text-[var(--color-text-primary)] ${getAlignClass(header.align)}`}
                style={{ padding: 'calc(var(--density-padding, 16px) * 0.75) var(--density-padding, 16px)' }}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Data Rows: alternating background, padding 12px, border bottom, hover 5% darker */}
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              className={`
                border-b border-[var(--color-border)] hover:brightness-95 transition-all
                bg-white odd:bg-[#FAFAFA]
                dark:bg-[#1A1A1A] dark:odd:bg-[#222222]
              `}
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
