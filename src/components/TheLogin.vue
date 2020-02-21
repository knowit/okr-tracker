<template>
  <div class="container content">
    <div class="login">
      <div class="information">
        <span class="title-1">
          Denne siden er nå lagt ned og blir verken brukt eller videreutviklet på. Ny side ligger ute på
          <a href="https://okr.oslo.systems">okr.oslo.systems</a>
        </span>
        <video src="https://thumbs.gfycat.com/HollowWaterloggedAnhinga-mobile.mp4" autoplay loop />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    login() {
      this.$login().then(() => {
        console.log('logging in');
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';
.container {
  display: flex;
  align-items: center;
  min-height: calc(80vh - 5rem);
}

.btn {
  margin-top: 2rem;
}

.information {
  background-color: $color-yellow;
  border-radius: 1rem;
  min-height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  margin-bottom: 2rem;
  flex-direction: column;
}
</style>
