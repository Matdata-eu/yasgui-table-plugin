declare module 'tabulator-tables' {
  export interface CellComponent {
    getValue(): any;
    getField(): string;
    getRow(): RowComponent;
    getElement(): HTMLElement;
  }

  export interface RowComponent {
    getCells(): CellComponent[];
    getData(): any;
    getPosition(): number;
  }

  export interface ColumnComponent {
    getField(): string;
    getWidth(): number;
    setWidth(width: number | string): void;
    getDefinition(): ColumnDefinition;
  }

  export interface ColumnDefinition {
    title?: string;
    field?: string;
    width?: number | string;
    minWidth?: number;
    maxWidth?: number;
    formatter?: any;
    headerSort?: boolean;
    sorter?: any;
    [key: string]: any;
  }

  export interface Options {
    data?: any[];
    columns?: ColumnDefinition[];
    layout?: string;
    placeholder?: string;
    initialSort?: Array<{ column: string; dir: 'asc' | 'desc' }>;
    [key: string]: any;
  }

  export class TabulatorFull {
    element: HTMLElement;
    
    constructor(element: HTMLElement | string, options?: Options);
    
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string, callback?: (...args: any[]) => void): void;
    
    getData(filter?: string): any[];
    getDataFiltered(): any[];
    setFilter(filter: any): void;
    clearFilter(): void;
    
    getColumns(): ColumnComponent[];
    getColumn(field: string): ColumnComponent | false;
    
    setLayout(mode: string): void;
    destroy(): void;
    redraw(force?: boolean): void;
    
    [key: string]: any;
  }
}
