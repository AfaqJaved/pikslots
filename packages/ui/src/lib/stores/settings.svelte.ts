let open = $state(false);

export const settingsStore = {
	get open() {
		return open;
	},
	set open(v: boolean) {
		open = v;
	},
	toggle() {
		open = !open;
	},
	close() {
		open = false;
	},
	makeOpen() {
		open = true;
	}
};
