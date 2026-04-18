import React from "react";

import type { BaseProps } from "@types/common";
import { classNames } from "@utils/classNames";

import "../../../tokens/_tier2-table.scss";
import "./Table.scss";

type BaseDomProps = Omit<BaseProps, "as" | "size" | "variant" | "isDisabled">;

export type TableSize = "default" | "compact";
export type TableAlign = "left" | "center" | "right";

export interface TableColumn<TData> {
  key: string;
  header: React.ReactNode;
  accessor?: keyof TData | ((row: TData, rowIndex: number) => React.ReactNode);
  cell?: (row: TData, rowIndex: number) => React.ReactNode;
  align?: TableAlign;
  width?: number | string;
  headerClassName?: string;
  cellClassName?: string;
}

export interface TableProps<TData = Record<string, unknown>>
  extends Omit<React.TableHTMLAttributes<HTMLTableElement>, "children">,
    BaseDomProps {
  columns?: TableColumn<TData>[];
  data?: TData[];
  rowKey?: keyof TData | ((row: TData, rowIndex: number) => React.Key);
  getRowClassName?: (row: TData, rowIndex: number) => string | undefined;
  striped?: boolean;
  hover?: boolean;
  bordered?: boolean;
  stickyHeader?: boolean;
  stickyColumn?: boolean;
  maxHeight?: string;
  size?: TableSize;
  interactiveGrid?: boolean;
  caption?: React.ReactNode;
  ariaLabel?: string;
  containerClassName?: string;
  children?: React.ReactNode;
}

export interface TableHeadProps
  extends Omit<React.HTMLAttributes<HTMLTableSectionElement>, "children">,
    BaseDomProps {
  children?: React.ReactNode;
}

export interface TableBodyProps
  extends Omit<React.HTMLAttributes<HTMLTableSectionElement>, "children">,
    BaseDomProps {
  children?: React.ReactNode;
}

export interface TableRowProps extends Omit<React.HTMLAttributes<HTMLTableRowElement>, "children">, BaseDomProps {
  selected?: boolean;
  children?: React.ReactNode;
}

export interface TableCellProps
  extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, "align" | "children">,
    BaseDomProps {
  align?: TableAlign;
  children?: React.ReactNode;
}

export interface TableHeaderCellProps
  extends Omit<React.ThHTMLAttributes<HTMLTableCellElement>, "align" | "children">,
    BaseDomProps {
  align?: TableAlign;
  children?: React.ReactNode;
}

function getAlignClass(baseClass: string, align?: TableAlign): string {
  if (!align || align === "left") {
    return baseClass;
  }

  return `${baseClass} ${baseClass}--align-${align}`;
}

function resolveCellValue<TData>(
  column: TableColumn<TData>,
  row: TData,
  rowIndex: number,
): React.ReactNode {
  if (column.cell) {
    return column.cell(row, rowIndex);
  }

  if (typeof column.accessor === "function") {
    return column.accessor(row, rowIndex);
  }

  if (column.accessor) {
    return row[column.accessor] as React.ReactNode;
  }

  return null;
}

function resolveRowKey<TData>(
  row: TData,
  rowIndex: number,
  rowKey?: keyof TData | ((row: TData, rowIndex: number) => React.Key),
): React.Key {
  if (typeof rowKey === "function") {
    return rowKey(row, rowIndex);
  }

  if (rowKey) {
    return row[rowKey] as React.Key;
  }

  return rowIndex;
}

const TableRoot = React.forwardRef<HTMLTableElement, TableProps<any>>(function Table<TData>(
  {
    className,
    columns,
    data,
    rowKey,
    getRowClassName,
    striped = false,
    hover = false,
    bordered = false,
    stickyHeader = false,
    stickyColumn = false,
    maxHeight,
    size = "default",
    interactiveGrid = false,
    caption,
    ariaLabel,
    containerClassName,
    children,
    ...rest
  }: TableProps<TData>,
  ref,
) {
  const hasDataAPI = Array.isArray(columns) && Array.isArray(data);

  return (
    <div
      className={classNames(
        "ds-table__container",
        {
          "ds-table__container--striped": striped,
          "ds-table__container--hover": hover,
          "ds-table__container--bordered": bordered,
          "ds-table__container--sticky-header": stickyHeader,
          "ds-table__container--sticky-column": stickyColumn,
          "ds-table__container--compact": size === "compact",
        },
        containerClassName,
      )}
      style={stickyHeader && maxHeight ? { maxHeight } : undefined}
    >
      <table
        {...rest}
        ref={ref}
        className={classNames("ds-table", `ds-table--size-${size}`, className)}
        role={interactiveGrid ? "grid" : undefined}
        aria-label={ariaLabel}
      >
        {caption ? <caption className="ds-table__caption">{caption}</caption> : null}

        {hasDataAPI ? (
          <>
            <thead className="ds-table__head">
              <tr className="ds-table__row">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={classNames(
                      getAlignClass("ds-table__header-cell", column.align),
                      column.headerClassName,
                    )}
                    style={column.width !== undefined ? { width: column.width } : undefined}
                    scope="col"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="ds-table__body">
              {data.map((row, rowIndex) => (
                <tr
                  key={resolveRowKey(row, rowIndex, rowKey)}
                  className={classNames("ds-table__row", getRowClassName?.(row, rowIndex))}
                >
                  {columns.map((column) => (
                    <td
                      key={`${String(resolveRowKey(row, rowIndex, rowKey))}-${column.key}`}
                      className={classNames(
                        getAlignClass("ds-table__cell", column.align),
                        column.cellClassName,
                      )}
                    >
                      {resolveCellValue(column, row, rowIndex)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </>
        ) : (
          children
        )}
      </table>
    </div>
  );
});

const TableHead = React.forwardRef<HTMLTableSectionElement, TableHeadProps>(function TableHead(
  { className, children, ...rest },
  ref,
) {
  return (
    <thead {...rest} ref={ref} className={classNames("ds-table__head", className)}>
      {children}
    </thead>
  );
});

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(function TableBody(
  { className, children, ...rest },
  ref,
) {
  return (
    <tbody {...rest} ref={ref} className={classNames("ds-table__body", className)}>
      {children}
    </tbody>
  );
});

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { className, selected = false, children, ...rest },
  ref,
) {
  return (
    <tr
      {...rest}
      ref={ref}
      className={classNames(
        "ds-table__row",
        {
          "ds-table__row--selected": selected,
        },
        className,
      )}
      aria-selected={selected || undefined}
    >
      {children}
    </tr>
  );
});

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { className, align = "left", children, ...rest },
  ref,
) {
  return (
    <td
      {...rest}
      ref={ref}
      className={classNames(getAlignClass("ds-table__cell", align), className)}
    >
      {children}
    </td>
  );
});

const TableHeaderCell = React.forwardRef<HTMLTableCellElement, TableHeaderCellProps>(function TableHeaderCell(
  { className, align = "left", scope = "col", children, ...rest },
  ref,
) {
  return (
    <th
      {...rest}
      ref={ref}
      scope={scope}
      className={classNames(getAlignClass("ds-table__header-cell", align), className)}
    >
      {children}
    </th>
  );
});

interface TableComponent extends React.ForwardRefExoticComponent<TableProps<any> & React.RefAttributes<HTMLTableElement>> {
  Head: React.ForwardRefExoticComponent<TableHeadProps & React.RefAttributes<HTMLTableSectionElement>>;
  Body: React.ForwardRefExoticComponent<TableBodyProps & React.RefAttributes<HTMLTableSectionElement>>;
  Row: React.ForwardRefExoticComponent<TableRowProps & React.RefAttributes<HTMLTableRowElement>>;
  Cell: React.ForwardRefExoticComponent<TableCellProps & React.RefAttributes<HTMLTableCellElement>>;
  HeaderCell: React.ForwardRefExoticComponent<TableHeaderCellProps & React.RefAttributes<HTMLTableCellElement>>;
}

const Table = TableRoot as TableComponent;

Table.Head = TableHead;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;
Table.HeaderCell = TableHeaderCell;

export default Table;

export function TableExample(): React.JSX.Element {
  type ProductRow = {
    id: string;
    name: string;
    category: string;
    price: string;
  };

  const columns: TableColumn<ProductRow>[] = [
    { key: "name", header: "Product", accessor: "name" },
    { key: "category", header: "Category", accessor: "category" },
    { key: "price", header: "Price", accessor: "price", align: "right" },
  ];

  const data: ProductRow[] = [
    { id: "1", name: "Noise-Canceling Headphones", category: "Audio", price: "$199" },
    { id: "2", name: "Mechanical Keyboard", category: "Accessories", price: "$129" },
  ];

  return (
    <div style={{ display: "grid", gap: "2rem" }}>
      <Table<ProductRow>
        columns={columns}
        data={data}
        rowKey="id"
        striped
        hover
        bordered
        ariaLabel="Products table"
      />

      <Table bordered hover ariaLabel="Manual table composition">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Order</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell align="right">Total</Table.HeaderCell>
          </Table.Row>
        </Table.Head>

        <Table.Body>
          <Table.Row>
            <Table.Cell>#1001</Table.Cell>
            <Table.Cell>Processing</Table.Cell>
            <Table.Cell align="right">$84.00</Table.Cell>
          </Table.Row>
          <Table.Row selected>
            <Table.Cell>#1002</Table.Cell>
            <Table.Cell>Shipped</Table.Cell>
            <Table.Cell align="right">$142.00</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </div>
  );
}