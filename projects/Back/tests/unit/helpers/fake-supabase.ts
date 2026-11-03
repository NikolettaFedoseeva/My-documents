/**
 * Упрощённая in-memory имитация клиента Supabase для unit-тестов.
 * Поддерживает ровно то, что использует бэкенд: select / insert / update / delete,
 * eq, or (игнорируется, но запоминается), order, limit, single, maybeSingle.
 */

type Row = Record<string, any>
type DbError = { message: string; code?: string } | null
type Result = { data: any; error: DbError }

type Operation = 'select' | 'insert' | 'update' | 'delete'

export interface FakeDb {
  tables: Record<string, Row[]>
  /** Журнал фильтров .or(...) — чтобы проверять, что в них не попал мусор */
  orFilters: string[]
  /** Если задано — любая операция вернёт эту ошибку БД */
  failWith: DbError
  from(table: string): QueryBuilder
  reset(): void
  seed(table: string, rows: Row[]): void
}

class QueryBuilder implements PromiseLike<Result> {
  private operation: Operation = 'select'
  private payload: Row | Row[] | null = null
  private filters: Array<(row: Row) => boolean> = []
  private expectOne: 'single' | 'maybeSingle' | null = null
  private limitCount: number | null = null
  private columns: string[] | null = null

  constructor(private db: FakeDb, private table: string) {}

  select(columns?: string): this {
    // select после insert/update означает «вернуть изменённые строки», операцию не меняем.
    // Список колонок учитываем, как настоящий PostgREST: лишние поля (например, password_hash) не вернутся.
    if (columns && columns.trim() !== '*') {
      this.columns = columns.split(',').map((c) => c.trim())
    }
    return this
  }

  insert(rows: Row | Row[]): this {
    this.operation = 'insert'
    this.payload = rows
    return this
  }

  update(values: Row): this {
    this.operation = 'update'
    this.payload = values
    return this
  }

  delete(): this {
    this.operation = 'delete'
    return this
  }

  eq(column: string, value: unknown): this {
    this.filters.push((row) => row[column] === value)
    return this
  }

  or(filter: string): this {
    this.db.orFilters.push(filter)
    return this
  }

  order(): this {
    return this
  }

  limit(count: number): this {
    this.limitCount = count
    return this
  }

  single(): this {
    this.expectOne = 'single'
    return this
  }

  maybeSingle(): this {
    this.expectOne = 'maybeSingle'
    return this
  }

  then<T1 = Result, T2 = never>(
    onfulfilled?: ((value: Result) => T1 | PromiseLike<T1>) | null,
    onrejected?: ((reason: unknown) => T2 | PromiseLike<T2>) | null,
  ): PromiseLike<T1 | T2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected)
  }

  private execute(): Result {
    if (this.db.failWith) {
      return { data: null, error: this.db.failWith }
    }

    const rows = (this.db.tables[this.table] ||= [])
    const matches = (row: Row): boolean => this.filters.every((f) => f(row))
    let result: Row[] = []

    switch (this.operation) {
      case 'select':
        result = rows.filter(matches)
        break
      case 'insert': {
        const list = Array.isArray(this.payload) ? this.payload : [this.payload as Row]
        for (const item of list) {
          if (this.table === 'users' && rows.some((r) => r.email === item.email)) {
            return { data: null, error: { message: 'duplicate key value', code: '23505' } }
          }
          const row = { id: `${this.table}-${rows.length + 1}`, is_banned: false, xp: 0, level: 1, ...item }
          rows.push(row)
          result.push(row)
        }
        break
      }
      case 'update':
        result = rows.filter(matches)
        result.forEach((r) => Object.assign(r, this.payload))
        break
      case 'delete': {
        result = rows.filter(matches)
        this.db.tables[this.table] = rows.filter((r) => !result.includes(r))
        break
      }
    }

    if (this.limitCount !== null) result = result.slice(0, this.limitCount)

    if (this.columns && this.operation !== 'delete') {
      const cols = this.columns
      result = result.map((row) => Object.fromEntries(cols.filter((c) => c in row).map((c) => [c, row[c]])))
    }

    if (this.expectOne === 'single') {
      return result.length === 1
        ? { data: result[0], error: null }
        : { data: null, error: { message: 'JSON object requested, multiple (or no) rows returned', code: 'PGRST116' } }
    }
    if (this.expectOne === 'maybeSingle') {
      return { data: result[0] ?? null, error: null }
    }
    return { data: result, error: null }
  }
}

export const createFakeSupabase = (): FakeDb => {
  const db: FakeDb = {
    tables: {},
    orFilters: [],
    failWith: null,
    from(table: string) {
      return new QueryBuilder(db, table)
    },
    reset() {
      db.tables = {}
      db.orFilters = []
      db.failWith = null
    },
    seed(table: string, rows: Row[]) {
      db.tables[table] = rows.map((r) => ({ ...r }))
    },
  }
  return db
}
