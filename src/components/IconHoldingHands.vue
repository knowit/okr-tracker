<template>
  <svg :width="width" :height="height" viewBox="0 0 25 24">
    <path
      d="M9.42962 1.875C9.42962 2.91053 8.59015 3.75 7.55462 3.75C6.51908 3.75 5.67962 2.91053 5.67962 1.875C5.67962 0.839466 6.51908 0 7.55462 0C8.59015 0 9.42962 0.839466 9.42962 1.875Z"
      fill="#2A2859"
    />
    <path
      d="M19.1804 2.0625C19.1804 3.09803 18.3409 3.9375 17.3054 3.9375C16.2698 3.9375 15.4304 3.09803 15.4304 2.0625C15.4304 1.02697 16.2698 0.1875 17.3054 0.1875C18.3409 0.1875 19.1804 1.02697 19.1804 2.0625Z"
      fill="#2A2859"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M4.61462 5.06249L3.80762 14.7502L5.30237 14.8747L5.30612 14.8282V24H6.80612V14.0625H8.30612V24H9.80612V14.0625L10.5576 14.0625V10.4689L11.707 14.2791L13.1414 14.2846L14.3764 10.3006L14.3084 17.0625H15.0584V24H16.5584V17.0625H18.0584V24H19.5584V17.0625H20.3084V14.142L20.3181 14.196L21.7926 13.9282L20.1816 5.06249H14.4291L14.4291 5.06478L12.4348 11.498L10.4948 5.06685L10.4946 5.06249H4.61462ZM5.99537 6.56249L5.49512 12.5625H9.05762V6.56249H5.99537ZM15.8076 6.56249H18.8076V15.5625H15.8076V6.56249Z"
      fill="#2A2859"
    />
  </svg>
</template>

<script>
export default {
  name: 'IconHoldingHands',

  props: {
    width: {
      type: Number,
      required: false,
      default: 25,
    },
    height: {
      type: Number,
      required: false,
      default: 24,
    },
    fill: {
      type: String,
      required: false,
      default: 'var(--color-primary)',
    },
  },
};
</script>
