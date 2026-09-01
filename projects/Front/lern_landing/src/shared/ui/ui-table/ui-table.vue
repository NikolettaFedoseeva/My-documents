<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TableColumn } from './types'

// #region Props & Emits
interface Props {
  columns: TableColumn[]
  data: Record<string, any>[]
  hoverable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hoverable: true,
})

const sortKey = ref<string>('')
const sortOrder = ref<'asc' | 'desc'>('asc')

const onSort = (column: TableColumn) => {
  if (!column.sortable) return
  if (sortKey.value === column.key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = column.key
    sortOrder.value = 'asc'
  }
}

const sortedData = computed(() => {
  if (!sortKey.value) return props.data
  return [...props.data].sort((a, b) => {
    const valA = a[sortKey.value]
    const valB = b[sortKey.value]
    if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
    if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})
// #endregion Functions
</script>

<template>
  <div class="ui-table-wrapper">
    <table class="ui-table" :class="{ 'ui-table--hoverable': props.hoverable }">
      <thead>
        <tr>
          <th
            v-for="col in props.columns"
            :key="col.key"
            :style="{ width: col.width }"
            :class="{ 'ui-table__th--sortable': col.sortable }"
            @click="onSort(col)"
          >
            <div class="ui-table__th-content">
              <span>{{ col.label }}</span>
              <span v-if="col.sortable && sortKey === col.key" class="ui-table__sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, idx) in sortedData" :key="idx">
          <td v-for="col in props.columns" :key="col.key">
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
        <tr v-if="!sortedData.length">
          <td :colspan="props.columns.length" class="ui-table__empty">
            Нет данных для отображения
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.ui-table-wrapper {
  width: 100%;
  overflow-x: auto;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  backdrop-filter: var(--card-blur);
}

.ui-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
  color: var(--text-main);

  th {
    padding: 0.85rem 1.15rem;
    font-weight: 700;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    background: var(--bg-container);
    border-bottom: 1px solid var(--border-color);
    user-select: none;
  }

  &__th--sortable {
    cursor: pointer;
    &:hover {
      color: var(--primary);
    }
  }

  &__th-content {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }

  &__sort-icon {
    font-size: 0.65rem;
    color: var(--primary);
  }

  td {
    padding: 0.85rem 1.15rem;
    border-bottom: 1px solid var(--border-color);
  }

  tr:last-child td {
    border-bottom: none;
  }

  &--hoverable tbody tr {
    transition: background 0.15s ease;
    &:hover {
      background: var(--bg-card-hover);
    }
  }

  &__empty {
    text-align: center;
    padding: 2rem !important;
    color: var(--text-muted);
    font-style: italic;
  }
}
</style>
