<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useCommandPalette } from '../model/use-command-palette'
import type { CommandItem } from '../types'

const {
  isOpen,
  searchQuery,
  selectedIndex,
  isLoading,
  filteredItems,
  close,
  executeItem,
} = useCommandPalette()

const inputRef = ref<HTMLInputElement | null>(null)

watch(isOpen, async (val) => {
  if (val) {
    await nextTick()
    inputRef.value?.focus()
  }
})

const onOverlayClick = (e: MouseEvent) => {
  if ((e.target as HTMLElement).classList.contains('command-palette-overlay')) {
    close()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="palette-fade">
      <div
        v-if="isOpen"
        class="command-palette-overlay"
        @click="onOverlayClick"
      >
        <div class="command-palette-window">
          <!-- Верхний блок ввода с иконкой и шорткатом -->
          <div class="command-palette__search-bar">
            <span class="search-icon">🔍</span>
            <input
              ref="inputRef"
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="Поиск по курсам, статьям, действиям... (или начните вводить)"
              autocomplete="off"
              spellcheck="false"
            />
            <button
              v-if="searchQuery"
              type="button"
              class="btn-clear"
              title="Очистить"
              @click="searchQuery = ''"
            >
              ✕
            </button>
            <span class="esc-badge" @click="close">Esc</span>
          </div>

          <!-- Спиннер загрузки при первичном сборе -->
          <div v-if="isLoading" class="command-palette__loading">
            <div class="palette-spinner"></div>
            <span>Индексация базы знаний LERN...</span>
          </div>

          <!-- Список результатов поиска -->
          <div v-else-if="filteredItems.length > 0" class="command-palette__results">
            <div
              v-for="(item, index) in filteredItems"
              :key="item.id"
              class="command-item"
              :class="{ 'command-item--selected': index === selectedIndex }"
              @mouseenter="selectedIndex = index"
              @click="executeItem(item)"
            >
              <div class="command-item__left">
                <span class="command-item__icon">{{ item.icon }}</span>
                <div class="command-item__info">
                  <div class="command-item__title-row">
                    <span class="command-item__title">{{ item.title }}</span>
                    <span v-if="item.badge" class="command-item__badge">{{ item.badge }}</span>
                  </div>
                  <span v-if="item.description" class="command-item__desc">
                    {{ item.description }}
                  </span>
                </div>
              </div>

              <div class="command-item__right">
                <span class="command-item__category-tag">{{ item.categoryLabel }}</span>
                <span v-if="item.shortcut" class="command-item__shortcut">{{ item.shortcut }}</span>
                <span v-if="index === selectedIndex" class="command-item__enter-hint">↵</span>
              </div>
            </div>
          </div>

          <!-- Пустое состояние -->
          <div v-else class="command-palette__empty">
            <span class="empty-icon">🔎</span>
            <p class="empty-title">Ничего не найдено по запросу «{{ searchQuery }}»</p>
            <span class="empty-hint">Попробуйте ввести название дисциплины, технологии или главы (например: Vue, TypeScript, Active Recall)</span>
          </div>

          <!-- Подвал с подсказками по клавишам -->
          <footer class="command-palette__footer">
            <div class="footer-hints">
              <span class="hint-item"><kbd>↑</kbd><kbd>↓</kbd> Навигация</span>
              <span class="hint-item"><kbd>↵</kbd> Выбрать</span>
              <span class="hint-item"><kbd>Esc</kbd> Закрыть</span>
            </div>
            <div class="footer-brand">
              <span>LERN Spotlight</span>
            </div>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.command-palette-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(10, 15, 29, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
}

.command-palette-window {
  width: 100%;
  max-width: 680px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  box-shadow:
    0 25px 60px -15px rgba(0, 0, 0, 0.65),
    0 0 40px rgba(99, 102, 241, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Поисковая строка */
.command-palette__search-bar {
  display: flex;
  align-items: center;
  padding: 1.15rem 1.4rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  gap: 0.85rem;
  background: rgba(255, 255, 255, 0.02);

  .search-icon {
    font-size: 1.25rem;
    opacity: 0.8;
  }

  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #f8fafc;
    font-size: 1.1rem;
    font-weight: 500;
    font-family: inherit;

    &::placeholder {
      color: #64748b;
      font-weight: 400;
    }
  }

  .btn-clear {
    background: rgba(255, 255, 255, 0.08);
    border: none;
    color: #94a3b8;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
    }
  }

  .esc-badge {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #94a3b8;
    padding: 0.2rem 0.5rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
  }
}

/* Список результатов */
.command-palette__results {
  max-height: 380px;
  overflow-y: auto;
  padding: 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
  }
}

.command-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
  background: transparent;

  &--selected {
    background: rgba(99, 102, 241, 0.16);
    border-left: 3px solid #818cf8;
    padding-left: calc(1rem - 3px);
  }

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  &--selected:hover {
    background: rgba(99, 102, 241, 0.22);
  }
}

.command-item__left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
  flex: 1;

  .command-item__icon {
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .command-item__info {
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 0.15rem;
  }

  .command-item__title-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .command-item__title {
    color: #f1f5f9;
    font-weight: 600;
    font-size: 0.95rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .command-item__badge {
    background: rgba(99, 102, 241, 0.2);
    border: 1px solid rgba(129, 140, 248, 0.35);
    color: #a5b4fc;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.1rem 0.4rem;
    border-radius: 6px;
    white-space: nowrap;
  }

  .command-item__desc {
    color: #94a3b8;
    font-size: 0.8rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.command-item__right {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
  margin-left: 0.75rem;

  .command-item__category-tag {
    font-size: 0.75rem;
    color: #64748b;
    font-weight: 500;
  }

  .command-item__shortcut {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #cbd5e1;
    font-size: 0.7rem;
    font-family: monospace;
    padding: 0.15rem 0.35rem;
    border-radius: 4px;
  }

  .command-item__enter-hint {
    background: rgba(129, 140, 248, 0.25);
    color: #c7d2fe;
    width: 20px;
    height: 20px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
  }
}

/* Пустое состояние и лоадер */
.command-palette__empty,
.command-palette__loading {
  padding: 3rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.6rem;
}

.empty-icon {
  font-size: 2.5rem;
  opacity: 0.7;
}

.empty-title {
  color: #f1f5f9;
  font-weight: 600;
  font-size: 1rem;
  margin: 0;
}

.empty-hint {
  color: #64748b;
  font-size: 0.85rem;
  max-width: 440px;
}

.palette-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #818cf8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Подвал */
.command-palette__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.4rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.2);
  color: #64748b;
  font-size: 0.75rem;

  .footer-hints {
    display: flex;
    gap: 1.25rem;

    .hint-item {
      display: flex;
      align-items: center;
      gap: 0.35rem;

      kbd {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #cbd5e1;
        padding: 0.1rem 0.35rem;
        border-radius: 4px;
        font-family: inherit;
        font-weight: 600;
      }
    }
  }

  .footer-brand {
    font-weight: 600;
    color: #475569;
  }
}

/* Анимации появления */
.palette-fade-enter-active,
.palette-fade-leave-active {
  transition: opacity 0.2s ease;

  .command-palette-window {
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
}

.palette-fade-enter-from,
.palette-fade-leave-to {
  opacity: 0;

  .command-palette-window {
    transform: scale(0.97) translateY(-10px);
  }
}
</style>
