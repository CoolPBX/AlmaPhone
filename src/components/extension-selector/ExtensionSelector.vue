<template>
  <div class="extension-selector">
    <div class="header">
      <h2 class="title">Seleccionar Extensión</h2>
      <div class="user-info">
        <span>Conectado como: {{ authStore.userEmail }}</span>
        <button @click="handleLogout" class="logout-btn">Cerrar Sesión</button>
      </div>
    </div>

    <div v-if="extensionStore.isLoading" class="loading">
      <div class="spinner"></div>
      <p>Cargando extensiones...</p>
    </div>

    <div v-else-if="extensionStore.error" class="error-message">
      {{ extensionStore.error }}
      <button @click="extensionStore.clearError" class="clear-error">✕</button>
      <button @click="handleRefresh" class="retry-btn">Reintentar</button>
    </div>

    <div v-else-if="!extensionStore.hasExtensions" class="no-extensions">
      <p>No hay extensiones disponibles</p>
      <button @click="handleRefresh" class="retry-btn">Actualizar</button>
    </div>

    <div v-else class="extensions-list">
      <h3>Extensiones Disponibles:</h3>

      <div class="extension-grid">
        <div
          v-for="extension in extensionStore.availableExtensions"
          :key="extension.extension_uuid"
          class="extension-card"
          :class="{ selected: isSelected(extension) }"
          @click="selectExtension(extension)"
        >
          <div class="extension-number">{{ extension.extension }}</div>
          <div class="extension-details">
            <p class="extension-uuid">{{ extension.extension_uuid }}</p>
            <p class="extension-description" v-if="extension.description">
              {{ extension.description }}
            </p>
          </div>
          <div class="selection-indicator">
            <span v-if="isSelected(extension)">✓ Seleccionada</span>
            <span v-else>Seleccionar</span>
          </div>
        </div>
      </div>

      <div v-if="extensionStore.selectedExtension" class="selected-info">
        <h4>Extensión Seleccionada:</h4>
        <div class="selected-details">
          <p><strong>Número:</strong> {{ extensionStore.selectedExtension.extension }}</p>
          <p><strong>UUID:</strong> {{ extensionStore.selectedExtension.extension_uuid }}</p>
        </div>

        <button @click="proceedToPhone" class="proceed-btn">Continuar al Teléfono</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../login/repositories/internal/AuthStore'
import { useExtensionStore } from './repositories/internal/ExtensionStore'
import type { ExtensionItemDto } from './domain/schemas/ExtensionSchemas'

const authStore = useAuthStore()
const extensionStore = useExtensionStore()
const router = useRouter()

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
  } else {
    extensionStore.clearExtensions()
    await extensionStore.fetchExtensions()
    console.log('Extensiones disponibles:', extensionStore.availableExtensions)
    console.log('Extensión seleccionada:', extensionStore.selectedExtension)
  }
})

const isSelected = (extension: ExtensionItemDto) => {
  return extension.extension_uuid === extensionStore.selectedExtension?.extension_uuid
}

const selectExtension = (extension: ExtensionItemDto) => {
  extensionStore.selectExtension(extension)
}

const proceedToPhone = () => {
  router.push('/phone')
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const handleRefresh = () => {
  extensionStore.fetchExtensions()
}
</script>

<style scoped>
.extension-selector {
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background: var(--surface-card);
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.title {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-color);
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.logout-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--red-500);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.3s;
}

.logout-btn:hover {
  background-color: var(--red-600);
}

.loading,
.error-message,
.no-extensions {
  text-align: center;
  margin-top: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--surface-border);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.clear-error,
.retry-btn {
  margin: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

.extensions-list h3 {
  margin-bottom: 1rem;
  color: var(--text-color-secondary);
}

.extension-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.extension-card {
  border: 2px solid var(--surface-border);
  padding: 1rem;
  border-radius: 1rem;
  background: var(--surface-100);
  cursor: pointer;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
}

.extension-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.extension-card.selected {
  border-color: var(--primary-color);
  background-color: var(--primary-50);
}

.extension-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.extension-details {
  margin-top: 0.5rem;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

.selection-indicator {
  margin-top: 1rem;
  text-align: right;
  font-weight: 500;
  color: var(--primary-color);
}

.selected-info {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid var(--surface-border);
}

.selected-details p {
  margin: 0.3rem 0;
}

.proceed-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

.proceed-btn:hover {
  background: var(--primary-600);
}
</style>
