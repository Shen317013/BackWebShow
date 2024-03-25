<template>
	<div class="index">
		<Header />
			<router-view></router-view>
		<Footer />
	</div>
</template>

<script>
	import Header from "../components/Header.vue";
	import Footer from "../components/Footer.vue";

	export default {
		name: 'index',
		components: {
			Header,
			Footer
		},
	};
</script>

<style scoped>
</style>