<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import TitleCard from "./TitleCard.vue";
import type { TitleSummary } from "@/types/api";

const props = defineProps<{
  label: string;
  items: TitleSummary[];
}>();

const emit = defineEmits<{ open: [item: TitleSummary] }>();

const scroller = ref<HTMLElement | null>(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

function updateArrows(): void {
  const el = scroller.value;
  if (!el) {
    return;
  }
  canScrollLeft.value = el.scrollLeft > 8;
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 8;
}

function scrollByPage(direction: 1 | -1): void {
  const el = scroller.value;
  if (!el) {
    return;
  }
  el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
}

watch(
  () => props.items,
  () => void nextTick(updateArrows),
);

onMounted(() => {
  updateArrows();
  window.addEventListener("resize", updateArrows);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateArrows);
});
</script>

<template>
  <section class="group/row mb-3.5">
    <div class="mb-3.5 flex items-baseline gap-3 px-6 sm:px-14">
      <h2 class="m-0 font-display text-xl font-bold">{{ label }}</h2>
      <span class="text-xs font-bold tracking-[0.5px] text-primary"
        >{{ items.length }} títulos</span
      >
    </div>

    <div class="relative">
      <div
        ref="scroller"
        class="-my-5 flex snap-x snap-proximity gap-3.5 overflow-x-auto scroll-px-6 px-6 py-7 pb-10 sm:scroll-px-14 sm:px-14"
        @scroll.passive="updateArrows"
      >
        <TitleCard
          v-for="item in items"
          :key="`${item.mediaType}-${item.tmdbId}`"
          :item="item"
          @open="emit('open', $event)"
        />
      </div>

      <!-- fade nas bordas enquanto há conteúdo escondido -->
      <div
        v-if="canScrollLeft"
        class="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent"
      />
      <div
        v-if="canScrollRight"
        class="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent"
      />

      <button
        v-if="canScrollLeft"
        type="button"
        aria-label="Ver títulos anteriores"
        class="absolute top-1/2 left-2 z-20 hidden size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-[rgba(11,10,9,0.75)] text-lg text-foreground/80 backdrop-blur-md transition-all duration-200 group-hover/row:opacity-100 hover:scale-110 hover:border-primary hover:text-primary-soft sm:left-3 md:flex"
        @click="scrollByPage(-1)"
      >
        ‹
      </button>
      <button
        v-if="canScrollRight"
        type="button"
        aria-label="Ver mais títulos"
        class="absolute top-1/2 right-2 z-20 hidden size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-[rgba(11,10,9,0.75)] text-lg text-foreground/80 backdrop-blur-md transition-all duration-200 group-hover/row:opacity-100 hover:scale-110 hover:border-primary hover:text-primary-soft sm:right-3 md:flex"
        @click="scrollByPage(1)"
      >
        ›
      </button>
    </div>
  </section>
</template>
