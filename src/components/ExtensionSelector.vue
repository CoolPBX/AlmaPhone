<template>
  <div class="extension-selector">
    <div class="header">
      <h2 class="title">Seleccionar Extensión</h2>
      <div class="user-info">
        <span>Conectado como: {{ authStore.userEmail }}</span>
        <button @click="handleLogout" class="logout-btn">
          Cerrar Sesión
        </button>
      </div>
    </div>

    <div v-if="extensionStore.isLoading" class="loading">
      <div class="spinner"></div>
      <p>Cargando extensiones...</p>
    </div>

    <div v-else-if="extensionStore.error" class="error-message">
      {{ extensionStore.error }}
      <button @click="extensionStore.clearError" class="clear-error">✕</button>
      <button @click="handleRefresh" class="retry-btn">
        Reintentar
      </button>
    </div>

    <div v-else-if="!extensionStore.hasExtensions" class="no-extensions">
      <p>No hay extensiones disponibles</p>
      <button @click="handleRefresh" class="retry-btn">
        Actualizar
      </button>
    </div>

    <div v-else class="extensions-list">
      <h3>Extensiones Disponibles:</h3>
      
      <div class="extension-grid">
        <div
          v-for="extension in extensionStore.availableExtensions"
          :key="extension.extension_uuid"
          class="extension-card"
          :class="{ 'selected': isSelected(extension) }"
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
        
        <button @click="proceedToPhone" class="proceed-btn">
          Continuar al Teléfono
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '../../src/stores/AuthStore';
import { useExtensionStore } from '../../src/stores/ExtensionStore';
import { useRouter } from 'vue-router';
import type { ExtensionItemDto } from '@/domain/dtos/ExtensionsDto';

const authStore = useAuthStore();
const extensionStore = useExtensionStore();
const router = useRouter();

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
  } else {
    extensionStore.clearExtensions();
    await extensionStore.fetchExtensions();
    console.log('Extensiones disponibles:', extensionStore.availableExtensions);
    console.log('Extensión seleccionada:', extensionStore.selectedExtension);
  }
});

const isSelected = (extension: ExtensionItemDto) => {
  return extension.extension_uuid === extensionStore.selectedExtension?.extension_uuid;
};

const selectExtension = (extension: ExtensionItemDto) => {
  extensionStore.selectExtension(extension);
};

const proceedToPhone = () => {
  router.push('/phone');
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const handleRefresh = () => {
  extensionStore.fetchExtensions();
};
</script>
