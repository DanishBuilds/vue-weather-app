<template>
  <i :class="iconClasses" :style="iconStyles" role="img" :aria-label="name">
    <!-- Placeholder for now - will be replaced with actual icon system -->
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <component :is="iconPath" />
    </svg>
  </i>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from "vue";

export interface IconProps {
  name: string;
  size?: string | number;
  color?: string;
}

const props = withDefaults(defineProps<IconProps>(), {
  size: "24",
});

// Simple icon definitions - in a real app you'd use an icon library
const iconPaths = {
  search: () =>
    h("circle", { cx: "11", cy: "11", r: "8" }) &&
    h("Path", { d: "m21 21-4.35-4.35" }),
  "map-pin": () => [
    h("path", { d: "M20 10c0 6-10 12-10 12s-10-6-10-12a10 10 0 0 1 20 0Z" }),
    h("circle", { cx: "10", cy: "10", r: "3" }),
  ],
  sun: () => [
    h("circle", { cx: "12", cy: "12", r: "4" }),
    h("path", { d: "m12 2 0 2" }),
    h("path", { d: "m12 20 0 2" }),
    h("path", { d: "m4.93 4.93 1.41 1.41" }),
    h("path", { d: "m17.66 17.66 1.41 1.41" }),
    h("path", { d: "M2 12h2" }),
    h("path", { d: "M20 12h2" }),
    h("path", { d: "m6.34 17.66-1.41 1.41" }),
    h("path", { d: "m19.07 4.93-1.41 1.41" }),
  ],
  cloud: () =>
    h("path", { d: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" }),
  "cloud-rain": () => [
    h("path", {
      d: "M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242",
    }),
    h("path", { d: "m16 14-3 5" }),
    h("path", { d: "m8 14-3 5" }),
    h("path", { d: "m16 19-3 2" }),
    h("path", { d: "m8 19-3 2" }),
  ],
  "cloud-snow": () => [
    h("path", {
      d: "M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242",
    }),
    h("path", { d: "M8 15h.01" }),
    h("path", { d: "M8 19h.01" }),
    h("path", { d: "M12 17h.01" }),
    h("path", { d: "M12 21h.01" }),
    h("path", { d: "M16 15h.01" }),
    h("path", { d: "M16 19h.01" }),
  ],
  zap: () => h("polygon", { points: "13,2 3,14 12,14 11,22 21,10 12,10 13,2" }),
  wind: () => [
    h("path", { d: "M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" }),
    h("path", { d: "M9.6 4.6A2 2 0 1 1 11 8H2" }),
    h("path", { d: "m20.6 15.6-1.4 1.4A2 2 0 0 1 16 16H2" }),
  ],
  droplets: () =>
    h("path", {
      d: "M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z",
    }),
  thermometer: () => [
    h("path", { d: "M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" }),
  ],
  eye: () => [
    h("path", { d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" }),
    h("circle", { cx: "12", cy: "12", r: "3" }),
  ],
  x: () => [h("path", { d: "m18 6-12 12" }), h("path", { d: "m6 6 12 12" })],
  "chevron-left": () => h("path", { d: "m15 18-6-6 6-6" }),
  "chevron-right": () => h("path", { d: "m9 18 6-6-6-6" }),
  "chevron-down": () => h("path", { d: "m6 9 6 6 6-6" }),
  menu: () => [
    h("line", { x1: "4", x2: "20", y1: "12", y2: "12" }),
    h("line", { x1: "4", x2: "20", y1: "6", y2: "6" }),
    h("line", { x1: "4", x2: "20", y1: "18", y2: "18" }),
  ],
  map: () => [
    h("path", { d: "m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" }),
    h("path", { d: "m9 3 0 15" }),
    h("path", { d: "m15 6 0 15" }),
  ],
  clock: () => [
    h("circle", { cx: "12", cy: "12", r: "10" }),
    h("polyline", { points: "12,6 12,12 16,14" }),
  ],
  "refresh-cw": () => [
    h("path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" }),
    h("path", { d: "M21 3v5h-5" }),
    h("path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" }),
    h("path", { d: "M8 16H3v5" }),
  ],
  loader: () => [
    h("line", { x1: "12", x2: "12", y1: "2", y2: "6" }),
    h("line", { x1: "12", x2: "12", y1: "18", y2: "22" }),
    h("line", { x1: "4.93", x2: "7.76", y1: "4.93", y2: "7.76" }),
    h("line", { x1: "16.24", x2: "19.07", y1: "16.24", y2: "19.07" }),
    h("line", { x1: "2", x2: "6", y1: "12", y2: "12" }),
    h("line", { x1: "18", x2: "22", y1: "12", y2: "12" }),
    h("line", { x1: "4.93", x2: "7.76", y1: "19.07", y2: "16.24" }),
    h("line", { x1: "16.24", x2: "19.07", y1: "7.76", y2: "4.93" }),
  ],
  user: () => [
    h("path", { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }),
    h("circle", { cx: "12", cy: "7", r: "4" }),
  ],
  plus: () => [h("path", { d: "m12 5 0 14" }), h("path", { d: "m5 12 14 0" })],
  "trash-2": () => [
    h("path", { d: "M3 6h18" }),
    h("path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }),
    h("path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }),
    h("line", { x1: "10", x2: "10", y1: "11", y2: "17" }),
    h("line", { x1: "14", x2: "14", y1: "11", y2: "17" }),
  ],
  camera: () => [
    h("path", {
      d: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",
    }),
    h("circle", { cx: "12", cy: "13", r: "3" }),
  ],
  "check-circle": () => [
    h("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
    h("path", { d: "m9 11 3 3L22 4" }),
  ],
};

const iconPath = computed(() => {
  const pathFn = iconPaths[props.name as keyof typeof iconPaths];
  return pathFn ? defineComponent({ render: pathFn }) : null;
});

const iconClasses = computed(() => ["base-icon", `base-icon--${props.name}`]);

const iconStyles = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  color: props.color,
}));
</script>

<style lang="scss" scoped>
.base-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 100%;
    height: 100%;
  }
}
</style>
